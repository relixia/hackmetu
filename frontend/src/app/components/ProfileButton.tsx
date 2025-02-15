'use client';

import { useState } from 'react';
import Image from 'next/image';

const ProfileButton = ({ setActiveComponent }) => {
  return (
    <button
      onClick={() => setActiveComponent('profile')}
      className="p-8 bg-white shadow-lg rounded-full hover:bg-gray-100 transition"
    >
      <Image
        src="/aholder.jpeg"
        alt="Profile"
        width={100}  // ⬆ Bigger Circle
        height={100} // ⬆ Bigger Circle
        className="rounded-full"
      />
    </button>
  );
};

export default ProfileButton;
