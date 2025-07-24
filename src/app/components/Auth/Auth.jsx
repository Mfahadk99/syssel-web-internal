"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { FaGoogle, FaFacebook } from "react-icons/fa";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import {
  login,
  register,
  googleLogin,
  facebookLogin,
  verifyEmail,
  resendVerificationCode,
  requestResetOtp,
  verifyResetOtp,
  resetPassword,
} from "@/app/utils/authApi";
import useAuthStore from "@/app/store/useAuthStore";
const Auth = ({
  title,
  subtitle,
  formFields = [],
  showSocial = false,
  footerText,
  footerLinkText,
  footerLinkHref,
  submitButtonText = "Submit",
  customErrorMessages = {},
  forgotPasswordText,
  forgotPasswordHref,
}) => {
  const router = useRouter();
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const digitRefs = useRef([]);
  
  // State to track password visibility for each password field
  const [passwordVisibility, setPasswordVisibility] = useState({});

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    setFocus,
  } = useForm();

  const {
    login: authStoreLogin,
    setError: setAuthError,
    setLoading: setAuthLoading,
    createProfileByFilter,
  } = useAuthStore();

  // Initialize password visibility state for password fields
  useEffect(() => {
    const passwordFields = formFields.filter(field => field.type === "password");
    const initialVisibility = {};
    passwordFields.forEach(field => {
      initialVisibility[field.name] = false;
    });
    setPasswordVisibility(initialVisibility);
  }, [formFields]);

  // Toggle password visibility
  const togglePasswordVisibility = (fieldName) => {
    setPasswordVisibility(prev => ({
      ...prev,
      [fieldName]: !prev[fieldName]
    }));
  };

  // For email verification code, initialize refs for the digit inputs
  useEffect(() => {
    // Initialize refs for digit inputs if this is the email verification form
    if (title === "Verify Your Email") {
      digitRefs.current = formFields.map(() => React.createRef());
    }
  }, [title, formFields]);

  // Handle auto-focus for digit inputs
  const handleDigitInput = (e, index) => {
    const value = e.target.value;

    // Only accept numeric input
    if (!/^\d*$/.test(value)) {
      e.preventDefault();
      return;
    }

    // If input is a digit, move to next input
    if (value && index < formFields.length - 1) {
      setFocus(formFields[index + 1].name);
    }
  };

  // Handle backspace for digit inputs
  const handleDigitKeyDown = (e, index) => {
    // If backspace and empty, focus previous input
    if (e.key === "Backspace" && !e.target.value && index > 0) {
      setFocus(formFields[index - 1].name);
    }
  };

  // Convert string patterns to RegExp
  const processValidation = (field) => {
    if (field.validation?.pattern?.value) {
      return {
        ...field,
        validation: {
          ...field.validation,
          pattern: {
            value: new RegExp(field.validation.pattern.value, "i"),
            message: field.validation.pattern.message,
          },
        },
      };
    }
    return field;
  };

  // Add a function to get custom error message
  const getErrorMessage = (error) => {
    const apiMessage = error?.response?.data?.message || error?.response?.data?.msg;

    if (apiMessage && customErrorMessages[apiMessage]) {
      return customErrorMessages[apiMessage];
    }

    if (apiMessage) {
      return apiMessage;
    }

    // Fallback to default messages
    switch (title) {
      case "Sign in to your account":
        return "Sign in failed";
      case "Create your account":
        return "Sign up failed";
      case "Reset your password":
        return "Password reset request failed";
      case "Verify Your Email":
        return "Email verification failed";
      default:
        return "An error occurred";
    }
  };

  // Define mutations for different form types
  const signInMutation = useMutation({
    mutationFn: login,
    onSuccess: async (response) => {
      // Get remember me value
      const rememberMe = watch("remember-me");

      // Call login with remember me flag
      authStoreLogin(
        response?.user,
        {
          accessToken: response?.accessToken,
          refreshToken: response?.refreshToken,
        },
        rememberMe
      );

      if (response?.user?.isProfileSetup) {
        const profile = await createProfileByFilter(response?.user);
        console.log(profile, "profileeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee");
        const profileType = profile?.profileType;
        if (profileType === "buyer") {
          router.push("/");
        } else {
          router.push("/missions");
        }
      } else {
        router.push("/profile-type");
      }

      console.log("profile not found");

    },
    onError: (error) => {
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
      setAuthError(errorMessage);
    },
  });

  const signUpMutation = useMutation({
    mutationFn: (data) => {
      return register({
        ...data,
        role: "user",
      });
    },
    onSuccess: (response) => {
      router.push(`/confirm-email?email=${encodeURIComponent(response.email)}`);
    },
    onError: (error) => {
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
      setAuthError(errorMessage);
    },
  });

  const verifyEmailMutation = useMutation({
    mutationFn: verifyEmail,
    onSuccess: () => {
      setSuccess("Email verified successfully");
      setTimeout(() => {
        router.push("/signin");
      }, 2000);
    },
    onError: (error) => {
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
      setAuthError(errorMessage);
    },
  });

  const resendCodeMutation = useMutation({
    mutationFn: resendVerificationCode,
    onSuccess: () => {
      setSuccess("Verification code resent. Please check your email.");
    },
    onError: (error) => {
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
      setAuthError(errorMessage);
    },
  });

  const googleLoginMutation = useMutation({
    mutationFn: googleLogin,
    onSuccess: (response) => {
      authStoreLogin(response.user, {
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      });
      router.push("/");
    },
    onError: (error) => {
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
      setAuthError(errorMessage);
    },
  });

  const facebookLoginMutation = useMutation({
    mutationFn: facebookLogin,
    onSuccess: (response) => {
      authStoreLogin(response.user, {
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      });
      router.push("/");
    },
    onError: (error) => {
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
      setAuthError(errorMessage);
    },
  });

  const requestResetOtpMutation = useMutation({
    mutationFn: requestResetOtp,
    onSuccess: (response) => {
      setSuccess("Reset code sent successfully. Please check your email.");
      router.push(
        `/confirm-email?email=${encodeURIComponent(response.email)}&type=reset`
      );
    },
    onError: (error) => {
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
      setAuthError(errorMessage);
    },
  });

  const verifyResetOtpMutation = useMutation({
    mutationFn: verifyResetOtp,
    onSuccess: () => {
      setSuccess("OTP verified successfully");
      router.push("/reset-pass");
    },
    onError: (error) => {
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
      setAuthError(errorMessage);
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: resetPassword,
    onSuccess: () => {
      setSuccess("Password reset successfully");
      setTimeout(() => {
        router.push("/signin");
      }, 2000);
    },
    onError: (error) => {
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
      setAuthError(errorMessage);
    },
  });

  // Modified submission handler with debugs
  const onSubmit = async (data) => {
    console.log("Form submitted with data:", data);
    console.log("Current form title:", title);

    setError(null);
    setSuccess(null);

    // Handle different form types based on the title
    switch (title) {
      case "Sign in to your account":
        signInMutation.mutate(data);
        break;

      case "Create your account":
        // Enhanced validation for registration
        if (!data.name || !data.email || !data.password) {
          setError("All fields are required");
          return;
        }

        // Only send the required fields to the API
        const registrationData = {
          name: data.name.trim(),
          email: data.email.trim(),
          password: data.password,
          role: "user", // This will be added by the mutation
        };

        signUpMutation.mutate(registrationData);
        break;

      case "Forgot Password":
        // Add validation for email
        if (!data.email) {
          setError("Email is required");
          return;
        }

        // Call the requestResetOtp mutation
        requestResetOtpMutation.mutate({ email: data.email.trim() });
        break;

      case "Verify Your Email":
        // Join the digits to form the verification code
        console.log("Processing verification code from data:", data);

        const verificationCode = `${data.digit1}${data.digit2}${data.digit3}${data.digit4}`;
        console.log("Generated verification code:", verificationCode);

        // Get the email from URL if available
        const urlParams = new URLSearchParams(window.location.search);
        const email = urlParams.get("email");
        const isResetPassword = urlParams.get("type") === "reset";

        console.log("Verification data:", {
          email,
          verificationCode,
          isResetPassword,
        });

        // Check if email exists
        if (!email) {
          setError("Email address is missing. Please go back and try again.");
          return;
        }

        // Send the verification data
        try {
          console.log("Calling verification mutation with:", {
            email,
            code: verificationCode,
          });
          if (isResetPassword) {
            // Use verifyResetOtp for password reset verification
            verifyResetOtpMutation.mutate({
              email: email,
              otp: verificationCode,
            });
          } else {
            // Use verifyEmail for regular email verification
            verifyEmailMutation.mutate({
              email: email,
              code: verificationCode,
            });
          }
        } catch (err) {
          console.error("Error triggering mutation:", err);
          setError("Failed to process verification request.");
        }
        break;

      case "Reset Your Password":
        // Validate passwords match
        if (data.newPassword !== data.confirmPassword) {
          setError("Passwords do not match");
          return;
        }

        // Call the resetPassword mutation with the required data
        resetPasswordMutation.mutate({
          email: data.email.trim(),
          newPassword: data.newPassword,
        });
        break;

      default:
        setError("Unknown form type");
        console.error("Unknown form type:", title);
    }
  };

  const handleResendCode = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get("email");

    if (email) {
      resendCodeMutation.mutate({ email });
    } else {
      setError("Email not found. Please go back and try again.");
    }
  };

  const handleGoogleLogin = () => {
    googleLoginMutation.mutate();
  };

  const handleFacebookLogin = () => {
    facebookLoginMutation.mutate();
  };

  // Get the current mutation based on the form type
  const getCurrentMutation = () => {
    switch (title) {
      case "Sign in to your account":
        return signInMutation;
      case "Create your account":
        return signUpMutation;
      case "Forgot Password":
        return requestResetOtpMutation;
      case "Verify Your Email":
        const urlParams = new URLSearchParams(window.location.search);
        const isResetPassword = urlParams.get("type") === "reset";
        return isResetPassword ? verifyResetOtpMutation : verifyEmailMutation;
      case "Reset Your Password":
        return resetPasswordMutation;
      default:
        return null;
    }
  };

  const currentMutation = getCurrentMutation();
  const isLoading =
    currentMutation?.isPending ||
    resendCodeMutation?.isPending ||
    requestResetOtpMutation?.isPending ||
    verifyResetOtpMutation?.isPending ||
    resetPasswordMutation?.isPending ||
    useAuthStore.getState().isLoading;

  // Debugging log for form state
  console.log("Form state:", {
    title,
    errors: Object.keys(errors).length > 0 ? errors : "No errors",
    isLoading,
    formFieldCount: formFields.length,
  });

  return (
    <div className="flex min-h-screen">
      {/* Left section with logo and primary background */}
      <div className="hidden md:flex md:w-1/2 bg-primary items-center justify-center">
        <div className="p-8">
          <div className="w-56 h-56 relative mx-auto">
            <Image
              src="/LogoFull.svg"
              alt="Company Logo"
              fill
              className="object-contain"
            />
          </div>
          <div className="text-center">
            <h1 className="text-7xl font-bold text-white">Syssel</h1>
            <p className="text-2xl text-white mt-4">Your local market</p>
          </div>
        </div>
      </div>

      {/* Right section with the form */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="mt-6 text-3xl font-extrabold text-gray-900">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-2 text-sm text-gray-600">{subtitle}</p>
            )}
          </div>

          <div className="mt-8 space-y-6">
            {showSocial && (
              <>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={googleLoginMutation.isPending}
                    className="cursor-pointer group relative flex w-full justify-center rounded-full border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition duration-300 disabled:opacity-50"
                  >
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                      <FaGoogle className="h-5 w-5 text-gray-500 group-hover:text-primary transition duration-300" />
                    </span>
                    <span className="hidden sm:inline">
                      Sign in with Google
                    </span>
                    <span className="inline sm:hidden">Google</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleFacebookLogin}
                    disabled={facebookLoginMutation.isPending}
                    className="cursor-pointer group relative flex w-full justify-center rounded-full border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition duration-300 disabled:opacity-50"
                  >
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                      <FaFacebook className="h-5 w-5 text-blue-600 transition duration-300" />
                    </span>
                    <span className="hidden sm:inline">
                      Sign in with Facebook
                    </span>
                    <span className="inline sm:hidden">Facebook</span>
                  </button>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-gray-50 px-2 text-gray-500">
                      Or sign in with email
                    </span>
                  </div>
                </div>
              </>
            )}

            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      {error}
                    </h3>
                  </div>
                </div>
              </div>
            )}

            {success && (
              <div className="rounded-md bg-green-50 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">
                      {success}
                    </h3>
                  </div>
                </div>
              </div>
            )}

            {/* FORM ELEMENT - Added id for debugging */}
            <form
              className="mt-4 space-y-4"
              onSubmit={handleSubmit(onSubmit)}
              id="auth-form"
            >
              {/* Special handling for verification code fields - display them horizontally */}
              {title === "Verify Your Email" ? (
                <div className="flex justify-center space-x-3">
                  {formFields.map((field, index) => {
                    const processedField = processValidation(field);
                    return (
                      <div key={index} className="w-14 cursor-pointer">
                        <label htmlFor={field.id} className="sr-only">
                          {field.label}
                        </label>
                        <input
                          id={field.id}
                          {...registerField(field.name, {
                            required: field.required,
                            ...processedField.validation,
                            onChange: (e) => handleDigitInput(e, index),
                            onKeyDown: (e) => handleDigitKeyDown(e, index),
                          })}
                          type={field.type}
                          autoComplete={field.autoComplete}
                          maxLength={1}
                          className={`relative block w-full appearance-none rounded-lg border text-center text-xl font-bold py-4 ${
                            errors[field.name]
                              ? "border-red-300"
                              : "border-gray-300"
                          } px-3 text-gray-900 placeholder-gray-400 focus:z-10 focus:border-primary focus:outline-none focus:ring-primary focus:shadow-md sm:text-sm transition duration-300`}
                          placeholder={field.placeholder}
                        />
                        {errors[field.name] && (
                          <p className="mt-1 text-xs text-red-600">!</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                // Regular form fields for other forms
                <div className="space-y-4 rounded-md">
                  {formFields.map((field, index) => {
                    if (field.type === "checkbox") return null;

                    const processedField = processValidation(field);
                    
                    // Check if this is a password field
                    const isPasswordField = field.type === "password";
                    
                    return (
                      <div key={index} className="cursor-pointer">
                        <label htmlFor={field.id} className="sr-only">
                          {field.label}
                        </label>
                        <div className="relative">
                          <input
                            id={field.id}
                            {...registerField(field.name, {
                              required: field.required,
                              ...processedField.validation,
                            })}
                            type={isPasswordField && passwordVisibility[field.name] ? "text" : field.type}
                            autoComplete={field.autoComplete}
                            className={`relative block w-full appearance-none rounded-full border ${
                              errors[field.name]
                                ? "border-red-300"
                                : "border-gray-300"
                            } px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-primary focus:outline-none focus:ring-primary focus:shadow-md sm:text-sm transition duration-300 ${
                              isPasswordField ? "pr-12" : ""
                            }`}
                            placeholder={field.placeholder}
                          />
                          {/* Password toggle button */}
                          {isPasswordField && (
                            <button
                              type="button"
                              onClick={() => togglePasswordVisibility(field.name)}
                              className="cursor-pointer absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition duration-300 z-20 p-1"
                              disabled={isLoading}
                              onMouseDown={(e) => e.preventDefault()}
                            >
                              {passwordVisibility[field.name] ? (
                                <FiEyeOff size={20} />
                              ) : (
                                <FiEye size={20} />
                              )}
                            </button>
                          )}
                        </div>
                        {errors[field.name] && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors[field.name].message ||
                              `${field.label} is required`}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Checkbox fields handling */}
              {formFields.some((field) => field.type === "checkbox") && (
                <div className="flex items-center justify-between">
                  {formFields.map(
                    (field, index) =>
                      field.type === "checkbox" && (
                        <div
                          key={index}
                          className="flex items-center cursor-pointer"
                        >
                          <input
                            id={field.id}
                            type="checkbox"
                            {...registerField(field.name, {
                              required: field.required,
                              ...field.validation,
                            })}
                            className={`h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary transition duration-300 ${
                              errors[field.name] ? "border-red-300" : ""
                            }`}
                          />
                          <label
                            htmlFor={field.id}
                            className="ml-2 block text-sm text-gray-900"
                          >
                            {field.label}
                            {/* Show * icon if error and it's the terms checkbox */}
                            {errors[field.name] && (
                              <span className="text-red-600 ml-1">*</span>
                            )}
                          </label>
                        </div>
                      )
                  )}
                  {/* Add forgot password link here */}
                  {title === "Sign in to your account" &&
                    forgotPasswordText &&
                    forgotPasswordHref && (
                      <Link
                        href={forgotPasswordHref}
                        className="text-sm font-medium text-primary hover:text-primary/80 transition duration-300"
                      >
                        {forgotPasswordText}
                      </Link>
                    )}
                </div>
              )}

              <div>
                {/* Fixed submit button - explicitly type="submit" */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="cursor-pointer group relative flex w-full justify-center rounded-full border-0 bg-primary py-2 px-4 text-sm font-medium text-white hover:bg-primary-hover hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={(e) => {
                    console.log("Submit button clicked");
                    // Let the form's onSubmit handle it naturally
                  }}
                >
                  {isLoading ? "Processing..." : submitButtonText}
                </button>
              </div>
            </form>

            {title === "Verify Your Email" ? (
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  {footerText}{" "}
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={resendCodeMutation.isPending}
                    className="cursor-pointer font-medium text-primary hover:text-primary-hover transition duration-300 disabled:opacity-50"
                  >
                    {resendCodeMutation.isPending
                      ? "Sending..."
                      : footerLinkText}
                  </button>
                </p>
              </div>
            ) : (
              footerText &&
              footerLinkText &&
              footerLinkHref && (
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    {footerText}{" "}
                    <Link
                      href={footerLinkHref}
                      className="cursor-pointer font-medium text-primary hover:text-primary/80 transition duration-300"
                    >
                      {footerLinkText}
                    </Link>
                  </p>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
