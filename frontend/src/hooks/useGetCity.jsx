// import axios from 'axios';
// import { useEffect } from 'react'
// import { useDispatch, useSelector } from 'react-redux'
// import { setCurrentAddress, setCurrentCity, setCurrentState } from '../redux/userSlice';
// import { setAddress, setLocation } from '../redux/mapSlice';

// const useGetCity = () => {
//     const dispatch = useDispatch();
//     const { userData } = useSelector(state => state.user)
//     const apiKey = import.meta.env.VITE_GEOAPIKEY

//     useEffect(() => {
//         navigator.geolocation.getCurrentPosition(async (position) => {
//             const latitude = position.coords.latitude
//             const longitude = position.coords.longitude
//             dispatch(setLocation({ lat: latitude, long: longitude }));

//             const result = await axios.get(`https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&format=json&apiKey=${apiKey}`)

//             dispatch(setCurrentCity(result?.data.results?.[0].city || result?.data.results?.[0].county))
//             dispatch(setCurrentState(result?.data.results?.[0].state))
//             dispatch(setCurrentAddress(result?.data.results?.[0].address_line2 || result?.data.results?.[0].address_line1))
//             dispatch(setAddress(result?.data.results?.[0].address_line2 || result?.data.results?.[0].address_line1))
//         }, (error) => {
//             console.log("Location error:", error)
//         }, {
//             enableHighAccuracy: true,
//             timeout: 10000,
//             maximumAge: 0
//         })
//     }, [userData, dispatch, apiKey])
// }

// export default useGetCity

import axios from 'axios';
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setCurrentAddress, setCurrentCity, setCurrentState } from '../redux/userSlice';
import { setAddress, setLocation } from '../redux/mapSlice';

const useGetCity = () => {
    const dispatch = useDispatch();
    const { userData } = useSelector(state => state.user)
    const apiKey = import.meta.env.VITE_GEOAPIKEY

    useEffect(() => {
        const latitude = 23.18;
        const longitude = 75.78;

        const fetchLocation = async () => {
            dispatch(setLocation({ lat: latitude, long: longitude }));

            try {
                const result = await axios.get(
                    `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&format=json&apiKey=${apiKey}`
                );

                dispatch(setCurrentCity(result?.data.results?.[0]?.city || result?.data.results?.[0]?.county));
                dispatch(setCurrentState(result?.data.results?.[0]?.state));
                dispatch(setCurrentAddress(result?.data.results?.[0]?.address_line2 || result?.data.results?.[0]?.address_line1));
                dispatch(setAddress(result?.data.results?.[0]?.address_line2 || result?.data.results?.[0]?.address_line1));
            } catch (err) {
                console.log("API error:", err);
            }
        };

        fetchLocation();

    }, [userData, dispatch, apiKey])
}

export default useGetCity;