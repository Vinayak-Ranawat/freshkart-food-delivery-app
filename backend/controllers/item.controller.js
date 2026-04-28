import Item from "../models/item.model.js";
import Shop from "../models/shop.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";

export const addItem = async (req, res) => {
    try {
        const { name, category, foodType, price, customizations } = req.body;
        let image;
        if (req.file) {
            image = await uploadOnCloudinary(req.file.path);
        }
        const shop = await Shop.findOne({ owner: req.user });
        if (!shop) {
            return res.status(400).json("Shop not found");
        }
        const parsedCustomizations = customizations ? JSON.parse(customizations) : [];
        const item = await Item.create({
            name, category, foodType, price, image, shop: shop._id, customizations: parsedCustomizations
        })
        shop.items.push(item._id);
        await shop.save();
        await shop.populate("owner")
        await shop.populate({
            path: "items",
            options: { sort: { updatedAt: -1 } }
        });
        return res.status(201).json(shop);
    } catch (error) {
        return res.status(500).json(`addItem error ${error}`);
    }
}

export const editItem = async (req, res) => {   
    try {
        const itemId = req.params.itemId;
        const { name, category, foodType, price, customizations } = req.body;

        const parsedCustomizations = customizations ? JSON.parse(customizations) : [];

        // Only include image if a new one is uploaded
        const updateData = { name, category, foodType, price, customizations: parsedCustomizations };
        if (req.file) {
            updateData.image = await uploadOnCloudinary(req.file.path);
        }

        const item = await Item.findByIdAndUpdate(itemId, updateData, { new: true });
        if (!item) {
            return res.status(400).json("Item not found");
        }

        const shop = await Shop.findOne({ owner: req.user }) // fixed req.userId → req.user
            .populate("owner")
            .populate({
                path: "items",
                options: { sort: { updatedAt: -1 } }
            });

        return res.status(200).json(shop);
    } catch (error) {
        return res.status(500).json(`editItem error ${error}`);
    }
}

export const getItemById = async (req, res) => {
    try {
        const itemId = req.params.itemId;
        const item = await Item.findById(itemId);
        if (item) {
            return res.status(200).json(item);
        } else {
            return res.status(404).json("Item not found");
        }
    } catch (error) {
        return res.status(500).json(`getItemById error ${error}`);
    }
}

export const deleteItem = async (req, res) => {
    try {
        const itemId = req.params.itemId;
        const item = await Item.findByIdAndDelete(itemId);
        if (!item) {
            return res.status(404).json("Item not found");
        }
        const shop = await Shop.findOne({ owner: req.user }) // fixed req.userId → req.user
        shop.items = shop.items.filter(i => i.toString() !== item._id.toString()); // fixed comparison
        await shop.save()
        await shop.populate("owner")
        await shop.populate({
            path: "items",
            options: { sort: { updatedAt: -1 } }
        })
        return res.status(200).json(shop); // added missing return
    } catch (error) {
        return res.status(500).json(`deleteItem error ${error}`);
    }
}

export const getItemsByCity = async (req, res) => {
    try {
        const { city } = req.params;
        if (!city) {
            return res.status(400).json({ message: "City is required" });
        }
        const shops = await Shop.find({
            city: { $regex: new RegExp(`^${city}$`, "i") }
        }).populate("items")
        if (!shops) {
            return res.status(400).json({ message: "No shops found in this city" });
        }
        const shopIds = shops.map(s => s._id);
        const items = await Item.find({ shop: { $in: shopIds } });
        return res.status(200).json(items);
    } catch (error) {
        return res.status(500).json({ message: `get items by city error ${error}`, error });
    }
}

export const getItemsByShop = async (req, res) => {
    try {
        const { shopId } = req.params;
        const shop = await Shop.findById(shopId).populate("items")
        if (!shop) {
            return res.status(400).json("shop not found")
        }
        return res.status(200).json({
            shop,
            items: shop.items
        });
    } catch (error) {
        return res.status(500).json(`getItemsByShop error ${error}`);
    }
}

export const searchItems = async (req, res) => {
    try {
        const { query, city } = req.query
        if (!query || !city) {
            return res.status(400).json({ message: "Query and city are required" })
        }
        const shops = await Shop.find({
            city: { $regex: new RegExp(`^${city}$`, "i") }
        }).populate("items")
        if (!shops) {
            return res.status(400).json("No shops found");
        }
        const shopIds = shops.map(s => s._id)
        const items = await Item.find({
            shop: { $in: shopIds },
            $or: [
                { name: { $regex: query, $options: "i" } },
                { category: { $regex: query, $options: "i" } },
                { foodType: { $regex: query, $options: "i" } },
            ]
        }).populate("shop", "name image")
        return res.status(200).json(items);
    } catch (error) {
        return res.status(500).json(`searchItems error ${error}`);
    }
}

export const rating = async (req, res) => {
    try {
        const { itemId, rating } = req.body
        if (!itemId || !rating) {
            return res.status(400).json({ message: "itemId and rating are required" });
        }
        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: "rating must be between 1 to 5" });
        }
        const item = await Item.findById(itemId);
        if (!item) {
            return res.status(400).json({ message: "Item not found" });
        }
        const newCount = item.rating.count + 1;
        const newAverage = (item.rating.average * item.rating.count + rating) / newCount;
        item.rating.count = newCount;
        item.rating.average = newAverage;
        await item.save();
        return res.status(200).json({ rating: item.rating });
    } catch (error) {
        console.log("Rating error:", error.message);
        return res.status(500).json(`rating error ${error}`);
    }
}