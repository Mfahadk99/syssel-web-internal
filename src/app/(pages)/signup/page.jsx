import React from "react";
import Auth from "../../components/Auth/Auth";
import { signUpFields } from "../../components/Auth/formConfig";

const SignupPage = () => {
  return (
    <Auth 
      title="Create your account"
      showSocial={true}
      footerText="Already have an account?"
      footerLinkText="Sign in"
      footerLinkHref="/signin"
      formFields={signUpFields}
      submitButtonText="Create Account"
      customErrorMessages={{
        "User already exists": "Email already in use",
        "Invalid email format": "Please enter a valid email address.",
        "Password too weak": "Password must be at least 8 characters long and include numbers and special characters.",
        // Add more custom messages as needed
      }}
    />
  );
};

export default SignupPage;
