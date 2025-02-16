import React from "react";

interface ThreeColumnLayoutProps {
  left: React.ReactNode;
  center: React.ReactNode;
  right: React.ReactNode;
}

export default function ThreeColumnLayout({
  left,
  center,
  right,
}: ThreeColumnLayoutProps) {
  return (
    <div className="flex w-full min-h-screen">
      {/* Left Column */}
      <div className="w-1/4 p-4 bg-gradient-to-b from-[#1E1E1E] to-[#2A2A2A] p-5 rounded-xl border border-gray-700 shadow-md overflow-auto">
        {left}
      </div>

      {/* Center Column */}
      <div className="w-1/2 p-4 bg-gradient-to-b from-[#1E1E1E] to-[#2A2A2A] p-5 rounded-xl border border-gray-700 shadow-md flex justify-center items-center overflow-auto">
        {center}
      </div>

      {/* Right Column */}
      <div className="w-1/4 p-4 bg-gradient-to-b from-[#1E1E1E] to-[#2A2A2A] p-5 rounded-xl border border-gray-700 shadow-md overflow-auto">
        {right}
      </div>
    </div>
  );
}
