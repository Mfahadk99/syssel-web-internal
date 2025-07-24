"use client";
import React, { Suspense } from "react";
import Auth from "@/app/components/Auth/Auth";
import { useSearchParams } from "next/navigation";
import { confirmCodeFields } from "@/app/components/Auth/formConfig";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const page = () => {
  return (
    <Suspense fallback={<Skeleton height={400} count={1} />}>
      <ConfirmEmail />
    </Suspense>
  );
};

const ConfirmEmail = () => {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const customErrorMessages = {
    invalid_code: "The verification code is invalid. Please try again.",
    code_expired:
      "Your verification code has expired. Please request a new one.",
    already_verified: "This email is already verified.",
    verification_failed: "Verification failed. Please try again.",
  };

  return (
    <Auth
      title="Verify Your Email"
      subtitle={
        email
          ? `We've sent a verification code to ${email}`
          : "Enter the 4-digit code we sent to your email"
      }
      formFields={confirmCodeFields}
      submitButtonText="Verify Email"
      footerText="Didn't receive a code?"
      footerLinkText="Resend code"
      customErrorMessages={customErrorMessages}
    />
  );
};

export default page;
