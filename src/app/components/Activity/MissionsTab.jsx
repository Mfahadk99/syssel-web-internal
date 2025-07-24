"use client";
import React, { useState } from "react";
import { FaPlus } from "react-icons/fa";
import { useQueryClient } from "@tanstack/react-query";
import MissionForm from "./missionForm";

const MissionsTab = ({
  activeTab,
  orderStatus,
  setOrderStatus,
  missionData,
  renderCard,
  activeFilter,
  setActiveFilter,
}) => {
  const [showMissionForm, setShowMissionForm] = useState(false);
  const queryClient = useQueryClient();

  const handleMissionCreated = () => {
    // Close the form
    setShowMissionForm(false);
    // Invalidate and refetch missions data
    queryClient.invalidateQueries({ queryKey: ["missions"] });
  };

  // console.log(missionData, "missionDatamissionData");
  return (
    <div>
      {activeTab === "missions" && (
        <>
          {/* Filter buttons */}
          <div className="flex flex-wrap justify-center gap-4 sm:gap-8 items-center mt-8 mb-6">
            <button
              className={`text-black px-4 py-2 border-b-2 ${
                orderStatus === "recent"
                  ? "border-primary font-medium"
                  : "border-transparent hover:border-primary transition-all"
              }`}
              onClick={() => {
                setOrderStatus("recent");
                setActiveFilter && setActiveFilter("recent");
              }}
            >
              Recent
            </button>
            <button
              className={`text-black px-4 py-2 border-b-2 ${
                orderStatus === "in-progress"
                  ? "border-primary font-medium"
                  : "border-transparent hover:border-primary transition-all"
              }`}
              onClick={() => {
                setOrderStatus("in-progress");
                setActiveFilter && setActiveFilter("in-progress");
              }}
            >
              In Progress
            </button>
            <button
              className={`text-black px-4 py-2 border-b-2 ${
                orderStatus === "complete"
                  ? "border-primary font-medium"
                  : "border-transparent hover:border-primary transition-all"
              }`}
              onClick={() => {
                setOrderStatus("complete");
                setActiveFilter && setActiveFilter("complete");
              }}
            >
              Completed
            </button>
          </div>

          {/* Mission data rendering based on filter */}
          {missionData?.filter((category) =>
            orderStatus === "recent"
              ? true
              : category?.orders?.some((order) => order?.status === orderStatus)
          ).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-gray-500 text-lg">
                {orderStatus === "recent"
                  ? "No missions available"
                  : orderStatus === "in-progress"
                  ? "No missions in progress"
                  : "No completed missions"}
              </p>
            </div>
          ) : (
            missionData
              ?.filter((category, index) =>
                orderStatus == "recent"
                  ? true
                  : category?.orders?.some(
                      (order) => order?.status === orderStatus
                    )
              )
              ?.map((category) => (
                <div key={category._id} className="mb-6">
                  <h2 className="text-sm font-medium mb-3 text-gray-500 uppercase tracking-wider">
                    {category?.category}
                  </h2>
                  {category?.orders
                    ?.filter((order) =>
                      orderStatus === "recent"
                        ? true
                        : order.status === orderStatus
                    )
                    ?.map((data) => renderCard(data))}
                </div>
              ))
          )}

          {/* Create Mission Button */}
          <div className="fixed sm:absolute bottom-4 sm:top-0 right-4 sm:right-0 z-10">
            <button
              onClick={() => setShowMissionForm(true)}
              className="bg-primary text-white py-2 px-4 sm:px-5 rounded-full cursor-pointer hover:bg-primary-hover duration-300 transition-colors flex gap-2 items-center text-sm sm:text-base"
            >
              <FaPlus className="w-3 h-3 sm:w-4 sm:h-4" />
              Create Mission
            </button>
          </div>

          {/* Modal for mission form */}
          {showMissionForm && <MissionForm onClose={handleMissionCreated} />}
        </>
      )}
    </div>
  );
};

export default MissionsTab;
