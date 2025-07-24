import React from "react";
import Auth from "../../components/Auth/Auth";
import { signInFields } from "../../components/Auth/formConfig";

const SigninPage = () => {
  return (
    <Auth 
      title="Sign in to your account"
      showSocial={true}
      footerText="Don't have an account?"
      footerLinkText="Sign up"
      footerLinkHref="/signup"
      formFields={signInFields}
      submitButtonText="Sign in"
      customErrorMessages={{
        "Invalid credentials": "The email or password you entered is incorrect. Please try again.",
        "Account not verified": "Please verify your email address before signing in.",
        // Add more custom messages as needed
      }}
      forgotPasswordText="Forgot password?"
      forgotPasswordHref="/forgot-pass"
    />
  );
};

export default SigninPage;
