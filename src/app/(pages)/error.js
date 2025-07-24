'use client';

import { useEffect } from 'react';
import toast from 'react-hot-toast';

export default function Error({
  error,
  reset,
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
    // Show error toast
    toast.error('Something went wrong');
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-4">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        Something went wrong!
      </h2>
      <button
        onClick={reset}
        className="cursor-pointer px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary_hover transition-colors"
      >
        Try again
      </button>
    </div>
  );
} 