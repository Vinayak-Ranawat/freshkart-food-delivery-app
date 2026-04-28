import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { MdLocationOn, MdSearch, MdMyLocation, MdDirectionsRun } from 'react-icons/md';
import { HiOutlineDevicePhoneMobile, HiOutlineCreditCard } from 'react-icons/hi2';
import { IoArrowBackCircleSharp } from 'react-icons/io5';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import "leaflet/dist/leaflet.css";
import { setAddress, setLocation } from '../redux/mapSlice';
import { addMyOrder } from '../redux/userSlice';
import { serverUrl } from '../App';

function RecenterMap({ location }) {
  const map = useMap();
  useEffect(() => {
    if (location.lat && location.long) {
      map.setView([location.lat, location.long], 16, { animate: true });
    }
  }, [location, map]);
  return null;
}

const CheckOut = () => {
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [addressInput, setAddressInput] = useState('');
  const apiKey = import.meta.env.VITE_GEOAPIKEY;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { location, address } = useSelector(state => state.map);
  const { cartItems } = useSelector(state => state.user);

  const onDragEnd = (e) => {
    const { lat, lng } = e.target._latlng;
    dispatch(setLocation({ lat, long: lng }));
    getAddressByLatLong(lat, lng);
  };

  const getAddressByLatLong = async (lat, long) => {
    try {
      const result = await axios.get(
        `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${long}&format=json&apiKey=${apiKey}`
      );
      const newAddress = result?.data.results?.[0].address_line2 || result?.data.results?.[0].address_line1;
      dispatch(setAddress(newAddress));
    } catch (error) {
      console.error("Error fetching address:", error);
    }
  };

  const getCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      dispatch(setLocation({ lat: latitude, long: longitude }));
      getAddressByLatLong(latitude, longitude);
    });
  };

  const getLatLongByAddress = async () => {
    try {
      const result = await axios.get(
        `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(addressInput)}&format=json&apiKey=${apiKey}`
      );
      if (result.data.results.length > 0) {
        const { lat, lon } = result.data.results[0];
        dispatch(setLocation({ lat, long: lon }));
      }
    } catch (error) {
      console.error("Error fetching coordinates:", error);
    }
  };

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const deliveryFee = (subtotal > 500 || subtotal === 0) ? 0 : 40;
  const gst = subtotal * 0.05;
  const total = subtotal + deliveryFee + gst;

  const handlePlaceOrder = async () => {
    const amountWithDeliveryFee = total + deliveryFee;
    try {
      const result = await axios.post(`${serverUrl}/api/order/place-order`, {
        paymentMethod,
        deliveryAddress: { text: addressInput, latitude: location.lat, longitude: location.long },
        totalAmount: amountWithDeliveryFee,
        cartItems
      }, { withCredentials: true });

      if (paymentMethod == "COD") {
        dispatch(addMyOrder(result.data));
        navigate('/order-placed');
      } else {
        const orderId = result.data.orderId;
        const razororder = result.data.razorOrder;
        openRazorpayWindow(orderId, razororder);
      }
    } catch (error) {
      console.log(error);
    }
  }

  const openRazorpayWindow = (orderId, razororder) => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: razororder.amount,
      Currency: 'INR',
      name: 'Fresh Cart',
      description: 'Food Delivery Payment',
      order_id: razororder.id,
      handler: async function (response) {
        try {
          const result = await axios.post(`${serverUrl}/api/order/verify-payment`, {
            razorpay_payment_id: response.razorpay_payment_id, orderId
          }, { withCredentials: true });
          dispatch(addMyOrder(result.data));
          navigate('/order-placed');
        } catch (error) {
          console.log("Payment verification error:", error);
        }
      }
    }
    const rzp = new window.Razorpay(options);
    rzp.open();
  }

  useEffect(() => {
    setAddressInput(address);
  }, [address]);

  return (
    <div className="min-h-screen bg-blue-50 p-4 md:p-10 flex justify-center items-center font-sans">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-md border border-blue-100 p-6 md:p-8 space-y-8">

        <div className="flex items-center gap-4">
          <IoArrowBackCircleSharp
            size={35}
            className="text-orange-500 cursor-pointer hover:text-orange-600 transition"
            onClick={() => navigate(-1)}
          />
          <h1 className="text-2xl font-bold text-gray-800">Checkout</h1>
        </div>

        <section className="space-y-4">
          <div className="flex items-center gap-2 text-blue-600 font-bold">
            <MdLocationOn className="text-xl" />
            <span className="text-sm uppercase tracking-wide">Delivery Location</span>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              className="flex-1 border border-blue-100 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 transition bg-blue-50"
              placeholder='Enter delivery address'
              value={addressInput}
              onChange={(e) => setAddressInput(e.target.value)}
            />
            <button
              className="bg-orange-500 p-3 rounded-lg text-white hover:bg-orange-400 shadow-sm transition"
              onClick={getLatLongByAddress}
            >
              <MdSearch className="text-xl" />
            </button>
            <button
              className="bg-blue-500 p-3 rounded-lg text-white hover:bg-blue-600 shadow-sm transition"
              onClick={getCurrentLocation}
            >
              <MdMyLocation className="text-xl" />
            </button>
          </div>

          <div className="w-full h-56 bg-blue-50 rounded-xl overflow-hidden relative border border-blue-100 z-0">
            <MapContainer
              center={[location?.lat || 25.4484, location?.long || 78.5685]}
              zoom={15}
              className="h-full w-full"
            >
              <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <RecenterMap location={location} />
              <Marker
                position={[location?.lat, location?.long]}
                draggable={true}
                eventHandlers={{ dragend: onDragEnd }}
              />
            </MapContainer>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-bold text-gray-800">Payment Method</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              onClick={() => setPaymentMethod('COD')}
              className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === 'COD' ? 'border-orange-400 bg-orange-50' : 'border-blue-100 hover:border-blue-200 bg-white'}`}
            >
              <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                <MdDirectionsRun size={24} />
              </div>
              <div>
                <p className="font-bold text-sm text-gray-800">Cash on Delivery</p>
                <p className="text-xs text-gray-500">Pay when your food arrives</p>
              </div>
            </div>

            <div
              onClick={() => setPaymentMethod('ONLINE')}
              className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === 'ONLINE' ? 'border-orange-400 bg-orange-50' : 'border-blue-100 hover:border-blue-200 bg-white'}`}
            >
              <div className="flex gap-1">
                <HiOutlineDevicePhoneMobile size={24} className="text-purple-500" />
                <HiOutlineCreditCard size={24} className="text-blue-500" />
              </div>
              <div>
                <p className="font-bold text-sm text-gray-800">Online Payment</p>
                <p className="text-xs text-gray-500">UPI / Card / Netbanking</p>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-bold text-gray-800">Order Summary</h2>
          <div className="border border-blue-100 rounded-xl p-5 bg-blue-50 space-y-4">
            <div className="space-y-2 max-h-32 overflow-y-auto pr-2">
              {cartItems.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-gray-600">{item.name} × {item.quantity}</span>
                  <span className="font-medium text-gray-800">₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-dashed border-blue-200 pt-4 space-y-2">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Delivery Fee</span>
                <span className={deliveryFee === 0 ? "text-green-600 font-bold" : ""}>
                  {deliveryFee === 0 ? "FREE" : `₹${deliveryFee.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>GST (5%)</span><span>₹{gst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xl font-extrabold text-orange-500 pt-2 border-t border-blue-100">
                <span>Total</span><span>₹{total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </section>

        <button
          className="w-full bg-orange-500 text-white font-bold py-4 rounded-xl hover:bg-orange-400 transition-all shadow-lg hover:shadow-orange-200 active:scale-[0.98] disabled:bg-gray-300 disabled:cursor-not-allowed"
          disabled={cartItems.length === 0}
          onClick={handlePlaceOrder}
        >
          {paymentMethod == 'COD' ? "Place Order (Cash on Delivery)" : "Pay & Place Order"}
        </button>
      </div>
    </div>
  );
};

export default CheckOut;