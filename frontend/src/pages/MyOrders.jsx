import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import OwnerOrderCard from '../components/OwnerOrderCard';
import UserOrderCard from '../components/UserOrderCard';
import { setMyOrders, updateRealTimeOrderStatus } from '../redux/userSlice';

export const MyOrders = () => {
  const { userData, myOrders, socket } = useSelector(state => state.user);
  const dispatch = useDispatch();

  useEffect(() => {
    socket?.on('newOrder', (data) => {
      if (data.shopOrders?.owner._id == userData._id) {
        dispatch(setMyOrders([data, ...myOrders]))
      }
    })
    socket?.on('update-status', ({ orderId, shopId, status, userId }) => {
      if (userId == userData._id) {
        dispatch(updateRealTimeOrderStatus({ orderId, shopId, status }))
      }
    })
    return () => {
      socket?.off('newOrder')
      socket?.off('update-status')
    }
  }, [socket])

  return (
    <div>
      <div>
        {myOrders?.map((order, i) => (
          userData.role === "user" ? (
            <UserOrderCard data={order} key={i} />
          ) : userData.role === "owner" ? (
            <OwnerOrderCard
              key={i}
              data={{
                _id: order._id,
                user: order.user,
                deliveryAddress: order.deliveryAddress,
                totalAmount: order.totalAmount,
                paymentMethod: order.paymentMethod,
                payment: order.payment,
                shop: order.shopOrders?.shop,
                shopOrderItems: order.shopOrders?.shopOrderItems,
                subtotal: order.shopOrders?.subtotal,
                status: order.shopOrders?.status,
                assignedDeliveryBoy: order.shopOrders?.assignedDeliveryBoy,
              }}
            />
          ) : null
        ))}
      </div>
    </div>
  )
}

export default MyOrders