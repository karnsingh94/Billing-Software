import { useEffect, useState } from "react";
import { User, Shield, Eye, EyeOff } from "lucide-react";

const Profile = () => {
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });

  useEffect(() => {
    const localData = JSON.parse(localStorage.getItem("currentUser"));

    if (localData) {
      setFormData({
        name: localData.name || "",
        email: localData.email || "",
        phone: localData.phone || "",
      });
    }
  }, []);

  const handleChange = (e) => {
  const { name, value } = e.target;

  setFormData((prev) => ({
    ...prev,
    [name]: value,
  }));
};


const handleProfileUpdate = () => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  const updatedUser = {
    ...currentUser,
    name: formData.name,
    email: formData.email,
    phone: formData.phone,
  };

  localStorage.setItem("currentUser", JSON.stringify(updatedUser));

  alert("Profile Updated Successfully");
};


  return (
    <div className="p-2">
      {/* Header */}
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your administrator account.</p>
      </div>

      {/* Personal Info */}
      <div className="sm:grid sm:grid-cols-12 gap-10 mt-5 sm:mt-10">
        <div className=" sm:col-span-3  ">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <User size={18} className="text-blue-600" />
            Personal Info
          </h2>

          <p className="text-sm text-gray-500 mt-2  ">
            Update your account's primary contact information.
          </p>
        </div>

        <div className="sm:col-span-9 bg-white border border-gray-300 rounded-xl mt-5 sm:mt-0 overflow-hidden">
          <div className="p-6">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Full Name
              </label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full mt-2 border border-gray-300 rounded-md px-3 py-2"
              />
            </div>

            <div className="sm:grid grid-cols-2 gap-5 sm:mt-6">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Email
                </label>

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                 onChange={handleChange}
                  className="w-full mt-2 border border-gray-300  rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Phone
                </label>

                <input
                  type="text"
                   name="phone"
                  value={formData.phone}
                onChange={handleChange}
                  className="w-full mt-2 border border-gray-300  rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-300 bg-gray-50 px-6 py-3 flex justify-end">
            <button  onClick={handleProfileUpdate} className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-2 rounded-full text-sm font-medium">
              Save Profile
            </button>
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="sm:grid sm:grid-cols-12 gap-10 mt-10">
        <div className="sm:col-span-3">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <Shield size={18} className="text-orange-500" />
            Security
          </h2>

          <p className="text-sm text-gray-500 mt-2">
            Ensure your account uses a secure password.
          </p>
        </div>

        <div className="sm:col-span-9 bg-white border border-gray-300  rounded-xl mt-5 sm:mt-0 overflow-hidden">
          <div className="p-6">
            {/* Current Password */}
            <div className="relative">
              <label className="text-sm font-medium text-gray-700">
                Current Password
              </label>

              <input
                type={showCurrentPass ? "text" : "password"}
                className="w-full mt-2 border border-gray-300  rounded-md px-3 py-2 pr-10 outline-none focus:ring-2 focus:ring-blue-500"
              />

              <button
                type="button"
                onClick={() => setShowCurrentPass(!showCurrentPass)}
                className="absolute right-3 top-11 text-gray-400 hover:text-gray-600"
              >
                {showCurrentPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="sm:grid grid-cols-2 gap-5 sm:mt-6">
              {/* New Password */}
              <div className="relative">
                <label className="text-sm font-medium text-gray-700">
                  New Password
                </label>

                <input
                  type={showNewPass ? "text" : "password"}
                  className="w-full mt-2 border border-gray-300  rounded-md px-3 py-2 pr-10 outline-none focus:ring-2 focus:ring-blue-500"
                />

                <button
                  type="button"
                  onClick={() => setShowNewPass(!showNewPass)}
                  className="absolute right-3 top-11 text-gray-400 hover:text-gray-600"
                >
                  {showNewPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Confirm Password */}
              <div className="relative">
                <label className="text-sm font-medium text-gray-700">
                  Confirm Password
                </label>

                <input
                  type={showConfirmPass ? "text" : "password"}
                  className="w-full mt-2 border border-gray-300  rounded-md px-3 py-2 pr-10 outline-none focus:ring-2 focus:ring-blue-500"
                />

                <button
                  type="button"
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                  className="absolute right-3 top-11 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-300 bg-gray-50 px-6 py-3 flex justify-end">
            <button className="bg-slate-900 hover:bg-black text-white px-6 py-2 rounded-full text-sm font-medium">
              Change Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
