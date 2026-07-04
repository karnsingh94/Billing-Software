import { useState } from "react";
import { FaCheckCircle, FaTimes, FaUserPlus } from "react-icons/fa";

const ProductAddForm = ({ setPtoAddFormShow }) => {
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    status: "",
    price: "",
    stock: "",
    role: "admin",
    image: null,
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
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

    
    if (!formData.sku) {
      newErrors.sku = "sku is required";
    }

    if (!formData.stock) {
      newErrors.stock = "stock is required";
    }

    if (!formData.price) {
      newErrors.price = "price is required";
    }

    if (!formData.status) {
      newErrors.status = "status is required";
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

    const newProduct = {
  id: Date.now(),
  name: formData.name.trim(),
  sku: formData.sku.trim(),
  price: Number(formData.price),
  stock: Number(formData.stock),
  status: formData.status,
  role: formData.role,
  image: imageBase64,
  createdBy: "Super Admin",
  createdAt: new Date().toISOString(),
};

    // Existing admins get karo
    const existingCategory = JSON.parse(localStorage.getItem("products")) || [];

    // New admin add karo
    const updatedProduct = [...existingCategory, newProduct];

    // Save in localStorage
    localStorage.setItem("products", JSON.stringify(updatedProduct));

    console.log("Saved User:", newProduct);

    setSuccess(true);

    setTimeout(() => {
      setIsSubmitting(false);

      setFormData({
        name: "",
        sku: "",
        status: "",
        price: "",
        stock: "",
        role: "admin",
        image: null,
      });

      setSuccess(false);

      setPtoAddFormShow(false);
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
          <p className="text-gray-600">Product has been added successfully.</p>
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
                  Add New Category
                </h2>
                <p className="text-blue-100 text-sm">
                  Create a new administrator account
                </p>
              </div>
            </div>
            <button
              onClick={() => setPtoAddFormShow(false)}
              className="text-white/80 hover:text-white transition"
            >
              <FaTimes className="text-xl" />
            </button>
          </div>
        </div>

        {/* -------------form-------------- */}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2">
              Product Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter product's full name"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition `}
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}
          </div>

          {/* Sku */}
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2">
              Sku <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="sku"
              value={formData.sku}
              onChange={handleChange}
              placeholder="ELEC"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition `}
            />
            {errors.sku && (
              <p className="text-red-500 text-xs mt-1">{errors.sku}</p>
            )}
          </div>

          {/* price */}
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2">
              Product price <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="price"
              value={formData.totalProducts}
              onChange={handleChange}
              placeholder="Enter product's price"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition `}
            />
            {errors.price && (
              <p className="text-red-500 text-xs mt-1">
                {errors.price}
              </p>
            )}
          </div>

          {/* stock */}
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2">
              Product stock <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              placeholder="Enter product's number"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition `}
            />
            {errors.stock && (
              <p className="text-red-500 text-xs mt-1">
                {errors.stock}
              </p>
            )}
          </div>

          {/* Status */}
          <div className="w-full">
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
            {errors.status && (
              <p className="text-red-500 text-xs mt-1">{errors.status}</p>
            )}
          </div>

          {/* Image */}
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2">
              Profile Image <span className="text-red-500">*</span>
            </label>

            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg `}
            />

            {errors.image && (
              <p className="text-red-500 text-xs mt-1">{errors.image}</p>
            )}

            {formData.image && (
              <div className="mt-3">
                <img
                  src={URL.createObjectURL(formData.image)}
                  alt="Preview"
                  className="w-24 h-24 rounded-full object-cover border"
                />
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setPtoAddFormShow(false)}
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
                  <FaUserPlus /> Add Category
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductAddForm;
