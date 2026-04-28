import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { serverUrl } from "../App";
import { setMyOrders } from "../redux/userSlice";
import axios from "axios";


export const useGetMyOrder = () => {
    const dispatch = useDispatch();
    const {userData}=useSelector(state=>state.user);
    useEffect(()=>{
        if (!userData) return;
        const fetchOrders= async() => {
            try {
                const result = await axios.get(`${serverUrl}/api/order/my-orders`,{withCredentials:true}   )
                dispatch(setMyOrders(result.data));
                console.log(result.data);
            } catch (error) {
                console.log(error);
            }
        }
        fetchOrders();
    },[userData,dispatch])
}

export default useGetMyOrder
