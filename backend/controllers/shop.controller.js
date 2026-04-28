import Shop from "../models/shop.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
export const createEditShop = async (req, res) => {
    try {
        const {name ,city, state, address}=req.body
        let image;
        if(req.file){
            console.log(req.file)
            image=await uploadOnCloudinary(req.file.path)
        }
        let shop = await Shop.findOne({owner:req.user});
        if(!shop){
            shop=await Shop.create({
            name ,city, state, address,image,owner:req.user
            })
        }else{
            shop=await Shop.findByIdAndUpdate(shop._id,{
            name ,city, state, address,image,owner:req.user
            },{new:true})
        }
        
        await shop.populate("owner items")
        return res.status(201).json(shop);
    } catch (error) {
        return res.status(500).json(`createShop error ${error}`);
    }
}


export const getMyShop = async (req, res) => {
    try {
        const shop = await Shop.findOne({owner:req.user}).populate("owner").populate({
                path:"items",
                options:{sort: {updatedAt: -1}}
            })
        if(!shop){
            return res.status(200).json(null); 
        }
        return res.status(200).json(shop);
    } catch (error) {
        return res.status(500).json(`getMyShop error ${error}`);
    }
}

export const getShopByCity = async (req, res) => {
    try {
        const {city}=req.params;
        const shops=await Shop.find({
            city:{$regex: new RegExp(`^${city}$`,"i")}  
        }).populate("owner").populate("items")
        if(!shops){
            return res.status(400).json("No shops found");
        }
        return res.status(200).json(shops);
    } catch (error) {
        return res.status(500).json(`getShopByCity error ${error}`);
    }
}

export const getShopsWithoutOwners = async (req, res) => {
    try {
        const shopsWithoutOwners = await Shop.find({ $or: [{owner: null}, {owner: {$exists: false}}] });
        return res.status(200).json({
            count: shopsWithoutOwners.length,
            shops: shopsWithoutOwners
        });
    } catch (error) {
        return res.status(500).json(`getShopsWithoutOwners error ${error}`);
    }
}
