import React, { useEffect, useState, useCallback, useMemo } from 'react';
import UserNavbar from './NavBar';
import { serverUrl } from '../App';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import DeliveryBoyTracking from './DeliveryBoyTracking';
import { FiUser, FiMapPin, FiPackage, FiTrendingUp, FiNavigation, FiClock, FiCheckCircle } from 'react-icons/fi';
import { requestNotificationPermission } from '../utils/notificationHelper';
import { removeAssignment } from '../redux/userSlice';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function DeliveryBoy() {
  const { userData, socket, newAssignments } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [currentOrder, setCurrentOrder] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [showOtpBox, setShowOtpBox] = useState(false);
  const [otp, setOtp] = useState("");
  const [deliveryBoyLocation, setDeliveryBoyLocation] = useState(null);
  const [todayDelivery, setTodayDelivery] = useState([]);

  const totalDeliveriesToday = useMemo(() => todayDelivery.reduce((acc, curr) => acc + curr.count, 0), [todayDelivery]);
  const ratePerDelivery = 100;
  const totalEarning = useMemo(() => todayDelivery.reduce((sum, d) => sum + (d.count * ratePerDelivery), 0), [todayDelivery]);

  useEffect(() => {
    if (!socket || userData?.role !== "deliveryBoy") return;
    let watchId;
    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition((position) => {
        const { latitude, longitude } = position.coords;
        setDeliveryBoyLocation({ lat: latitude, lon: longitude });
        socket.emit('updateLocation', { userId: userData._id, latitude, longitude });
      }, (err) => console.error(err), { enableHighAccuracy: true });
    }
    return () => watchId && navigator.geolocation.clearWatch(watchId);
  }, [socket, userData]);

  const getAssignments = useCallback(async () => {
    try {
      const { data } = await axios.get(`${serverUrl}/api/order/get-assignments`, { withCredentials: true });
      setAssignments(data);
    } catch (err) { console.log(err); }
  }, []);

  const getCurrentOrder = useCallback(async () => {
    try {
      const { data } = await axios.get(`${serverUrl}/api/order/get-current-order`, { withCredentials: true });
      if (data?.shopOrder) {
        setCurrentOrder(data);
      } else {
        setCurrentOrder(null);
      }
    } catch (err) {
      console.log(err);
      setCurrentOrder(null);
    }
  }, []);

  const handleTodaysDelivery = async () => {
    try {
      const { data } = await axios.get(`${serverUrl}/api/order/get-today-delivery`, { withCredentials: true });
      setTodayDelivery(data);
    } catch (err) { console.log(err); }
  };

  const acceptOrder = async (id) => {
    try {
      await axios.get(`${serverUrl}/api/order/accept-order/${id}`, { withCredentials: true });
      getCurrentOrder();
      getAssignments();
      dispatch(removeAssignment(id));
    } catch (err) { console.log(err); }
  };

  const sendDeliveryOtp = async () => {
    try {
      await axios.post(`${serverUrl}/api/order/send-delivery-otp`,
        { orderId: currentOrder._id, shopOrderId: currentOrder.shopOrder._id },
        { withCredentials: true });
      setShowOtpBox(true);
    } catch (err) {
      console.error("Send delivery OTP error", err);
      alert("Unable to send OTP. Please try again.");
    }
  };

  const verifyOtp = async () => {
    try {
      await axios.post(`${serverUrl}/api/order/verify-delivery-otp`,
        { orderId: currentOrder._id, shopOrderId: currentOrder.shopOrder._id, otp },
        { withCredentials: true });
      setCurrentOrder(null);
      setShowOtpBox(false);
      setOtp("");
      handleTodaysDelivery();
    } catch (err) { alert("Invalid OTP."); }
  };

  useEffect(() => {
    getAssignments();
    getCurrentOrder();
    handleTodaysDelivery();
    requestNotificationPermission();
  }, [getAssignments, getCurrentOrder]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-blue-100 text-gray-800 p-3 rounded-xl shadow-lg">
          <p className="text-xs font-bold text-orange-500 uppercase mb-1">Time</p>
          <p className="text-sm font-black">{payload[0].payload.hour}:00</p>
          <p className="text-xs text-gray-500 mt-1">Orders: <span className="font-bold text-blue-600">{payload[0].value}</span></p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-blue-50 min-h-screen pb-10 font-sans">
      <UserNavbar />

      {/* New assignment toast notifications */}
      <div className="fixed top-20 right-4 z-[100] flex flex-col gap-2">
        {newAssignments.map((a) => (
          <div key={a._id} className="bg-orange-500 text-white p-4 rounded-2xl shadow-xl flex items-center gap-4 border border-orange-300 w-80">
            <div className="bg-white/20 p-2 rounded-lg"><FiPackage size={20} /></div>
            <div className="flex-1 overflow-hidden">
              <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">New Task</p>
              <p className="text-sm font-bold truncate">{a.shopName}</p>
            </div>
            <button onClick={() => dispatch(removeAssignment(a._id))} className="text-white/60 hover:text-white text-lg">✕</button>
          </div>
        ))}
      </div>

      <main className="max-w-3xl mx-auto px-4 pt-24 pb-12 flex flex-col gap-6">

        {/* Profile + Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Profile Card */}
          <div className="md:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-blue-100 flex items-center gap-5">
            <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center flex-shrink-0">
              <FiUser size={28} className="text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Active Partner</p>
              <h1 className="text-xl font-black text-gray-800 mt-0.5">{userData?.fullName}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="h-2 w-2 rounded-full bg-orange-500 animate-pulse"></span>
                <span className="text-xs font-bold text-orange-500">System Online</span>
              </div>
            </div>
          </div>

          {/* Today's Total */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-100 flex flex-col justify-center items-center text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Today's Total</p>
            <p className="text-4xl font-black text-blue-700">{totalDeliveriesToday}</p>
            <p className="text-xs text-gray-400 mt-1">Deliveries</p>
          </div>
        </div>

        {/* Chart + Earnings Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Chart */}
          <div className="md:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-blue-100">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-base font-black text-gray-800 flex items-center gap-2">
                <FiTrendingUp className="text-orange-500" /> Hourly Velocity
              </h2>
              <FiClock className="text-gray-300" />
            </div>
            <div className="h-[180px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={todayDelivery} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f97316" stopOpacity={1} />
                      <stop offset="100%" stopColor="#ea580c" stopOpacity={0.8} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0f0ff" />
                  <XAxis dataKey="hour" axisLine={false} tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }}
                    tickFormatter={(h) => `${h}h`} />
                  <YAxis axisLine={false} tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 11 }} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: '#eff6ff', radius: 8 }} />
                  <Bar dataKey="count" fill="url(#barGrad)" radius={[6, 6, 0, 0]} barSize={18} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Earnings */}
          <div className="bg-orange-500 rounded-2xl p-6 shadow-sm flex flex-col justify-between text-white">
            <div>
              <p className="text-xs font-black uppercase tracking-widest opacity-80 mb-1">Revenue</p>
              <h2 className="text-lg font-bold leading-tight">Today's Earnings</h2>
            </div>
            <div className="mt-4">
              <p className="text-4xl font-black">₹{totalEarning}</p>
              <p className="text-xs opacity-70 font-bold uppercase tracking-wider mt-1">Fixed: ₹{ratePerDelivery}/order</p>
            </div>
          </div>
        </div>

        {/* Active Task */}
        {currentOrder && (
          <div className="bg-white rounded-2xl shadow-sm border border-blue-100 overflow-hidden">

            {/* Header */}
            <div className="bg-blue-600 px-6 py-4 flex justify-between items-center">
              <h2 className="text-white font-black text-lg flex items-center gap-2">
                <FiNavigation size={18} /> Active Task
              </h2>
              <div className="bg-white/20 px-4 py-2 rounded-xl text-right">
                <p className="text-[10px] font-bold text-white/60 uppercase">Payout</p>
                <p className="text-lg font-black text-orange-300">₹{currentOrder?.shopOrder?.subtotal}</p>
              </div>
            </div>

            <div className="p-6 flex flex-col gap-4">

              {/* Shop + Address */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                  <p className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-1">Shop</p>
                  <p className="text-sm font-bold text-gray-800">{currentOrder?.shopOrder?.shop?.name}</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                  <p className="text-xs font-bold uppercase tracking-widest text-orange-400 mb-1 flex items-center gap-1">
                    <FiMapPin size={11} /> Customer Address
                  </p>
                  <p className="text-sm font-medium text-gray-700">{currentOrder?.deliveryAddress?.text}</p>
                </div>
              </div>

              {/* Map - fixed size */}
              <div className="rounded-xl overflow-hidden border border-blue-100"
                style={{ height: '350px', minHeight: '400px', maxHeight: '350px' }}>
                <DeliveryBoyTracking data={{
                  deliveryBoyLocation: deliveryBoyLocation || {
                    lat: userData.location.coordinates[1],
                    lon: userData.location.coordinates[0]
                  },
                  customerLocation: {
                    lat: currentOrder.deliveryAddress.latitude,
                    lon: currentOrder.deliveryAddress.longitude
                  }
                }} />
              </div>

              {/* OTP / Action */}
              {!showOtpBox ? (
                <button
                  onClick={sendDeliveryOtp}
                  className="w-full bg-orange-500 hover:bg-orange-400 text-white font-black py-4 rounded-xl text-base transition-all duration-300 hover:scale-[1.01]">
                  Arrived at Location
                </button>
              ) : (
                <div className="flex flex-col gap-3">
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest text-center mb-3">Enter OTP</p>
                    <input
                      type="text"
                      maxLength="6"
                      className="w-full bg-white border border-blue-200 rounded-xl py-4 text-center text-3xl font-black text-gray-800 tracking-[0.4em] focus:outline-none focus:border-blue-400"
                      placeholder="••••••"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowOtpBox(false)}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-4 rounded-xl transition">
                      Back
                    </button>
                    <button
                      onClick={verifyOtp}
                      className="flex-[2] bg-orange-500 hover:bg-orange-400 text-white font-black py-4 rounded-xl transition flex items-center justify-center gap-2">
                      <FiCheckCircle size={18} /> Complete Order
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Available Assignments */}
        <div>
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 px-1">
            Available Nearby ({assignments?.length || 0})
          </p>

          <div className="flex flex-col gap-3">
            {!currentOrder && assignments?.map((a, i) => (
              <div key={i} className="bg-white rounded-2xl border border-blue-100 border-l-4 border-l-orange-500 shadow-sm p-5 flex justify-between items-center hover:shadow-md transition-all duration-300">
                <div className="space-y-1">
                  <p className="font-black text-gray-800 text-base">{a.shopName}</p>
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <FiMapPin size={11} className="text-orange-400" /> {a.deliveryAddress?.text}
                  </p>
                </div>
                <button
                  onClick={() => acceptOrder(a.assignmentId)}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-black px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105 flex-shrink-0 ml-4">
                  Accept
                </button>
              </div>
            ))}

            {!currentOrder && assignments.length === 0 && (
              <div className="text-center py-14 bg-white rounded-2xl border-2 border-dashed border-blue-100">
                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FiPackage size={22} className="text-blue-300" />
                </div>
                <p className="text-gray-400 font-bold text-sm">Scanning for orders...</p>
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}

export default DeliveryBoy;