import React from "react";

interface LeftPanelProps {
  personnel: any;
  floorData: any;
  buildingData: any;
}

export default function LeftPanel({
  personnel,
  floorData,
  buildingData,
}: LeftPanelProps) {
  if (!personnel || !floorData || !buildingData) {
    return (
      <div className="text-gray-700">
        Loading user/floor/building info...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center  mb-4 bg">
        <h1 className="text-2xl font-bold text-white-800 capitalize" >
          {personnel?.name} {personnel?.surname}'s Profile
        </h1>
        <p className="text-gray-500 text-sm">
          Personal details and information
        </p>
      </div>

      {/* Profile Section */}
      <div className="bg-[#2A2A2A] shadow rounded p-4">
        <div className="flex items-center space-x-2 mb-2">
          <strong className="text-white-700">Name:</strong>
          <span className="text-white capitalize">{personnel?.name}</span>
        </div>
        <div className="flex items-center space-x-2 mb-2">
          <strong className="text-white-700">Surname:</strong>
          <span className="text-white capitalize">{personnel?.surname}</span>
        </div>
        <div className="flex items-center space-x-2 mb-2">
          <strong className="text-white-700">Email:</strong>
          <span className="text-white">{personnel?.email}</span>
        </div>
        <div className="flex items-center space-x-2 mb-2">
          <strong className="text-white-700">Coordinates:</strong>
          <span className="text-white">
            x={personnel?.x_coor}, y={personnel?.y_coor}
          </span>
        </div>
      </div>

      {/* Floor & Building Info */}
      <div className="bg-[#2A2A2A] shadow rounded p-4">
        <h2 className="text-lg font-semibold mb-3 text-gray-800">
          Floor & Building
        </h2>
        <div className="flex items-center space-x-2 mb-2">
          <strong className="text-white-700">Floor #:</strong>
          <span className="text-white">{floorData?.number}</span>
        </div>
        <div className="flex items-center space-x-2 mb-2">
          <strong className="text-white-700">Floor Width:</strong>
          <span className="text-white">{floorData?.width}</span>
        </div>
        <div className="flex items-center space-x-2 mb-2">
          <strong className="text-white-700">Floor Length:</strong>
          <span className="text-white">{floorData?.length}</span>
        </div>
        <hr className="my-2" />
        <div className="flex items-center space-x-2 mb-2">
          <strong className="text-white-700">Building ID:</strong>
          <span className="text-white">{floorData?.building_id}</span>
        </div>
        <div className="flex items-center space-x-2 mb-2">
          <strong className="text-white-700">Total Floors:</strong>
          <span className="text-white">{buildingData?.floor_count}</span>
        </div>
      </div>
    </div>
  );
}
