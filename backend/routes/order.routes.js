import express from "express";
import { acceptOrder, getDeliveryBoyAssignment, getMyOrders, placeOrder, updateOrderStatus, getCurrentOrder, markDelivered, getOrderById, sendDeliveryOtp, verifyDeliveryOtp, getTodaysDeliveries, verifyPayment } from "../controllers/order.controller.js";
import isAuth from "../middlewares/isAuth.js";


const orderRouter = express.Router();

orderRouter.post("/place-order", isAuth, placeOrder);
orderRouter.post("/verify-payment", isAuth, verifyPayment);
orderRouter.get("/my-orders", isAuth, getMyOrders);
orderRouter.get("/get-assignments", isAuth, getDeliveryBoyAssignment);
orderRouter.get("/get-current-order", isAuth, getCurrentOrder);
orderRouter.post("/send-delivery-otp", isAuth, sendDeliveryOtp);
orderRouter.post("/verify-delivery-otp", isAuth, verifyDeliveryOtp);
orderRouter.post("/update-status/:orderId/:shopId", isAuth, updateOrderStatus);
orderRouter.get("/accept-order/:assignmentId", isAuth, acceptOrder);
orderRouter.post("/mark-delivered/:assignmentId", isAuth, markDelivered);
orderRouter.get("/get-order-by-id/:orderId", isAuth, getOrderById);
orderRouter.get("/get-today-delivery", isAuth, getTodaysDeliveries)

export default orderRouter;