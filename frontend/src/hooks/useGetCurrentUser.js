import axios from 'axios'
import { serverUrl } from '../App'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setUserData } from '../redux/userSlice'

const useGetCurrentUser = () => {
    const dispatch = useDispatch();
    useEffect(() => {
        const fetchUser = async () => {
    try {
        const result = await axios.get(`${serverUrl}/api/user/current`, { withCredentials: true })
        dispatch(setUserData(result.data))
    } catch (error) {
        if (error.response?.status !== 400 && error.response?.status !== 401) {
            console.log(error);
        }
    }
        }
        fetchUser();
    }, [dispatch])
}

export default useGetCurrentUser