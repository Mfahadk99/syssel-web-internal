import { useState } from "react";
import Image from "next/image";
import DummyProfileImage from "../../../../public/DummyProfileImage.png";

export default function Reviews({
  averageRating = "0",
  reviews = [],
  title = "Average Ratings",
  profile,
}) {
  // Filter to extract rating from reviews
  const ratings = reviews.map((review) => review.rating);

  // Count occurrences of each rating
  const ratingCounts = ratings.reduce((acc, rating) => {
    acc[rating] = (acc[rating] || 0) + 1;
    return acc;
  }, {});

  const getBarWidth = (rating) => {
    const widths = {
      5: (ratingCounts[5] * 100) / reviews.length || 0,
      4: (ratingCounts[4] * 100) / reviews.length || 0,
      3: (ratingCounts[3] * 100) / reviews.length || 0,
      2: (ratingCounts[2] * 100) / reviews.length || 0,
      1: (ratingCounts[1] * 100) / reviews.length || 0,
    };
    return widths[rating];
  };

  return (
    <div className="max-w-4xl mx-auto font-sans p-6">
      <h1 className="text-3xl font-bold text-[var(--color-secondary)] mb-6">
        {title}
      </h1>

      <div className="flex flex-row justify-between items-center mb-12">
        {/* Rating Bars - Left Side */}
        <div className="w-2/3 pr-8">
          {[5, 4, 3, 2, 1].map((rating) => (
            <div key={rating} className="flex items-center mb-3">
              <span className="w-16 text-[var(--color-secondary)]">
                {rating} rating
              </span>
              <div className="flex-1 h-4 bg-[var(--color-secondary)]/10 rounded-sm ml-2 overflow-hidden">
                <div
                  className="h-full bg-[var(--color-primary)] rounded-sm"
                  style={{ width: `${getBarWidth(rating)}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        {/* Average Rating Circle - Right Side */}
        <div className="w-1/3 flex justify-center items-center">
          <div className="w-32 h-32 rounded-full border-8 border-[var(--color-primary)] flex items-center justify-center">
            <div className="text-[var(--color-secondary)] text-4xl font-bold">
              {averageRating}
            </div>
          </div>
        </div>
      </div>

      {/* Review Cards Section */}
      {/* <div className="space-y-6">
        {reviews.map((review, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
          >
            <div className="flex items-center gap-4 mb-4">
              <Image
                  src={review.avatar || DummyProfileImage}
                  alt={review.provider.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <h3 className="font-semibold text-[var(--color-secondary)]">
                  {review.provider.name}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-[var(--color-primary)] font-medium">
                    {review.rating}
                  </span>
                  <span className="text-sm text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <p className="text-[var(--color-secondary)] mb-2">
              {review.review}
            </p>
            <div className="text-sm text-gray-500">{review.projectType}</div>
          </div>
        ))}
      </div> */}

      {/* New Review Cards Section */}
      <div className="max-w-4xl mx-auto">
        {reviews?.length > 0 && (
          <h2 className="text-3xl font-bold text-[var(--color-primary)] mb-4">
            Top Reviews
          </h2>
        )}

        {/* Container with padding to account for the avatar overflow */}
        <div className="space-y-8">
          {reviews?.map((review, index) => (
            <div key={index} className="relative pl-6 pt-8">
              {/* Main card */}
              <div className="bg-white rounded-2xl p-5 shadow-md border border-[var(--color-primary)]/10">
                {/* Header with name and rating */}
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-bold text-[var(--color-primary)] text-lg">
                    {profile?.profileType === "provider"
                      ? review.buyer?.name
                      : review.provider?.name}
                  </h3>
                  <div className="flex items-center">
                    <span className="text-[var(--color-primary)] font-medium">
                      {review.rating}
                    </span>
                  </div>
                </div>

                {/* Project type and date */}
                <div className="text-[var(--color-secondary)] text-sm mb-2">
                  {review.projectType} |{" "}
                  {new Date(review.createdAt).toLocaleDateString()}
                </div>

                {/* Review content */}
                <p className="text-[var(--color-secondary)]">{review.review}</p>
              </div>

              {/* Profile Picture - positioned at top left */}
              <div className="absolute -top-2 -left-2">
                <Image
                  src={
                    profile?.profileType === "provider"
                      ? review.buyer?.image || DummyProfileImage
                      : review.provider?.image || DummyProfileImage
                  }
                  alt={`${review.provider.name} avatar`}
                  className="w-16 h-16 rounded-full border-4 border-[var(--color-primary)] shadow-md"
                  width={64}
                  height={64}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
