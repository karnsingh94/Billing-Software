import { useState } from "react";
import axios from "axios";
import {
  FaCheckCircle,
  FaEnvelope,
  FaEye,
  FaEyeSlash,
  FaLock,
  FaMapMarkerAlt,
  FaPhone,
  FaTimes,
  FaUserPlus,
  // FaUserTag,
} from "react-icons/fa";

const API_URL = import.meta.env.VITE_API_URL;

const AddFormUser = ({ setAddFormShow }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    location: "",
  });

  const [showPassword, setShowPassword] =
    useState(false);

  const [errors, setErrors] = useState({});

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Validate Form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName =
        "Full name is required";
    } else if (
      formData.fullName.trim().length < 3
    ) {
      newErrors.fullName =
        "Full name must be at least 3 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (
      !/\S+@\S+\.\S+/.test(formData.email)
    ) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password =
        "Password is required";
    } else if (
      formData.password.length < 6
    ) {
      newErrors.password =
        "Password must be at least 6 characters";
    }

    if (!formData.phone) {
      newErrors.phone =
        "Phone number is required";
    } else if (
      !/^\d{10}$/.test(formData.phone)
    ) {
      newErrors.phone =
        "Phone number must be 10 digits";
    }

    if (!formData.location.trim()) {
      newErrors.location =
        "Location is required";
    }


    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // Handle Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const token =
        localStorage.getItem("accessToken");

      if (!token) {
        alert(
          "Token nahi mila. Dobara login karo."
        );

        setIsSubmitting(false);
        return;
      }

      const userData = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phone: formData.phone.trim(),
        location: formData.location.trim(),
      };

    

      console.log(
        "Create User Request:",
        userData
      );

      const response = await axios.post(
        `${API_URL}/auth/create-user`,
        userData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log(
        "User Created:",
        response.data
      );

      /*
      Purana image Base64 code delete nahi kiya,
      sirf comment kiya hai.

      let imageBase64 = "";

      if (formData.image) {
        imageBase64 = await new Promise(
          (resolve) => {
            const reader = new FileReader();

            reader.onloadend = () => {
              resolve(reader.result);
            };

            reader.readAsDataURL(
              formData.image
            );
          }
        );
      }
      */

      /*
      Purana localStorage code delete nahi kiya,
      sirf comment kiya hai.

      const newAdmin = {
        id: Date.now(),
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        image: imageBase64,
        lacation: formData.lacation,
        joinDate:
          new Date()
            .toISOString()
            .split("T")[0],
        createdBy: "Admin",
      };

      const existingUser =
        JSON.parse(
          localStorage.getItem("user")
        ) || [];

      const updatedUser = [
        ...existingUser,
        newAdmin,
      ];

      localStorage.setItem(
        "user",
        JSON.stringify(updatedUser)
      );

      console.log(
        "Saved User:",
        newAdmin
      );
      */

      setSuccess(true);

      setTimeout(() => {
        setIsSubmitting(false);

        setFormData({
          fullName: "",
          email: "",
          password: "",
          phone: "",
          location: "",

         
        });

        setErrors({});
        setSuccess(false);
        setAddFormShow(false);
      }, 1500);
    } catch (error) {
      console.error(
        "Create User Error:",
        error.response?.data ||
          error.message
      );

      alert(
        error.response?.data?.message ||
          "User create nahi hua"
      );

      setIsSubmitting(false);
    }
  };

  // Success View
  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-2xl animate-bounceIn">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <FaCheckCircle className="text-3xl text-green-600" />
          </div>

          <h3 className="mb-2 text-2xl font-bold text-gray-800">
            Success!
          </h3>

          <p className="text-gray-600">
            User has been added successfully.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="rounded-t-2xl bg-gradient-to-r from-blue-600 to-purple-600 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                <FaUserPlus className="text-xl text-white" />
              </div>

              <div>
                <h2 className="text-xl font-bold text-white">
                  Add New User
                </h2>

                <p className="text-sm text-blue-100">
                  Create a new user account
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                setAddFormShow(false)
              }
              className="text-white/80 transition hover:text-white"
            >
              <FaTimes className="text-xl" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-4 p-6"
        >
          {/* Full Name */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Full Name{" "}
              <span className="text-red-500">
                *
              </span>
            </label>

            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Enter user's full name"
              className={`w-full rounded-lg border px-4 py-2 transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.fullName
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            />

            {errors.fullName && (
              <p className="mt-1 text-xs text-red-500">
                {errors.fullName}
              </p>
            )}

            {/*
            Purana name input:

            <input
              type="text"
              name="pallName"
              value={formData.pallName}
              onChange={handleChange}
            />
            */}
          </div>

          {/* Email */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Email Address{" "}
              <span className="text-red-500">
                *
              </span>
            </label>

            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <FaEnvelope className="text-gray-400" />
              </div>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="user@example.com"
                className={`w-full rounded-lg border py-2 pr-4 pl-10 transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.email
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              />
            </div>

            {errors.email && (
              <p className="mt-1 text-xs text-red-500">
                {errors.email}
              </p>
            )}

            {/*
            Purana email input:

            <input
              type="email"
              name="fuail"
              value={formData.fuail}
              onChange={handleChange}
            />
            */}
          </div>

          {/* Password */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Password{" "}
              <span className="text-red-500">
                *
              </span>
            </label>

            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <FaLock className="text-gray-400" />
              </div>

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password"
                className={`w-full rounded-lg border py-2 pr-10 pl-10 transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.password
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    !showPassword
                  )
                }
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <FaEyeSlash size={18} />
                ) : (
                  <FaEye size={18} />
                )}
              </button>
            </div>

            {errors.password && (
              <p className="mt-1 text-xs text-red-500">
                {errors.password}
              </p>
            )}

            {/*
            Purana password input:

            <input
              type="password"
              name="emssword"
              value={formData.emssword}
              onChange={handleChange}
            />
            */}
          </div>

          {/* Phone */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Phone Number{" "}
              <span className="text-red-500">
                *
              </span>
            </label>

            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <FaPhone className="text-gray-400" />
              </div>

              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="9876543210"
                maxLength="10"
                className={`w-full rounded-lg border py-2 pr-4 pl-10 transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.phone
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              />
            </div>

            {errors.phone && (
              <p className="mt-1 text-xs text-red-500">
                {errors.phone}
              </p>
            )}
          </div>

          {/* Location */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Location{" "}
              <span className="text-red-500">
                *
              </span>
            </label>

            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <FaMapMarkerAlt className="text-gray-400" />
              </div>

              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Enter user location"
                className={`w-full rounded-lg border py-2 pr-4 pl-10 transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.location
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              />
            </div>

            {errors.location && (
              <p className="mt-1 text-xs text-red-500">
                {errors.location}
              </p>
            )}

            {/*
            Purana location input:

            <input
              type="text"
              name="lacation"
              value={formData.lacation}
              onChange={handleChange}
            />
            */}
          </div>

          {/*
          Backend me image field nahi hai,
          isliye image input delete nahi kiya,
          sirf comment kiya hai.

          <div>
            <label>
              Profile Image
            </label>

            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleChange}
            />

            {errors.image && (
              <p>
                {errors.image}
              </p>
            )}

            {formData.image && (
              <div>
                <img
                  src={URL.createObjectURL(
                    formData.image
                  )}
                  alt="Preview"
                />
              </div>
            )}
          </div>
          */}

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() =>
                setAddFormShow(false)
              }
              disabled={isSubmitting}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 py-2 font-semibold text-white transition hover:from-blue-700 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Adding...
                </>
              ) : (
                <>
                  <FaUserPlus />
                  Add User
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddFormUser;