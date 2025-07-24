"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import {
  FiArrowLeft,
  FiPaperclip,
  FiCheck,
  FiHeadphones,
  FiX,
} from "react-icons/fi";
import Link from "next/link";
import useImageUploader from "../../utils/imgUpload";
import { useCreateTicket } from "@/app/hooks/useTicket";
import toast from "react-hot-toast";

const generateTicketNumber = () => {
  const timestamp = Date.now().toString();
  const randomSuffix = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `${timestamp}-${randomSuffix}`;
};

const Support = ({ customerName, customerId }) => {
  const [attachmentAdded, setAttachmentAdded] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const { uploadFiles, uploading, error: uploadError } = useImageUploader();
  const { mutate: createTicket, isLoading: isCreating } = useCreateTicket();

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setAttachmentAdded(true);
    }
  };

  const removeAttachment = () => {
    setSelectedFile(null);
    setAttachmentAdded(false);
    // Reset the file input
    const fileInput = document.getElementById("file-upload");
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setSubmitError(null);

    let attachmentURL = "";

    // Upload file if selected
    if (selectedFile) {
      try {
        const [result] = await uploadFiles([selectedFile]);
        if (result.success) {
          attachmentURL = result.urls[0];
        } else {
          setSubmitError(`Upload failed: ${result.error}`);
          setIsSubmitting(false);
          return;
        }
      } catch (err) {
        setSubmitError(`Upload error: ${err.message}`);
        setIsSubmitting(false);
        return;
      }
    }

    const requestBody = {
      ticketNumber: generateTicketNumber(),
      customerName: customerName,
      issueType: data.issueType,
      description: data.description,
      // assignedTo: customerId,
      attachment: attachmentURL,
    };

    createTicket(requestBody, {
      onSuccess: (result) => {
        // console.log("Support ticket created:", result);
        reset();
        setSelectedFile(null);
        setAttachmentAdded(false);
        toast.success("Support ticket submitted successfully!");
        setIsSubmitting(false);
      },
      onError: (err) => {
        setSubmitError(`Failed to submit ticket: ${err.message || err}`);
        setIsSubmitting(false);
      },
    });
  };

  const issueTypes = [
    { value: "technical", label: "Technical" },
    { value: "billing", label: "Billing" },
    { value: "general", label: "General" },
    { value: "other", label: "Other" },
  ];

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <div className="bg-background p-4 flex items-center sticky top-0 z-10 border-b border-gray-200">
        <Link href="/">
          <div className="cursor-pointer p-2">
            <FiArrowLeft size={22} className="text-gray-700" />
          </div>
        </Link>
        <h1 className="text-xl font-medium mx-auto text-gray-800">Support</h1>
        <div className="w-10"></div>
      </div>

      <div className="max-w-xl mx-auto px-4 py-8">
        {/* Icon and title */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 bg-[#7d4464] rounded-full flex items-center justify-center mb-3">
            <FiHeadphones size={32} color="white" />
          </div>
          <h2 className="text-xl font-medium text-[#7d4464]">Need help?</h2>
          <p className="text-sm text-center text-gray-600 mt-1">
            Submit your request below and our support team will get back to you
            as soon as possible.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Issue Type Dropdown */}
          <div className="mb-4">
            <select
              {...register("issueType", { required: "Issue type is required" })}
              className="w-full p-3 border bg-white border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#7d4464]"
            >
              <option value="">Select Issue Type</option>
              {issueTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {errors.issueType && (
              <p className="text-red-500 text-sm mt-1">
                {errors.issueType.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="mb-4">
            <textarea
              placeholder="Describe your issue..."
              {...register("description", {
                required: "Description is required",
              })}
              className="w-full h-32 p-3 bg-white border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-1 focus:ring-[#7d4464]"
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* File Attachment */}
          <div className="mb-6">
            <div className="flex items-center justify-between px-2 mb-2">
              <div className="flex items-center">
                <label
                  htmlFor="file-upload"
                  className="flex items-center cursor-pointer"
                >
                  <span className="text-gray-500 mr-2">
                    <FiPaperclip size={18} />
                  </span>
                  <span className="text-sm text-gray-500">Add Attachment</span>
                </label>
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                />
              </div>
              {attachmentAdded && (
                <div className="bg-green-500 rounded-full p-1">
                  <FiCheck className="text-white" size={14} />
                </div>
              )}
            </div>

            {/* Selected File Display */}
            {selectedFile && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700 truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={removeAttachment}
                  className="ml-2 p-1 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <FiX size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Error Messages */}
          {uploadError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{uploadError}</p>
            </div>
          )}

          {submitError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{submitError}</p>
            </div>
          )}

          {/* Upload Progress */}
          {uploading && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-700 text-sm">Uploading attachment...</p>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex space-x-4">
            <Link href="/" className="flex-1">
              <button
                type="button"
                className="cursor-pointer w-full py-2 border border-[#7d4464] text-[#7d4464] rounded-full font-medium hover:bg-gray-50 transition-colors"
                disabled={isSubmitting || uploading}
              >
                Cancel
              </button>
            </Link>
            <button
              type="submit"
              className="cursor-pointer flex-1 py-2 bg-primary text-white rounded-full font-medium hover:bg-primary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              disabled={isSubmitting || uploading}
            >
              {isSubmitting
                ? "Submitting..."
                : uploading
                ? "Uploading..."
                : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Support;
