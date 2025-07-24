"use client";

export const signInFields = [
  {
    id: "email-address",
    name: "email",
    type: "email",
    autoComplete: "email",
    required: true,
    placeholder: "Email address",
    label: "Email address",
    validation: {
      pattern: {
        value: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
        message: "Please enter a valid email address",
      },
    },
  },
  {
    id: "password",
    name: "password",
    type: "password",
    autoComplete: "current-password",
    required: true,
    placeholder: "Password",
    label: "Password",
    validation: {
      minLength: {
        value: 6,
        message: "Password must be at least 6 characters",
      },
    },
  },
  {
    id: "remember-me",
    name: "remember-me",
    type: "checkbox",
    required: false,
    label: "Remember me",
  },
];

export const signUpFields = [
  {
    id: "name",
    name: "name",
    type: "text",
    required: true,
    placeholder: "Full Name",
    label: "Full Name",
    validation: {
      minLength: {
        value: 2,
        message: "Name must be at least 2 characters",
      },
      pattern: {
        value: "^[a-zA-Z\\s'-]*$",
        message: "Name can only contain letters, spaces, hyphens, and apostrophes",
      },
    },
  },
  {
    id: "email-address",
    name: "email",
    type: "email",
    autoComplete: "email",
    required: true,
    placeholder: "Email address",
    label: "Email address",
    validation: {
      pattern: {
        value: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
        message: "Please enter a valid email address",
      },
    },
  },
  {
    id: "password",
    name: "password",
    type: "password",
    autoComplete: "new-password",
    required: true,
    placeholder: "Password",
    label: "Password",
    validation: {
      minLength: {
        value: 6,
        message: "Password must be at least 6 characters",
      },
      pattern: {
        value: "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).*$",
        message: "Password must contain at least one uppercase letter, one lowercase letter, and one number",
      },
    },
  },
  {
    id: "confirm-password",
    name: "confirm-password",
    type: "password",
    autoComplete: "new-password",
    required: true,
    placeholder: "Confirm Password",
    label: "Confirm Password",
    validation: {
      validate: (value, formValues) => value === formValues.password || "Passwords do not match",
    },
  },
  {
    id: "terms-and-privacy",
    name: "terms-and-privacy",
    type: "checkbox",
    required: true,
    label: "I agree to the Terms of Service and Privacy Policy",
  },
];

export const forgotPasswordFields = [
  {
    id: "email-address",
    name: "email",
    type: "email",
    autoComplete: "email",
    required: true,
    placeholder: "Email address",
    label: "Email address",
    validation: {
      pattern: {
        value: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
        message: "Please enter a valid email address",
      },
    },
  },
];

export const confirmCodeFields = [
  {
    id: "digit1",
    name: "digit1",
    type: "text",
    autoComplete: "one-time-code",
    placeholder: "•",
    required: true,
    validation: {
      required: "Required",
      pattern: {
        value: "^\\d$",
        message: "Must be a digit",
      },
    },
  },
  {
    id: "digit2",
    name: "digit2",
    type: "text",
    autoComplete: "one-time-code",
    placeholder: "•",
    required: true,
    validation: {
      required: "Required",
      pattern: {
        value: "^\\d$",
        message: "Must be a digit",
      },
    },
  },
  {
    id: "digit3",
    name: "digit3",
    type: "text",
    autoComplete: "one-time-code",
    placeholder: "•",
    required: true,
    validation: {
      required: "Required",
      pattern: {
        value: "^\\d$",
        message: "Must be a digit",
      },
    },
  },
  {
    id: "digit4",
    name: "digit4",
    type: "text",
    autoComplete: "one-time-code",
    placeholder: "•",
    required: true,
    validation: {
      required: "Required",
      pattern: {
        value: "^\\d$",
        message: "Must be a digit",
      },
    },
  },
];

export const resetPasswordFields = [
  {
    id: "email-address",
    name: "email",
    type: "email",
    autoComplete: "email",
    required: true,
    placeholder: "Email address",
    label: "Email address",
    validation: {
      pattern: {
        value: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
        message: "Please enter a valid email address",
      },
    },
  },
  {
    id: "new-password",
    name: "newPassword",
    type: "password",
    autoComplete: "new-password",
    required: true,
    placeholder: "New Password",
    label: "New Password",
    validation: {
      minLength: {
        value: 6,
        message: "Password must be at least 6 characters",
      },
      pattern: {
        value: "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).*$",
        message: "Password must contain at least one uppercase letter, one lowercase letter, and one number",
      },
    },
  },
  {
    id: "confirm-password",
    name: "confirmPassword",
    type: "password",
    autoComplete: "new-password",
    required: true,
    placeholder: "Confirm New Password",
    label: "Confirm New Password",
    validation: {
      validate: (value, formValues) => value === formValues.newPassword || "Passwords do not match",
    },
  },
];
