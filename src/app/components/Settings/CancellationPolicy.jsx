"use client";
import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { ChevronLeft, Info } from "lucide-react";
import useAuthStore from "@/app/store/useAuthStore";
// import SimpleLogoLoader from "@/app/components/Loader/Loader";
import { useGetSettingsById, useUpdateSettings } from "../../hooks/useSettings";
import toast from "react-hot-toast";

export default function CancellationPolicy() {
  const { currentProfile } = useAuthStore();
  const profileId = currentProfile?._id;
  console.log(profileId, "profileIddddddddddddddddddddddddddddddddddddddddd");
  const { data: settingData, isLoading: policyLoading } =
    useGetSettingsById(profileId);
  console.log(settingData, "11111111111111111111111111111111111111111");
  const settingId = settingData?.data?._id;
  console.log(settingId, "settingId2d2d2d2d2d2d2d2d2d222d2d2d2d2d2d2d2d2d2d2");
  const updateSettings = useUpdateSettings(settingId);

  const dataPolicy = settingData?.data?.cancellationPolicy || {};
  console.log(
    dataPolicy,
    "dataPolicy222222222222222222222222222222222222222222"
  );

  // Always show at least 3 variations
  const variantsFromApi =
    dataPolicy.variants?.map((v) => ({
      isActive: v.isActive,
      cancellationDeadline: v.cancellationDeadline?.replace(" before", ""),
      cancellationFee: v.cancellationFee?.replace(/[^0-9.]/g, ""),
      feeType: v.cancellationFee?.replace(/[0-9.]/g, "") || "%",
      _id: v._id,
    })) || [];
  const emptyVariant = {
    isActive: false,
    cancellationDeadline: "",
    cancellationFee: "",
    feeType: "%",
    _id: undefined,
  };
  const variants = [...variantsFromApi];
  while (variants.length < 3) variants.push({ ...emptyVariant });

  // Prepare form default values from API
  const defaultValues = {
    NonRefundable: dataPolicy.NonRefundable ?? false,
    variants,
  };

  const { control, handleSubmit, reset, watch, setValue } = useForm({
    defaultValues,
  });
  const [isProcessing, setIsProcessing] = useState(false);

  // Reset form when API data changes
  useEffect(() => {
    const variantsFromApi =
      dataPolicy.variants?.map((v) => ({
        isActive: v.isActive,
        cancellationDeadline: v.cancellationDeadline?.replace(" before", ""),
        cancellationFee: v.cancellationFee?.replace(/[^0-9.]/g, ""),
        feeType: v.cancellationFee?.replace(/[0-9.]/g, "") || "%",
        _id: v._id,
      })) || [];
    const variants = [...variantsFromApi];
    while (variants.length < 3) variants.push({ ...emptyVariant });
    reset({
      NonRefundable: dataPolicy.NonRefundable ?? false,
      variants,
    });
  }, [dataPolicy, reset]);

  const deadlineOptions = ["24 hours", "2 Days", "3 Days"];
  const feeTypeOptions = ["%", "kr"];

  // Save handler
  const onSubmit = async (data) => {
    setIsProcessing(true);
    try {
      await updateSettings.mutateAsync({
        cancellationPolicy: {
          NonRefundable: data.NonRefundable,
          variants: data.variants.map((variant) => {
            const base = {
              isActive: variant.isActive,
              cancellationDeadline: variant.cancellationDeadline + " before",
              cancellationFee: variant.cancellationFee + variant.feeType,
            };
            if (variant._id) base._id = variant._id;
            return base;
          }),
        },
      });
      toast.success("Cancellation Policy updated successfully!");
    } catch (error) {
      console.error("Error updating cancellation policy:", error);
      toast.error("Failed to Update Cancellation Policy. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // if (policyLoading || !settingData) {
  //   return <SimpleLogoLoader />;
  // }

  return (
    <div className="mx-auto bg-background min-h-screen pb-8">
      {/* Header */}
      <div className="flex items-center justify-center relative h-16 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-[#3a2f29]">
          Cancellation Policy
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="p-6">
          {/* <div className="flex justify-between mb-6">
            <h2 className="text-2xl font-bold text-[#2a3b4c]">
              Cancellation / Refund Conditions
            </h2>
            <Info size={24} className="text-[#2a3b4c]" />
          </div> */}

          <div className="flex justify-between mb-6 relative">
            <h2 className="text-2xl font-bold text-[#2a3b4c]">
              Cancellation / Refund Conditions
            </h2>
            <div className="relative group">
              <Info size={24} className="text-[#2a3b4c] cursor-pointer" />

              {/* Tooltip / Hover Modal */}
              <div className="absolute right-0 top-8 w-80 z-50 hidden group-hover:block">
                <div className="p-4 rounded-2xl shadow-lg bg-white border border-gray-200 text-sm text-gray-700 space-y-3 leading-relaxed">
                  <p>
                    <strong>
                      Enter the conditions for cancellations and refunds.
                    </strong>
                  </p>
                  <p>
                    Toggle for all pre-paid services to be non-refundable under
                    24 hours prior to the appointment.
                  </p>
                  <p>Add variations for cancellation / refund policies:</p>
                  <p>For example:</p>
                  <ul className="list-disc list-inside space-y-1 pl-2">
                    <li>
                      If cancelled before <strong>3 days</strong>, full refund{" "}
                      <span className="text-gray-500">
                        (0% cancellation fee)
                      </span>
                    </li>
                    <li>
                      If cancelled before <strong>24 hours</strong>, 50% refund{" "}
                      <span className="text-gray-500">
                        (50% cancellation fee)
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {/* NonRefundable toggle */}
            <div className="flex justify-between items-center p-4 bg-white rounded-lg shadow-sm">
              <span className="font-semibold text-lg">
                Non-refundable under 24 hours prior
              </span>
              <Controller
                control={control}
                name="NonRefundable"
                render={({ field }) => (
                  <button
                    type="button"
                    className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ${
                      field.value ? "bg-[#7b4864]" : "bg-gray-300"
                    }`}
                    onClick={() => field.onChange(!field.value)}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transform transition-transform duration-200 ${
                        field.value ? "translate-x-6" : "translate-x-0"
                      }`}
                    ></div>
                  </button>
                )}
              />
            </div>

            {/* Variants */}
            {watch("variants").map((variant, idx) => (
              <div key={variant._id || idx} className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-white rounded-lg shadow-sm">
                  <span className="font-semibold text-lg">{`Variation ${
                    idx + 1
                  }`}</span>
                  <Controller
                    control={control}
                    name={`variants.${idx}.isActive`}
                    render={({ field }) => (
                      <button
                        type="button"
                        className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ${
                          field.value ? "bg-[#7b4864]" : "bg-gray-300"
                        }`}
                        onClick={() => {
                          // Only allow one active at a time
                          const variants = watch("variants").map((v, i) => ({
                            ...v,
                            isActive: i === idx ? !field.value : false,
                          }));
                          setValue("variants", variants, { shouldDirty: true });
                        }}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white transform transition-transform duration-200 ${
                            field.value ? "translate-x-6" : "translate-x-0"
                          }`}
                        ></div>
                      </button>
                    )}
                  />
                </div>
                {variant.isActive && (
                  <>
                    {/* Deadline */}
                    <div className="w-full p-4 bg-white rounded-lg shadow-sm">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-lg">
                          Cancellation deadline
                        </span>
                        <Controller
                          control={control}
                          name={`variants.${idx}.cancellationDeadline`}
                          render={({ field }) => (
                            <select
                              {...field}
                              className="border px-3 py-1 rounded-full border-gray-300"
                            >
                              {deadlineOptions.map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                          )}
                        />
                      </div>
                    </div>
                    {/* Fee & Fee Type */}
                    <div className="w-full p-4 bg-white rounded-lg shadow-sm">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-lg">
                          Cancellation fee
                        </span>
                        <div className="flex items-center border rounded-full border-gray-300 px-3 py-1">
                          <Controller
                            control={control}
                            name={`variants.${idx}.cancellationFee`}
                            render={({ field }) => (
                              <input
                                {...field}
                                type="text"
                                placeholder="Type here"
                                className="w-20 text-gray-400 focus:outline-none mr-2"
                              />
                            )}
                          />
                          <Controller
                            control={control}
                            name={`variants.${idx}.feeType`}
                            render={({ field }) => (
                              <select
                                {...field}
                                className="border-none bg-transparent"
                              >
                                {feeTypeOptions.map((option) => (
                                  <option key={option} value={option}>
                                    {option}
                                  </option>
                                ))}
                              </select>
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
          {/* Save Button */}
          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              className="bg-[#7b4864] text-white px-6 py-2 rounded-lg font-semibold shadow-md hover:bg-[#5a3450] transition"
              disabled={isProcessing}
            >
              {isProcessing ? "Updating..." : "Update Policy"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
