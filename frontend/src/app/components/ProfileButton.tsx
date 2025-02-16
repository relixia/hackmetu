'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface ProfileButtonProps {
  setActiveComponent: React.Dispatch<React.SetStateAction<string | null>>;
  userId: number | null; // Add userId prop
}

const ProfileButton = ({ setActiveComponent, userId }: ProfileButtonProps) => {
  const router = useRouter();

  const handleProfileRedirect = () => {
    router.push(`/pages/profile?userId=${userId}`); // Navigate to the profile page
  };

  return (
    <button
      //onClick={() => setActiveComponent('profile')}
      className="bg-white shadow-lg rounded-full hover:bg-gray-100 transition"
    >
      <Image
  src="/logo.png"
  alt="Profile Logo"
  width={175}  // Increase the size here
  height={175} // Increase the size here
  className="rounded-full"
/>



    </button>
  );
};

export default ProfileButton;
