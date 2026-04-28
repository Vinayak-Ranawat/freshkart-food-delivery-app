import React, { createContext, useContext, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { serverUrl } from '../App';
import { useSelector, useDispatch } from 'react-redux';
import { addMyOrder, updateRealTimeOrderStatus, addNewAssignment } from '../redux/userSlice';

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const socketRef = useRef(null);
    const { userData } = useSelector(state => state.user);
    const dispatch = useDispatch();

    useEffect(() => {
        // ✅ Create socket instance
        const socket = io(serverUrl, { withCredentials: true });
        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('Socket connected:', socket.id);
            if (userData) {
                socket.emit('identity', { userId: userData._id });
            }
        });

        // ✅ New order notification for owner
        socket.on('newOrder', (data) => {
            dispatch(addMyOrder(data));
        });

        // ✅ Order status update for user
        socket.on('orderStatusUpdate', (data) => {
            dispatch(updateRealTimeOrderStatus(data));
        });

        // ✅ New assignment for delivery boy
        socket.on('newAssignment', (data) => {
            dispatch(addNewAssignment(data));
        });

        return () => {
            socket.disconnect();
        };
    }, [userData?._id]);

    return (
        <SocketContext.Provider value={socketRef.current}>
            {children}
        </SocketContext.Provider>
    );
};
