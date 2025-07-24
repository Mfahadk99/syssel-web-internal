"use client";
import { useRouter } from "next/navigation";

/**
 * Hook to handle navigation to different entity profiles
 * @param {Object} options - Configuration options
 * @param {string} options.routePrefix - Route prefix for navigation (default: '/provider-profile')
 * @param {string[]} options.idFields - Fields to check for ID in priority order (default: ['_id', 'id'])
 * @param {string} options.defaultId - Default ID if no ID is found (default: 'default')
 * @param {Object} options.additionalParams - Additional params to add to URL
 * @param {boolean} options.usePathRouting - Use path-based routing instead of query params (default: true)
 * @returns {Function} navigate - Function to navigate to entity profile
 */
export default function useNavigation({
  routePrefix = "/provider-profile",
  idFields = ["service", "providerId", "serviceId", "missionId", "voucherId", "_id"],
  defaultId = "default",
  additionalParams = {},
  usePathRouting = true,
} = {}) {
  const router = useRouter();

  const navigate = (item, e) => {
    if (e) e.preventDefault();

    // Find the first available ID from provided fields
    const id = idFields.reduce((foundId, field) => foundId || (item && item[field]), null) || defaultId;

    if (usePathRouting) {
      // Path-based routing: /provider-profile/id
      const basePath = `${routePrefix}/${id}`;

      // If there are additional params, add them as query string
      const queryParams = new URLSearchParams(additionalParams).toString();
      const finalPath = queryParams ? `${basePath}?${queryParams}` : basePath;

      router.push(finalPath);
    } else {
      // Query-based routing: /provider-profile?id=...
      const queryParams = new URLSearchParams({
        id,
        ...additionalParams,
      }).toString();

      router.push(`${routePrefix}?${queryParams}`);
    }
  };

  return navigate;
}
