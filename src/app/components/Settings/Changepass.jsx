"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { changePassword } from "../../utils/authApi";
import toast from "react-hot-toast";

const Changepass = ({ onCancel }) => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);

    try {
      // Prepare data according to API requirements
      const passwordData = {
        oldPassword: data.currentPassword,
        newPassword: data.newPassword,
      };

      const response = await changePassword(passwordData);
      console.log("Password changed successfully:", response);
      
      // Show success toast
      toast.success("Password updated successfully!");
      
      // Reset form after successful submission
      reset();
      
      // Close the form after a delay
      setTimeout(() => {
        onCancel();
      }, 2000);
    } catch (err) {
      console.error("Error changing password:", err);
      
      // Show error toast with specific message from API response
      const errorMessage = err.response?.data?.msg || "Failed to update password";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const newPassword = watch("newPassword");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="pt-1 pb-5 px-5 border-gray-100">
      <div className="space-y-4">
        {/* Current Password */}
        <div>
          <label className="block text-sm text-gray-500 mb-1">Current Password</label>
          <div className="relative">
            <input
              type={showCurrentPassword ? "text" : "password"}
              className="w-full p-3 border border-gray-300 rounded-lg outline-none transition-all"
              placeholder="Enter current password"
              disabled={isLoading}
              {...register("currentPassword", { required: "Current password is required" })}
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="cursor-pointer absolute right-3 top-3 text-gray-500"
              disabled={isLoading}
            >
              {showCurrentPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
            </button>
          </div>
          {errors.currentPassword && (
            <p className="text-xs text-red-500 mt-1">{errors.currentPassword.message}</p>
          )}
        </div>

        {/* New Password */}
        <div>
          <label className="block text-sm text-gray-500 mb-1">New Password</label>
          <div className="relative">
            <input
              type={showNewPassword ? "text" : "password"}
              className="w-full p-3 border border-gray-300 rounded-lg outline-none transition-all"
              placeholder="Enter new password"
              disabled={isLoading}
              {...register("newPassword", {
                required: "New password is required",
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters",
                },
              })}
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="cursor-pointer absolute right-3 top-3 text-gray-500"
              disabled={isLoading}
            >
              {showNewPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
            </button>
          </div>
          {errors.newPassword && (
            <p className="text-xs text-red-500 mt-1">{errors.newPassword.message}</p>
          )}
        </div>

        {/* Confirm New Password */}
        <div>
          <label className="block text-sm text-gray-500 mb-1">Confirm New Password</label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              className="w-full p-3 border border-gray-300 rounded-lg outline-none transition-all"
              placeholder="Confirm new password"
              disabled={isLoading}
              {...register("confirmPassword", {
                required: "Please confirm your new password",
                validate: (value) =>
                  value === newPassword || "Passwords do not match",
              })}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="cursor-pointer absolute right-3 top-3 text-gray-500"
              disabled={isLoading}
            >
              {showConfirmPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-red-500 mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-2 pt-2">
          <button
            type="button"
            className="cursor-pointer px-5 py-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="cursor-pointer px-5 py-2 bg-primary text-white rounded-full hover:bg-primary/80 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? "Updating..." : "Update Password"}
          </button>
        </div>
      </div>
    </form>
  );
};

export default Changepass;
