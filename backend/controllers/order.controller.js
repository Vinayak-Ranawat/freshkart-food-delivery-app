import mongoose from "mongoose";
import Order from "../models/order.model.js";
import Shop from "../models/shop.model.js";
import Item from "../models/item.model.js";
import User from "../models/user.model.js";
import DeliveryAssignment from "../models/deliveryAssignment.model.js";
import { sendDeliveryOtpMail } from "../utils/mail.js";
import Razorpay from "razorpay";
import dotnv from 'dotenv';

console.log("Razorpay Key ID:", process.env.RAZORPAY_KEY_ID);
console.log("Razorpay Key Secret:", process.env.RAZORPAY_KEY_SECRET ? "EXISTS" : "MISSING");

dotnv.config();
let instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});


export const placeOrder = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "User not authenticated" });
        }

        const { cartItems, paymentMethod, deliveryAddress, totalAmount } = req.body;

        if (!cartItems || cartItems.length === 0) {
            return res.status(400).json({ message: "Cart is empty" });
        }
        if (!deliveryAddress.text || !deliveryAddress.latitude || !deliveryAddress.longitude) {
            return res.status(400).json({ message: "Send complete delivery address details" });
        }

        const groupItemsByShop = {};
        cartItems.forEach(item => {
            const shopId = item.shop;
            if (!groupItemsByShop[shopId]) groupItemsByShop[shopId] = [];
            groupItemsByShop[shopId].push(item);
        });

        const shopOrders = await Promise.all(Object.keys(groupItemsByShop).map(async (shopId) => {
            let shop = await Shop.findById(shopId).populate("owner");
            if (!shop) throw new Error(`Shop with id ${shopId} not found`);
            if (!shop.owner) throw new Error(`Shop ${shopId} has no owner assigned.`);

            const items = groupItemsByShop[shopId];
            const itemIds = items.map(i => i._id || i.id).filter(Boolean);
            if (itemIds.length !== items.length) {
                throw new Error(`Invalid item data in cart - some items missing IDs`);
            }

            const subtotal = items.reduce((sum, i) => sum + Number(i.price) * Number(i.quantity), 0);

            return {
                shop: shop._id,
                owner: shop.owner._id,
                subtotal,
                shopOrderItems: items.map((i) => ({
                    item: i._id || i.id,
                    name: i.name,
                    price: i.price,
                    quantity: i.quantity,
                    image: i.image,
                    customizations: i.customizations || []   // ← save selected customizations
                }))
            };
        }));

        if (paymentMethod === "ONLINE") {
            const razorpayOrder = await instance.orders.create({
                amount: Math.round(totalAmount * 100),
                currency: "INR",
                receipt: `receipt_${Date.now()}`,
            });

            const order = await Order.create({
                user: req.user,
                paymentMethod,
                deliveryAddress,
                totalAmount,
                shopOrders,
                razorpayOrderId: razorpayOrder.id,
                payment: false
            });

            return res.status(201).json({
                razorOrder: razorpayOrder,
                orderId: order._id,
            });
        }

        const newOrder = await Order.create({
            user: req.user,
            paymentMethod,
            deliveryAddress,
            totalAmount,
            shopOrders
        });

        await newOrder.populate("shopOrders.shopOrderItems.item", "name image price");
        await newOrder.populate("shopOrders.shop", "name");
        await newOrder.populate("shopOrders.owner", "name socketId");
        await newOrder.populate("user", "name email mobile");

        const io = req.app.get('io');
        if (io) {
            newOrder.shopOrders.forEach(shopOrder => {
                const ownerSocketId = shopOrder.owner.socketId;
                if (ownerSocketId) {
                    io.to(ownerSocketId).emit('newOrder', {
                        _id: newOrder._id,
                        paymentMethod: newOrder.paymentMethod,
                        user: newOrder.user,
                        shopOrders: shopOrder,
                        createdAt: newOrder.createdAt,
                        deliveryAddress: newOrder.deliveryAddress,
                        payment: newOrder.payment
                    });
                }
            });
        }

        return res.status(201).json(newOrder);

    } catch (error) {
        console.log("placeOrder ERROR:", error);
        return res.status(500).json({ message: `placeOrder error ${error}` });
    }
};


export const verifyPayment = async (req, res) => {
    try {
        const { razorpay_payment_id, orderId } = req.body;
        const payment = await instance.payments.fetch(razorpay_payment_id);
        if (!payment || payment.status !== "captured") {
            return res.status(400).json({ message: "Payment not Completed!" });
        }
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(400).json({ message: "Order not found" });
        }
        order.payment = true;
        order.razorpayPaymentId = razorpay_payment_id;
        await order.save();

        await order.populate("shopOrders.shopOrderItems.item", "name image price")
        await order.populate("shopOrders.shop", "name");
        return res.status(200).json(order);
    } catch (error) {
        return res.status(500).json({ message: `verifyPayment error ${error}` });
    }
}

export const getMyOrders = async (req, res) => {
    try {
        const user = await User.findById(req.user);
        if (user.role == "user") {
            const orders = await Order.find({ user: req.user })
                .sort({ createdAt: -1 })
                .populate("shopOrders.shop", "name")
                .populate("shopOrders.owner", "name email mobile")
                .populate("shopOrders.shopOrderItems.item", "name image price")
            return res.status(200).json(orders)
        }
        else if (user.role == "owner") {
            const orders = await Order.find({ "shopOrders.owner": req.user })
                .sort({ createdAt: -1 })
                .populate("shopOrders.shop", "name")
                .populate("user")
                .populate("shopOrders.shopOrderItems.item", "name image price")
                .populate("shopOrders.assignedDeliveryBoy", "fullName mobile")

            const filteredOrders = orders.map((order => ({
                _id: order._id,
                paymentMethod: order.paymentMethod,
                user: order.user,
                shopOrders: order.shopOrders.find(o => o.owner.toString() === req.user.toString()),
                createdAt: order.createdAt,
                deliveryAddress: order.deliveryAddress,
                payment: order.payment
            })))
            return res.status(200).json(filteredOrders)
        }
    } catch (error) {
        return res.status(500).json({ message: `getMyOrders error ${error}` });
    }
}

export const updateOrderStatus = async (req, res) => {
    try {
        const { orderId, shopId } = req.params;
        const { status } = req.body;
        const order = await Order.findById(orderId);

        const shopOrder = order.shopOrders.find(o => o.shop.toString() === shopId);
        if (!shopOrder) {
            return res.status(404).json({ message: "Shop order not found in this order" })
        }

        shopOrder.status = status;
        let deliveryBoysPayload = [];


        if (status === "out for delivery" && !shopOrder.assignment) {
            const { longitude, latitude } = order.deliveryAddress;

            // Temporarily find all delivery boys, not just nearby
            const nearbyDeliveryBoys = await User.find({
                role: "deliveryBoy"
                // location: {
                //     $near: {
                //         $geometry: { type: "Point", coordinates: [Number(longitude), Number(latitude)] },
                //         $maxDistance: 5000
                //     }
                // }
            });

            console.log("Found delivery boys:", nearbyDeliveryBoys.map(b => ({ id: b._id, name: b.fullName, role: b.role })));

            const nearByIds = nearbyDeliveryBoys.map(b => b._id);

            const busyIds = await DeliveryAssignment.find({
                assignedTo: { $in: nearByIds },
                status: "accepted"
            }).distinct("assignedTo");

            console.log("Busy IDs:", busyIds);

            const busyIdSet = new Set(busyIds.map(id => String(id)));
            const availableBoys = nearbyDeliveryBoys.filter(b => !busyIdSet.has(String(b._id)));

            console.log("Available boys:", availableBoys.map(b => b.fullName));

            const candidates = availableBoys.map(b => b._id);

            if (candidates.length === 0) {
                await order.save();
                return res.json({ message: "order status updated but no delivery boy available right now" });
            }

            const newDeliveryAssignment = await DeliveryAssignment.create({
                order: order._id,
                shop: shopOrder.shop,
                shopOrderId: shopOrder._id,
                brodcastedTo: candidates,
                status: "brodcasted",
                notified: false  // Mark as not notified
            });

            shopOrder.assignment = newDeliveryAssignment._id;

            deliveryBoysPayload = availableBoys.map(b => ({
                id: b._id,
                fullName: b.fullName,
                longitude: b.location.coordinates?.[0],
                latitude: b.location.coordinates?.[1],
                mobile: b.mobile
            }));

            // Use newDeliveryAssignment (the instance)
            const populatedAssignment = await DeliveryAssignment.findById(newDeliveryAssignment._id)
                .populate('order')
                .populate('shop');

            const io = req.app.get('io');
            if (io) {
                availableBoys.forEach(boy => {
                    const boySocketId = boy.socketId;
                    if (boySocketId) {
                        io.to(boySocketId).emit('newAssignment', {
                            sendTo: boy._id,
                            assignmentId: populatedAssignment._id,
                            orderId: populatedAssignment.order._id,
                            shopName: populatedAssignment.shop?.name,
                            deliveryAddress: populatedAssignment.order.deliveryAddress,
                            totalAmount: populatedAssignment.order.totalAmount,
                            items: populatedAssignment.order.shopOrders.find(
                                so => so._id.equals(populatedAssignment.shopOrderId)
                            )?.shopOrderItems || [],
                            subTotal: populatedAssignment.order.shopOrders.find(
                                so => so._id.equals(populatedAssignment.shopOrderId)
                            )?.subtotal
                        });
                    }
                });
            }


        }

        await order.save();
        const updatedShopOrder = order.shopOrders.find(o => o.shop.toString() === shopId);
        await order.populate("shopOrders.shop", "name");
        await order.populate("shopOrders.assignedDeliveryBoy", "fullName email mobile");
        await order.populate("user", "socketId");
        const newAssignmentFlag = status === "out for delivery" && deliveryBoysPayload.length > 0;

        const io = req.app.get('io')
        if (io) {
            const userSocketId = order.user.socketId;
            if (userSocketId) {
                io.to(userSocketId).emit('update-status', {
                    orderId: order._id,
                    shopId: updatedShopOrder.shop._id,
                    status: updatedShopOrder.status,
                    userId: order.user._id
                })
            }
        }


        return res.status(200).json({
            shopOrder: updatedShopOrder,
            assignedDeliveryBoy: updatedShopOrder?.assignedDeliveryBoy,
            availableBoys: deliveryBoysPayload,
            assignment: updatedShopOrder?.assignment,
            newAssignment: newAssignmentFlag  // Flag indicating a new assignment was created
        });

    } catch (error) {
        console.log("FULL ERROR:", error);
        return res.status(500).json({ message: `Order status error ${error}` });
    }
}

export const getDeliveryBoyAssignment = async (req, res) => {
    try {
        const deliveryBoyId = req.user;

        const assignments = await DeliveryAssignment.find({
            brodcastedTo: deliveryBoyId,
            status: "brodcasted"
        })
            .populate("order")
            .populate("shop");

        // ✅ Filter out assignments where order is null (deleted orders)
        const validAssignments = assignments.filter(a => a.order !== null);

        const formated = validAssignments.map((a) => ({
            assignmentId: a._id,
            orderId: a.order._id,
            shopName: a.shop?.name,
            deliveryAddress: a.order.deliveryAddress,
            totalAmount: a.order.totalAmount,
            items: a.order.shopOrders.find(
                (so) => so._id.equals(a.shopOrderId)
            )?.shopOrderItems || [],
            subTotal: a.order.shopOrders.find(
                (so) => so._id.equals(a.shopOrderId)
            )?.subtotal
        }));

        return res.status(200).json(formated);

    } catch (error) {
        console.log("getDeliveryBoyAssignment ERROR:", error);
        return res.status(500).json({ message: `get assignment error ${error}` });
    }
}
export const acceptOrder = async (req, res) => {
    try {
        const { assignmentId } = req.params;
        const assigment = await DeliveryAssignment.findById(assignmentId);
        if (!assigment) {
            return res.status(404).json({ message: "Assignment not found" })
        }
        if (assigment.status !== "brodcasted") {
            return res.status(400).json({ message: "Assignment already accepted by someone else" })
        }
        const alreadyAssigned = await DeliveryAssignment.findOne({
            assignedTo: req.user,
            status: { $in: ["brodcasted", "accepted"] }
        });
        if (alreadyAssigned) {
            return res.status(400).json({ message: "You have already accepted an assignment" });
        }
        assigment.assignedTo = req.user;
        assigment.status = "accepted";
        assigment.acceptedAt = new Date();
        await assigment.save();

        const order = await Order.findById(assigment.order);
        if (!order) {
            return res.status(404).json({ message: "Order not found" })
        }

        let shopOrder = order.shopOrders.id(assigment.shopOrderId);
        shopOrder.assignedDeliveryBoy = req.user;
        await order.save();

        await order.populate("shopOrders.shop", "assignedDeliveryBoy");
        return res.status(200).json({ message: "Order accepted successfully" });

    } catch (error) {
        return res.status(500).json({ message: `accept order error ${error}` });
    }
}
export const markDelivered = async (req, res) => {
    try {
        const { assignmentId } = req.params;
        const assignment = await DeliveryAssignment.findById(assignmentId);
        if (!assignment) {
            return res.status(404).json({ message: "Assignment not found" });
        }
        if (assignment.assignedTo.toString() !== req.user.toString()) {
            return res.status(403).json({ message: "Not authorized" });
        }
        assignment.status = "completed";
        assignment.deliveredAt = new Date();
        await assignment.save();

        const order = await Order.findById(assignment.order);
        const shopOrder = order.shopOrders.id(assignment.shopOrderId);
        shopOrder.status = "delivered";
        await order.save();

        return res.status(200).json({ message: "Order marked as delivered" });
    } catch (error) {
        return res.status(500).json({ message: `mark delivered error ${error}` });
    }
}
export const getCurrentOrder = async (req, res) => {
    try {
        const deliveryBoyId = req.user;
        if (!deliveryBoyId) {
            return res.status(401).json({ message: "Not authenticated" });
        }

        const assignment = await DeliveryAssignment.findOne({
            assignedTo: deliveryBoyId,
            status: "accepted"
        })
            .populate("shop", "name")
            .populate("assignedTo", "fullName email mobile location")
            .populate({
                path: "order",
                populate: [{ path: "user", select: "fullName email mobile location" }],
            });

        if (!assignment) {
            return res.status(200).json({ message: "No current assignment", shopOrder: null });
        }

        const shopOrder = assignment.order?.shopOrders?.find(so => String(so._id) === String(assignment.shopOrderId));
        if (!shopOrder) {
            return res.status(200).json({ message: "No current shop order", shopOrder: null });
        }

        const coordinates = assignment.assignedTo?.location?.coordinates;
        const deliveryBoyLocation = {
            lat: Array.isArray(coordinates) && coordinates.length === 2 ? coordinates[1] : null,
            lon: Array.isArray(coordinates) && coordinates.length === 2 ? coordinates[0] : null,
        };

        const customerLocation = assignment.order?.deliveryAddress ? {
            lat: assignment.order.deliveryAddress.latitude,
            lon: assignment.order.deliveryAddress.longitude
        } : { lat: null, lon: null };

        return res.status(200).json({
            _id: assignment.order._id,
            assignmentId: assignment._id,
            user: assignment.order.user,
            shopOrder,
            deliveryAddress: assignment.order.deliveryAddress,
            deliveryBoyLocation,
            customerLocation
        });
    } catch (error) {
        console.error("getCurrentOrder ERROR:", error);
        res.status(500).json({ message: "Current Order error: " + error.message });
    }
};

export const getOrderById = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await Order.findById(orderId)
            .populate("user")
            .populate("shopOrders.shop", "name")
            .populate("shopOrders.assignedDeliveryBoy", "fullName mobile location")
            .populate("shopOrders.shopOrderItems.item", "name image price")
            .lean();
        if (!order) {
            return res.status(400).json({ message: "Order not found" });
        }
        return res.status(200).json(order);
    } catch (error) {
        console.log("getOrderById ERROR:", error);
        res.status(500).json({ message: `get order by id order error: ${error}` });
    }
}

export const sendDeliveryOtp = async (req, res) => {
    try {
        const { orderId, shopOrderId } = req.body;
        const order = await Order.findById(orderId).populate("user");
        const shopOrder = order.shopOrders.id(shopOrderId);
        if (!order || !shopOrder) {
            return res.status(404).json({ message: "Order or Shop order not found" })
        }
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        shopOrder.deliveryOtp = otp;
        shopOrder.otpExpire = Date.now() + 5 * 60 * 1000;
        await order.save();
        await sendDeliveryOtpMail(order.user, otp);
        return res.status(200).json({ message: `Delivery OTP sent to${order?.user?.fullName} ` })
    } catch (error) {
        res.status(500).json({ message: `send delivery otp error: ${error}` });
    }
}

export const verifyDeliveryOtp = async (req, res) => {
    try {
        const { orderId, shopOrderId, otp } = req.body;
        const order = await Order.findById(orderId).populate("user");
        const shopOrder = order.shopOrders.id(shopOrderId);
        if (!order || !shopOrder) {
            return res.status(404).json({ message: "Order or Shop order not found" })
        }
        if (shopOrder.deliveryOtp != otp || !shopOrder.otpExpire || shopOrder.otpExpire < Date.now()) {
            return res.status(400).json({ message: "Invalid or expired OTP" })
        }
        shopOrder.status = "delivered";
        shopOrder.deliveredAt = Date.now();
        await order.save();
        await DeliveryAssignment.deleteOne({
            shopOrderId: shopOrder._id,
            order: order._id,
            assignedTo: shopOrder.assignedDeliveryBoy
        });
        return res.status(200).json({ message: "OTP verified, order marked as delivered" })
    } catch (error) {
        return res.status(500).json({ message: `verify delivery otp error: ${error}` });
    }
}

export const getTodaysDeliveries = async (req, res) => {
    try {
        const deliveryBoyId = new mongoose.Types.ObjectId(req.user)
        const startsOfDay = new Date()
        startsOfDay.setHours(0, 0, 0, 0)

        const orders = await Order.find({
            "shopOrders.assignedDeliveryBoy": deliveryBoyId,
            "shopOrders.status": "delivered",
            "shopOrders.deliveredAt": { $gte: startsOfDay }
        }).lean()
        let todaysDeliveries = [];
        orders.forEach(order => {
            order.shopOrders.forEach(shopOrder => {
                if (shopOrder.assignedDeliveryBoy.toString() == deliveryBoyId.toString() && shopOrder.status == "delivered" &&
                    shopOrder.deliveredAt &&
                    shopOrder.deliveredAt >= startsOfDay) {
                    todaysDeliveries.push(shopOrder)
                }
            })
        })
        let stats = {}
        todaysDeliveries.forEach(shopOrder => {
            const hour = new Date(shopOrder.deliveredAt).getHours()
            stats[hour] = (stats[hour] || 0) + 1
        })
        let formattedStats = Object.keys(stats).map(hour => ({
            hour: parseInt(hour),
            count: stats[hour]
        }))
        formattedStats.sort((a, b) => a.hour - b.hour)

        return res.status(200).json(formattedStats)
    } catch (error) {
        return res.status(500).json({ message: `get today's deliveries error: ${error}` });
    }
}