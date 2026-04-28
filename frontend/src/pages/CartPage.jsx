import React from 'react'
import { useSelector } from 'react-redux'
import CartItemCard from '../components/CartItemCard'
import { useNavigate } from 'react-router-dom'
import { IoArrowBackCircleSharp } from 'react-icons/io5'
import { MdShoppingCart } from 'react-icons/md'

const CartPage = () => {
  const navigate = useNavigate()
  const { cartItems } = useSelector(state => state.user)

  const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)
  const deliveryFee = (subtotal > 500 || subtotal === 0) ? 0 : 40
  const gst = subtotal * 0.05
  const total = subtotal + deliveryFee + gst

  return (
    <div className="min-h-screen bg-blue-50 font-sans">
      <div className="bg-white shadow-sm sticky top-0 z-10 border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <IoArrowBackCircleSharp
              size={35}
              className="text-orange-500 cursor-pointer hover:text-orange-600 transition"
              onClick={() => navigate('/')}
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Your Cart</h1>
              <p className="text-sm text-gray-500">
                {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} saved
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-dashed border-blue-200">
            <div className="bg-blue-50 p-6 rounded-full mb-4">
              <MdShoppingCart className="text-blue-200 text-7xl" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-8 max-w-xs text-center">
              Looks like you haven't added anything to your cart yet.
            </p>
            <button
              onClick={() => navigate('/')}
              className="bg-orange-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-400 transition shadow-lg shadow-orange-100 active:scale-95"
            >
              Browse Menu
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold text-gray-800">Review Items</h2>
                <button
                  onClick={() => navigate('/')}
                  className="text-orange-500 text-sm font-semibold hover:underline"
                >
                  + Add more
                </button>
              </div>
              {cartItems.map((item, index) => (
                <CartItemCard key={index} data={item} />
              ))}
            </div>

            <div className="lg:col-span-1 sticky top-28">
              <div className="bg-white rounded-2xl p-6 shadow-md border border-blue-100">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Order Summary</h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span className="text-sm">Subtotal</span>
                    <span className="font-medium text-gray-800">₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span className="text-sm">Delivery Fee</span>
                    <span className={`font-medium ${deliveryFee === 0 ? 'text-green-600' : 'text-gray-800'}`}>
                      {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span className="text-sm">GST (5%)</span>
                    <span className="font-medium text-gray-800">₹{gst.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-dashed border-blue-100 pt-4 flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-800">Total</span>
                    <span className="text-2xl font-black text-orange-500">₹{total.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  className="w-full bg-orange-500 text-white py-4 rounded-xl font-bold hover:bg-orange-400 transition-all shadow-lg shadow-orange-100 active:scale-[0.98] mb-4"
                  onClick={() => navigate("/checkout")}
                >
                  Proceed to Checkout
                </button>

                <div className={`p-3 rounded-lg text-center text-xs font-medium transition-colors ${subtotal > 500 ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'}`}>
                  {subtotal > 500
                    ? "🎉 You've unlocked FREE delivery!"
                    : `Add ₹${(500 - subtotal).toFixed(0)} more for FREE delivery`}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CartPage