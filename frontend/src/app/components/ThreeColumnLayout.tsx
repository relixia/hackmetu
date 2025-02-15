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
      <div className="flex-1 min-w-[200px] max-w-[25%] bg-[#FBF8EF] p-4 rounded-lg">
        {leftComponent}
      </div>
      <div className="flex-auto bg-[#FBF8EF] p-4 rounded-lg">
        {centerComponent}
      </div>
      <div className="flex-1 min-w-[200px] max-w-[25%] bg-[#FBF8EF] p-4 rounded-lg">
        {rightComponent}
      </div>
    </div>
  );
};

export default ThreeColumnLayout;
