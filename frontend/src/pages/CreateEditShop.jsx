import React, { useState } from "react";
import { ImSpoonKnife } from "react-icons/im";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { IoArrowBackCircleSharp } from "react-icons/io5";
import axios from "axios";
import { serverUrl } from "../App";
import { setMyShopData } from "../redux/ownerSlice";
import { ClipLoader } from "react-spinners";

const CreateEditShop = () => {
  const navigate = useNavigate();
  const { myShopData } = useSelector(state => state.owner);
  const { currentCity, currentState, currentAddress } = useSelector(state => state.user);
  const [name, setName] = useState(myShopData?.name || "");
  const [address, setAddress] = useState(myShopData?.address || currentAddress);
  const [city, setCity] = useState(myShopData?.city || currentCity);
  const [state, setState] = useState(myShopData?.state || currentState);
  const [frontendImage, setFrontendImage] = useState(myShopData?.image || null);
  const [backendImage, setBackendImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const handleImage = (e) => {
    const file = e.target.files[0];
    setBackendImage(file);
    setFrontendImage(URL.createObjectURL(file));
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("address", address);
      formData.append("city", city);
      formData.append("state", state);
      if (backendImage) formData.append("image", backendImage);
      const result = await axios.post(`${serverUrl}/api/shop/create-edit`, formData, { withCredentials: true });
      dispatch(setMyShopData(result.data));
      setLoading(false);
      navigate("/");
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  }

  const inputClass = "w-full border border-blue-100 rounded-xl px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-blue-50 text-gray-700";
  const labelClass = "text-sm font-medium text-gray-600";

  return (
    <div className="min-h-screen bg-blue-50 flex justify-center py-16 px-4">
      <div className="w-full max-w-lg bg-white shadow-md rounded-3xl p-8 border border-blue-100">
        <IoArrowBackCircleSharp size={35} className="text-orange-500 mb-4 cursor-pointer" onClick={() => navigate("/")} />

        <div className="flex justify-center mb-4">
          <div className="bg-orange-100 p-4 rounded-full shadow-sm">
            <ImSpoonKnife className="text-orange-500 text-3xl" />
          </div>
        </div>

        <h1 className="text-center text-3xl font-bold text-blue-700 mb-8">
          {myShopData ? "Edit Shop" : "Create Your Shop"}
        </h1>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <label className={labelClass}>Name</label>
          <input type="text" className={inputClass} onChange={(e) => setName(e.target.value)} value={name} />

          <label className={labelClass}>Shop Image</label>
          <input type="file" accept="image/*" className={inputClass} onChange={handleImage} />
          {frontendImage && <img src={frontendImage} alt="" className="w-full h-48 object-cover rounded-xl border border-blue-100 mb-4" />}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>City</label>
              <input type="text" className={inputClass} onChange={(e) => setCity(e.target.value)} value={city} />
            </div>
            <div>
              <label className={labelClass}>State</label>
              <input type="text" className={inputClass} onChange={(e) => setState(e.target.value)} value={state} />
            </div>
          </div>

          <label className={labelClass}>Address</label>
          <textarea className={inputClass + " mb-6"} onChange={(e) => setAddress(e.target.value)} value={address} />

          <button className="w-full bg-orange-500 text-white font-bold py-3 rounded-xl shadow-md hover:bg-orange-400 transition-all" disabled={loading}>
            {loading ? <ClipLoader size={25} color="white" /> : "Save"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateEditShop;