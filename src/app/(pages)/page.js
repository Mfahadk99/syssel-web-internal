"use client";
import dynamic from "next/dynamic";

const MainPage = dynamic(() => import("./discover/page"), {
  loading: () => <div></div>,
});

export default function HomePage() {
  return (
    <div>
      <MainPage />
    </div>
  );
}
