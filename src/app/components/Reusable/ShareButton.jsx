"use client";

import React, { useEffect, useState } from "react";
import { Share2 } from "lucide-react";

const ShareButton = ({
  title = "Share this profile",
  text = "Check out this amazing profile!",
  url,
  className = "",
  showText = true,
  children,
}) => {
  const [currentUrl, setCurrentUrl] = useState("");
  
  useEffect(() => {
    setCurrentUrl(url || window.location.href);
  }, [url]);

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title,
          text: `${text}\n\n${currentUrl}`,
          url: currentUrl,
        });
      } else {
        await navigator.clipboard.writeText(`${title}\n${text}\n\n${currentUrl}`);
        alert("Link and message copied to clipboard!");
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  return (
    <button onClick={handleShare} className={className}>
      {children || (
        <>
          <Share2 className={`w-5 h-5 ${showText ? "mr-2" : ""}`} />
          {showText && "Share"}
        </>
      )}
    </button>
  );
};

export default ShareButton;
