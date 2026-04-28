import express from "express";

import isAuth from "../middlewares/isAuth.js";
import { addItem, deleteItem, editItem, getItemById, getItemsByCity, getItemsByShop, searchItems, rating } from "../controllers/item.controller.js";
import { upload } from "../middlewares/multer.js";
// import Item from "../models/item.model.js";

const ItemRouter = express.Router();

ItemRouter.post("/add-item", isAuth, upload.single("image"), addItem);
ItemRouter.post("/edit-item/:itemId", isAuth, upload.single("image"), editItem);
ItemRouter.get("/get-by-id/:itemId", isAuth, getItemById);
ItemRouter.delete("/delete/:itemId", isAuth, deleteItem);
ItemRouter.get("/get-by-city/:city", isAuth, getItemsByCity);
ItemRouter.get("/get-by-shop/:shopId", isAuth, getItemsByShop);
ItemRouter.get("/search-items", isAuth, searchItems);
ItemRouter.post("/rating", isAuth, rating);
export default ItemRouter;

