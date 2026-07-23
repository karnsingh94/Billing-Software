import { useEffect, useState } from "react";
import axios from "axios";
import {
  FaCheckCircle,
  FaTimes,
  FaUserPlus,
} from "react-icons/fa";

const API_URL = import.meta.env.VITE_API_URL;
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const ProductEditForm = ({
  setEditShowForm,
  editId,
}) => {
  const [formData, setFormData] = useState({
    productName: "",
    gst: "",
    productPrice: "",
    stock: "",
    productImage: null,

    /*
    Selling price hata diya hai,
    delete nahi kiya, sirf comment kiya hai.

    sellingPrice: "",
    */

    /*
    Purane fields delete nahi kiye,
    sirf comment kiye hain.

    name: "",
    sku: "",
    status: "",
    price: "",
    role: "admin",
    image: null,
    */
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] =
    useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (editId) {
      setFormData({
        productName: editId.productName || "",
        gst: editId.gst ?? "",
        productPrice: editId.productPrice ?? "",
        stock: editId.stock ?? "",
        productImage: editId.productImage || null,

        /*
        Selling price hata diya hai.

        sellingPrice: editId.sellingPrice ?? "",
        */

        /*
        Purane edit fields:

        name: editId.name || "",
        sku: editId.sku || "",
        price: editId.price || "",
        status: editId.status || "",
        image: editId.image || null,
        */
      });
    }
  }, [editId]);

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

    if (!formData.productName.trim()) {
      newErrors.productName =
        "Product name is required";
    } else if (
      formData.productName.trim().length < 3
    ) {
      newErrors.productName =
        "Product name must be at least 3 characters";
    }

    if (formData.gst === "") {
      newErrors.gst = "GST is required";
    } else if (Number(formData.gst) < 0) {
      newErrors.gst =
        "GST cannot be negative";
    }

    if (formData.productPrice === "") {
      newErrors.productPrice =
        "Product price is required";
    } else if (
      Number(formData.productPrice) <= 0
    ) {
      newErrors.productPrice =
        "Product price must be greater than 0";
    }

    /*
    Selling price validation hata di hai.

    if (formData.sellingPrice === "") {
      newErrors.sellingPrice =
        "Selling price is required";
    } else if (
      Number(formData.sellingPrice) <= 0
    ) {
      newErrors.sellingPrice =
        "Selling price must be greater than 0";
    }
    */

    if (formData.stock === "") {
      newErrors.stock = "Stock is required";
    } else if (Number(formData.stock) < 0) {
      newErrors.stock =
        "Stock cannot be negative";
    }

    /*
    Update ke time image change karna optional hai.

    if (!formData.productImage) {
      newErrors.productImage =
        "Product image is required";
    }
    */

    /*
    Purani validation:

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.sku) {
      newErrors.sku = "SKU is required";
    }

    if (!formData.price) {
      newErrors.price = "Price is required";
    }

    if (!formData.status) {
      newErrors.status = "Status is required";
    }
    */

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  /*
  Purana Base64 function delete nahi kiya,
  sirf comment kiya hai.

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.readAsDataURL(file);

      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };
  */

  // Existing ya selected image ka preview
  const getImagePreview = () => {
    if (!formData.productImage) {
      return "https://placehold.co/400x200?text=Click+to+Upload";
    }

    if (formData.productImage instanceof File) {
      return URL.createObjectURL(
        formData.productImage
      );
    }

    if (
      typeof formData.productImage === "string" &&
      formData.productImage.startsWith("http")
    ) {
      return formData.productImage;
    }

    return `${BACKEND_URL}/${formData.productImage}`;
  };

  // Handle Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!editId?.id) {
      alert("Product ID nahi mila");
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();

      formDataToSend.append(
        "productName",
        formData.productName.trim()
      );

      formDataToSend.append(
        "gst",
        formData.gst
      );

      formDataToSend.append(
        "productPrice",
        formData.productPrice
      );

      /*
      Selling price API payload se hata diya hai.

      formDataToSend.append(
        "sellingPrice",
        formData.sellingPrice
      );
      */

      formDataToSend.append(
        "stock",
        formData.stock
      );

      // Sirf nayi image select hone par file bhejenge
      if (
        formData.productImage instanceof File
      ) {
        formDataToSend.append(
          "productImage",
          formData.productImage
        );
      }

      /*
      Purane fields API me nahi bhejne:

      formDataToSend.append(
        "name",
        formData.name
      );

      formDataToSend.append(
        "sku",
        formData.sku
      );

      formDataToSend.append(
        "price",
        formData.price
      );

      formDataToSend.append(
        "status",
        formData.status
      );

      formDataToSend.append(
        "image",
        formData.image
      );
      */

      const token =
        localStorage.getItem("accessToken");

      if (!token) {
        alert(
          "Token nahi mila. Dobara login karo."
        );

        setIsSubmitting(false);
        return;
      }

      const response = await axios.put(
        `${API_URL}/products/update-product/${editId.id}`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(
        "Product Updated:",
        response.data
      );

      /*
      Purana localStorage update code
      delete nahi kiya, sirf comment kiya hai.

      const productsData =
        JSON.parse(
          localStorage.getItem("products")
        ) || [];

      let imageData = formData.image;

      if (formData.image instanceof File) {
        imageData = await convertToBase64(
          formData.image
        );
      }

      const UpdatedData = productsData.map(
        (item) =>
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
            : item
      );

      localStorage.setItem(
        "products",
        JSON.stringify(UpdatedData)
      );
      */

      setSuccess(true);

      setTimeout(() => {
        setIsSubmitting(false);
        setSuccess(false);
        setEditShowForm(false);
      }, 1500);
    } catch (error) {
      console.error(
        "Update Product Error:",
        error.response?.data ||
          error.message
      );

      alert(
        error.response?.data?.message ||
          "Product update nahi hua"
      );

      setIsSubmitting(false);
    }
  };

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
            Product has been updated successfully.
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
                  Update Product
                </h2>

                <p className="text-sm text-blue-100">
                  Update product information and details
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                setEditShowForm(false)
              }
              className="text-white/80 transition hover:text-white"
            >
              <FaTimes className="text-xl" />
            </button>
          </div>
        </div>

        {/* Form Content */}
        <form
          onSubmit={handleSubmit}
          className="space-y-4 p-6"
        >
          {/* Product Name */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Product Name{" "}
              <span className="text-red-500">
                *
              </span>
            </label>

            <input
              type="text"
              name="productName"
              value={formData.productName}
              onChange={handleChange}
              placeholder="Enter product name"
              className="w-full rounded-lg border px-4 py-2 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {errors.productName && (
              <p className="mt-1 text-xs text-red-500">
                {errors.productName}
              </p>
            )}
          </div>

          {/* GST */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              GST Percentage{" "}
              <span className="text-red-500">
                *
              </span>
            </label>

            <input
              type="number"
              name="gst"
              value={formData.gst}
              onChange={handleChange}
              placeholder="Enter GST percentage"
              min="0"
              step="0.01"
              className="w-full rounded-lg border px-4 py-2 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {errors.gst && (
              <p className="mt-1 text-xs text-red-500">
                {errors.gst}
              </p>
            )}
          </div>

          {/* Product Price */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Product Price{" "}
              <span className="text-red-500">
                *
              </span>
            </label>

            <input
              type="number"
              name="productPrice"
              value={formData.productPrice}
              onChange={handleChange}
              placeholder="Enter product price"
              min="0"
              step="0.01"
              className="w-full rounded-lg border px-4 py-2 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {errors.productPrice && (
              <p className="mt-1 text-xs text-red-500">
                {errors.productPrice}
              </p>
            )}
          </div>

          {/*
          Selling Price input hata diya hai,
          delete nahi kiya, sirf comment kiya hai.

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Selling Price
              <span className="text-red-500">*</span>
            </label>

            <input
              type="number"
              name="sellingPrice"
              value={formData.sellingPrice}
              onChange={handleChange}
              placeholder="Enter selling price"
              min="0"
              step="0.01"
              className="w-full rounded-lg border px-4 py-2 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {errors.sellingPrice && (
              <p className="mt-1 text-xs text-red-500">
                {errors.sellingPrice}
              </p>
            )}
          </div>
          */}

          {/* Stock */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Product Stock{" "}
              <span className="text-red-500">
                *
              </span>
            </label>

            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              placeholder="Enter product stock"
              min="0"
              step="1"
              className="w-full rounded-lg border px-4 py-2 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {errors.stock && (
              <p className="mt-1 text-xs text-red-500">
                {errors.stock}
              </p>
            )}
          </div>

          {/*
          Purane form inputs delete nahi kiye,
          sirf comment kiye hain.

          <div>
            <label>SKU</label>

            <input
              type="text"
              name="sku"
              value={formData.sku}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Price</label>

            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Status</label>

            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="">
                Select Status
              </option>

              <option value="Active">
                Active
              </option>

              <option value="Inactive">
                Inactive
              </option>
            </select>
          </div>
          */}

          {/* Product Image */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Product Image
            </label>

            <input
              type="file"
              id="productImageUpload"
              name="productImage"
              accept="image/*"
              onChange={handleChange}
              className="hidden"
            />

            <label
              htmlFor="productImageUpload"
              className="block cursor-pointer"
            >
              <img
                src={getImagePreview()}
                alt="Product Preview"
                className="h-40 w-full rounded-lg border border-gray-300 object-cover"
              />
            </label>

            <p className="mt-1 text-xs text-gray-500">
              Image change karne ke liye image par click karein.
            </p>

            {errors.productImage && (
              <p className="mt-1 text-xs text-red-500">
                {errors.productImage}
              </p>
            )}

            {/*
            Purana image field:

            <input
              type="file"
              id="imageUpload"
              name="image"
              accept="image/*"
              onChange={handleChange}
            />

            <img
              src={formData.image}
              alt="Preview"
            />
            */}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() =>
                setEditShowForm(false)
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
                  Updating...
                </>
              ) : (
                <>Update Product</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductEditForm;