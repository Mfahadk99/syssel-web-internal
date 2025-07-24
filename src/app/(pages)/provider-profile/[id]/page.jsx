"use client";
import { useParams, useSearchParams } from "next/navigation";
import React from "react";
// import ProviderProfile from "@/app/components/ProviderProfile/ProviderProfile";
import { useGetServiceByProviderId } from "@/app/hooks/useServices";
import { useGetSectionsByFilter } from "@/app/hooks/useSections";
import { useGetProfileById } from "@/app/hooks/useProfile";
import { useUser } from "@/app/context/UserContext";
import { useGetVouchers } from "@/app/hooks/useVoucher";
import { useGetAllImages } from "@/app/hooks/useGallery";
// import SimpleLogoLoader from "@/app/components/Loader/Loader";
import useLocation from "@/app/store/useLocation";
import dynamic from "next/dynamic";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const ProviderProfile = dynamic(
  () => import("@/app/components/ProviderProfile/ProviderProfile"),
  {
    loading: () => (
      <div className="bg-[#fef3ec] min-h-screen flex justify-center items-start p-6 md:p-10">
        <div className="bg-white rounded-2xl shadow-lg w-full max-w-6xl mx-auto">
          {/* Cover image */}
          <div className="relative h-[180px] md:h-[220px] rounded-t-2xl overflow-hidden">
            <Skeleton height="100%" width="100%" />
            {/* Profile avatar */}
            <div className="absolute left-10 -bottom-12">
              <Skeleton circle height={120} width={120} />
            </div>
          </div>
          {/* Profile info */}
          <div className="pt-16 px-8 pb-4">
            <div className="flex items-center gap-4">
              <Skeleton height={32} width={220} />
              <Skeleton height={24} width={32} />
            </div>
            <Skeleton height={20} width={180} style={{ marginTop: 8 }} />
            <Skeleton height={18} width={120} style={{ marginTop: 8 }} />
            {/* Stats */}
            <div className="flex gap-8 mt-6">
              <Skeleton height={28} width={60} />
              <Skeleton height={28} width={60} />
              <Skeleton height={28} width={60} />
            </div>
          </div>
          {/* Tabs */}
          <div className="flex gap-4 px-8 mt-2 mb-4">
            <Skeleton height={36} width={90} borderRadius={18} />
            <Skeleton height={36} width={90} borderRadius={18} />
            <Skeleton height={36} width={90} borderRadius={18} />
            <Skeleton height={36} width={90} borderRadius={18} />
          </div>
          {/* Main section/card */}
          <div className="bg-gray-50 rounded-2xl mx-4 mb-6 p-8 min-h-[180px] flex flex-col items-center justify-center">
            <Skeleton height={40} width="60%" style={{ marginBottom: 24 }} />
            <Skeleton height={48} width={220} borderRadius={12} />
          </div>
        </div>
      </div>
    ),
    ssr: false,
  }
);


const ProviderProfileContent = () => {
  // Data fetching using Hooks
  const params = useParams();
  // const { loading, setLoading } = useLoader();
  const searchParams = useSearchParams();
  const id = params.id || searchParams.get("id");

  const locationnnn = useLocation();
  console.log(locationnnn, "locationnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn");

  const {
    data: servicesData,
    isLoading,
    error,
    isSuccess: servicesSuccess,
  } = useGetServiceByProviderId(id);
  const {
    data: sectionsData,
    isLoading: sectionsLoading,
    error: sectionsError,
  } = useGetSectionsByFilter("provider", id, { enabled: servicesSuccess });
  const {
    data: voucherData,
    isLoading: voucherLoading,
    error: voucherError,
  } = useGetVouchers("providerId", id);
  const {
    data: providerData,
    isLoading: providerLoading,
    error: providerError,
  } = useGetProfileById(id);

  // Variables
  const providerServices = servicesData?.data || [];
  const providerSections = sectionsData?.data?.sections || [];
  const providerDataa = providerData?.data || [];
  const {
    data: galleryImages,
    isLoading: galleryLoading,
    error: galleryError,
  } = useGetAllImages(id);
  const vouchers = voucherData?.data?.vouchers || [];
  console.log(providerServices, "providerServices");

  // Filteration
  const subcategories =
    providerDataa?.subCategory?.map((sub) => ({
      id: sub._id,
      name: sub.name.trim(),
    })) || [];
  const providerTotalServices =
    providerServices.map((service) => ({
      id: service._id,
      name: service.name.trim(),
    })) || [];
  const { userType, isCurrentProfile } = useUser();

  // Create sections from providerSections and populate with matching services from providerServices
  const sections = providerSections
    .filter((section) => !section.isGallery) // Filter out gallery sections
    .map((section) => {
      // Find all services that belong to this section
      const sectionServices = providerServices.filter(
        (service) => service.sections && service.sections.includes(section._id)
      );

      // Find all vouchers that belong to this section
      const sectionVouchers = vouchers.filter(
        (voucher) =>
          voucher.sectionId &&
          voucher.sectionId.some(
            (sectionInfo) => sectionInfo._id === section._id
          )
      );

      // Format all services belonging to this section
      const formattedServices = sectionServices.map((service) => {
        return {
          provider: id,
          _id: service._id,
          serviceId: service._id,
          imageUrl: service.images?.[0] || "",
          category: service.category,
          images: service.images?.map((img) => ({ url: img })) || [],
          title: service.name,
          description: service.description,
          price: service.defaultPrice,
          priceUnit: "Per Session",
          vat: "25",
          defaultDuration: service.defaultDuration?.toString() || "30",
          allowClientDirectBooking: service.directBooking,
          allowRating: service.allowRating,
          homeService: service.homeService,
          nonRefundable: service.nonRefundable,
          addons:
            service.addOns?.map((addon) => ({
              title: addon.title,
              price: addon.price.toString(),
            })) || [],
          inputFields:
            service.inputBoxes?.map((input) => {
              let type = "text";
              if (input.inputType?.includes("image")) type = "image";

              return {
                type,
                label: input.value,
                enabled: true,
              };
            }) || [],
        };
      });

      // Format vouchers for this section
      const formattedVouchers = sectionVouchers.map((voucher) => ({
        provider: id,
        voucherId: voucher._id,
        _id: voucher._id,
        title: voucher.title,
        about: voucher.about,
        voucherValue: voucher.voucherValue,
        validity: voucher.validity,
        voucherNumber: voucher.voucherNumber,
        status: voucher.status,
        images: voucher.images,
        type: voucher.type,
      }));

      return {
        title: section.name,
        sectionId: section?.id || section?._id,
        ProviderServices: formattedServices,
        vouchers: formattedVouchers,
      };
    });

  const breakpoints = {
    320: { slidesPerView: 1.2, spaceBetween: 10 },
    640: { slidesPerView: 2.2, spaceBetween: 12 },
    768: { slidesPerView: 3.2, spaceBetween: 12 },
    1024: { slidesPerView: 4.2, spaceBetween: 12 },
  };

  // gallery sections integration here

  const gallerySections = providerSections.filter(
    (section) => section.isGallery === true
  );

  // useGetAllImages
  const galleryImagesData = galleryImages?.data || [];

  // First, create a map of all gallery sections
  const sectionsMap = gallerySections.map((section) => ({
    sectionId: section._id,
    sectionName: section.name,
    images: [],
  }));

  // Then, add images to their corresponding sections
  const groupedBySection = (galleryImagesData.data || []).reduce(
    (acc, photo) => {
      // Skip photos that don't have valid section data
      if (!photo.section || !photo.section._id) {
        return acc;
      }

      const sectionId = photo.section._id;

      // Find the section in our array
      const sectionIndex = acc.findIndex(
        (section) => section.sectionId === sectionId
      );

      if (sectionIndex !== -1) {
        // Add the image to the corresponding section
        acc[sectionIndex].images.push(photo);
      }

      return acc;
    },
    sectionsMap
  ); // Initialize with all gallery sections

  const galleryData = {
    projects: groupedBySection.map((section) => ({
      _id: section.sectionId,
      title: section.sectionName,
      images: section.images.map((img) => ({
        url: img.image,
        _id: img._id,
      })),
    })),
  };

  const isCurrentUser = isCurrentProfile(id);

  if (
    !providerData ||
    providerLoading ||
    isLoading ||
    sectionsLoading ||
    galleryLoading ||
    voucherLoading ||
    galleryLoading
  ) {
    return null;
  }

  if (error || sectionsError || providerError) {
    return (
      <div>
        {error?.message || sectionsError?.message || providerError?.message}
      </div>
    );
  }

  return (
    <ProviderProfile
      initialSections={sections}
      breakpoints={breakpoints}
      providerId={id}
      providerData={providerDataa}
      galleryData={galleryData}
      subcategories={subcategories}
      isCurrentProfile={isCurrentUser}
      userType={userType}
      providerTotalServices={providerTotalServices}
    />
  );
};

export default ProviderProfileContent;
