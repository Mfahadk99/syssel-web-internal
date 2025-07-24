"use client";
import React, { useContext } from "react";
import dynamic from "next/dynamic";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useGetServiceById } from "@/app/hooks/useServices";
import { useParams } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { useGetProfileById } from "@/app/hooks/useProfile";
import { useUser } from "@/app/context/UserContext";
import useAuthStore from "@/app/store/useAuthStore";

const ServiceInfo = dynamic(
  () => import("@/app/components/ProviderProfile/ServiceInfo"),
  {
    loading: () => (
      <div className="bg-[#fdf4ee] min-h-screen flex items-center justify-center">
        <div className="w-full max-w-5xl mx-auto">
          <div className="bg-white rounded-2xl shadow-md p-8 mt-8">
            {/* Cover image */}
            <div className="relative mb-8">
              <Skeleton height={260} width="100%" borderRadius={18} />
              {/* Avatar and company name at bottom left */}
              <div className="absolute left-8 bottom-8 flex items-center">
                <Skeleton
                  height={56}
                  width={56}
                  circle
                  style={{ marginRight: 16 }}
                />
                <Skeleton height={24} width={160} />
              </div>
              {/* Price at bottom right */}
              <div className="absolute right-8 bottom-8">
                <Skeleton height={40} width={120} borderRadius={20} />
              </div>
              {/* Top right icons */}
              <div className="absolute right-8 top-8 flex gap-4">
                <Skeleton height={36} width={36} circle />
                <Skeleton height={36} width={36} circle />
              </div>
            </div>
            {/* Title, subtitle, rating */}
            <div className="mb-6">
              <Skeleton height={28} width={120} style={{ marginBottom: 8 }} />
              <Skeleton height={18} width={180} style={{ marginBottom: 8 }} />
              <div className="flex items-center gap-2 mb-2">
                <Skeleton height={18} width={90} />
                <Skeleton height={18} width={30} />
              </div>
            </div>
            {/* Add-ons section */}
            <div className="mb-2">
              <Skeleton height={22} width={90} style={{ marginBottom: 12 }} />
              <div className="rounded-xl border px-4 py-3 flex items-center gap-4">
                <Skeleton height={24} width={24} circle />
                <Skeleton height={18} width={80} />
                <div className="flex-1" />
                <Skeleton height={18} width={40} />
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    ssr: false,
  }
);

const page = () => {
  const params = useParams();
  const id = params.id;
  const { data: serviceDataa, isLoading, isError } = useGetServiceById(id);
  console.log(serviceDataa, "serviceD4444444444444444444444444444444444444")
  const { currentProfile } = useAuthStore();
  const ProviderServiceData = serviceDataa?.data;
  const searchParams = useSearchParams();
  const paramsId = searchParams.get("provider");
  const {
    data: profile,
    isLoading: profileLoading,
    isError: profileError,
  } = useGetProfileById(paramsId);
  const profileData = profile?.data || [];
  const timings = profileData?.timings;
  const { isCurrentProfile } = useUser();
  const customerId = currentProfile?._id;
  const isCurrentUser = isCurrentProfile(paramsId);
  const subcategories =
    profile?.data?.subCategory?.map((sub) => ({
      id: sub._id,
      name: sub.name.trim(),
    })) || [];

  if (isLoading || profileLoading) {
    return null;
  }

  const serviceData = {
    serviceId: id,
    providerId: ProviderServiceData.provider?._id,
    category: ProviderServiceData.category?.name,
    providerSubCategories: subcategories,
    subcategory: ProviderServiceData.subcategory?.name,
    images: (ProviderServiceData.images || []).map((img) => ({
      url: img || "https://via.placeholder.com/400",
    })),
    title: ProviderServiceData.name || "",
    description: ProviderServiceData.description || "",
    price: ProviderServiceData.defaultPrice || "0",
    vat: ProviderServiceData.vatPercentage || "25",
    priceUnit: ProviderServiceData.priceUnit || "Per Session",
    defaultDuration: ProviderServiceData.defaultDuration || "30",
    allowClientDirectBooking: ProviderServiceData.directBooking || false,
    allowRating: ProviderServiceData.allowRating || false,
    homeService: ProviderServiceData.homeService || false,
    nonRefundable: ProviderServiceData.nonRefundable || false,
    addons: (ProviderServiceData.addOns || []).map((addon) => ({
      title: addon.title || "",
      price: addon.price || "0",
    })),
    inputFields: (ProviderServiceData.inputBoxes || []).map((field) => ({
      type: field.inputType || "text-box",
      label: field.value || "No data to display",
      enabled: field.isEnabled || true,
    })),
    status: ProviderServiceData.status || "active",
    slug: ProviderServiceData.slug || "",
    sections: ProviderServiceData.sections || [],
    sales: (ProviderServiceData.sales || []).map((sale) => ({
      id: sale._id,
      name: sale.name || "",
      slug: sale.slug || "",
      originalPrice: sale.originalPrice || 0,
      finalPrice: sale.finalPrice || 0,
      lastMinDeal: sale.lastMinDeal || false,
      followerExclusive: sale.followerExclusive || false,
      endDate: sale.endDate || "",
      status: sale.status || "",
      discountPercentage: sale.discountPercentage || 0,
      createdAt: sale.createdAt || "",
    })),
  };

  if (isError || profileError) {
    return <div>Error: {isError.message}</div>;
  }

  return (
    <div>
      <ServiceInfo
        isCurrentUser={isCurrentUser}
        serviceData={serviceData}
        profileData={profileData}
        customerId={customerId}
        timings={timings}
      />
    </div>
  );
};

export default page;
