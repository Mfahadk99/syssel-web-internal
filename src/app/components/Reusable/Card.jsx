"use client";
import React from "react";
import { useState } from "react";
import Image from "next/image";
import Ratings from "./Ratings";
import { MapPin, UserRoundPlus, UserRoundCheck } from "lucide-react";
import {
  FaMapMarkerAlt,
  FaStar,
  FaStarHalfAlt,
  FaHeart,
  FaRegHeart,
  FaClock,
} from "react-icons/fa";
import { HiBadgeCheck } from "react-icons/hi";
import CardWrapper from "./CardWrapper";
import useFavourite from "@/app/store/useFavourite";
import { useRouter } from "next/navigation";
import useAuthStore from "@/app/store/useAuthStore";
import { useFollow, useUnfollow } from "@/app/hooks/useFollow";

export const ReusableCard = ({ item, routePrefix, followings }) => {
  // Destructure item properties with fallback values
  const {
    _id = "",
    name = "",
    avatar = "",
    rating = 0,
    distance = 0,
    bids = 0,
    missionName = "",
    missionAdvertiser = "",
    isVerified,
  } = item || {};

  const { user } = useAuthStore();
  const { currentProfile } = useAuthStore();
  const userId = user?.id;
  let isMission = false;

  if (item?.missionName) {
    console.log("misionCard");
    isMission = true;
  }

  const followedProviders = followings || [];
  const providerId = _id;

  // Check if this provider is followed
  const isFollowed = followedProviders.includes(providerId);

  // Follow/unfollow hooks
  const followMutation = useFollow();
  const unfollowMutation = useUnfollow();

  // Handle follow/unfollow click
  const handleFollowClick = async (e) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      if (isFollowed) {
        await unfollowMutation.mutateAsync({ providerId, userId });
        setIsFollowing(false);
      } else {
        await followMutation.mutateAsync({ providerId, userId });
        setIsFollowing(true);
      }
      // Optionally, you can refetch the followed providers list here
      // refetch();
    } catch (error) {
      console.error("Error following/unfollowing:", error);
      // Optionally, revert the local state if the mutation fails
      setIsFollowing(!isFollowing);
    }
  };

  // Format distance to show in meters or kilometers
  const formatDistance = (meters) => {
    return meters < 1000 ? `${meters}m` : `${(meters / 1000).toFixed(1)}km`;
  };

  const [isFollowing, setIsFollowing] = useState(isFollowed);

  return (
    <CardWrapper item={item} navigationOptions={{ routePrefix: routePrefix }}>
      <div className="rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 bg-white group">
        {/* Card container */}
        <div className="w-full aspect-square relative overflow-hidden group">
          {/* Image container */}
          <div className="w-full h-full relative">
            {avatar && avatar.trim() !== "" && (
              <Image
                src={avatar}
                alt={name}
                fill
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
            )}

            {/* Content overlay - using a full overlay with flex to position elements */}
            <div className="flex flex-col w-full h-full">
              {/* Dark overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>

              {/* Top row with badges */}
              <div className="w-full flex relative justify-between p-2 z-10">
                {/* Follow/Unfollow icon */}
                {isMission === false && (
                  <button
                    onClick={handleFollowClick}
                    className="absolute top-2 left-2 bg-white rounded-full p-1 w-7 h-7 flex items-center justify-center shadow-sm"
                    aria-label={isFollowing ? "Unfollow" : "Follow"}
                  >
                    {isFollowing ? (
                      <UserRoundCheck className="w-5 h-5 text-black pl-0.5 font-black" />
                    ) : (
                      <UserRoundPlus className="w-5 h-5 text-black pl-0.5 font-black" />
                    )}
                  </button>
                )}

                {/* Rating badge with shadow */}
                {rating
                  ? rating > 0 && (
                      <div className=" absolute top-2 right-2 bg-white rounded-full px-1 w-7 h-7 justify-center text-sm font-semibold flex items-center shadow-sm">
                        <span>{rating.toFixed(1)}</span>
                      </div>
                    )
                  : bids > 0 && (
                      <div className="bg-primary text-white rounded-full px-3 py-1 text-sm font-semibold flex items-center shadow-sm">
                        <span>Bids: {bids}</span>
                      </div>
                    )}
              </div>

              {/* Bottom info section - using margin-top:auto to push to bottom */}
              <div className="flex flex-col w-full mt-auto p-3 text-white z-10">
                <div className="flex items-center gap-1">
                  <h3 className="font-semibold text-sm sm:text-base truncate drop-shadow-sm">
                    {name ? name : missionName}
                  </h3>
                  {isVerified && (
                    <HiBadgeCheck className="w-5 h-5 text-white drop-shadow-sm" />
                  )}
                </div>

                {/* Advertiser name - only show if available */}
                <div className="flex justify-between items-center text-xs space-x-1 mt-1">
                  {missionAdvertiser && (
                    <div className="text-sm text-white/90 drop-shadow-sm">
                      {missionAdvertiser}
                    </div>
                  )}
                  <div className="flex items-center gap-1 drop-shadow-sm">
                    <FaMapMarkerAlt className="w-4 h-4" />
                    <span>{formatDistance(distance)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CardWrapper>
  );
};

export const ServicesCard = ({ item, routePrefix }) => {
  const { handleFavorite, isFavorite } = useFavourite();

  // Destructure item properties with fallback values
  const {
    provider,
    _id = "", // Make sure to include _id from the item
    name = "",
    price = "42",
    avatar = "",
    distance = 0,
    currency = "kr",
    isVerified,
  } = item || {};

  // Format distance
  const formatDistance = (meters) => {
    return meters < 1000 ? `${meters}m` : `${(meters / 1000).toFixed(1)}km`;
  };

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleFavorite(_id);
  };

  return (
    <CardWrapper
      item={item}
      navigationOptions={{
        routePrefix: routePrefix,
        additionalParams: {
          provider: provider,
        },
      }}
    >
      <div className="relative rounded-lg overflow-hidden shadow-md group transition-all duration-300 hover:shadow-lg">
        {/* Card image with overlay */}
        <div className="relative aspect-square w-full">
          {avatar && avatar.trim() !== "" && (
            <Image
              src={avatar}
              alt={name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          )}

          {/* Dark overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>

          {/* Price badge */}
          <div className="absolute top-2 right-2 bg-background rounded-full px-3 py-1 text-sm font-semibold">
            {price ? `${price} ${currency}` : "Request Price"}
          </div>

          {/* Heart/Favorite icon */}
          <div className="absolute top-2 left-2">
            <div
              className="bg-background rounded-full p-1.5 cursor-pointer hover:bg-white"
              onClick={handleFavoriteClick}
            >
              {isFavorite(_id) ? (
                <FaHeart className="w-5 h-5 text-red-500" />
              ) : (
                <FaRegHeart className="w-5 h-5 text-gray-600" />
              )}
            </div>
          </div>

          {/* Information at bottom */}
          <div className="absolute bottom-0 left-0 w-full p-3 text-white">
            <div className="font-semibold text-sm sm:text-base truncate">
              <h3 className="flex items-center gap-1">
                {name}
                {isVerified && <HiBadgeCheck className="w-5 h-5 text-white" />}
              </h3>
            </div>
            <div className="flex items-center text-sm space-x-1 mt-1">
              <FaMapMarkerAlt className="w-4 h-4" />
              <span>{formatDistance(distance)}</span>
            </div>
          </div>
        </div>
      </div>
    </CardWrapper>
  );
};

export const SalesCard = ({ item, routePrefix }) => {
  const { handleFavorite, isFavorite } = useFavourite();

  // Destructure item properties with fallback values
  const {
    _id = "",
    name = "",
    providerId,
    avatar = "",
    discountPercent = "",
    timeRemaining = "",
    location = "",
    distance = 0,
  } = item || {};

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleFavorite(_id);
  };

  return (
    <CardWrapper
      item={{ _id }}
      navigationOptions={{
        routePrefix: routePrefix,
        additionalParams: { provider: providerId },
      }}
    >
      <div className="relative rounded-lg overflow-hidden shadow-md group transition-all duration-300 hover:shadow-lg">
        {/* Card image with overlay */}
        <div className="relative aspect-square w-full">
          {avatar && avatar.trim() !== "" && (
            <Image
              src={avatar}
              alt={name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          )}

          {/* Dark overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>

          {/* Discount badge */}
          {discountPercent && (
            <div className="absolute top-4 right-4 bg-primary text-white rounded-full px-4 py-1.5 text-sm font-semibold">
              {discountPercent}% Discount
            </div>
          )}

          {/* Heart/Favorite icon */}
          <div className="absolute top-4 left-4">
            <div
              className="bg-background rounded-full p-1.5 cursor-pointer hover:bg-white"
              onClick={handleFavoriteClick}
            >
              {isFavorite(_id) ? (
                <FaHeart className="w-5 h-5 text-red-500" />
              ) : (
                <FaRegHeart className="w-5 h-5 text-gray-600" />
              )}
            </div>
          </div>

          {/* Timer countdown */}
          <div className="absolute bottom-28 left-0 right-0 flex justify-center">
            <div className="bg-black/50 text-white rounded-full px-4 py-1 flex items-center space-x-2">
              <FaClock className="w-5 h-5" />
              <span className="text-md font-medium">{timeRemaining}</span>
            </div>
          </div>

          {/* Information at bottom */}
          <div className="absolute bottom-0 left-0 w-full p-4 text-white">
            <h3 className="font-semibold text-md">{name || "Toning"}</h3>
            <div className="flex items-center text-base space-x-1 mt-1">
              <FaMapMarkerAlt className="w-4 h-4" />
              <span className="text-sm">{location}</span>
              <span className="text-sm ml-auto">• {distance}m</span>
            </div>
          </div>
        </div>
      </div>
    </CardWrapper>
  );
};

export const SalesInfoCard = ({ data, routePrefix }) => {
  const { handleFavorite, isFavorite } = useFavourite();

  // Destructure properties with fallback values
  const {
    _id = "",
    idOfProvider,
    name = "",
    avatar = data?.image,
    description = "",
    provider = "",
    discountPercent,
    originalPrice,
    finalPrice,
    PerHourPrice,
    currency = "kr",
    timeRemaining,
    distance = 0,
  } = data || {};

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleFavorite(_id);
  };

  // Render price display based on available data
  const renderPriceDisplay = () => {
    if (PerHourPrice) {
      // If PerHourPrice is available, show it
      return (
        <div className="flex items-center">
          <span className="font-semibold text-black text-lg">
            {PerHourPrice} {currency} / h
          </span>
        </div>
      );
    } else if (finalPrice && originalPrice) {
      // Case 1: Both prices are available
      return (
        <div className="flex items-center">
          <span className="text-gray-500 line-through text-sm mr-2">
            {originalPrice} {currency}
          </span>
          <span className="font-semibold text-black text-lg">
            {finalPrice} {currency}
          </span>
        </div>
      );
    } else if (finalPrice && !originalPrice) {
      // Case 2: Only finalPrice is available
      return (
        <div className="flex items-center">
          <span className="font-semibold text-black text-lg">
            {finalPrice} {currency}
          </span>
        </div>
      );
    } else {
      // Case 3: Only originalPrice is available or both are not available
      return (
        <button className="cursor-pointer bg-primary hover:bg-primary-hover text-white font-medium py-2 px-4 rounded-full text-sm transition-colors duration-300">
          Request price
        </button>
      );
    }
  };

  return (
    <CardWrapper
      item={data}
      navigationOptions={{
        routePrefix: routePrefix,
        additionalParams: {
          provider: idOfProvider,
        },
      }}
    >
      <div className="flex h-36 bg-white rounded-lg shadow overflow-hidden">
        {/* Image container */}
        <div className="relative h-36 w-52 flex-shrink-0">
          {avatar && avatar.trim() !== "" && (
            <Image
              src={avatar}
              alt={name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 96px, 176px"
            />
          )}

          {/* Heart/favorite button */}
          <button
            onClick={handleFavoriteClick}
            className="absolute top-2 left-2 bg-white rounded-full p-1.5 w-8 h-8 flex items-center justify-center"
          >
            {isFavorite(_id) ? (
              <FaHeart className="w-5 h-5 text-red-500" />
            ) : (
              <FaRegHeart className="w-5 h-5 text-gray-600" />
            )}
          </button>

          {/* Timer countdown */}
          {timeRemaining && (
            <div className="absolute bottom-1 left-14 bg-black/70 text-white rounded-full px-3 py-1 flex items-center">
              <FaClock className="w-3 h-3 mr-1.5" />
              <span className="text-md font-medium">{timeRemaining}</span>
            </div>
          )}
        </div>

        {/* Content container */}
        <div className="p-4 flex-grow relative">
          {/* Discount badge */}
          {discountPercent && (
            <div className="absolute top-2 right-2 bg-primary text-white rounded-full px-3 py-1 text-sm font-medium">
              - {discountPercent}%
            </div>
          )}

          <div className="flex flex-col h-full">
            {/* Service name */}
            <h3 className="text-xl font-semibold text-gray-800">{name}</h3>

            {/* Provider name */}
            <p className="text-sm text-gray-600 mt-0.5">{provider}</p>

            {/* Service description */}
            <p className="text-sm text-gray-500 mt-1">{description}</p>

            {/* Distance and price */}
            <div className="flex items-center mt-auto justify-between">
              <div className="flex items-center text-sm text-gray-700">
                <FaMapMarkerAlt className="mr-1 text-gray-500" />
                <span>{distance} meters</span>
              </div>

              {renderPriceDisplay()}
            </div>
          </div>
        </div>
      </div>
    </CardWrapper>
  );
};

export const ReusableInfoCard = ({ item }) => {
  // Destructure item properties with fallback values
  const {
    name = "",
    avatar = null,
    rating = 0,
    distance = 0,
    bids = 0,
    missionName = "",
    missionAdvertiser = "",
    isVerified,
    verified = false,
    description = "",
  } = item || {};

  // Format distance to show in meters or kilometers
  const formatDistance = (meters) => {
    return meters < 1000 ? `${meters}m` : `${(meters / 1000).toFixed(1)}km`;
  };

  // Generate star display based on rating
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.3;

    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={`star-${i}`} className="text-yellow-400" />);
    }

    // Add half star if applicable
    if (hasHalfStar) {
      stars.push(<FaStarHalfAlt key="half-star" className="text-yellow-400" />);
    }

    return stars;
  };

  return (
    <CardWrapper item={item}>
      <div className="flex h-36 bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300">
        {/* Logo/Image container - Modified to touch top and bottom */}
        <div className="relative h-36 w-44 flex-shrink-0 bg-blue-900 rounded-2xl">
          {avatar && avatar.trim() !== "" ? (
            <Image
              src={avatar}
              alt={name}
              fill
              className="object-cover rounded-2xl"
              sizes="96px"
            />
          ) : null}
        </div>

        {/* Content container */}
        <div className="p-4 flex-grow">
          {/* Business name and rating */}
          <div className="flex flex-col h-full">
            <div className="flex items-center gap-1">
              <h3 className="text-lg font-semibold text-gray-800">
                {name ? name : missionName}
              </h3>
              {isVerified ||
                (verified && <HiBadgeCheck className="w-5 h-5 text-primary" />)}
            </div>

            {/* Rating display */}
            <div className="flex items-center mt-1">
              {rating ? (
                <>
                  <span className="text-gray-700 font-medium mr-1">
                    {rating.toFixed(1)}
                  </span>
                  <div className="flex">{renderStars(rating)}</div>
                </>
              ) : bids ? (
                <div className="text-primary text-sm font-semibold">
                  Bids: {bids}
                </div>
              ) : null}
            </div>

            {/* Advertiser name - only show if available */}
            {missionAdvertiser && (
              <div className="text-sm text-gray-600 mt-1">
                {missionAdvertiser}
              </div>
            )}

            {/* Description */}
            {description && (
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                {description}
              </p>
            )}

            {/* Distance */}
            <div className="flex items-center mt-auto text-sm text-gray-700">
              <FaMapMarkerAlt className="mr-1" />
              <span>{formatDistance(distance)}</span>
            </div>
          </div>
        </div>
      </div>
    </CardWrapper>
  );
};

export const ConsultationCard = ({ item, isExpanded = false }) => {
  const router = useRouter();
  const {
    provider,
    serviceId,
    voucherId,
    imageUrl,
    images,
    voucherValue,
    title,
    rating,
    description,
    about,
    price,
    currency = "kr",
  } = item || {};

  // Use description if available, otherwise fall back to about
  const displayText = description ?? about ?? "";
  const displayVoucherValue = voucherValue
    ? `${voucherValue}% off`
    : `${price} ${currency}`;
  const displayImage = imageUrl ?? images?.[0] ?? "";

  const handleClick = () => {
    // Check if the item is a voucher by looking for voucher-specific properties
    const isVoucher = item.voucherValue || item.voucherNumber;
    const route = isVoucher ? "/voucher-view" : "/service-info";
    router.push(`${route}/${serviceId || voucherId}?provider=${provider}`);
  };

  return (
    <div
      onClick={handleClick}
      className={`
          cursor-pointer bg-white rounded-2xl shadow-sm hover:shadow-md overflow-hidden transition-all duration-300
          ${
            isExpanded
              ? "flex h-32 w-full hover:shadow-md transition-all duration-300"
              : "w-[250px] h-[280px]"
          }
        `}
    >
      {/* Image Section */}
      <div
        className={`
            relative
            ${isExpanded ? "h-full w-44 flex-shrink-0" : "w-full h-[140px]"}
          `}
      >
        {displayImage && displayImage.trim() !== "" && (
          <Image
            src={displayImage}
            alt={title}
            fill
            className={`
                object-cover
                ${isExpanded ? "rounded-l-2xl" : ""}
              `}
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        )}

        {/* Add VOUCHER label when voucherValue exists */}
        {voucherValue && (
          <div className="absolute bottom-0 left-0 right-0 bg-[#e8e8ca] py-1 text-black text-xs font-bold text-center">
            VOUCHER
          </div>
        )}

        <div
          className={`
              bg-white rounded-full px-2 py-0.5 text-black text-xs font-semibold
              absolute top-2 right-2
            `}
        >
          {displayVoucherValue}
        </div>
      </div>

      {/* Content Section */}
      <div
        className={`
            ${
              isExpanded
                ? "p-3 flex flex-col justify-between flex-grow"
                : "p-3 h-[140px]"
            }
          `}
      >
        <div>
          <h3
            className={`
                font-semibold text-gray-800 line-clamp-1
                ${isExpanded ? "text-base" : "text-base mb-1"}
              `}
          >
            {title}
          </h3>

          <div className={`${isExpanded ? "mt-1" : "mb-2"}`}>
            <Ratings
              rating={rating}
              showNumber={true}
              size={isExpanded ? "text-sm" : "text-base"}
            />
          </div>
        </div>

        <p
          className={`
              text-gray-500 text-xs
              ${isExpanded ? "line-clamp-2 mt-1" : "line-clamp-3"}
            `}
        >
          {displayText}
        </p>
      </div>
    </div>
  );
};

export const ServiceInfoCard = ({ data }) => {
  // Destructure service properties with fallback values
  const {
    name = "",
    avatar = null,
    description = "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos. ",
    price = "500",
    currency = "kr",
    distance = 0,
    duration = "30 min",
  } = data || {};

  return (
    <CardWrapper item={data}>
      <div className="flex h-36 bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300">
        {/* Image container */}
        <div className="relative h-36 w-44 flex-shrink-0 rounded-2xl">
          {avatar && avatar.trim() !== "" && (
            <Image
              src={avatar}
              alt={name}
              fill
              className="object-cover rounded-2xl"
              sizes="(max-width: 768px) 96px, 176px"
            />
          )}

          {/* Heart/favorite icon can be added here if needed */}
        </div>

        {/* Content container */}
        <div className="flex h-full p-4 flex-grow">
          <div className="flex flex-col justify-between">
            {/* Service name */}
            <h3 className="text-lg font-semibold text-gray-800">{name}</h3>

            {/* Business name / provider */}
            <p className="text-sm text-gray-600">{description}</p>

            {/* Distance and duration */}
            <div className="flex items-center text-sm text-gray-700">
              <FaMapMarkerAlt className="mr-1" />
              <span>{distance} meters</span>
            </div>
          </div>
          <div className="flex flex-col justify-between ml-auto items-center">
            {duration && (
              <div>
                <div className="flex items-center justify-end text-sm text-gray-700">
                  <FaClock className="mr-1 text-xl" />
                  <span>{duration}</span>
                </div>
              </div>
            )}

            {/* Price display */}
            <div className="flex justify-end">
              <span className="font-semibold text-black">
                {price} {currency}
              </span>
            </div>
          </div>
        </div>
      </div>
    </CardWrapper>
  );
};

export const VoucherCard = ({ data }) => {
  // Destructure item properties with fallback values
  const { name, image, price, rating, description, distance, expiryDate } =
    data || {};

  return (
    <div className="flex h-38 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-primary border-dashed">
      {/* Image container */}
      <div className="relative h-38 w-52 flex-shrink-0">
        {typeof image === "string" && image.trim() !== "" && (
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 96px, 176px"
          />
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-[#e8e8ca] py-1 text-black text-xs font-bold text-center">
          VOUCHER
        </div>
      </div>

      {/* Content container */}
      <div className="p-4 flex-grow relative">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-bold text-gray-800">{name}</h3>
          <div className="bg-[#632d41] text-white text-sm font-semibold px-2 py-0.5 rounded">
            - {price} kr
          </div>
        </div>

        {/* Rating */}
        <div className="mt-1">
          <Ratings rating={rating} showNumber={true} size="text-lg" />
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 mt-1 line-clamp-2 overflow-hidden text-ellipsis">{description}</p>

        {/* Distance and expiry date at bottom */}
        <div className="flex items-center justify-between mt-2 text-sm">
          <div className="flex items-center text-gray-700">
            <FaMapMarkerAlt className="mr-1" />
            <span>{distance} meters</span>
          </div>
          <div className="text-gray-600 text-xs">
            {expiryDate ? expiryDate.split("T")[0] : ""}
          </div>
        </div>
      </div>
    </div>
  );
};

export const OngoingSaleCard = ({ data }) => {
  const {
    title,
    image,
    company,
    newPrice,
    description,
    distance,
    oldPrice,
    discount,
  } = data || {};

  return (
    <div className="flex bg-white rounded-2xl shadow p-5 items-center gap-6 w-full min-h-[140px]">
      {image && image.trim() !== "" && (
        <img
          src={image}
          alt={title}
          className="w-32 h-32 object-cover rounded-xl flex-shrink-0"
        />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-[#43213b]">{title}</h3>
          <span className="bg-[#7c4a6a] text-white text-base font-semibold px-4 py-1 rounded-full">
            - {discount}%
          </span>
        </div>
        <div className="font-bold text-[#43213b] text-base mb-1">{company}</div>
        <div className="text-gray-500 text-[1rem] truncate">{description}</div>
        <div className="flex items-center gap-3 mt-4">
          <span className="flex items-center text-gray-600 text-base">
            <MapPin size={18} className="mr-1" />
            {distance} meters
          </span>
          <span className="ml-auto text-gray-400 text-base line-through">
            {oldPrice} kr
          </span>
          <span className="text-[#43213b] text-lg font-bold ml-2">
            {newPrice} kr
          </span>
        </div>
      </div>
    </div>
  );
};
