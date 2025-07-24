"use client";
import { React } from "react";
import { useGetSettingsById } from "@/app/hooks/useSettings";
// import SimpleLogoLoader from "@/app/components/Loader/Loader";
// import Settings from "@/app/components/Settings/Settings";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

const Settings = dynamic(() => import("../../../components/Settings/Settings"), {
  loading: () => <Skeleton count={16} height={80} borderRadius={24} style={{ marginTop: 28 }} />,
  ssr: false,
});

const page = () => {
  const { id } = useParams();
  const {
    data: settings,
    isLoading: settingsLoading,
    error: settingsError,
  } = useGetSettingsById(id);

  //variables
  const setttingsId = settings?.data?._id;
  const radiusSettings = settings?.data?.discoverSettings || {};
  const missionSettings = settings?.data?.missionSettings || {};
  const language = settings?.data?.language;

  if (settingsError) {
    return <div>Error: {settingsError.message}</div>;
  }

  // if (settingsLoading || !settings) {
  //   return (
  //     <div>
  //       <SimpleLogoLoader />
  //     </div>
  //   );
  // }

  return (
    <div>
      <Settings
        setttingsId={setttingsId}
        radiusSettings={radiusSettings}
        missionSettings={missionSettings}
        language={language}
      />
    </div>
  );
};

export default page;
