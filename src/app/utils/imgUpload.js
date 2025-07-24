import { useState, useCallback } from 'react';
import axiosInstance from './axios';

const DEFAULT_CONFIG = {
  baseUrl: process.env.NEXT_IMAGE_URL || "https://tt4eu2pm56.eu-central-1.awsapprunner.com",
  endpoint: '/api/upload',
  fieldName: 'files',
  headers: {
    'content-type': 'multipart/form-data',
  },
  timeout: 30000,
};

const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const maxSize = 5 * 1024 * 1024; // 5MB

const useImageUploader = () => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);

  const validateFiles = useCallback((files) => {
    const fileArray = files instanceof FileList ? Array.from(files) :
      Array.isArray(files) ? files : [files];

    const errors = [];

    fileArray.forEach((file, index) => {
      if (!(file instanceof File) && !(file instanceof Blob)) {
        errors.push(`File ${index + 1}: Not a valid file object`);
        return;
      }

      if (!allowedTypes.includes(file.type)) {
        errors.push(`File ${index + 1} (${file.name}): Unsupported file type`);
      }

      if (file.size > maxSize) {
        errors.push(`File ${index + 1} (${file.name}): File size exceeds 5MB limit`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  }, []);

  const uploadFiles = useCallback(async (files, options = {}) => {
    setUploading(true);
    setError(null);
    const { config = {}, onProgress } = options;
    const mergedConfig = { ...DEFAULT_CONFIG, ...config };

    let fileArray;
    if (files instanceof FileList) {
      fileArray = Array.from(files);
    } else if (Array.isArray(files)) {
      fileArray = files;
    } else if (files instanceof File || files instanceof Blob) {
      fileArray = [files];
    } else {
      setError('Invalid input: expected File, FileList, or array of Files');
      setUploading(false);
      return;
    }

    // Validate files before upload
    const validation = validateFiles(fileArray);
    if (!validation.isValid) {
      setError(validation.errors.join(', '));
      setUploading(false);
      return;
    }

    try {
      // Create single FormData with all files
      const formData = new FormData();
      fileArray.forEach((file) => {
        formData.append('files', file);
      });

      // Single API call for all files
      const response = await axiosInstance.post(
        `${mergedConfig.baseUrl}${mergedConfig.endpoint}`,
        formData,
        { headers: mergedConfig.headers, timeout: mergedConfig.timeout }
      );

      const uploadedFiles = response?.data?.files || [];
      if (uploadedFiles.length === 0) {
        throw new Error('No files returned from server');
      }

      const result = {
        success: true,
        urls: uploadedFiles.map(file => file.fileUrl),
        data: response.data
      };

      setResults([result]);
      onProgress && onProgress(fileArray.length, fileArray.length);
      return [result];
    } catch (err) {
      const error = {
        success: false,
        error: err.response?.data?.message || err.message || 'Upload failed',
        data: err.response?.data,
      };
      setError(error.error);
      return [error];
    } finally {
      setUploading(false);
    }
  }, [validateFiles]);

  return {
    uploadFiles,
    uploading,
    error,
    results,
    validateFiles,
  };
};

export default useImageUploader;
