import UserNavbar from "./NavBar";
import { useSelector } from "react-redux";
import { ImSpoonKnife } from "react-icons/im";
import { useNavigate } from "react-router-dom";
import useGetMyShop from "../hooks/useGetMyShop";
import { MdEdit, MdFastfood } from "react-icons/md";
import OwnerItemCard from "./OwnerItemCard";

const OwnerDashboard = () => {
  useGetMyShop();
  const { myShopData } = useSelector((state) => state.owner);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-blue-50">
      <UserNavbar />

      {!myShopData?._id ? (
        <div className="flex justify-center items-center min-h-[calc(100vh-70px)] px-4 pt-20">
          <div className="w-full max-w-md bg-white shadow-md rounded-3xl p-10 border border-blue-100 text-center hover:shadow-lg transition-all duration-300">
            <div className="flex justify-center mb-6">
              <div className="bg-blue-100 p-6 rounded-full border-2 border-blue-300 shadow-sm">
                <ImSpoonKnife className="text-orange-500 text-7xl" />
              </div>
            </div>
            <h2 className="text-4xl font-bold text-blue-700 mb-4">ADD YOUR RESTAURANT</h2>
            <p className="text-gray-500 text-base mb-8 leading-relaxed">
              Own a restaurant? Join us to reach more customers and grow your business!
            </p>
            <button
              className="bg-orange-500 hover:bg-orange-400 text-white font-bold px-8 py-4 rounded-2xl shadow-md transition-all duration-300 hover:scale-[1.05]"
              onClick={() => navigate("/create-edit-shop")}
            >
              Get Started
            </button>
          </div>
        </div>
      ) : (
        <div className="pt-20 pb-12">

          {/* Contained Card */}
          <div className="max-w-3xl mx-auto px-4 mt-6">
            <div className="relative w-full rounded-3xl overflow-hidden shadow-lg border border-blue-100">
              {myShopData?.image ? (
                <img src={myShopData.image} alt={myShopData.name} className="w-full h-64 object-cover" />
              ) : (
                <div className="w-full h-64 bg-blue-100 flex items-center justify-center">
                  <MdFastfood className="text-blue-300 text-9xl" />
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

              <button
                className="absolute top-4 right-4 bg-orange-500 hover:bg-orange-400 text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 z-10"
                onClick={() => navigate("/create-edit-shop")}
              >
                <MdEdit size={20} />
              </button>

              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h1 className="text-3xl font-bold mb-1">
                  Welcome to <span className="text-orange-400">{myShopData?.name}</span>!
                </h1>
                <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 text-base">
                  <p className="flex items-center gap-2">
                    <span className="text-orange-400">📍</span>
                    <span className="font-medium">{myShopData?.location}</span>
                  </p>
                  {myShopData?.address && (
                    <p className="text-gray-300">{myShopData.address}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {(myShopData?.items?.length || 0) === 0 && (
            <div className="flex justify-center items-center min-h-[calc(100vh-70px)] px-4 pt-20">
              <div className="w-full max-w-md bg-white shadow-md rounded-3xl p-10 border border-blue-100 text-center hover:shadow-lg transition-all duration-300">
                <div className="flex justify-center mb-6">
                  <div className="bg-blue-100 p-6 rounded-full border-2 border-blue-300 shadow-sm">
                    <ImSpoonKnife className="text-orange-500 text-7xl" />
                  </div>
                </div>
                <h2 className="text-4xl font-bold text-blue-700 mb-4">ADD YOUR FOOD ITEM</h2>
                <p className="text-gray-500 text-base mb-8 leading-relaxed">
                  Ready to expand your menu? Click below to add delicious food items and attract more customers!
                </p>
                <button
                  className="bg-orange-500 hover:bg-orange-400 text-white font-bold px-8 py-4 rounded-2xl shadow-md transition-all duration-300 hover:scale-[1.05]"
                  onClick={() => navigate("/add-item")}
                >
                  Add Food
                </button>
              </div>
            </div>
          )}

          {(myShopData?.items?.length || 0) > 0 &&
            <div className="flex flex-col items-center gap-4 w-full max-w-3xl mx-auto px-4 mt-6">
              {myShopData.items.map((item, index) => (
                <OwnerItemCard key={index} data={item} />
              ))}
            </div>}
        </div>
      )}
    </div>
  );
};

export default OwnerDashboard;