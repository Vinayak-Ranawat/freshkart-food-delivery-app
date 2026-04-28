import React from 'react'
import { FiPlus, FiMinus, FiTrash2 } from 'react-icons/fi'
import { FaLeaf } from 'react-icons/fa6'
import { IoTriangle } from 'react-icons/io5'
import { useDispatch, useSelector } from 'react-redux'
import { addToCart, setCartItems } from '../redux/userSlice'

const CartItemCard = ({ data }) => {
  const dispatch = useDispatch();
  const { cartItems } = useSelector(state => state.user);

  const handleIncrement = () => {
    dispatch(addToCart({
      id: data.id, name: data.name, price: data.price,
      image: data.image, shop: data.shop, quantity: 1, foodType: data.foodType,
      customizations: data.customizations || []
    }));
  };

  const handleDecrement = () => {
    if (data.quantity > 1) {
      dispatch(addToCart({
        id: data.id, name: data.name, price: data.price,
        image: data.image, shop: data.shop, quantity: -1, foodType: data.foodType,
        customizations: data.customizations || []
      }));
    }
  };

  const handleRemove = () => {
    const updatedCart = cartItems.filter(item => item.id !== data.id);
    dispatch(setCartItems(updatedCart));
  };

  // Fix 1: customizations have no price, so skip price calculation
  const effectivePrice = data.price || 0;
  const itemSubtotal = effectivePrice * data.quantity;

  // Fix 2: shop name — handle object, string ID, or name
  const shopName = data.shop?.name || (typeof data.shop === 'string' ? null : null);

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow border border-blue-100">
      <div className="flex items-center gap-4">
        <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
          <img src={data.image} alt={data.name} className="w-full h-full object-cover" />
          <div className="absolute top-1 left-1">
            {data.foodType === "Veg" ? (
              <div className="w-4 h-4 border border-green-600 bg-white flex items-center justify-center rounded-sm">
                <FaLeaf className="text-green-600 text-[8px]" />
              </div>
            ) : (
              <div className="w-4 h-4 border border-red-600 bg-white flex items-center justify-center rounded-sm">
                <IoTriangle className="text-red-600 text-[8px]" />
              </div>
            )}
          </div>
        </div>

        <div className="flex-1">
          <h3 className="text-base font-bold text-gray-800 mb-1">{data.name}</h3>

          {/* Toppings */}
          {data.customizations && data.customizations.length > 0 && (
            <div className="text-xs text-gray-500 mb-1 flex flex-wrap gap-1">
              {data.customizations.map((c, idx) => (
                <span key={idx} className="bg-orange-50 text-orange-600 font-medium px-2 py-0.5 rounded-full border border-orange-100">
                  ✓ {c.name}
                </span>
              ))}
            </div>
          )}

          {/* Shop name — only show if available */}
          {shopName && (
            <p className="text-sm text-gray-500 mb-2">{shopName}</p>
          )}

          <p className="text-base font-semibold text-blue-700">
            ₹{effectivePrice} <span className="text-xs text-gray-400 font-normal">each</span>
          </p>
        </div>

        <div className="flex items-center gap-3 bg-blue-50 rounded-lg px-3 py-2 border border-blue-100">
          <button
            onClick={handleDecrement}
            className="text-orange-500 hover:bg-orange-500 hover:text-white rounded-full p-1.5 transition"
          >
            <FiMinus className="text-sm" />
          </button>
          <span className="text-gray-800 font-bold text-base min-w-[24px] text-center">
            {data.quantity}
          </span>
          <button
            onClick={handleIncrement}
            className="text-orange-500 hover:bg-orange-500 hover:text-white rounded-full p-1.5 transition"
          >
            <FiPlus className="text-sm" />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-blue-50">
        <button
          onClick={handleRemove}
          className="text-red-500 hover:text-red-600 text-sm font-medium flex items-center gap-1.5 transition"
        >
          <FiTrash2 className="text-base" />
          Remove Item
        </button>

        <div className="text-right">
          <p className="text-xs text-gray-500 mb-0.5">Item Subtotal</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-orange-500">₹{itemSubtotal.toFixed(2)}</p>
            {data.quantity > 1 && (
              <span className="text-xs text-gray-400 font-medium">
                ({data.quantity} × ₹{effectivePrice})
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CartItemCard