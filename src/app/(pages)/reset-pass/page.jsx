'use client'
import React from 'react'
import Auth from "@/app/components/Auth/Auth";
import { resetPasswordFields } from "@/app/components/Auth/formConfig";

const ResetPasswordPage = () => {
  return (
    <Auth 
      title="Reset Your Password"
      subtitle="Enter your email and new password"
      formFields={resetPasswordFields}
      submitButtonText="Reset Password"
      footerText="Remember your password?"
      footerLinkText="Back to sign in"
      footerLinkHref="/signin"
      customErrorMessages={{
        "Invalid email": "Please enter a valid email address.",
        "Password too weak": "Password must be at least 6 characters and include uppercase, lowercase, and numbers.",
        "Passwords do not match": "The passwords you entered do not match.",
        // Add more custom messages as needed
      }}
    />
  );
};

export default ResetPasswordPage;