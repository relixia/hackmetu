'use client';

import { useState } from 'react';
import Image from 'next/image';

const ProfileButton = ({ setActiveComponent }) => {
  return (
    <button
      onClick={() => setActiveComponent('profile')}
      className="flex items-center space-x-6 p-6 bg-white shadow-lg rounded-full hover:bg-gray-100 transition text-2xl"
    >
      <Image
        src="/aholder.jpeg" // Update with dynamic image source if needed
        alt="Profile"
        width={80} // Increased size
        height={80} // Increased size
        className="rounded-full"
      />
    </button>
  );
};

export default ProfileButton;
