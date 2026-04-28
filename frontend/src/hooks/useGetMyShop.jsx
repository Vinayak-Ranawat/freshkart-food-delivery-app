import axios from 'axios'
import { serverUrl } from '../App'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setMyShopData } from '../redux/ownerSlice';

export const useGetMyShop = () => {
    const dispatch = useDispatch();
    const {userData}=useSelector(state=>state.user);
    useEffect(()=>{
        if (!userData) return;
        const fetchShop= async() => {
            try {
                const result = await axios.get(`${serverUrl}/api/shop/my-shop`,{withCredentials:true}   )
                dispatch(setMyShopData(result.data));
            } catch (error) {
                console.log(error);
            }
        }
        fetchShop();
    },[userData,dispatch])
}

export default useGetMyShop
