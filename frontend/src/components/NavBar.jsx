import { IoIosSearch } from "react-icons/io";
import { FaLocationDot } from "react-icons/fa6";
import { FaShoppingCart } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect } from "react";
import { ImCross } from "react-icons/im";
import axios from "axios";
import { serverUrl } from "../App";
import { setSearchItems, setUserData, setMyOrders, setShopInMyCity, setItemsInMyCity, setCurrentCity, setCartItems } from "../redux/userSlice";
import { setMyShopData } from "../redux/ownerSlice";
import { IoMdAdd } from "react-icons/io";
import { TbReceiptDollar } from "react-icons/tb";
import { useNavigate } from "react-router-dom";

function UserNavbar() {
    const { userData, currentCity, cartItems, myOrders } = useSelector(state => state.user)
    const { myShopData } = useSelector(state => state.owner)
    const navigate = useNavigate();
    const [popup, setPopup] = useState(false);
    const [showSearch, setShowSearch] = useState(false)
    const [query, setQuery] = useState("");
    const dispatch = useDispatch();

    const handleLogOut = async () => {
        try {
            await axios.get(`${serverUrl}/api/auth/signout`, { withCredentials: true });
            dispatch(setUserData(null));
            dispatch(setMyOrders([]));
            dispatch(setShopInMyCity([]));
            dispatch(setItemsInMyCity([]));
            dispatch(setCurrentCity(null));
            dispatch(setCartItems([]));
            dispatch(setMyShopData(null));
        } catch (error) {
            console.log(error);
        }
    }

    const handleSearchItems = async () => {
        try {
            const result = await axios.get(`${serverUrl}/api/item/search-items?query=${query}&city=${currentCity}`, { withCredentials: true });
            dispatch(setSearchItems(result.data));
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        if (query) {
            handleSearchItems();
        } else {
            dispatch(setSearchItems(null));
        }
    }, [query])

    return (
        <div className="w-full h-[70px] flex items-center justify-between px-6 fixed top-0 z-[9999] bg-white shadow-md border-b border-blue-100">

            <h1 className="text-2xl font-bold text-blue-600 tracking-wide">FreshKart</h1>

            {showSearch && userData.role == "user" && (
                <div className="flex md:hidden items-center bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 w-[90%] shadow-sm mt-30">
                    <div className="flex items-center gap-2 border-r border-blue-200 pr-2 w-[60%]">
                        <FaLocationDot className="text-orange-500 text-base" />
                        <div className="text-gray-700 truncate text-sm">{currentCity}</div>
                    </div>
                    <div className="flex items-center gap-2 pl-2 w-[60%]">
                        <IoIosSearch size={18} className="text-blue-400" />
                        <input
                            type="text"
                            placeholder="Search items..."
                            className="w-full bg-transparent outline-none text-gray-700 placeholder-gray-400 text-sm"
                            onChange={e => setQuery(e.target.value)}
                            value={query}
                        />
                    </div>
                </div>
            )}

            {userData.role == "user" && (
                <div className="hidden md:flex items-center bg-blue-50 border border-blue-200 rounded-xl px-3 py-2 w-[55%] shadow-inner">
                    <div className="flex items-center gap-2 border-r border-blue-200 pr-3 w-[35%]">
                        <FaLocationDot className="text-orange-500 text-lg" />
                        <div className="text-gray-700 truncate text-sm">{currentCity}</div>
                    </div>
                    <div className="flex items-center gap-2 pl-3 w-[65%]">
                        <IoIosSearch size={22} className="text-blue-400" />
                        <input
                            type="text"
                            placeholder="Search fresh items..."
                            className="w-full bg-transparent outline-none text-gray-700 placeholder-gray-400 text-sm"
                            onChange={e => setQuery(e.target.value)}
                            value={query}
                        />
                    </div>
                </div>
            )}

            <div className="flex items-center gap-6 text-gray-600">

                {userData.role == "user" && (showSearch
                    ? <ImCross className="text-orange-500 md:hidden" onClick={() => setShowSearch(false)} />
                    : <IoIosSearch size={30} className="text-blue-500 md:hidden" onClick={() => setShowSearch(true)} />
                )}

                {userData.role == "owner" ? (
                    <>
                        {myShopData && (
                            <>
                                <button className="bg-orange-500 hidden hover:bg-orange-400 text-white font-semibold px-4 py-2 rounded-xl shadow-md transition-all duration-300 md:flex items-center gap-2">
                                    <IoMdAdd size={20} className="text-white" />
                                    <span onClick={() => navigate("/add-item")} className="hidden md:inline text-sm">Add Food Item</span>
                                </button>
                                <button className="md:hidden bg-orange-500 hover:bg-orange-400 text-white font-semibold p-2 rounded-xl shadow-md transition-all duration-300 hover:scale-[1.05] flex items-center justify-center">
                                    <IoMdAdd size={24} className="text-white" onClick={() => navigate("/add-item")} />
                                </button>
                            </>
                        )}

                        <div className="hidden md:flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-semibold px-4 py-2 rounded-xl shadow-md transition-all duration-300 hover:scale-[1.05] cursor-pointer relative"
                            onClick={() => navigate("/my-orders")}>
                            <TbReceiptDollar size={20} />
                            <span className="text-sm">My Orders</span>
                            <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-bold px-[6px] py-[1px] rounded-full shadow-md">
                                {myOrders.length}
                            </span>
                        </div>

                        <div className="md:hidden flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-semibold px-4 py-2 rounded-xl shadow-md transition-all duration-300 hover:scale-[1.05] cursor-pointer relative"
                            onClick={() => navigate("/my-orders")}>
                            <TbReceiptDollar size={20} />
                            <span className="text-sm">Orders</span>
                            <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-bold px-[6px] py-[1px] rounded-full shadow-md">
                                {myOrders.length}
                            </span>
                        </div>
                    </>
                ) : (
                    <>
                        {userData.role == "user" && (
                            <>
                                <div className="relative cursor-pointer hover:scale-110 transition-transform duration-300"
                                    onClick={() => navigate("./cart") }>
                                    <FaShoppingCart size={28} className="text-blue-500" />
                                    <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs font-bold px-[6px] py-[1px] rounded-full shadow-md">
                                        {cartItems.length}
                                    </span>
                                </div>
                                <button className="hidden md:block bg-orange-500 hover:bg-orange-400 text-white font-semibold text-sm px-4 py-2 rounded-xl shadow-md transition-all duration-300 hover:scale-[1.05]"
                                    onClick={() => navigate("/my-orders")}>
                                    My Orders
                                </button>
                            </>
                        )}
                    </>
                )}

                <div className="flex items-center gap-2 cursor-pointer">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shadow-md hover:bg-blue-700 transition-all duration-300"
                        onClick={() => setPopup(prev => !prev)}>
                        {userData?.fullName ? userData.fullName.slice(0, 1).toUpperCase() : "U"}
                    </div>
                </div>

                {popup && (
                    <div className="absolute right-0 top-20 w-44 bg-white rounded-2xl shadow-lg border border-blue-100 flex flex-col items-start py-2 transition-all duration-200">
                        <p className="text-gray-800 text-xl font-medium px-4 py-2 w-full text-left hover:bg-blue-50 hover:text-blue-600 transition-all duration-200">
                            {userData?.fullName || "User"}
                        </p>
                        {userData.role === "user" && (
                            <button
                                className="md:hidden px-4 py-2 text-left w-full text-gray-700 font-medium hover:bg-blue-50 hover:text-blue-600 transition-all duration-200"
                                onClick={() => navigate("/my-orders") }>
                                My Orders
                            </button>
                        )}
                        <button
                            onClick={handleLogOut}
                            className="text-red-500 px-4 py-2 text-left w-full font-semibold hover:text-red-600 hover:bg-red-50 transition-all duration-200">
                            Log Out
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default UserNavbar;