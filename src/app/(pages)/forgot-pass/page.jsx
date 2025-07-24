import React from "react";
import Auth from "../../components/Auth/Auth";
import { forgotPasswordFields } from "../../components/Auth/formConfig";

const ForgotPasswordPage = () => {
  return (
    <Auth 
      title="Forgot Password"
      subtitle="Enter your email address and we'll send you a link to reset your password"
      footerText="Remember your password?"
      footerLinkText="Back to sign in"
      footerLinkHref="/signin"
      formFields={forgotPasswordFields}
      submitButtonText="Send reset code"
      customErrorMessages={{
        "Email not found": "We couldn't find an account with that email address.",
        "Too many attempts": "Too many password reset attempts. Please try again later.",
        // Add more custom messages as needed
      }}
    />
  );
};

export default ForgotPasswordPage;
