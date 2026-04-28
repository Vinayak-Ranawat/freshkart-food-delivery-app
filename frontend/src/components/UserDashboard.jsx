import React, { useRef, useState, useEffect } from "react";
import UserNavbar from "./NavBar";
import { categories } from "../category";
import CategoryCard from "./CategoryCard";
import { BiSolidLeftArrow, BiSolidRightArrow } from "react-icons/bi";
import { useSelector } from "react-redux";
import useGetShopByCity from "../hooks/useGetShopByCity.jsx";
import FoodCard from "./FoodCard";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { IoSparklesOutline, IoStorefrontOutline, IoSearch } from "react-icons/io5";

const UserDashboard = () => {
  useGetShopByCity();
  const { currentCity, shopInMyCity, itemsInMyCity, searchItems } = useSelector(state => state.user);
  const cateScrollRef = useRef();
  const shopScrollRef = useRef();
  const navigate = useNavigate();

  const [cateArrows, setCateArrows] = useState({ left: false, right: false });
  const [shopArrows, setShopArrows] = useState({ left: false, right: false });
  const [updatedItemsList, setUpdatedItemsList] = useState([]);

  const handleFilterByCategory = (category) => {
    if (category === "All") {
      setUpdatedItemsList(itemsInMyCity);
    } else {
      const filtered = itemsInMyCity.filter(i => i.category === category);
      setUpdatedItemsList(filtered);
    }
  };

  useEffect(() => {
    setUpdatedItemsList(itemsInMyCity);
  }, [itemsInMyCity]);

  const checkArrowVisibility = (ref, setArrows) => {
    if (!ref.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = ref.current;
    setArrows({
      left: scrollLeft > 10,
      right: scrollLeft < scrollWidth - clientWidth - 10,
    });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      checkArrowVisibility(cateScrollRef, setCateArrows);
      checkArrowVisibility(shopScrollRef, setShopArrows);
    }, 500);
    window.addEventListener("resize", () => {
      checkArrowVisibility(cateScrollRef, setCateArrows);
      checkArrowVisibility(shopScrollRef, setShopArrows);
    });
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", () => { });
    }
  }, [shopInMyCity, itemsInMyCity]);

  const scrollHandler = (ref, dir, setArrows) => {
    if (ref.current) {
      ref.current.scrollBy({ left: dir === "left" ? -400 : 400, behavior: "smooth" });
      setTimeout(() => checkArrowVisibility(ref, setArrows), 400);
    }
  };

  const SectionHeader = ({ title, icon: Icon, subtitle }) => (
    <div className="flex flex-col mb-8">
      <div className="flex items-center gap-2 mb-1">
        {Icon && <Icon className="text-orange-500 text-xl" />}
        <span className="text-xs font-bold tracking-[0.2em] text-orange-400 uppercase">
          {subtitle || "Curated for you"}
        </span>
      </div>
      <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">{title}</h2>
      <div className="h-1 w-12 bg-orange-500 mt-2 rounded-full"></div>
    </div>
  );

  return (
    <div className="bg-blue-50 min-h-screen pb-20 font-sans">
      <UserNavbar />

      <main className="max-w-[1400px] mx-auto pt-24 px-4 sm:px-8">

        <AnimatePresence>
          {searchItems && searchItems.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-16"
            >
              <SectionHeader title="Search Results" icon={IoSearch} subtitle="Found matches" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {searchItems.map((item, i) => (
                  <FoodCard key={i} data={item} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative group mb-16">
          <SectionHeader title="Inspiration for your first order" icon={IoSparklesOutline} />
          <div className="relative">
            {cateArrows.left && (
              <button
                onClick={() => scrollHandler(cateScrollRef, "left", setCateArrows)}
                className="absolute -left-4 top-1/2 -translate-y-1/2 z-20 bg-white shadow-xl border border-blue-100 text-orange-500 rounded-full w-12 h-12 hidden md:flex items-center justify-center hover:bg-orange-500 hover:text-white transition-all"
              >
                <BiSolidLeftArrow size={20} />
              </button>
            )}
            <div
              ref={cateScrollRef}
              onScroll={() => checkArrowVisibility(cateScrollRef, setCateArrows)}
              className="flex gap-6 overflow-x-auto no-scrollbar py-4 scroll-smooth"
            >
              {categories.map((cat, i) => (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} key={i}>
                  <CategoryCard name={cat.category} image={cat.image} onClick={() => handleFilterByCategory(cat.category)} />
                </motion.div>
              ))}
            </div>
            {cateArrows.right && (
              <button
                onClick={() => scrollHandler(cateScrollRef, "right", setCateArrows)}
                className="absolute -right-4 top-1/2 -translate-y-1/2 z-20 bg-white shadow-xl border border-blue-100 text-orange-500 rounded-full w-12 h-12 hidden md:flex items-center justify-center hover:bg-orange-500 hover:text-white transition-all"
              >
                <BiSolidRightArrow size={20} />
              </button>
            )}
          </div>
        </div>

        <div className="relative mb-20">
          <SectionHeader title={`Best Shops in ${currentCity || 'your city'}`} icon={IoStorefrontOutline} />
          <div className="relative">
            {shopArrows.left && (
              <button
                onClick={() => scrollHandler(shopScrollRef, "left", setShopArrows)}
                className="absolute -left-4 top-1/2 -translate-y-1/2 z-20 bg-white shadow-xl text-orange-500 rounded-full w-12 h-12 hidden md:flex items-center justify-center hover:bg-orange-500 hover:text-white transition-all"
              >
                <BiSolidLeftArrow size={20} />
              </button>
            )}
            <div
              ref={shopScrollRef}
              onScroll={() => checkArrowVisibility(shopScrollRef, setShopArrows)}
              className="flex gap-8 overflow-x-auto no-scrollbar py-4"
            >
              {shopInMyCity?.map((shop, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -5 }}
                  className="min-w-[200px] cursor-pointer"
                  onClick={() => navigate(`/shop/${shop._id}`)}
                >
                  <CategoryCard name={shop.name} image={shop.image} />
                </motion.div>
              ))}
            </div>
            {shopArrows.right && (
              <button
                onClick={() => scrollHandler(shopScrollRef, "right", setShopArrows)}
                className="absolute -right-4 top-1/2 -translate-y-1/2 z-20 bg-white shadow-xl text-orange-500 rounded-full w-12 h-12 hidden md:flex items-center justify-center hover:bg-orange-500 hover:text-white transition-all"
              >
                <BiSolidRightArrow size={20} />
              </button>
            )}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="pt-10 border-t border-blue-100"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-2 italic">
              What's Next on Your Plate?
            </h2>
            <p className="text-gray-500 font-medium">Your next favorite meal is one tap away.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
            {updatedItemsList?.map((item, i) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                viewport={{ once: true }}
                key={i}
              >
                <FoodCard data={item} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default UserDashboard;