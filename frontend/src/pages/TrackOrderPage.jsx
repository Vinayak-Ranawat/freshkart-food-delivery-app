import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { serverUrl } from "../App";
import { IoIosArrowRoundBack } from "react-icons/io";
import DeliveryBoyTracking from "../components/DeliveryBoyTracking";
import { useSelector } from "react-redux";

function TrackOrderPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [currentOrder, setCurrentOrder] = React.useState(null);
  const { socket } = useSelector(state => state.user);
  const [liveLocation, setLiveLocation] = useState({});

  const handleGetOrder = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/order/get-order-by-id/${orderId}`, { withCredentials: true });
      setCurrentOrder(result.data);
    } catch (error) { console.log(error); }
  };

  useEffect(() => {
    if (socket) {
      socket.on('updatedDeliveryLocation', ({ deliveryBoyId, latitude, longitude }) => {
        setLiveLocation(prev => ({ ...prev, [deliveryBoyId]: { lat: latitude, lon: longitude } }));
      });
    }
  }, [socket]);

  useEffect(() => { handleGetOrder(); }, [orderId]);

  return (
    <div className="max-w-4xl mx-auto p-4 flex flex-col gap-6 bg-blue-50 min-h-screen">
      <div
        className="relative flex items-center gap-4 top-[20px] left-[20px] z-[10] mb-[10px] cursor-pointer"
        onClick={() => navigate("/")}
      >
        <IoIosArrowRoundBack size={35} className="text-orange-500" />
        <h1 className="text-2xl font-bold text-gray-800">Track Order</h1>
      </div>

      {currentOrder?.shopOrders?.map((shopOrder, index) => (
        <div key={index} className="bg-white p-4 rounded-2xl shadow-sm border border-blue-100 space-y-4">
          <div>
            <p className="text-lg font-bold mb-2 text-orange-500">{shopOrder.shop?.name}</p>
            <p className="font-semibold text-gray-700">
              <span className="text-gray-500">Items:</span>{" "}
              {shopOrder.shopOrderItems?.map((i) => i.name).join(", ")}
            </p>
            <p className="text-gray-700"><span className="font-semibold text-gray-500">Subtotal:</span> ₹{shopOrder.subtotal}</p>
            <p className="text-gray-700"><span className="font-semibold text-gray-500">Delivery Address:</span> {currentOrder?.deliveryAddress?.text}</p>
          </div>

          {shopOrder.status !== "delivered" ? (
            <>
              {shopOrder.assignedDeliveryBoy ? (
                <div className="text-sm text-gray-700">
                  <p className="font-semibold">
                    <span className="text-gray-500">Delivery Boy:</span>{" "}
                    {shopOrder.assignedDeliveryBoy.fullName}
                  </p>
                  <p className="font-semibold">
                    <span className="text-gray-500">Contact:</span>{" "}
                    {shopOrder.assignedDeliveryBoy.mobile}
                  </p>
                </div>
              ) : (
                <p className="font-semibold text-gray-400">Delivery Boy is not assigned yet.</p>
              )}
            </>
          ) : (
            <p className="text-green-600 font-semibold text-lg">✅ Delivered</p>
          )}

          {shopOrder.assignedDeliveryBoy?.location?.coordinates && shopOrder.status != "delivered" && (
            <div className="h-[400px] w-full rounded-2xl overflow-hidden shadow-md">
              <DeliveryBoyTracking data={{
                deliveryBoyLocation: liveLocation[shopOrder.assignedDeliveryBoy._id] || {
                  lat: shopOrder.assignedDeliveryBoy.location.coordinates[1],
                  lon: shopOrder.assignedDeliveryBoy.location.coordinates[0],
                },
                customerLocation: {
                  lat: currentOrder.deliveryAddress.latitude,
                  lon: currentOrder.deliveryAddress.longitude,
                },
              }} />
            </div>
          )}
        </div>
      ))}

      {!currentOrder && (
        <p className="text-center text-gray-400 font-semibold mt-10">Loading order...</p>
      )}
    </div>
  );
}

export default TrackOrderPage;