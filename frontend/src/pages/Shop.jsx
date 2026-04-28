import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { serverUrl } from '../App';
import FoodCard from '../components/FoodCard';
import { motion } from 'framer-motion';
import { IoArrowBackCircle, IoLocationSharp, IoRestaurant, IoSearchOutline, IoFlash } from "react-icons/io5";
import { MdOutlineVerified } from "react-icons/md";

const Shop = () => {
  const { shopId } = useParams();
  const navigate = useNavigate();
  const [shop, setShop] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleShop = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/item/get-by-shop/${shopId}`, { withCredentials: true });
      setShop(result.data.shop);
      setItems(result.data.items);
      setLoading(false);
    } catch (error) {
      console.error("Error:", error);
      setLoading(false);
    }
  };

  useEffect(() => { handleShop(); }, [shopId]);

  if (loading) return (
    <div className="h-screen flex flex-col justify-center items-center gap-4 bg-blue-50">
      <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-orange-500 font-bold animate-pulse">Loading Menu...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-blue-50 pb-24">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative h-[300px] md:h-[450px] w-full overflow-hidden"
      >
        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 z-30 transition-transform hover:scale-110 active:scale-95"
        >
          <IoArrowBackCircle className="text-white/90 text-5xl drop-shadow-lg" />
        </button>

        <img src={shop?.image} alt={shop?.name} className="w-full h-full object-cover scale-105" />

        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/70 flex flex-col items-center justify-center text-white px-4">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white/20 backdrop-blur-md p-4 rounded-full mb-4 border border-white/30"
          >
            <IoRestaurant className="text-3xl md:text-4xl text-white" />
          </motion.div>

          <motion.h1
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-4xl md:text-7xl font-black text-center tracking-tighter drop-shadow-2xl flex items-center gap-3"
          >
            {shop?.name}
            <MdOutlineVerified className="text-blue-300 text-2xl md:text-4xl" />
          </motion.h1>

          <div className="flex items-center gap-2 mt-4 bg-black/30 px-4 py-1.5 rounded-full backdrop-blur-sm border border-white/10">
            <IoLocationSharp className="text-orange-400" />
            <span className="text-sm md:text-base font-medium tracking-wide uppercase">
              {shop?.city}, {shop?.state}
            </span>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 mt-10">
        <div className="flex flex-col items-center mb-12">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-[2px] w-12 bg-orange-500"></div>
            <span className="text-orange-500 font-bold tracking-[0.2em] text-xs uppercase">Premium Selection</span>
            <div className="h-[2px] w-12 bg-orange-500"></div>
          </div>
          <h2 className="text-4xl font-black text-gray-900 flex items-center gap-3">
            <IoFlash className="text-yellow-400" /> Our Menu
          </h2>
        </div>

        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8 lg:gap-12"
        >
          {items.map((item) => (
            <motion.div key={item._id} whileHover={{ y: -10 }} className="flex justify-center">
              <FoodCard data={item} />
            </motion.div>
          ))}
        </motion.div>

        {items.length === 0 && (
          <div className="text-center py-24">
            <IoSearchOutline className="mx-auto text-6xl text-blue-200 mb-4" />
            <p className="text-gray-400 text-xl font-medium">No delicacies found today.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;