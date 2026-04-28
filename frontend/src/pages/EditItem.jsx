import React, { useEffect, useState } from "react";
import { ImSpoonKnife } from "react-icons/im";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { IoArrowBackCircleSharp } from "react-icons/io5";
import { FiPlus, FiX } from "react-icons/fi";
import axios from "axios";
import { serverUrl } from "../App";
import { setMyShopData } from "../redux/ownerSlice";
import { ClipLoader } from "react-spinners";

const EditFood = () => {
    const navigate = useNavigate();
    const { myShopData } = useSelector(state => state.owner);
    const { itemId } = useParams();
    const [currentItem, setCurrentItem] = useState(null);
    const [name, setName] = useState("");
    const [price, setPrice] = useState(0);
    const [frontendImage, setFrontendImage] = useState(null);
    const [backendImage, setBackendImage] = useState(null);
    const [category, setCategory] = useState("");
    const [foodType, setFoodType] = useState("Veg");
    const [loading, setLoading] = useState(false);
    const [customizations, setCustomizations] = useState([]);
    const [customInput, setCustomInput] = useState("");
    const categories = ["Snacks", "Main Course", "Desserts", "Pizza", "Burgers",
        "Sandwiches", "South Indian", "North Indian", "Chinese", "Fast Food", "Sweets", "Others"];
    const dispatch = useDispatch();

    const handleImage = (e) => {
        const file = e.target.files[0];
        setBackendImage(file);
        setFrontendImage(URL.createObjectURL(file));
    };

    const addCustomization = () => {
        const trimmed = customInput.trim();
        if (!trimmed || customizations.find(c => c.name === trimmed)) return;
        setCustomizations(prev => [...prev, { name: trimmed }]);
        setCustomInput("");
    };

    const removeCustomization = (name) => {
        setCustomizations(prev => prev.filter(c => c.name !== name));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("name", name);
            formData.append("price", price);
            formData.append("category", category);
            formData.append("foodType", foodType);
            formData.append("customizations", JSON.stringify(customizations));
            if (backendImage) formData.append("image", backendImage);
            const result = await axios.post(`${serverUrl}/api/item/edit-item/${itemId}`, formData, { withCredentials: true });
            dispatch(setMyShopData(result.data));
            setLoading(false);
            navigate("/");
        } catch (error) {
            console.error("Error editing item:", error.result?.data || error.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        const handleGetItemById = async () => {
            try {
                const result = await axios.get(`${serverUrl}/api/item/get-by-id/${itemId}`, { withCredentials: true });
                setCurrentItem(result.data);
            } catch (error) {
                console.error("Error fetching item:", error.result?.data || error.message);
            }
        };
        handleGetItemById();
    }, [itemId]);

    useEffect(() => {
        setName(currentItem?.name || "");
        setPrice(currentItem?.price || 0);
        setFrontendImage(currentItem?.image || null);
        setCategory(currentItem?.category || "");
        setFoodType(currentItem?.foodType || "Veg");
        setCustomizations(currentItem?.customizations || []);
    }, [currentItem]);

    const inputClass = "w-full border border-blue-100 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-blue-50 text-gray-700";
    const labelClass = "text-sm font-medium text-gray-600 mb-1 block";

    return (
        <div className="min-h-screen bg-blue-50 flex justify-center py-16 px-4">
            <div className="w-full max-w-lg bg-white shadow-md rounded-3xl p-8 border border-blue-100">
                <IoArrowBackCircleSharp size={35} className="text-orange-500 mb-4 cursor-pointer" onClick={() => navigate("/")} />
                <div className="flex justify-center mb-4">
                    <div className="bg-orange-100 p-4 rounded-full shadow-sm">
                        <ImSpoonKnife className="text-orange-500 text-3xl" />
                    </div>
                </div>
                {myShopData && <h1 className="text-center text-3xl font-bold text-blue-700 mb-8">Edit Food</h1>}

                <form className="space-y-5" onSubmit={handleSubmit}>
                    <div><label className={labelClass}>Name</label>
                        <input type="text" placeholder="Enter food item" className={inputClass} onChange={(e) => setName(e.target.value)} value={name} />
                    </div>
                    <div><label className={labelClass}>Food Image</label>
                        <input type="file" accept="image/*" className={inputClass} onChange={handleImage} />
                        {frontendImage && <img src={frontendImage} alt="" className="w-full h-48 object-cover rounded-xl border border-blue-100 mt-2" />}
                    </div>
                    <div><label className={labelClass}>Price</label>
                        <input type="number" placeholder="0" className={inputClass} onChange={(e) => setPrice(e.target.value)} value={price} />
                    </div>
                    <div><label className={labelClass}>Select Category</label>
                        <select className={inputClass} onChange={(e) => setCategory(e.target.value)} value={category}>
                            <option value="">Select Category</option>
                            {categories.map((cat, i) => <option value={cat} key={i}>{cat}</option>)}
                        </select>
                    </div>
                    <div><label className={labelClass}>Food Type</label>
                        <select className={inputClass} onChange={(e) => setFoodType(e.target.value)} value={foodType}>
                            <option value="Veg">Veg</option>
                            <option value="Non-Veg">Non-Veg</option>
                        </select>
                    </div>

                    {/* Customizations */}
                    <div>
                        <label className={labelClass}>
                            Customizations <span className="text-gray-400 font-normal">(optional)</span>
                        </label>
                        <p className="text-xs text-gray-400 mb-2">e.g. Extra Cheese, No Onion, Extra Spicy</p>
                        <div className="flex gap-2 mb-3">
                            <input
                                type="text"
                                placeholder="Type an option and press +"
                                className="flex-1 border border-blue-100 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-blue-50 text-gray-700 text-sm"
                                value={customInput}
                                onChange={(e) => setCustomInput(e.target.value)}
                                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomization(); } }}
                            />
                            <button type="button" onClick={addCustomization}
                                className="bg-orange-500 hover:bg-orange-400 text-white px-4 py-2 rounded-xl font-bold transition">
                                <FiPlus size={18} />
                            </button>
                        </div>
                        {customizations.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {customizations.map((c, i) => (
                                    <span key={i} className="flex items-center gap-1.5 bg-blue-100 text-blue-700 text-sm font-semibold px-3 py-1.5 rounded-full">
                                        {c.name}
                                        <button type="button" onClick={() => removeCustomization(c.name)} className="text-blue-400 hover:text-red-500 transition">
                                            <FiX size={14} />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    <button className="w-full bg-orange-500 text-white font-bold py-3 rounded-xl shadow-md hover:bg-orange-400 transition-all" disabled={loading}>
                        {loading ? <ClipLoader size={25} color="white" /> : "Save"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EditFood;
