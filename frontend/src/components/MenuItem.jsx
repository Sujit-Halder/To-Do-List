import React from 'react';

const MenuItem = ({ icon, text, active, onClick }) => (
  <button
    type="button"
    title={text}
    onClick={onClick}
    className={`touch-control flex w-full items-center rounded-xl px-3 py-2.5 text-left text-sm transition-all duration-200 ${
      active ? 'bg-white text-red-500 shadow-sm' : 'text-white/90 hover:bg-white/15 hover:text-white'
    }`}
  >
    <span className="mr-3 flex w-5 justify-center text-base">{icon}</span>
    <span className="font-medium leading-tight">{text}</span>
  </button>
);

export default MenuItem;
