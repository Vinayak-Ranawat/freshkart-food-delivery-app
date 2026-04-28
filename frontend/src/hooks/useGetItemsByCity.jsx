import axios from 'axios'
import { serverUrl } from '../App'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setItemsInMyCity } from '../redux/userSlice'

const useGetItemsByCity = () => {
    const dispatch = useDispatch();
    const {currentCity, userData} =useSelector(state=>state.user);
    useEffect(()=>{
        if (!userData || !currentCity) return;
        const fetchItems= async() => {
            try {
                const result = await axios.get(`${serverUrl}/api/item/get-by-city/${currentCity}`,{withCredentials:true}   )
                dispatch(setItemsInMyCity(result.data))
            } catch (error) {
                console.log("useGetItemsByCity error",error);
            }
        }
        fetchItems()
    },[currentCity,dispatch, userData])
}

export default useGetItemsByCity
