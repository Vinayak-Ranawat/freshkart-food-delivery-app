import React from "react";
import axios from "axios";
import { useDispatch } from 'react-redux';
import { updateOrderStatus } from '../redux/userSlice';
import { serverUrl } from '../App';
import { FiUser, FiMail, FiPhone, FiMapPin, FiPackage, FiTruck, FiCheckCircle, FiClock } from 'react-icons/fi';

const STATUS_CONFIG = {
  "pending":          { color: "#f59e0b", bg: "#fffbeb", border: "#fde68a", icon: FiClock,       label: "Pending" },
  "preparing":        { color: "#3b82f6", bg: "#eff6ff", border: "#bfdbfe", icon: FiPackage,     label: "Preparing" },
  "out for delivery": { color: "#f97316", bg: "#fff7ed", border: "#fed7aa", icon: FiTruck,       label: "Out for Delivery" },
  "delivered":        { color: "#10b981", bg: "#ecfdf5", border: "#a7f3d0", icon: FiCheckCircle, label: "Delivered" },
};

const OwnerOrderCard = ({ data }) => {
  const [availableBoys, setAvailableBoys] = React.useState([]);
  const dispatch = useDispatch();

  const shopId = data?.shop?._id || data?.shopOrders?.shop?._id || data?.shopOrders?.[0]?.shop?._id;
  const orderId = data?._id;
  const shopOrderItems = data?.shopOrderItems || data?.shopOrders?.shopOrderItems || data?.shopOrders?.[0]?.shopOrderItems;
  const currentStatus = data?.status || data?.shopOrders?.status || data?.shopOrders?.[0]?.status || "pending";
  const subtotal = data?.subtotal || data?.shopOrders?.subtotal || data?.shopOrders?.[0]?.subtotal || data?.totalAmount;
  const assignedDeliveryBoy = data?.assignedDeliveryBoy || data?.shopOrders?.assignedDeliveryBoy || data?.shopOrders?.[0]?.assignedDeliveryBoy;

  const cfg = STATUS_CONFIG[currentStatus] || STATUS_CONFIG["pending"];
  const StatusIcon = cfg.icon;

  const handleUpdateStatus = async (status) => {
    if (!orderId || !shopId) return;
    try {
      const result = await axios.post(
        `${serverUrl}/api/order/update-status/${orderId}/${shopId}`,
        { status },
        { withCredentials: true }
      );
      dispatch(updateOrderStatus({ orderId, shopId, status }));
      if (result.data?.availableBoys) setAvailableBoys(result.data.availableBoys);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="bg-white rounded-[24px] shadow-sm border border-blue-100 mb-5 overflow-hidden">
      <div style={{ height: "4px", background: `linear-gradient(90deg, ${cfg.color}, ${cfg.color}88)` }} />

      <div className="p-6">

        {/* Customer Info */}
        <div className="flex justify-between items-start mb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-500 flex items-center justify-center text-white flex-shrink-0">
              <FiUser size={20} />
            </div>
            <div>
              <div className="font-bold text-base text-gray-900">{data.user?.fullName || "Customer"}</div>
              <div className="flex flex-wrap gap-3 mt-1">
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <FiMail size={11} className="text-blue-500" /> {data.user?.email}
                </span>
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <FiPhone size={11} className="text-blue-500" /> {data.user?.mobile}
                </span>
                {data.paymentMethod == "ONLINE"
                  ? <p className="text-xs text-gray-500">Payment: {data.payment ? "Paid" : "Pending"}</p>
                  : <p className="text-xs text-gray-500">Payment: {data.paymentMethod}</p>}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <span className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest">
              #{orderId?.slice(-6).toUpperCase()}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold rounded-full px-3 py-1 uppercase tracking-wide"
              style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}` }}>
              <StatusIcon size={10} /> {currentStatus}
            </span>
          </div>
        </div>

        <div className="border-t border-blue-50 mb-5" />

        {/* Items Ordered */}
        <div className="mb-5">
          <div className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest mb-3">Items Ordered</div>
          <div className="flex flex-col gap-3">
            {shopOrderItems?.map((item, i) => (
              <div key={i} className="bg-blue-50 rounded-2xl p-3 border border-blue-100">
                <div className="flex items-center gap-3">
                  <img
                    src={item?.image || 'https://placehold.co/48x48/f1f5f9/94a3b8?text=🍽'}
                    className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                    alt={item?.name || 'Food'}
                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/48x48/f1f5f9/94a3b8?text=🍽' }}
                  />
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-800">{item?.name || item?.item?.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">Qty: {item.quantity}</div>
                  </div>
                  <div className="text-sm font-bold text-orange-500">₹{(item.price * item.quantity).toLocaleString()}</div>
                </div>

                {/* Toppings box */}
                {item?.customizations && item.customizations.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-blue-200">
                    <p className="text-[10px] font-extrabold text-blue-400 uppercase tracking-widest mb-2">
                      Toppings / Customizations
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {item.customizations.map((c, j) => (
                        <span
                          key={j}
                          className="bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1 rounded-full border border-orange-200"
                        >
                          ✓ {c.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Address */}
        <div className="flex items-start gap-3 bg-blue-50 rounded-2xl p-4 border border-blue-100 mb-5">
          <FiMapPin size={15} className="text-orange-500 mt-0.5 flex-shrink-0" />
          <div>
            <div className="text-sm font-medium text-gray-700">{data.deliveryAddress?.text || "Address not available"}</div>
            {data.deliveryAddress?.latitude && (
              <div className="text-[10px] font-mono text-gray-400 mt-1">
                LAT: {data.deliveryAddress.latitude} | LON: {data.deliveryAddress.longitude}
              </div>
            )}
          </div>
        </div>

        {/* Status + Total */}
        <div className="flex justify-between items-end border-t border-blue-50 pt-5 flex-wrap gap-4">
          <div>
            <div className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest mb-2">Update Status</div>
            <select
              defaultValue={currentStatus}
              onChange={(e) => handleUpdateStatus(e.target.value)}
              className="text-sm font-bold rounded-xl px-3 py-2 border outline-none cursor-pointer"
              style={{ color: cfg.color, background: cfg.bg, borderColor: cfg.border }}
            >
              <option value="pending">⏳ Pending</option>
              <option value="preparing">👨‍🍳 Preparing</option>
              <option value="out for delivery">🚴 Out for Delivery</option>
              <option value="delivered">✅ Delivered</option>
            </select>
          </div>

          <div className="text-right">
            <div className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest">Order Total</div>
            <div className="text-3xl font-extrabold text-orange-500 tracking-tight">
              ₹{Number(subtotal).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Delivery Boy */}
        {currentStatus === "out for delivery" && (
          <div className="mt-4 rounded-2xl p-4 border border-orange-200 bg-orange-50">
            {assignedDeliveryBoy ? (
              <div>
                <p className="font-semibold text-orange-700 mb-2">Assigned Delivery Boy</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <FiUser size={14} className="text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{assignedDeliveryBoy.fullName}</p>
                    <p className="text-sm text-gray-600">{assignedDeliveryBoy.mobile}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <p className="font-semibold text-orange-700 mb-3 flex items-center gap-2">
                  <FiTruck size={13} /> Available Delivery Boys
                </p>
                {availableBoys?.length > 0 ? (
                  availableBoys.map((b, i) => (
                    <div key={i} className="flex justify-between text-sm py-2 border-b last:border-0 border-orange-100 text-orange-800">
                      <span className="font-medium">{b.fullName}</span>
                      <span className="text-orange-600">{b.mobile}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-orange-500 opacity-70">
                    Waiting for delivery boys to accept...
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerOrderCard;