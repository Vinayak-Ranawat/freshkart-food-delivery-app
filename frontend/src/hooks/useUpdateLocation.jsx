// import axios from 'axios';
// import { useEffect } from 'react'
// import { serverUrl } from '../App';
// import { useSelector } from 'react-redux'

// const useUpdateLocation = () => {
//     const { userData } = useSelector(state => state.user)

//     useEffect(() => {
//         if (!userData) return;

//         const updateLocation = async (lat, lon) => {
//             await axios.post(`${serverUrl}/api/user/update-location`, { lat, lon }, { withCredentials: true })
//         }

//         const watchId = navigator.geolocation.watchPosition((pos) => {
//             updateLocation(pos.coords.latitude, pos.coords.longitude);
//         }, (error) => {
//             console.log("Watch error:", error)
//         }, {
//             enableHighAccuracy: true,
//             timeout: 10000,
//             maximumAge: 0
//         })

//         return () => navigator.geolocation.clearWatch(watchId)
//     }, [userData])
// }

// export default useUpdateLocation

import axios from 'axios';
import { useEffect } from 'react'
import { serverUrl } from '../App';
import { useSelector } from 'react-redux'

const useUpdateLocation = () => {
    const { userData } = useSelector(state => state.user)

    useEffect(() => {
        if (!userData) return;

        const latitude = 23.18;
        const longitude = 75.78;

        const updateLocation = async () => {
            await axios.post(
                `${serverUrl}/api/user/update-location`,
                { lat: latitude, lon: longitude },
                { withCredentials: true }
            );
        };

        updateLocation();

    }, [userData])
}

export default useUpdateLocation;