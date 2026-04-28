import React from "react";

const CategoryCard = ({ name, image, onClick }) => {
  return (
    <div className="relative min-w-[160px] h-[120px] rounded-xl overflow-hidden border-2 border-blue-200 hover:border-orange-400 transition cursor-pointer group bg-white shadow-sm hover:shadow-md" onClick={onClick}>
      <img
        src={image}
        alt={image}
        className="w-full h-full object-cover transform group-hover:scale-110 transition duration-300"
      />
      <div className="absolute bottom-0 w-full h-10 bg-black/50"></div>
      <div className="absolute bottom-0 w-full text-center py-2">
        <p className="text-white text-sm font-semibold tracking-wide">{name}</p>
      </div>
    </div>
  );
};

export default CategoryCard;