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
      onClick={handleProfileRedirect}
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
