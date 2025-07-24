"use client";
import React from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/app/store/useAuthStore";
import Image from "next/image";

export const ActivityCard = ({
  data,
  activeTab,
  selectedMissionId,
  setSelectedMissionId,
  RenderBidsList,
}) => {
  const { currentProfile } = useAuthStore();
  const profileType = currentProfile?.profileType;
  const router = useRouter();

  const handleClickonMissionTabCard = (id) => {
    console.log(id);
    if (activeTab === "missions") {
      setSelectedMissionId(id === selectedMissionId ? null : id);
      console.log("missionTab");
    } else if (activeTab === "orders" && profileType === "provider") {
      router.push(`/mission/${id}`);
      console.log("orderTab provider");
    } else if (activeTab === "orders" && profileType === "buyer") {
      router.push(`/service-info/${id}`);
      console.log("orderTab buyer");
    }
    console.log("running");
  };

  return (
    <div key={data.id} className="mb-4">
      <div
        className="items-center sm:flex bg-white rounded-xl shadow-md cursor-pointer"
        onClick={() => {
          handleClickonMissionTabCard(data.id);
        }}
      >
        {/* Left image section */}
        <div className="relative min-w-[20%] h-40 bg-gray-200">
          <Image
            src={data?.image || "/images/default-image.png"}
            alt={data.title}
            fill
            className="rounded-l-xl object-cover"
            sizes="(max-width: 768px) 100vw, 20vw"
          />
        </div>

        {/* Content section */}
        <div className="flex p-4 sm:w-[80%]">
          <div className="flex justify-between w-full items-center">
            {/* Service details */}
            <div className="min-w-0">
              <h3 className="text-xl font-bold tracking-wide text-gray-800">
                {data.title}
              </h3>
              <div className="text-gray-500 text-md font-semibold mt-1">
                {data.business}
              </div>

              <p className="text-gray-400 w-[90%] text-sm mt-2 truncate">
                {data.description}
              </p>

              <div className="mt-2 text-secondary font-semibold">
                {data.price || data.date}
              </div>
            </div>

            <div className="flex flex-col  gap-2 items-center justify-center">
              {/* Status circle */}
              <div className="relative ">
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center`}
                >
                  {data.status === "completed" ? (
                    <span className="text-sm font-bold text-green-500">
                      Done
                    </span>
                  ) : (
                    <span className="text-2xl font-bold">{data.days}</span>
                  )}
                </div>

                {/* Label below circle */}
                {data.status !== "completed" && (
                  <div className="text-xs text-center mt-1">Days</div>
                )}

                {/* Progress arc for days count */}
                {data.status !== "completed" ? (
                  <div className="absolute  top-0 right-0 w-16 h-16">
                    <div className="w-16 h-16 p-1.5 rounded-full  circle-progress">
                      <div className="flex w-full h-full bg-white rounded-full items-center justify-center p-1">
                        <div className="text-center">
                          <div className="text-secondary text-xl font-bold"></div>
                          <div
                            className={`w-16 h-16 rounded-full flex items-center justify-center`}
                          >
                            {data.status === "completed" ? (
                              <span className="text-sm font-bold text-green-500">
                                Done
                              </span>
                            ) : (
                              <span className="text-2xl font-bold">
                                {data.days}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="absolute top-0 right-0 w-16 h-16">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="#57f000"
                        strokeWidth="8"
                      />
                    </svg>
                  </div>
                )}
              </div>

              {activeTab === "missions" && (
                <div className="text-secondary text-lg font-black mt-1">
                  {data.bids} bids
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Display bids below the mission card instead of inside it */}
      {activeTab === "missions" && selectedMissionId === data.id && (
        <div className="w-full mt-2 px-4 py-6 bg-gray-50 rounded-xl">
          {/* {renderBidsList(data.id, data)} */}

          <RenderBidsList missionId={data.id} missionData={data} />
        </div>
      )}
    </div>
  );
};

export default ActivityCard;
