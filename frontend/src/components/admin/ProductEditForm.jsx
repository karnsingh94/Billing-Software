import { useEffect, useState } from "react";
import { FaCheckCircle, FaTimes, FaUserPlus } from "react-icons/fa";

const ProductEditForm = ({ setEditShowForm, editId }) => {
  // console.log(editId);

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

  useEffect(() => {
    if (editId) {
      setFormData({
        name: editId.name || "",
        sku: editId.sku || "",
        price: editId.price || "",
        stock: editId.stock || "",
        status: editId.status || "",
        image: editId.image || null,
      });
    }
  }, [editId]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  // Image BaseUrl-------

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.readAsDataURL(file);

      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // Handle Submit Form----

  const handleSubmit = async (e) => {
    e.preventDefault();

    const productsData = JSON.parse(localStorage.getItem("products")) || [];

    let imageData = formData.image;

    // New image select hui hai
    if (formData.image instanceof File) {
      imageData = await convertToBase64(formData.image);
    }

    const UpdatedData = productsData.map((item) =>
      item.id === editId.id
        ? {
            ...item,
            name: formData.name,
            sku: formData.sku,
            price: formData.price,
            stock: formData.stock,
            status: formData.status,
            image: imageData,
          }
        : item,
    );

    localStorage.setItem("products", JSON.stringify(UpdatedData));
    console.log(JSON.parse(localStorage.getItem("products")));

    setSuccess(true);

    setTimeout(() => {
      setEditShowForm(false);
    }, 1500);
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center animate-bounceIn">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaCheckCircle className="text-green-600 text-3xl" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Success!</h3>
          <p className="text-gray-600">Product has been edit successfully.</p>
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
                <h2 className="text-xl font-bold text-white">UpDate Product</h2>
                <p className="text-blue-100 text-sm">
                  Update product information and details
                </p>
              </div>
            </div>
            <button
              onClick={() => setEditShowForm(false)}
              className="text-white/80 hover:text-white transition"
            >
              <FaTimes className="text-xl" />
            </button>
          </div>
        </div>

        {/* Form Content */}

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
              placeholder="Enter product's name"
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
              value={formData.price}
              onChange={handleChange}
              placeholder="Enter product's price"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition `}
            />
            {errors.price && (
              <p className="text-red-500 text-xs mt-1">{errors.price}</p>
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
              <p className="text-red-500 text-xs mt-1">{errors.stock}</p>
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
              Category Image
            </label>

            {/* Hidden File Input */}
            <input
              type="file"
              id="imageUpload"
              name="image"
              accept="image/*"
              onChange={handleChange}
              className="hidden"
            />

            {/* Clickable Image */}
            <label htmlFor="imageUpload" className="cursor-pointer block">
              <img
                src={
                  formData.image
                    ? formData.image instanceof File
                      ? URL.createObjectURL(formData.image)
                      : formData.image
                    : "https://via.placeholder.com/400x200?text=Click+to+Upload"
                }
                alt="Preview"
                className="w-full h-40 object-cover rounded-lg border border-gray-300"
              />
            </label>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setEditShowForm(false)}
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
                <>Update Category</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductEditForm;
