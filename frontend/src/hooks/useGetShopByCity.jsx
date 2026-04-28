import axios from 'axios'
import { serverUrl } from '../App'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setShopInMyCity } from '../redux/userSlice'

const useGetShopByCity = () => {
    const dispatch = useDispatch();
    const { currentCity, userData } = useSelector(state => state.user);
    useEffect(() => {
        if (!userData || !currentCity) return;
        if (!currentCity) {
            dispatch(setShopInMyCity([]));
            return;
        }

        const fetchShop = async () => {
            try {
                const result = await axios.get(`${serverUrl}/api/shop/get-by-city/${currentCity}`, { withCredentials: true });
                dispatch(setShopInMyCity(result.data || []));
            } catch (error) {
                console.log("useGetShopByCity error", error);
                dispatch(setShopInMyCity([]));
            }
        }
        fetchShop()
    }, [currentCity, dispatch, userData])
}

export default useGetShopByCity
