import React from "react";
import { useForm, Controller } from "react-hook-form";
import { useUpdateSettings } from "@/app/hooks/useSettings";
import toast from "react-hot-toast";

const Language = ({ onLanguageChange, currentLanguage, onCancel, language, settingsId }) => {
  const languages = [
    { id: "en", name: "English (US)" },
    { id: "nb", name: "Norsk" },
  ];

  const { control, handleSubmit } = useForm({
    defaultValues: {
      selectedLanguage: currentLanguage || "en",
    },
  });

  const updateSettingsMutation = useUpdateSettings(settingsId);

  const onSubmit = async (data) => {
    try {
      await updateSettingsMutation.mutateAsync({
        language: data.selectedLanguage
      });
      
      onLanguageChange && onLanguageChange(data.selectedLanguage);
      onCancel && onCancel();
      toast.success("Language updated successfully");
    } catch (error) {
      toast.error("Error updating language");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-5">
      <h2 className="text-lg font-medium mb-4 text-gray-700">Select Language</h2>

      <Controller
        control={control}
        name="selectedLanguage"
        render={({ field }) => (
          <div className="space-y-3 mb-5">
            {languages.map((language, index) => (
              <div
                key={index}
                onClick={() => field.onChange(language.id)}
                className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                  field.value === language.id
                    ? "bg-[#7d4464] bg-opacity-10 border border-[#7d4464]"
                    : "border border-gray-200 hover:bg-gray-50"
                }`}
              >
                <span
                  className={`${
                    field.value === language.id ? "text-white font-medium" : "text-gray-700"
                  }`}
                >
                  {language.name}
                </span>

                {field.value === language.id && (
                  <div className="ml-auto w-4 h-4 rounded-full bg-[#7d4464] flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      />

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="cursor-pointer px-5 py-2 border border-gray-300 rounded-full text-gray-700 font-medium hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="cursor-pointer px-5 py-2 bg-[#7d4464] rounded-full text-white font-medium hover:bg-primary/80"
        >
          Save
        </button>
      </div>
    </form>
  );
};

export default Language;
