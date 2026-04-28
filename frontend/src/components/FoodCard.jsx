import React, { useState, useEffect } from 'react'
import { FaLeaf, FaStar, FaRegStar } from "react-icons/fa6";
import { IoTriangle } from 'react-icons/io5'
import { FiPlus, FiMinus } from 'react-icons/fi'
import { FaCartPlus } from 'react-icons/fa'
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../redux/userSlice';
import { useNavigate } from 'react-router-dom';

const FoodCard = ({ data }) => {
  const [quantity, setQuantity] = useState(0);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cartItems } = useSelector(state => state.user);

  useEffect(() => {
    const itemInCart = cartItems.find(item => item.id === (data._id || data.id));
    setQuantity(itemInCart ? itemInCart.quantity : 0);
  }, [cartItems, data._id, data.id]);

  const isInCart = quantity > 0;

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) =>
      i < rating
        ? <FaStar key={i} className='text-yellow-400 text-sm' />
        : <FaRegStar key={i} className='text-yellow-400 text-sm' />
    );
  };

  const handleIncrement = (e) => {
    e.stopPropagation();
    setQuantity(q => q + 1);
    dispatch(addToCart({
      id: data._id || data.id, name: data.name, price: data.price,
      image: data.image, shop: data.shop || data.shopId, quantity: 1, foodType: data.foodType
    }));
  };

  const handleDecrement = (e) => {
    e.stopPropagation();
    if (quantity > 0) {
      setQuantity(q => q - 1);
      dispatch(addToCart({
        id: data._id || data.id, name: data.name, price: data.price,
        image: data.image, shop: data.shop || data.shopId, quantity: -1, foodType: data.foodType
      }));
    }
  };

  return (
    <div
      onClick={() => navigate(`/item/${data._id || data.id}`)}
      className={`relative min-w-[160px] h-[170px] rounded-xl overflow-hidden border-2 ${
        isInCart ? 'border-blue-400' : 'border-orange-400'
      } hover:border-orange-500 transition-all duration-300 cursor-pointer group bg-white shadow-md hover:shadow-xl`}
    >
      <div className="absolute top-2 left-2 z-10">
        {data.foodType === "Veg" ? (
          <div className="w-5 h-5 border-2 border-green-600 bg-white flex items-center justify-center rounded-sm">
            <FaLeaf className="text-green-600 text-xs" />
          </div>
        ) : (
          <div className="w-5 h-5 border-2 border-red-600 bg-white flex items-center justify-center rounded-sm">
            <IoTriangle className="text-red-600 text-xs" />
          </div>
        )}
      </div>

      <div className="absolute top-2 right-2 z-10">
        {quantity === 0 ? (
          <button
            onClick={handleIncrement}
            className="flex items-center gap-1 bg-white border-2 border-orange-500 text-orange-500 px-2 py-1 rounded-lg font-bold text-sm hover:bg-orange-500 hover:text-white transition"
          >
            <FaCartPlus className="text-base" />
            <span>ADD</span>
          </button>
        ) : (
          <div className={`flex items-center gap-2 bg-white rounded-lg border-2 ${isInCart ? 'border-blue-400' : 'border-orange-400'} px-1.5 py-1`}>
            <button onClick={handleDecrement} className={`${isInCart ? 'text-blue-500 hover:bg-blue-500' : 'text-orange-500 hover:bg-orange-500'} hover:text-white rounded p-0.5 transition`}>
              <FiMinus className="text-sm" />
            </button>
            <span className={`${isInCart ? 'text-blue-600' : 'text-orange-500'} font-bold text-sm min-w-[16px] text-center`}>{quantity}</span>
            <button onClick={handleIncrement} className={`${isInCart ? 'text-blue-500 hover:bg-blue-500' : 'text-orange-500 hover:bg-orange-500'} hover:text-white rounded p-0.5 transition`}>
              <FiPlus className="text-sm" />
            </button>
          </div>
        )}
      </div>

      <img src={data.image} alt={data.name} className="w-full h-full object-cover transform group-hover:scale-110 transition duration-300" />
      <div className="absolute bottom-0 w-full h-20 bg-gradient-to-t from-black/80 to-transparent"></div>
      <div className="absolute bottom-0 w-full px-3 py-2">
        <p className="text-white text-sm font-bold tracking-wide truncate drop-shadow-lg mb-1">{data.name}</p>
        <div className="flex items-center justify-center gap-1 mb-1">
          {renderStars(Math.round(data.rating?.average || 0))}
          <span className="text-white text-xs font-medium ml-1">({data.rating?.count || 0})</span>
        </div>
        {data.price && (
          <div className="flex items-center justify-center">
            <span className="text-orange-300 text-base font-extrabold drop-shadow-md">₹{data.price}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default FoodCard;
