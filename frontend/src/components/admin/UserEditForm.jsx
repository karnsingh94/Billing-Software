import { useEffect, useState } from "react";
import axios from "axios";
import {
  FaCheckCircle,
  FaTimes,
  FaUserPlus,
} from "react-icons/fa";

const API_URL = import.meta.env.VITE_API_URL;

const UserEditForm = ({
  setEditShowForm,
  editData,
}) => {
  console.log("Edit Data:", editData);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    location: "",

    // Update API me use nahi ho raha
    // joinDate: "",
    // image: null,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] =
    useState(false);
  const [success, setSuccess] =
    useState(false);
  const [apiError, setApiError] =
    useState("");

  // =====================================================
  // EDIT USER DATA FORM ME SET KARNA
  // =====================================================

  useEffect(() => {
    if (editData) {
      setFormData({
        fullName:
          editData.fullName ||
          editData.name ||
          "",

        email:
          editData.email || "",

        phone:
          editData.phone || "",

        location:
          editData.location || "",

        // Purana code
        // joinDate:
        //   editData.joinDate || "",

        // image:
        //   editData.image || null,
      });
    }
  }, [editData]);

  // =====================================================
  // INPUT CHANGE
  // =====================================================

  const handleChange = (e) => {
    const {
      name,
      value,

      // Image use nahi ho rahi
      // files,
    } = e.target;

    setFormData((prev) => ({
      ...prev,

      // Purana image code
      // [name]: files
      //   ? files[0]
      //   : value,

      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    setApiError("");
  };

  // =====================================================
  // PURANA IMAGE BASE64 CODE
  // API me image use nahi ho rahi
  // =====================================================

  /*
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.readAsDataURL(file);

      reader.onload = () =>
        resolve(reader.result);

      reader.onerror = (error) =>
        reject(error);
    });
  };
  */

  // =====================================================
  // FORM VALIDATION
  // =====================================================

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName =
        "Full name is required";
    } else if (
      formData.fullName.trim().length < 2
    ) {
      newErrors.fullName =
        "Full name must contain at least 2 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email =
        "Email is required";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        formData.email.trim()
      )
    ) {
      newErrors.email =
        "Invalid email format";
    }

    if (!formData.phone.trim()) {
      newErrors.phone =
        "Phone number is required";
    } else if (
      formData.phone.trim().length < 7
    ) {
      newErrors.phone =
        "Invalid phone number";
    }

    if (!formData.location.trim()) {
      newErrors.location =
        "Location is required";
    } else if (
      formData.location.trim().length < 2
    ) {
      newErrors.location =
        "Location must contain at least 2 characters";
    }

    setErrors(newErrors);

    return (
      Object.keys(newErrors).length === 0
    );
  };

  // =====================================================
  // UPDATE USER API
  // PUT /api/v1/auth/user/:id
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!editData?.id) {
      setApiError(
        "User ID not found"
      );

      return;
    }

    try {
      setIsSubmitting(true);
      setSuccess(false);
      setApiError("");

      const token =
        localStorage.getItem(
          "accessToken"
        ) ||
        localStorage.getItem("token") ||
        localStorage.getItem(
          "authToken"
        );

      if (!token) {
        setApiError(
          "Login token not found"
        );

        return;
      }

      const payload = {
        email: formData.email
          .trim()
          .toLowerCase(),

        fullName:
          formData.fullName.trim(),

        phone:
          formData.phone.trim(),

        location:
          formData.location.trim(),
      };

      console.log(
        "Update User ID:",
        editData.id
      );

      console.log(
        "Update User Payload:",
        payload
      );

      const response =
        await axios.put(
          `${API_URL}/auth/user-update/${editData.id}`,
          payload,
          {
            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            withCredentials: true,
          }
        );

      console.log(
        "Update User Response:",
        response.data
      );

      setSuccess(true);

      setTimeout(() => {
        setEditShowForm(false);
      }, 1500);

      // =================================================
      // PURANA LOCALSTORAGE UPDATE CODE
      // API lagne ke baad use nahi ho raha
      // =================================================

      /*
      const categoryData =
        JSON.parse(
          localStorage.getItem("user")
        ) || [];

      let imageData =
        formData.image;

      if (
        formData.image instanceof File
      ) {
        imageData =
          await convertToBase64(
            formData.image
          );
      }

      const userData =
        categoryData.map((item) =>
          item.id === editData.id
            ? {
                ...item,
                name:
                  formData.fullName,
                email:
                  formData.email,
                phone:
                  formData.phone,
                location:
                  formData.location,
                joinDate:
                  formData.joinDate,
                image:
                  imageData,
              }
            : item
        );

      localStorage.setItem(
        "user",
        JSON.stringify(userData)
      );
      */
    } catch (error) {
      console.error(
        "Update User Error:",
        error
      );

      const validationErrors =
        error.response?.data?.errors;

      if (
        Array.isArray(validationErrors)
      ) {
        const backendErrors = {};

        validationErrors.forEach(
          (item) => {
            const field =
              item.field
                ?.replace("body.", "")
                ?.replace(
                  "params.",
                  ""
                );

            if (field) {
              backendErrors[field] =
                item.message;
            }
          }
        );

        setErrors(backendErrors);
      }

      setApiError(
        error.response?.data?.message ||
          "User update failed"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // =====================================================
  // SUCCESS MESSAGE
  // =====================================================

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaCheckCircle className="text-green-600 text-3xl" />
          </div>

          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            Success!
          </h3>

          <p className="text-gray-600">
            User updated successfully.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}

        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <FaUserPlus className="text-white text-xl" />
              </div>

              <div>
                <h2 className="text-xl font-bold text-white">
                  Update User
                </h2>

                <p className="text-blue-100 text-sm">
                  Update user account
                  information
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                setEditShowForm(false)
              }
              className="text-white/80 hover:text-white transition"
            >
              <FaTimes className="text-xl" />
            </button>
          </div>
        </div>

        {/* Form */}

        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-4"
        >
          {apiError && (
            <div className="p-3 bg-red-100 border border-red-300 text-red-600 rounded-lg text-sm">
              {apiError}
            </div>
          )}

          {/* Full Name */}

          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2">
              User Name{" "}
              <span className="text-red-500">
                *
              </span>
            </label>

            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Enter user full name"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition ${
                errors.fullName
                  ? "border-red-500 focus:ring-red-300"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
            />

            {errors.fullName && (
              <p className="text-red-500 text-xs mt-1">
                {errors.fullName}
              </p>
            )}
          </div>

          {/* Email */}

          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2">
              User Email{" "}
              <span className="text-red-500">
                *
              </span>
            </label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="user@gmail.com"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition ${
                errors.email
                  ? "border-red-500 focus:ring-red-300"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
            />

            {errors.email && (
              <p className="text-red-500 text-xs mt-1">
                {errors.email}
              </p>
            )}
          </div>

          {/* Phone */}

          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2">
              User Phone{" "}
              <span className="text-red-500">
                *
              </span>
            </label>

            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter phone number"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition ${
                errors.phone
                  ? "border-red-500 focus:ring-red-300"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
            />

            {errors.phone && (
              <p className="text-red-500 text-xs mt-1">
                {errors.phone}
              </p>
            )}
          </div>

          {/* Location */}

          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2">
              User Location{" "}
              <span className="text-red-500">
                *
              </span>
            </label>

            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Enter user location"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition ${
                errors.location
                  ? "border-red-500 focus:ring-red-300"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
            />

            {errors.location && (
              <p className="text-red-500 text-xs mt-1">
                {errors.location}
              </p>
            )}
          </div>

          {/* Purana JoinDate code */}

          {/*
          <div>
            <label>
              Join Date
            </label>

            <input
              type="date"
              name="joinDate"
              value={formData.joinDate}
              onChange={handleChange}
            />
          </div>
          */}

          {/* Purana Image code */}

          {/*
          <div>
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleChange}
            />
          </div>
          */}

          {/* Buttons */}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() =>
                setEditShowForm(false)
              }
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />

                  Updating...
                </>
              ) : (
                <>Update User</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserEditForm;