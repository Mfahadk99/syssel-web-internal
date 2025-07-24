"use client";
import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { ChevronLeft, Info } from "lucide-react";
import { useGetSettingsById, useUpdateSettings } from "../../hooks/useSettings";
import useAuthStore from "@/app/store/useAuthStore";
// import SimpleLogoLoader from "@/app/components/Loader/Loader";
import toast from "react-hot-toast";

export default function LoyaltySettings() {
  const { currentProfile } = useAuthStore();
  const profileId = currentProfile?._id;
  console.log(profileId, "profileIdddddddddddddddddddddddddd");

  const { data: settingData, isLoading } = useGetSettingsById(profileId);
  console.log(settingData, "11111111111111111111111111111111111111111");
  const settingId = settingData?.data?._id;
  console.log(settingId, "settingId2d2d2d2d2d2d2d2d2d222d2d2d2d2d2d2d2d2d2d2");
  const updateSettings = useUpdateSettings(settingId);

  const rewardsData = settingData?.data?.rewards || [];
  console.log(rewardsData, "rewardsdat222222222222222222222222222222222222222");

  // Always show at least 3 vouchers
  const vouchersFromApi = rewardsData.map((reward) => ({
    isActive: reward.voucher1.isActive,
    inStoreSpend: reward.voucher1.inStoreSpend,
    voucherRewardSize: reward.voucher1.voucherRewardSize,
    message: reward.voucher1.message,
    _id: reward._id,
  }));
  const emptyVoucher = {
    isActive: false,
    inStoreSpend: "",
    voucherRewardSize: "",
    message: "",
    _id: undefined,
  };
  const vouchers = [...vouchersFromApi];
  while (vouchers.length < 3) vouchers.push({ ...emptyVoucher });

  const defaultValues = { vouchers };
  const { control, handleSubmit, reset, watch, setValue } = useForm({
    defaultValues,
  });
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const vouchersFromApi = rewardsData.map((reward) => ({
      isActive: reward.voucher1.isActive,
      inStoreSpend: reward.voucher1.inStoreSpend,
      voucherRewardSize: reward.voucher1.voucherRewardSize,
      message: reward.voucher1.message,
      _id: reward._id,
    }));
    const vouchers = [...vouchersFromApi];
    while (vouchers.length < 3) vouchers.push({ ...emptyVoucher });
    reset({ vouchers });
  }, [rewardsData, reset]);

  // Save handler
  const onSubmit = async (data) => {
    setIsProcessing(true);
    try {
      await updateSettings.mutateAsync({
        rewards: data.vouchers.map((voucher) => {
          const base = {
            voucher1: {
              isActive: voucher.isActive,
              inStoreSpend: voucher.inStoreSpend,
              voucherRewardSize: voucher.voucherRewardSize,
              message: voucher.message,
            },
          };
          if (voucher._id) base._id = voucher._id;
          return base;
        }),
      });
      toast.success("Loyalty Program updated successfully!");
    } catch (error) {
      console.error("Error updating rewards:", error);
      toast.error("Failed to Update Loyalty Program. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // if (isLoading) return <div>Loading rewards...</div>;
  // if (!rewardsData.length) return <div>No rewards found for this profile.</div>;

  // if (isLoading || !settingData) {
  //   return <SimpleLogoLoader />;
  // }

  return (
    <div className="mx-auto bg-background min-h-screen pb-8">
      {/* Header */}
      <div className="flex items-center justify-center relative h-16 border-gray-200">
        {/* <div className="absolute left-4">
          <ChevronLeft size={24} color="#333" />
        </div> */}
        <h1 className="text-2xl font-bold text-[#3a2f29]">Loyalty Program</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Rewards Section */}
        <div className="p-6">
          {/* <div className="flex justify-between mb-6">
            <h2 className="text-2xl font-bold text-[#2a3b4c]">Rewards</h2>
            <Info size={24} className="text-[#2a3b4c]" />
          </div> */}
          <div className="flex justify-between mb-6 relative">
            <h2 className="text-2xl font-bold text-[#2a3b4c]">Rewards</h2>

            {/* Info Icon with Hover Tooltip */}
            <div className="relative group cursor-pointer">
              <Info size={24} className="text-[#2a3b4c]" />

              {/* Hover Modal */}
              <div className="absolute top-8 right-0 w-80 z-50 hidden group-hover:block">
                <div className="p-4 bg-white shadow-xl rounded-2xl border border-gray-200 text-sm text-[#3a2f29] space-y-3 leading-relaxed">
                  <p className="font-semibold text-center">
                    Reward loyal customers with automatic vouchers when they
                    spend a certain amount in store.
                  </p>
                  <p className="text-center">
                    The voucher will be sent directly to the customer, in-chat
                    with a personalised message.
                  </p>
                </div>
              </div>
            </div>
          </div>
          {/* Vouchers */}
          <div className="space-y-4">
            {watch("vouchers").map((voucher, idx) => (
              <div key={voucher._id || idx} className="space-y-3">
                <div className="flex justify-between items-center p-4 bg-white rounded-xl shadow-sm">
                  <span className="font-semibold text-lg">
                    Automatic voucher {idx + 1}
                  </span>
                  <Controller
                    control={control}
                    name={`vouchers.${idx}.isActive`}
                    render={({ field }) => (
                      <button
                        type="button"
                        className={`cursor-pointer w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out ${
                          field.value ? "bg-[#7b4864]" : "bg-gray-300"
                        }`}
                        onClick={() => {
                          // Only allow one active at a time
                          const vouchers = watch("vouchers").map((v, i) => ({
                            ...v,
                            isActive: i === idx ? !field.value : false,
                          }));
                          // setValue is not destructured, so add it to useForm
                          setValue("vouchers", vouchers, { shouldDirty: true });
                        }}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white transform transition-transform duration-200 ease-in-out ${
                            field.value ? "translate-x-6" : "translate-x-0"
                          }`}
                        ></div>
                      </button>
                    )}
                  />
                </div>
                {voucher.isActive && (
                  <>
                    {/* In-store spend */}
                    <div className="p-4 bg-white rounded-lg shadow-sm">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-lg">
                          In-store spend
                        </span>
                        <div className="flex items-center border border-gray-300 rounded-full px-2 py-1">
                          <Controller
                            control={control}
                            name={`vouchers.${idx}.inStoreSpend`}
                            render={({ field }) => (
                              <input
                                type="number"
                                {...field}
                                className="w-17 text-right outline-none focus:outline-none focus:ring-0"
                                style={{
                                  WebkitAppearance: "none",
                                  MozAppearance: "textfield",
                                }}
                              />
                            )}
                          />
                          <span className="font-semibold ml-1">kr</span>
                        </div>
                      </div>
                    </div>
                    {/* Voucher reward size */}
                    <div className="p-4 bg-white rounded-lg shadow-sm">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-lg">
                          Voucher reward size
                        </span>
                        <div className="flex items-center border border-gray-300 rounded-full px-2 py-1">
                          <Controller
                            control={control}
                            name={`vouchers.${idx}.voucherRewardSize`}
                            render={({ field }) => (
                              <input
                                type="number"
                                {...field}
                                className="w-17 text-right outline-none focus:outline-none focus:ring-0"
                                style={{
                                  WebkitAppearance: "none",
                                  MozAppearance: "textfield",
                                }}
                              />
                            )}
                          />
                          <span className="font-semibold ml-1">kr</span>
                        </div>
                      </div>
                    </div>
                    {/* Personalised message */}
                    <div className="p-4 bg-white rounded-lg shadow-sm h-32">
                      <Controller
                        control={control}
                        name={`vouchers.${idx}.message`}
                        render={({ field }) => (
                          <textarea
                            {...field}
                            placeholder="Personalised message"
                            className="w-full h-full text-gray-600 outline-none focus:outline-none focus:ring-0 resize-none bg-transparent"
                          />
                        )}
                      />
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
              {isProcessing ? "Updating..." : "Update Rewards"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
