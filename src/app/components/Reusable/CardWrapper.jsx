"use client";
import Link from "next/link";
import useNavigation from "@/app/hooks/useNavigation";

/**
 * A flexible wrapper component for cards that adds navigation functionality
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @param {Object} props.item - Data item to pass to navigation
 * @param {string} props.url - Fallback URL if no navigation is configured
 * @param {Object} props.navigationOptions - Options to pass to useNavigation
 * @param {string} props.className - Additional classes for the Link
 * @param {boolean} props.disabled - Whether navigation is disabled
 */
export default function CardWrapper({
  children,
  item,
  url = "#",
  navigationOptions = {},
  className = "block",
  disabled = false,
  ...otherProps
}) {
  const navigate = useNavigation(navigationOptions);
  
  const handleClick = (e) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    
    if (item) {
      e.preventDefault();
      navigate(item, e);
    }
  };

  return (
    <Link 
      href={url} 
      onClick={handleClick} 
      className={className}
      {...otherProps}
    >
      {children}
    </Link>
  );
}