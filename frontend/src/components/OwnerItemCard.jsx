import React from 'react';
import { MdEdit, MdDelete } from 'react-icons/md';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { serverUrl } from '../App';
import axios from 'axios';
import { setMyShopData } from '../redux/ownerSlice';

const OwnerItemCard = ({ data }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const handleDelete = async () => {
    try {
      const result = await axios.delete(`${serverUrl}/api/item/delete/${data._id}`, { withCredentials: true });
      dispatch(setMyShopData(result.data));
      navigate("/");
    } catch (error) {
      console.log("Delete Item Error:", error);
    }
  }

  return (
    <div className="mt-5 w-full bg-white rounded-2xl border border-blue-100 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.01] overflow-hidden">
      <div className="flex items-center gap-4 p-4">
        <div className="w-24 h-24 md:w-28 md:h-28 flex-shrink-0 rounded-xl overflow-hidden border-2 border-blue-100 shadow-sm">
          {data?.image ? (
            <img src={data.image} alt={data.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-blue-50 flex items-center justify-center">
              <span className="text-gray-400 text-4xl">🍽️</span>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-xl md:text-2xl font-bold text-blue-700 mb-1 truncate">
            {data?.name || 'Food Item'}
          </h3>
          <div className="flex flex-wrap gap-2 mb-2 text-sm md:text-base">
            <p className="text-gray-600">
              <span className="text-gray-400">Category:</span>{' '}
              <span className="font-medium text-blue-600">{data?.category || 'N/A'}</span>
            </p>
            <p className="text-gray-600">
              <span className="text-gray-400">Food Type:</span>{' '}
              <span className="font-medium text-blue-600">{data?.foodType || 'N/A'}</span>
            </p>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-orange-500">₹{data?.price || '0'}</p>
        </div>

        <div className="flex flex-col gap-3 items-center">
          <button
            className="bg-blue-500 hover:bg-blue-400 text-white p-2 md:p-3 rounded-xl shadow-sm transition-all duration-300 hover:scale-110"
            title="Edit Item"
            onClick={() => navigate(`/edit-item/${data._id}`)}
          >
            <MdEdit size={20} />
          </button>
          <button
            className="bg-red-500 hover:bg-red-400 text-white p-2 md:p-3 rounded-xl shadow-sm transition-all duration-300 hover:scale-110"
            title="Delete Item"
            onClick={handleDelete}
          >
            <MdDelete size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default OwnerItemCard;