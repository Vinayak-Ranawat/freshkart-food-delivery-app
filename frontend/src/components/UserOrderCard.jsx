import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiClock, FiMapPin, FiPackage, FiCreditCard, FiArrowLeft, FiChevronRight } from 'react-icons/fi';
import axios from "axios";
import { serverUrl } from "../App";

const UserOrderCard = ({ data }) => {
  const navigate = useNavigate();
  const [selectedRating, setSelectedRating] = useState({});

  const handleRating = async (itemId, rating) => {
    console.log("Sending itemId:", itemId, "rating:", rating);
    try {
      await axios.post(
        `${serverUrl}/api/item/rating`,
        { itemId, rating },
        { withCredentials: true }
      );
      setSelectedRating(prev => ({ ...prev, [itemId]: rating }));
    } catch (error) {
      console.log("Error submitting rating:", error);
    }
  };

  return (
    <div style={{ maxWidth: '780px', margin: '0 auto' }}>

      {/* Back + label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            width: '38px', height: '38px', borderRadius: '50%',
            backgroundColor: '#f0f6ff', border: '1px solid #dce8f5',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <FiArrowLeft size={16} color="#001d3d" />
        </button>
        <span style={{
          fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em',
          textTransform: 'uppercase', color: '#7a8fa6',
        }}>
          Order Details
        </span>
      </div>

      {/* Order header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        flexWrap: 'wrap', gap: '12px',
        paddingBottom: '20px', marginBottom: '20px',
        borderBottom: '1px solid #eef3fa',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '14px',
            backgroundColor: '#22c55e',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <FiPackage size={22} color="#fff" />
          </div>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#001d3d', margin: 0 }}>
              Order #{data._id?.slice(-6).toUpperCase()}
            </h2>
            <p style={{
              fontSize: '13px', color: '#7a8fa6', margin: '3px 0 0',
              display: 'flex', alignItems: 'center', gap: '5px',
            }}>
              <FiClock size={12} color="#e67e22" />
              {new Date(data.createdAt).toDateString()}
            </p>
          </div>
        </div>

        {/* Payment badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          backgroundColor: '#f0faf5', border: '1px solid #bbf0d6',
          borderRadius: '20px', padding: '6px 14px',
        }}>
          <FiCreditCard size={13} color="#16a34a" />
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#16a34a',
            textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {data.paymentMethod === 'cod'
              ? 'Cash on Delivery'
              : `Online Payment: ${data.payment ? 'True' : 'False'}`}
          </span>
        </div>
      </div>

      {/* Shop orders */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        {data.shopOrders?.map((shopOrder, idx) => (
          <div key={idx}>

            {/* Shop name + status */}
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', marginBottom: '16px',
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#001d3d', margin: 0 }}>
                {shopOrder.shop?.name || 'Restaurant'}
              </h3>
              <span style={{
                fontSize: '12px', fontWeight: 600,
                color: shopOrder.status === 'delivered' ? '#16a34a'
                  : shopOrder.status === 'out for delivery' ? '#e67e22'
                  : '#1a6bbf',
                backgroundColor: shopOrder.status === 'delivered' ? '#f0faf5'
                  : shopOrder.status === 'out for delivery' ? '#fff4eb'
                  : '#eef4ff',
                border: `1px solid ${shopOrder.status === 'delivered' ? '#bbf0d6'
                  : shopOrder.status === 'out for delivery' ? '#fcd9a8'
                  : '#c3d9f8'}`,
                borderRadius: '20px', padding: '4px 14px',
              }}>
                {shopOrder.status}
              </span>
            </div>

            {/* Items — horizontal scroll row */}
            <div style={{
              display: 'flex', gap: '14px',
              overflowX: 'auto', paddingBottom: '8px',
              /* hide scrollbar but keep scroll */
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}>
              {shopOrder.shopOrderItems.map((item, i) => {
                const itemId = item.item?._id || item._id; 
                const rating = selectedRating[itemId];
                return (
                  <div key={i} style={{
                    minWidth: '155px', maxWidth: '155px',
                    backgroundColor: '#f7fafd',
                    borderRadius: '16px',
                    border: '1px solid #dce8f5',
                    overflow: 'hidden',
                    flexShrink: 0,
                  }}>
                    {/* Item image */}
                    <img
                      src={item?.image || 'https://placehold.co/155x105/dce8f5/7a8fa6?text=Food'}
                      alt={item.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://placehold.co/155x105/dce8f5/7a8fa6?text=Food';
                      }}
                      style={{
                        width: '100%', height: '105px',
                        objectFit: 'cover', display: 'block',
                      }}
                    />

                    <div style={{ padding: '10px 10px 12px' }}>
                      <p style={{
                        fontSize: '13px', fontWeight: 700, color: '#001d3d',
                        margin: '0 0 5px', whiteSpace: 'nowrap',
                        overflow: 'hidden', textOverflow: 'ellipsis',
                      }}>
                        {item.name}
                      </p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', color: '#7a8fa6', fontWeight: 500 }}>
                          Qty {item.quantity} × ₹{item.price}
                        </span>
                        <span style={{ fontSize: '13px', fontWeight: 800, color: '#e67e22' }}>
                          ₹{item.price * item.quantity}
                        </span>
                      </div>

                      {/* Star rating — only when delivered */}
                      {shopOrder.status === 'delivered' && (
                        <div style={{
                          display: 'flex', justifyContent: 'center', gap: '2px',
                          marginTop: '8px', paddingTop: '8px',
                          borderTop: '1px solid #dce8f5',
                        }}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => handleRating(itemId, star)}
                              style={{
                                background: 'none', border: 'none',
                                cursor: 'pointer', padding: '0',
                                fontSize: '16px', lineHeight: 1,
                                color: rating >= star ? '#f59e0b' : '#d1d5db',
                                transition: 'transform 0.1s',
                              }}
                              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.25)'}
                              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                            >
                              ★
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Divider between shops */}
            {idx < (data.shopOrders?.length - 1) && (
              <div style={{ height: '1px', backgroundColor: '#eef3fa', marginTop: '24px' }} />
            )}
          </div>
        ))}
      </div>

      {/* Footer — address + total */}
      <div style={{
        marginTop: '24px', paddingTop: '20px',
        borderTop: '1px solid #eef3fa',
        display: 'grid', gridTemplateColumns: '1fr auto',
        gap: '20px', alignItems: 'end',
      }}>
        {/* Address */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <FiMapPin size={13} color="#e67e22" />
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#7a8fa6',
              textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Delivery Address
            </span>
          </div>
          <p style={{ fontSize: '13px', color: '#4a5f7a', margin: 0,
            lineHeight: 1.6, paddingLeft: '19px' }}>
            {data.deliveryAddress?.text}
          </p>
        </div>

        {/* Total + Track button */}
        <div style={{
          backgroundColor: '#001d3d',
          borderRadius: '16px',
          padding: '16px 22px',
          textAlign: 'right',
          minWidth: '180px',
        }}>
          <p style={{ fontSize: '11px', color: '#7a9cbf', fontWeight: 600,
            textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 2px' }}>
            Grand Total
          </p>
          <p style={{ fontSize: '24px', fontWeight: 900, color: '#ffffff',
            margin: '0 0 12px', fontStyle: 'italic' }}>
            ₹{data.totalAmount}
          </p>
          <button
            onClick={() => navigate(`/track-order/${data._id}`)}
            style={{
              width: '100%', backgroundColor: '#e67e22', color: '#ffffff',
              border: 'none', borderRadius: '10px', padding: '9px 16px',
              fontSize: '12px', fontWeight: 700, cursor: 'pointer',
              textTransform: 'uppercase', letterSpacing: '0.08em',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            }}
          >
            Track Order <FiChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserOrderCard;