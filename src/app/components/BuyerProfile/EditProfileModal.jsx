"use client";
import React, { useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { X, Upload, MapPin, User } from "lucide-react";
import Image from "next/image";
import { useUpdateProfile } from "@/app/hooks/useProfile";
import useImageUploader from "@/app/utils/imgUpload";
import DummyProfileImage from "../../../../public/DummyProfileImage.png";

const EditProfileModal = ({ isOpen, onClose, profile }) => {
  const [formData, setFormData] = useState({
    name: "",
    city: "",
    country: "",
    image: DummyProfileImage,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(DummyProfileImage);

  const updateProfileMutation = useUpdateProfile();
  const { uploadFiles, uploading: imageUploading } = useImageUploader();

  // Initialize form data when modal opens
  useEffect(() => {
    if (isOpen && profile) {
      setFormData({
        name: profile.name || "",
        city: profile.city || "",
        country: profile.country || "",
        image: profile.image || DummyProfileImage,
      });
      setImagePreview(profile.image || DummyProfileImage);
      setImageFile(null);
    }
  }, [isOpen, profile]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let imageUrl = formData.image;

      // Upload image if a new file is selected
      if (imageFile) {
        const uploadResults = await uploadFiles([imageFile]);
        if (uploadResults[0]?.success) {
          imageUrl = uploadResults[0].urls[0];
        } else {
          console.error("Failed to upload image:", uploadResults[0]?.error);
          return;
        }
      }

      // Prepare the data to send
      const updateData = {
        id: profile._id,
        name: formData.name,
        city: formData.city,
        country: formData.country,
        image: imageUrl,
      };

      updateProfileMutation.mutate(updateData, {
        onSuccess: () => {
          onClose();
          // Optionally refresh the profile data
          if (profile.refetchProfile) {
            profile.refetchProfile();
          }
        },
        onError: (error) => {
          console.error("Failed to update profile:", error);
          // You can add toast notification here
        },
      });
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-900/10 backdrop-blur-md" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-6">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Edit Profile
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Avatar Section */}
                  <div className="flex flex-col items-center space-y-4">
                    <div className="relative">
                      <Image
                        src={imagePreview || DummyProfileImage}
                        alt="Profile"
                        width={80}
                        height={80}
                        className="w-20 h-20 rounded-full object-cover border-4 border-gray-200"
                        unoptimized={
                          typeof imagePreview === "string" &&
                          imagePreview.startsWith("data:")
                        }
                        onError={(e) => {
                          e.target.src = DummyProfileImage;
                        }}
                      />
                      <label className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-2 cursor-pointer hover:bg-primary/80 transition-colors">
                        <Upload className="w-4 h-4" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <p className="text-sm text-gray-500 text-center">
                      Click the upload icon to change your profile picture
                    </p>
                  </div>

                  {/* Name Field */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      <User className="w-4 h-4 inline mr-2" />
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>

                  {/* Location Fields */}
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700">
                      <MapPin className="w-4 h-4 inline mr-2" />
                      Location
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="City"
                      />
                      <input
                        type="text"
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Country"
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={
                        updateProfileMutation.isPending || imageUploading
                      }
                      className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {updateProfileMutation.isPending || imageUploading
                        ? "Updating..."
                        : "Update Profile"}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default EditProfileModal;
