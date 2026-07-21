import { useEffect, useState } from "react";
import {
  FaCheckCircle,
  FaTimes,
  FaUserPlus,
} from "react-icons/fa";

const API_URL = import.meta.env.VITE_API_URL;

const AllEditForm = ({
  setEditShowForm,
  editData,
  onAdminUpdated,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [success, setSuccess] =
    useState(false);

  useEffect(() => {
    if (editData) {
      setFormData({
        name: editData.fullName || "",
        email: editData.email || "",
        phone: editData.phone || "",
        location: editData.location || "",
      });
    }
  }, [editData]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim())
      newErrors.name = "Name is required";

    if (!formData.email.trim())
      newErrors.email = "Email is required";

    if (!formData.phone.trim())
      newErrors.phone = "Phone is required";

    if (!formData.location.trim())
      newErrors.location =
        "Location is required";

    setErrors(newErrors);

    return (
      Object.keys(newErrors).length === 0
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      setIsSubmitting(true);

      const token =
        localStorage.getItem("accessToken");

      const response = await fetch(
        `${API_URL}/auth/admin/${editData.id}`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",
            Authorization: `Bearer ${token}`,
          },

          credentials: "include",

          body: JSON.stringify({
            fullName: formData.name,
            email: formData.email,
            phone: formData.phone,
            location: formData.location,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setSuccess(true);

      if (!response.ok) {
        throw new Error(data.message);
      }

      alert("Admin updated successfully");

      window.location.reload();
    } catch (error) {
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
        <div className="bg-white rounded-xl p-8 text-center">
          <FaCheckCircle className="text-green-600 text-5xl mx-auto mb-3" />

          <h2 className="text-2xl font-bold">
            Success
          </h2>

          <p>
            Admin updated successfully.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full">

        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-5 rounded-t-xl flex justify-between items-center">

          <div className="flex items-center gap-3">
            <FaUserPlus className="text-white text-2xl" />

            <h2 className="text-white text-xl font-bold">
              Update Admin
            </h2>
          </div>

          <button
            onClick={() =>
              setEditShowForm(false)
            }
          >
            <FaTimes className="text-white text-xl" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-4"
        >
          <div>
            <label>Name</label>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border rounded-lg p-2"
            />

            <p className="text-red-500 text-sm">
              {errors.name}
            </p>
          </div>

          <div>
            <label>Email</label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border rounded-lg p-2"
            />

            <p className="text-red-500 text-sm">
              {errors.email}
            </p>
          </div>

          <div>
            <label>Phone</label>

            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full border rounded-lg p-2"
            />

            <p className="text-red-500 text-sm">
              {errors.phone}
            </p>
          </div>

          <div>
            <label>Location</label>

            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full border rounded-lg p-2"
            />

            <p className="text-red-500 text-sm">
              {errors.location}
            </p>
          </div>

          <div className="flex gap-3 pt-3">

            <button
              type="button"
              onClick={() =>
                setEditShowForm(false)
              }
              className="flex-1 border rounded-lg py-2"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 text-white rounded-lg py-2"
            >
              {isSubmitting
                ? "Updating..."
                : "Update"}
            </button>

          </div>
        </form>
      </div>
    </div>
  );
};

export default AllEditForm;