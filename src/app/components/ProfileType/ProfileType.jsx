"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SlidingButtons from "../Reusable/SlidingButtons";
import { useRouter } from "next/navigation";
import useAuthStore from "@/app/store/useAuthStore";

const ProfileTypeSelector = () => {
  const [selectedType, setSelectedType] = useState("buyer");
  const router = useRouter();
  const buttons = [
    { id: "buyer", label: "Buyer" },
    { id: "provider", label: "Provider" },
  ];

  const { user } = useAuthStore();

  // Move navigation logic to useEffect
  useEffect(() => {
    if (user && user.isProfileSetup) {
      router.push("/discover");
    }
  }, [user, router]);

  const contentVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
  };

  const listItemVariants = {
    initial: { opacity: 0, x: -10 },
    animate: (custom) => ({
      opacity: 1,
      x: 0,
      transition: { delay: 0.1 + custom * 0.08 },
    }),
  };

  return (
    <motion.div
      className="flex flex-col items-center w-full max-w-full mx-auto px-4 py-6 sm:p-8 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="w-full max-w-xl flex flex-col items-center h-full">
        <div className="w-full flex flex-col items-center">
          <motion.h2
            className="text-3xl sm:text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#7F4665] to-[#3D2030]"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            I am a...
          </motion.h2>

          {/* Toggle Switch - Replaced with SlidingButtons */}
          <motion.div
            className="w-full max-w-xs mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <SlidingButtons
              buttons={buttons}
              activeButton={selectedType}
              setActiveButton={setSelectedType}
              className="w-full h-14 bg-gray-100"
              buttonClassName="flex-1 h-full px-10"
              activeButtonClassName="text-white"
              inactiveButtonClassName="text-gray-500 hover:text-gray-700"
            />
          </motion.div>
        </div>

        {/* Content Section */}
        <div className="w-full flex-grow flex items-center justify-center px-4">
          <AnimatePresence mode="wait">
            {selectedType === "buyer" ? (
              <motion.div
                key="buyer-content"
                className="w-full max-w-md"
                variants={contentVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <h3 className="text-2xl font-bold text-[#7F4665] mb-3 text-center">
                  Buyer
                </h3>
                <p className="text-gray-600 mb-6 text-center">
                  Looking for services to help with your needs
                </p>

                <div className="bg-[#D4B0C3]/20 rounded-xl p-6 shadow-sm border border-[#D4B0C3]/30">
                  <h4 className="text-lg font-semibold text-[#3D2030] mb-4">
                    What you can do:
                  </h4>
                  <ul className="space-y-4">
                    {[
                      "Browse services",
                      "Hire providers",
                      "Submit reviews",
                    ].map((item, index) => (
                      <motion.li
                        key={index}
                        className="flex items-center"
                        variants={listItemVariants}
                        initial="initial"
                        animate="animate"
                        custom={index}
                      >
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#D4B0C3]/30 mr-3 flex-shrink-0">
                          <svg
                            className="w-5 h-5 text-[#7F4665]"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </span>
                        <span className="text-[#3D2030]">{item}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="provider-content"
                className="w-full max-w-md"
                variants={contentVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <h3 className="text-2xl font-bold text-[#7F4665] mb-3 text-center">
                  Provider
                </h3>
                <p className="text-gray-600 mb-6 text-center">
                  Offering your services to potential clients
                </p>

                <div className="bg-[#D4B0C3]/20 rounded-xl p-6 shadow-sm border border-[#D4B0C3]/30">
                  <h4 className="text-lg font-semibold text-[#3D2030] mb-4">
                    What you can do:
                  </h4>
                  <ul className="space-y-4">
                    {[
                      "List your services",
                      "Connect with clients",
                      "Receive payments",
                    ].map((item, index) => (
                      <motion.li
                        key={index}
                        className="flex items-center"
                        variants={listItemVariants}
                        initial="initial"
                        animate="animate"
                        custom={index}
                      >
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#D4B0C3]/30 mr-3 flex-shrink-0">
                          <svg
                            className="w-5 h-5 text-[#7F4665]"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </span>
                        <span className="text-[#3D2030]">{item}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.button
          className="cursor-pointer w-full max-w-xs px-10 py-4 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group mt-8 bg-primary"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          // transition={{ delay: 0.3 }}
        >
          <motion.span
            className="absolute inset-0 w-full h-full opacity-0 group-hover:opacity-100 bg-primary"
            initial={{ x: "100%", opacity: 0 }}
            whileHover={{ x: 0, opacity: 1 }}
            transition={{ type: "tween", duration: 0.2 }}
          />
          <span
            className="relative z-10"
            onClick={() => {
              if (selectedType === "buyer") {
                router.push("/buyer-signup");
              } else {
                router.push("/provider-signup");
              }
            }}
          >
            Continue as {selectedType === "buyer" ? "Buyer" : "Provider"}
          </span>
        </motion.button>
      </div>
    </motion.div>
  );
};

export default ProfileTypeSelector;
