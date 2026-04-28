import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FiClock, FiMapPin, FiCheckCircle, FiArrowLeft } from 'react-icons/fi';
import { FaLeaf } from 'react-icons/fa6';

const OrderPlacedPage = () => {
  const navigate = useNavigate();
  const { recentOrder } = useSelector(state => state.user);

  const handleTrackOrder = () => navigate('/my-orders');
  const handleNewOrder = () => navigate('/');

  return (
    <div className="min-h-screen bg-blue-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-all duration-300 flex items-center border border-blue-100"
          >
            <FiArrowLeft className="text-gray-700 text-lg" />
          </button>
        </div>

        <div className="text-center mb-12">
          <div className="w-28 h-28 bg-orange-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-orange-300/40 animate-pulse">
            <FiCheckCircle className="w-20 h-20 text-white animate-bounce" />
          </div>
          <h1 className="text-4xl font-bold text-blue-700 mb-4">Order Placed!</h1>
          <p className="text-xl text-gray-600 font-medium">Your delicious meal is on its way 🍲</p>
        </div>

        <div className="bg-white rounded-3xl shadow-md border border-blue-100 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <FiClock className="mr-3 text-orange-500 w-8 h-8" />
            Order #12345
          </h2>

          <div className="space-y-4 mb-6">
            {recentOrder?.items?.map((item, idx) => (
              <div key={idx} className="flex items-center space-x-4 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                <img
                  src={item.image || '/api-placeholder/food.jpg'}
                  alt={item.name}
                  className="w-20 h-20 rounded-xl object-cover shadow-md"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{item.name}</h3>
                  <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-orange-500">₹{item.price * item.quantity}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-blue-100 pt-6">
            <div className="flex justify-between text-lg font-semibold mb-2">
              <span>Total:</span>
              <span className="text-orange-500">₹{recentOrder?.total || 450}</span>
            </div>
            <div className="text-sm text-gray-500 flex items-center">
              <FiMapPin className="mr-2 text-blue-500" />
              Delivering to: {recentOrder?.address || 'Your Address'}
            </div>
          </div>
        </div>

        <div className="text-center space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <button
              onClick={handleTrackOrder}
              className="flex-1 bg-orange-500 hover:bg-orange-400 text-white py-4 px-8 rounded-2xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center justify-center"
            >
              <FiMapPin className="mr-2 w-5 h-5" />
              Track Order
            </button>
            <button
              onClick={handleNewOrder}
              className="flex-1 bg-white text-gray-800 py-4 px-8 rounded-2xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 border border-blue-100 flex items-center justify-center"
            >
              <FaLeaf className="mr-2 w-5 h-5 text-blue-500" />
              New Order
            </button>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-12">
          You'll receive notifications for order updates
        </p>
      </div>
    </div>
  );
};

export default OrderPlacedPage;