"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Plus, X } from "lucide-react";
import { useCreateSection } from "@/app/hooks/useSections";
import toast from "react-hot-toast";

const Section = ({
  initialSections = [],
  onUpdateSections,
  providerId,
  subcategories,
  providerTotalServices,
}) => {
  const [showNewSection, setShowNewSection] = useState(false);
  const [sections, setSections] = useState(initialSections);

  // Initialize mutations
  const createSectionMutation = useCreateSection();

  // React Hook Form setup for section creation
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    watch,
  } = useForm({
    mode: "onChange",
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      // Create section first
      const sectionData = {
        provider: providerId,
        name: data.name,
      };

      // Create section using the mutation
      const sectionResponse = await createSectionMutation.mutateAsync(
        sectionData
      );
      const sectionId = sectionResponse.data._id;

      // Update local state
      const newSection = {
        sectionId: sectionId,
        title: data.name,
      };

      const updatedSections = [...sections, newSection];
      setSections(updatedSections);
      if (onUpdateSections) onUpdateSections(updatedSections);

      // Reset form and state
      reset();
      setShowNewSection(false);
      toast.success("Section created successfully!");
    } catch (error) {
      toast.error(
        "Error creating section: " +
          (error.response?.data?.message || error.message || "Unknown error")
      );
    }
  };

  const handleCancel = () => {
    reset();
    setShowNewSection(false);
  };

  return (
    <>
      {/* Add New Section Button */}
      <button
        onClick={() => setShowNewSection(true)}
        className="w-full mb-6 py-3 px-4 bg-gray-50 hover:bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center gap-2 text-gray-600 transition-colors"
      >
        <Plus className="w-5 h-5" />
        <span>Add New Section</span>
      </button>

      {/* New Section Form */}
      {showNewSection && (
        <div className="mb-8 bg-gray-50 p-4 rounded-xl">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1 mr-2">
                <input
                  type="text"
                  placeholder="Enter section name..."
                  {...register("name", {
                    required: "Section name is required",
                    minLength: {
                      value: 2,
                      message: "Name must be at least 2 characters",
                    },
                    maxLength: {
                      value: 50,
                      message: "Name must be less than 50 characters",
                    },
                  })}
                  className={`w-full p-2 border rounded-lg ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={handleCancel}
                className="p-2 text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Buttons */}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!isValid}
                className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary)]/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Section
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default Section;
