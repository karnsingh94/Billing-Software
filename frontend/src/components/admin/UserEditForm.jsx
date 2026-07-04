import { useEffect, useState } from "react";
import { FaCheckCircle, FaTimes, FaUserPlus } from "react-icons/fa";

const UserEditForm = ({ setEditShowForm, editData }) => {
  console.log(editData);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    image: null,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (editData) {
      setFormData({
        name: editData.name || "",
        email: editData.email || "",
        phone: editData.phone || "",
        joinDate: editData.joinDate || "",
        image: editData.image || null,
      });
    }
  }, [editData]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.readAsDataURL(file);

      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const categoryData = JSON.parse(localStorage.getItem("user")) || [];

    let imageData = formData.image;

    // New image select hui hai
    if (formData.image instanceof File) {
      imageData = await convertToBase64(formData.image);
    }

    const userData = categoryData.map((item) =>
      item.id === editData.id
        ? {
            ...item,
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            joinDate: formData.joinDate,
            image: imageData,
          }
        : item,
    );

    localStorage.setItem("user", JSON.stringify(userData));

    // console.log(JSON.parse(localStorage.getItem("user")));

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
          <p className="text-gray-600">User has been edit successfully.</p>
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
                <h2 className="text-xl font-bold text-white">upDate User</h2>
                <p className="text-blue-100 text-sm">
                  Create a new administrator account
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

        {/* -------------Form Content---------------- */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2">
              User Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
                value={formData.name}
                onChange={handleChange}
              placeholder="Enter user full name"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition `}
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2">
              User Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
                value={formData.email}
                onChange={handleChange}
              placeholder="user@gmail.com"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition `}
            />
            {errors.emai && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          {/* Phone number */}
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2">
              User Phone <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="phone"
                value={formData.phone}
                onChange={handleChange}
              placeholder="Enter user full name"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition `}
            />
            {errors.phone && (
              <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
            )}
          </div>

          {/* JoinDate */}
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2">
              JoinDate<span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="joinDate"
                value={formData.joinDate}
                onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition `}
            />
            {errors.joinDate && (
              <p className="text-red-500 text-xs mt-1">{errors.joinDate}</p>
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

export default UserEditForm;
