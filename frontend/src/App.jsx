import React, { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import SignUp from './pages/SignUp'
import SignIn from './pages/SignIn'
import ForgotPassword from './pages/ForgotPassword'
import useGetCurrentUser from './hooks/useGetCurrentUser.js'
import { useDispatch, useSelector } from 'react-redux'
import Home from './pages/Home.jsx'
import useGetCity from './hooks/useGetCity.jsx'
import useGetMyShop from './hooks/useGetMyShop.jsx'
export const serverUrl = "http://localhost:8000"
import CreateEditShop from './pages/createEditShop.jsx'
import AddFood from './pages/AddFood.jsx'
import EditItem from './pages/EditItem.jsx'
import useGetShopByCity from './hooks/useGetShopByCity.jsx'
import useGetItemsByCity from './hooks/useGetItemsByCity.jsx'
import CartPage from './pages/CartPage.jsx'
import CheckOut from './pages/CheckOut.jsx'
import OrderPlaced from './pages/OrderPlaced.jsx'
import MyOrders from './pages/MyOrders.jsx'
import useGetMyOrder from './hooks/useGetMyOrder.jsx'
import useUpdateLocation from './hooks/useUpdateLocation.jsx'
import TrackOrderPage from './pages/TrackOrderPage.jsx'
import DeliveryBoy from './components/DeliveryBoy.jsx'
import Shop from './pages/Shop.jsx'
import ItemDetails from './pages/ItemDetails.jsx'

const App = () => {
  useGetCurrentUser()
  useUpdateLocation()
  useGetCity()
  useGetMyShop()
  useGetShopByCity()
  useGetItemsByCity()
  useGetMyOrder();
  const {userData} =useSelector(state=>state.user)

  return (
    <Routes>
      <Route path='/signup' element={!userData?<SignUp/>:<Navigate to={"/"}/>} />
      <Route path='/signin' element={!userData?<SignIn/>:<Navigate to={"/"}/>}/>
      <Route path='/forgot-password' element={!userData?<ForgotPassword/>:<Navigate to={"/"}/>}/>
      <Route path='/' element={userData?<Home/>:<Navigate to={"/signin"}/>} />
      <Route path='/create-edit-shop' element={userData?<CreateEditShop/>:<Navigate to={"/signin"}/>} />
      <Route path='/add-item' element={userData?<AddFood/>:<Navigate to={"/signin"}/>} />
      <Route path='/edit-item/:itemId' element={userData?<EditItem/>:<Navigate to={"/signin"}/>} />
      <Route path='/cart' element={userData?<CartPage/>:<Navigate to={"/signin"}/>} />
      <Route path='/checkout' element={userData?<CheckOut/>:<Navigate to={"/signin"}/>} />
      <Route path='/order-placed' element={userData?<OrderPlaced/>:<Navigate to={"/signin"}/>} />
      <Route path='/my-orders' element={userData?<MyOrders/>:<Navigate to={"/signin"}/>} />
      <Route path='/delivery' element={userData ? <DeliveryBoy /> : <Navigate to={"/signin"} />} />
      <Route path='/track-order/:orderId' element={userData?<TrackOrderPage/>:<Navigate to={"/signin"}/>} />
      <Route path='/shop/:shopId' element={userData?<Shop/>:<Navigate to={"/signin"}/>} />
      <Route path='/item/:itemId' element={userData?<ItemDetails/>:<Navigate to={"/signin"}/>} />
    </Routes>
  )
}

export default App
