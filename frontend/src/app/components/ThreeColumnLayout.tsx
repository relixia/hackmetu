'use client';

import { ReactNode } from 'react';

interface ThreeColumnLayoutProps {
  leftComponent: ReactNode;
  centerComponent: ReactNode;
  rightComponent: ReactNode;
}

const ThreeColumnLayout = ({ leftComponent, centerComponent, rightComponent }: ThreeColumnLayoutProps) => {
  return (
    <div className="flex flex-1 gap-6 p-6 justify-between">
      {/* Left Column */}
      <div className="flex-1 min-w-[200px] max-w-[25%] bg-gradient-to-b from-[#1E1E1E] to-[#2A2A2A] p-5 rounded-xl border border-gray-700 shadow-md">
        {leftComponent}
      </div>

      {/* Center Column */}
      <div className="flex-auto bg-gradient-to-b from-[#252525] to-[#1E1E1E] p-6 rounded-xl border border-gray-700 shadow-lg">
        {centerComponent}
      </div>

      {/* Right Column */}
      <div className="flex-1 min-w-[200px] max-w-[25%] bg-gradient-to-b from-[#1E1E1E] to-[#2A2A2A] p-5 rounded-xl border border-gray-700 shadow-md">
        {rightComponent}
      </div>
    </div>
  );
};

export default ThreeColumnLayout;
