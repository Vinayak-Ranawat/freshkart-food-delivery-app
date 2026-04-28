import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { serverUrl } from "../App";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../redux/userSlice";
import { FaLeaf } from "react-icons/fa6";
import { IoTriangle, IoArrowBackCircle } from "react-icons/io5";
import { FaStar, FaRegStar } from "react-icons/fa6";
import { FiMinus, FiPlus, FiCheck } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const ItemDetail = () => {
    const { itemId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { cartItems } = useSelector(state => state.user);

    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedCustomizations, setSelectedCustomizations] = useState([]);
    const [addedToast, setAddedToast] = useState(false);

    const cartItem = cartItems.find(c => c.id === itemId || c.id === item?._id);
    const quantity = cartItem?.quantity || 0;

    useEffect(() => {
        const fetchItem = async () => {
            try {
                const result = await axios.get(`${serverUrl}/api/item/get-by-id/${itemId}`, { withCredentials: true });
                setItem(result.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching item:", error);
                setLoading(false);
            }
        };
        fetchItem();
    }, [itemId]);

    const toggleCustomization = (name) => {
        setSelectedCustomizations(prev =>
            prev.includes(name) ? prev.filter(c => c !== name) : [...prev, name]
        );
    };

    const handleAddToCart = () => {
        dispatch(addToCart({
            id: item._id, name: item.name, price: item.price,
            image: item.image, shop: item.shop, quantity: 1,
            foodType: item.foodType,
            customizations: selectedCustomizations.map(name => ({ name }))
        }));
        setAddedToast(true);
        setTimeout(() => setAddedToast(false), 2000);
    };

    const handleIncrement = () => {
        dispatch(addToCart({
            id: item._id, name: item.name, price: item.price,
            image: item.image, shop: item.shop, quantity: 1,
            foodType: item.foodType,
            customizations: selectedCustomizations.map(name => ({ name }))
        }));
    };

    const handleDecrement = () => {
        if (quantity > 0) {
            dispatch(addToCart({
                id: item._id, name: item.name, price: item.price,
                image: item.image, shop: item.shop, quantity: -1,
                foodType: item.foodType,
                customizations: selectedCustomizations.map(name => ({ name }))
            }));
        }
    };

    const renderStars = (rating) => {
        return Array.from({ length: 5 }, (_, i) =>
            i < Math.round(rating)
                ? <FaStar key={i} className="text-yellow-400 text-sm" />
                : <FaRegStar key={i} className="text-yellow-400 text-sm" />
        );
    };

    if (loading) return (
        <div className="h-screen flex flex-col items-center justify-center bg-blue-50 gap-4">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-orange-500 font-bold animate-pulse">Loading...</p>
        </div>
    );

    if (!item) return (
        <div className="h-screen flex items-center justify-center bg-blue-50">
            <p className="text-gray-400 font-semibold text-lg">Item not found.</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-blue-50">

            {/* Toast */}
            <AnimatePresence>
                {addedToast && (
                    <motion.div
                        initial={{ opacity: 0, y: -40 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -40 }}
                        className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] bg-green-500 text-white font-bold px-6 py-3 rounded-2xl shadow-xl flex items-center gap-2"
                    >
                        <FiCheck className="text-lg" /> Added to cart!
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Back button */}
            <button
                onClick={() => navigate(-1)}
                className="fixed top-5 left-5 z-50 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform border border-blue-100"
            >
                <IoArrowBackCircle className="text-orange-500 text-2xl" />
            </button>

            {/* Main Layout */}
            <div className="flex flex-col lg:flex-row min-h-screen">

                {/* LEFT — Image */}
                <div className="w-full lg:w-[600px] lg:flex-shrink-0 lg:sticky lg:top-0 lg:h-screen bg-gray-100 flex items-center justify-center p-6">
                    <div className="relative w-full max-w-sm">
                        <div className="absolute inset-0 bg-orange-100 rounded-3xl blur-2xl opacity-60 scale-95" />
                        <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                            <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-64 lg:h-80 object-cover"
                            />
                            <div className="absolute top-3 right-3">
                                {item.foodType === "Veg" ? (
                                    <div className="w-8 h-8 border-2 border-green-500 bg-white flex items-center justify-center rounded-md shadow-lg">
                                        <FaLeaf className="text-green-600 text-sm" />
                                    </div>
                                ) : (
                                    <div className="w-8 h-8 border-2 border-red-500 bg-white flex items-center justify-center rounded-md shadow-lg">
                                        <IoTriangle className="text-red-600 text-sm" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT — Details */}
                <div className="flex-1 bg-blue-50 px-6 py-8 lg:px-10 lg:py-12 pb-32 overflow-y-auto">
                    <div className="bg-white rounded-2xl p-5 border border-blue-100 shadow-sm mb-5">
                        <div className="flex items-start justify-between mb-4 gap-3">
                            <h1 className="text-2xl lg:text-3xl font-black text-gray-900 leading-tight flex-1">
                                {item.name}
                            </h1>
                            <span className="bg-blue-100 text-blue-700 text-sm font-bold px-4 py-1.5 rounded-full flex-shrink-0">
                                {item.category}
                            </span>
                        </div>

                        {/* Price + Rating row */}
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Price</p>
                                <p className="text-4xl font-black text-orange-500">₹{item.price}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Rating</p>
                                <div className="flex items-center gap-1">
                                    {renderStars(item.rating?.average || 0)}
                                    <span className="text-xs text-gray-400 ml-1">({item.rating?.count || 0})</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Toppings Checkboxes */}
                    <div className="bg-white rounded-2xl p-5 border border-blue-100 shadow-sm mb-5">
                        <h2 className="text-base font-black text-gray-800 mb-1">
                            Toppings & Customizations
                        </h2>

                        {item.customizations && item.customizations.length > 0 ? (
                            <>
                                <p className="text-xs text-gray-400 mb-4">Check the options you'd like to add</p>
                                <div className="flex flex-col gap-2">
                                    {item.customizations.map((c, i) => {
                                        const isSelected = selectedCustomizations.includes(c.name);
                                        return (
                                            <label
                                                key={i}
                                                className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                                                    isSelected
                                                        ? "border-orange-400 bg-orange-50"
                                                        : "border-blue-100 bg-blue-50 hover:border-orange-200"
                                                }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => toggleCustomization(c.name)}
                                                    className="w-4 h-4 accent-orange-500 cursor-pointer flex-shrink-0"
                                                />
                                                <span className={`font-semibold text-sm flex-1 ${isSelected ? "text-orange-600" : "text-gray-700"}`}>
                                                    {c.name}
                                                </span>
                                                {isSelected && <FiCheck className="text-orange-500" size={16} />}
                                            </label>
                                        );
                                    })}
                                </div>

                                {selectedCustomizations.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-blue-100">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Selected</p>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedCustomizations.map((name, i) => (
                                                <span key={i} className="bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1 rounded-full">
                                                    ✓ {name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <p className="text-gray-400 text-sm font-medium mt-2">
                                No toppings available for this item.
                            </p>
                        )}
                    </div>

                    {/* Add to Cart / Quantity */}
                    <div className="flex items-center gap-4">
                        {quantity === 0 ? (
                            <button
                                onClick={handleAddToCart}
                                className="flex-1 bg-orange-500 hover:bg-orange-400 text-white font-black py-4 rounded-2xl text-lg shadow-lg shadow-orange-200 active:scale-[0.98] transition-all"
                            >
                                Add to Cart — ₹{item.price}
                            </button>
                        ) : (
                            <>
                                <div className="flex items-center gap-4 bg-white border border-blue-100 rounded-2xl px-5 py-3 shadow-sm">
                                    <button
                                        onClick={handleDecrement}
                                        className="text-orange-500 hover:bg-orange-500 hover:text-white rounded-full p-1.5 transition"
                                    >
                                        <FiMinus size={18} />
                                    </button>
                                    <span className="text-gray-800 font-black text-xl min-w-[28px] text-center">
                                        {quantity}
                                    </span>
                                    <button
                                        onClick={handleIncrement}
                                        className="text-orange-500 hover:bg-orange-500 hover:text-white rounded-full p-1.5 transition"
                                    >
                                        <FiPlus size={18} />
                                    </button>
                                </div>
                                <button
                                    onClick={() => navigate("/cart")}
                                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-2xl text-base shadow-lg active:scale-[0.98] transition-all"
                                >
                                    Go to Cart — ₹{item.price * quantity}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ItemDetail;