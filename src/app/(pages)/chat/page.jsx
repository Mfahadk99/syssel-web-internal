"use client";
import React from "react";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const CompanyInfo = dynamic(
  () => import("@/app/components/Settings/CompanyInfo"),
  {
    loading: () => (
      <Skeleton height={36} width={320} style={{ margin: "32px auto" }} />
    ),
    ssr: false,
  }
);

const Chat = dynamic(() => import("@/app/components/chat/chat"), {
  loading: () => (
    <div className="flex h-screen bg-[#fef3ec]">
      {/* Sidebar */}
      <div className="w-[320px] bg-white border-r p-4 flex flex-col">
        <Skeleton
          height={40}
          width="100%"
          borderRadius={8}
          style={{ marginBottom: 24 }}
        />
        {/* Conversation list */}
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 mb-4">
            <Skeleton circle height={40} width={40} />
            <div className="flex-1">
              <Skeleton height={16} width="60%" />
              <Skeleton height={12} width="80%" />
            </div>
          </div>
        ))}
      </div>
      {/* Chat area */}
      <div className="flex-1 flex flex-col bg-[#fef3ec]">
        {/* Header */}
        <div className="bg-primary/80 h-16 flex items-center px-6">
          <Skeleton height={32} width={120} />
        </div>
        {/* Chat bubbles */}
        <div className="flex-1 p-6 flex flex-col gap-4">
          {/* Left bubble */}
          <div className="flex items-center gap-2">
            <Skeleton circle height={32} width={32} />
            <Skeleton height={28} width={180} borderRadius={16} />
          </div>
          {/* Right bubble */}
          <div className="flex justify-end">
            <Skeleton height={28} width={220} borderRadius={16} />
          </div>
          {/* Left bubble */}
          <div className="flex items-center gap-2">
            <Skeleton circle height={32} width={32} />
            <Skeleton height={28} width={140} borderRadius={16} />
          </div>
          {/* Right bubble */}
          <div className="flex justify-end">
            <Skeleton height={28} width={180} borderRadius={16} />
          </div>
        </div>
        {/* Input bar */}
        <div className="flex items-center gap-3 px-6 py-4 border-t bg-white">
          <Skeleton circle height={36} width={36} />
          <Skeleton height={36} width="60%" borderRadius={18} />
          <Skeleton circle height={36} width={36} />
        </div>
      </div>
    </div>
  ),
  ssr: false,
});

const ChatPage = () => {
  const searchParams = useSearchParams();
  const currentUser = searchParams.get("currentUser");
  const profileId = searchParams.get("profileId");

  return <Chat currentUser={currentUser} profileId={profileId} />;
};

const page = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ChatPage />
    </Suspense>
  );
};

export default page;
