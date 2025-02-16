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
