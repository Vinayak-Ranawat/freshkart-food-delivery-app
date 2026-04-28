import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
    name: "user",
    initialState: {
        userData: null,
        currentCity: null,
        currentState: null,
        currentAddress: null,
        shopInMyCity: [],
        itemsInMyCity: [],
        cartItems: [],
        myOrders: [],
        newAssignments: [],
        notificationCount: 0,
        searchItems: null,
        // ✅ socket removed — use SocketContext instead
    },
    reducers: {
        setUserData: (state, action) => {
            state.userData = action.payload
        },
        setCurrentCity: (state, action) => {
            state.currentCity = action.payload
        },
        setCurrentState: (state, action) => {
            state.currentState = action.payload
        },
        setCurrentAddress: (state, action) => {
            state.currentAddress = action.payload
        },
        setShopInMyCity: (state, action) => {
            state.shopInMyCity = action.payload
        },
        setItemsInMyCity: (state, action) => {
            state.itemsInMyCity = action.payload
        },
        setCartItems: (state, action) => {
            state.cartItems = action.payload
        },
        addToCart: (state, action) => {
            const cartItem = action.payload;
            const existingItem = state.cartItems.find(i => i.id === cartItem.id);
            if (existingItem) {
                existingItem.quantity += cartItem.quantity;
                if (existingItem.quantity <= 0) {
                    state.cartItems = state.cartItems.filter(i => i.id !== cartItem.id);
                }
            } else {
                if (cartItem.quantity > 0) {
                    state.cartItems.push(cartItem);
                }
            }
        },
        updateQuantity: (state, action) => {
            const { id, quantity } = action.payload;
            const item = state.cartItems.find(i => i.id === id);
            if (item) {
                item.quantity = quantity;
            }
        },
        setMyOrders: (state, action) => {
            state.myOrders = action.payload
        },
        addMyOrder: (state, action) => {
            state.myOrders = [action.payload, ...state.myOrders];
        },
        updateOrderStatus: (state, action) => {
            const { orderId, shopId, status } = action.payload;
            const order = state.myOrders.find(o => o._id === orderId);
            if (order) {
                if (order.shopOrders && !Array.isArray(order.shopOrders)) {
                    if (order.shopOrders.shop._id === shopId) {
                        order.shopOrders.status = status;
                    }
                } else {
                    const shopOrder = order.shopOrders?.find(s => s.shop._id === shopId);
                    if (shopOrder) shopOrder.status = status;
                }
            }
        },
        updateRealTimeOrderStatus: (state, action) => {
            const { orderId, shopId, status } = action.payload;
            const order = state.myOrders.find(o => o._id === orderId);
            if (order) {
                if (order.shopOrders && !Array.isArray(order.shopOrders)) {
                    if (order.shopOrders.shop._id === shopId) {
                        order.shopOrders.status = status;
                    }
                } else {
                    const shopOrder = order.shopOrders?.find(so => so.shop._id === shopId);
                    if (shopOrder) shopOrder.status = status;
                }
            }
        },
        addNewAssignment: (state, action) => {
            const assignment = action.payload;
            const exists = state.newAssignments.find(a => a._id === assignment._id);
            if (!exists) {
                state.newAssignments.push(assignment);
                state.notificationCount += 1;
            }
        },
        clearNotifications: (state) => {
            state.newAssignments = [];
            state.notificationCount = 0;
        },
        removeAssignment: (state, action) => {
            const assignmentId = action.payload;
            state.newAssignments = state.newAssignments.filter(a => a._id !== assignmentId);
            state.notificationCount = Math.max(0, state.notificationCount - 1);
        },
        setSearchItems: (state, action) => {
            state.searchItems = action.payload;
        },
    }
})

export const {
    setUserData, setCurrentCity, setCurrentState, setCurrentAddress,
    setShopInMyCity, setItemsInMyCity, setCartItems, addToCart,
    updateQuantity, setMyOrders, addMyOrder, updateOrderStatus,
    addNewAssignment, clearNotifications, removeAssignment,
    setSearchItems, updateRealTimeOrderStatus
} = userSlice.actions

export default userSlice.reducer