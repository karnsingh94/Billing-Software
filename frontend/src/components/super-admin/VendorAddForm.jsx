import { useState } from "react";
import {
  FaCheckCircle,
  FaEnvelope,
  FaEye,
  FaEyeSlash,
  FaLock,
  FaPhone,
  FaTimes,
  FaUserPlus,
} from "react-icons/fa";

const VendorAddForm = ({ setShowAddForm }) => {
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    password: "",
    phone: "",
    status: "",
    joinDate: "",
    image: "null",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Handle Input Change
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

  // Validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.image) {
      newErrors.image = "Profile image is required";
    }

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.length < 3) {
      newErrors.name = "Name must be at least 3 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

   

    if (!formData.phone) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = "Phone number must be 10 digits";
    }

     if (!formData.image) {
      newErrors.image = "Profile image is required";
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

    let imageBase64 = "";

    if (formData.image) {
      imageBase64 = await new Promise((resolve) => {
        const reader = new FileReader();

        reader.onloadend = () => {
          resolve(reader.result);
        };

        reader.readAsDataURL(formData.image);
      });
    }

    const newVendor = {
      id: Date.now(),
      name: formData.name,
      email: formData.email,
      company:formData.company,
      phone: formData.phone,
      status: formData.status,
      role: formData.role,
      image: imageBase64,
      joinDate: new Date().toISOString().split("T")[0],
      createdBy: "Super Admin",
    };

    // Existing admins get karo
    const existingAdmins = JSON.parse(localStorage.getItem("vendors")) || [];

    // New admin add karo
    const updatedVendor = [...existingAdmins, newVendor];

    // Save in localStorage
    localStorage.setItem("vendors", JSON.stringify(updatedVendor));

    console.log("Saved Vendor:", newVendor);

    setSuccess(true);

    // if (onAdminAdded) {
    //   onAdminAdded(newAdmin);
    // }

    setTimeout(() => {
      setIsSubmitting(false);

      setFormData({
        name: "",
        company: "",
        email: "",
        password: "",
        phone: "",
        status: "",
        joinDate: "",
        image: "null",
      });

      setSuccess(false);

      setShowAddForm(false);
    }, 1500);
  };

  // Success View
  if (success) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center animate-bounceIn">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaCheckCircle className="text-green-600 text-3xl" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Success!</h3>
          <p className="text-gray-600">vendor has been added successfully.</p>
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
                <h2 className="text-xl font-bold text-white">Add New Vendor</h2>
                <p className="text-blue-100 text-sm">
                  Create a new administrator account
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-white/80 hover:text-white transition"
            >
              <FaTimes className="text-xl" />
            </button>
          </div>
        </div>
        {/*---------------- form -------------*/}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
               value={formData.name}
              onChange={handleChange}
              placeholder="Enter vendor's full name"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition `}
            />
          </div>
          {/* Compan */}
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2">
              Company Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="company"
               value={formData.company}
              onChange={handleChange}
              placeholder="Enter company name"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition `}
            />
          </div>
          {/* Email */}
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaEnvelope className="text-gray-400" />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
              onChange={handleChange}
                placeholder="admin@example.com"
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition `}
              />
            </div>
          </div>
          {/* Password */}
          <div className="relative">
            <label className="block text-gray-700 text-sm font-semibold mb-2">
              Password <span className="text-red-500">*</span>
            </label>

            <div className="absolute top-10 left-3 flex items-center pointer-events-none">
              <FaLock className="text-gray-400" />
            </div>

            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.passsword}
              onChange={handleChange}
              placeholder="Enter password"
              className="w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-10 right-3 text-gray-500"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaPhone className="text-gray-400" />
              </div>
              <input
                type="text"
                name="phone"
                value={formData.phone}
              onChange={handleChange}
                placeholder="9876543210"
                maxLength="10"
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition `}
              />
            </div>
          </div>

          {/* Status  JoinDate */}
          <div className="flex gap-5 w-full">
            {/* Status */}
            <div className="w-1/2">
              <label className="block text-gray-700 text-sm font-semibold mb-2">
                Select Status <span className="text-red-500">*</span>
              </label>

              <select
                name="status"
                value={formData.status}
              onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            {/* Join Date */}
            <div className="w-1/2">
              <label className="block text-gray-700 text-sm font-semibold mb-2">
                Join Date <span className="text-red-500">*</span>
              </label>

              <input
                type="date"
                name="joinDate"
                value={formData.joinDate}
              onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* image */}

          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2">
              Profile Image <span className="text-red-500">*</span>
            </label>

            <input
              type="file"
              name="image"
               accept="image/*"
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg }`}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
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
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Adding...
                </>
              ) : (
                <>
                  <FaUserPlus /> Add Vendor
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VendorAddForm;
