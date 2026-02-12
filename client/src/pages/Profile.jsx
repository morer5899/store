import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useForm } from "react-hook-form";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

export default function Profile() {
  const { updatePassword, axiosInstance } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm();

  const newPassword = watch("newPassword");

  // ✅ Strong Password Regex (same as backend)
  const passwordRegex =
    /^(?=.*[A-Z])(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axiosInstance.get("/auth/profile");
        setProfile(response.data.data);
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [axiosInstance]);

  const onSubmit = async (data) => {
    setMessage({ type: "", text: "" });
    setLoading(true);

    const result = await updatePassword({
      newPassword: data.newPassword,
    });

    if (result.success) {
      setMessage({ type: "success", text: "Password updated successfully!" });
      reset();
    } else {
      setMessage({ type: "error", text: result.message });
    }

    setLoading(false);
  };

  if (loadingProfile) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin h-10 w-10 border-b-2 border-primary-600 rounded-full"></div>
      </div>
    );
  }

  const inputStyle =
    "w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none";

  return (
    <div className="max-w-4xl mx-auto px-4">
      <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
      <p className="text-sm text-gray-600">
        Manage your account settings
      </p>

      <div className="mt-8 bg-white shadow-sm border border-gray-200 rounded-xl p-8">

        {/* Personal Info */}
        <div className="mb-12">
          <h3 className="text-lg font-semibold border-b pb-3">
            Personal Information
          </h3>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                type="text"
                value={profile?.name || ""}
                disabled
                className={`${inputStyle} bg-gray-50 text-gray-600`}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                value={profile?.email || ""}
                disabled
                className={`${inputStyle} bg-gray-50 text-gray-600`}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-gray-700">
                Role
              </label>
              <input
                type="text"
                value={profile?.role || ""}
                disabled
                className={`${inputStyle} bg-gray-50 text-gray-600`}
              />
            </div>
          </div>
        </div>

        {/* Password Section */}
        <div>
          <h3 className="text-lg font-semibold border-b pb-3">
            Update Password
          </h3>

          {message.text && (
            <div
              className={`mt-4 p-3 rounded-lg text-sm ${
                message.type === "success"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6">

            {/* New Password */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                New Password
              </label>

              <div className="relative mt-2">
                <input
                  type={showNewPassword ? "text" : "password"}
                  {...register("newPassword", {
                    required: "New password is required",
                    pattern: {
                      value: passwordRegex,
                      message:
                        "Password must be 8-16 characters, include one uppercase and one special character",
                    },
                  })}
                  className={`${inputStyle} ${
                    errors.newPassword
                      ? "border-red-500 focus:ring-red-500"
                      : ""
                  }`}
                />

                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-2.5"
                >
                  {showNewPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-500" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-500" />
                  )}
                </button>
              </div>

              {errors.newPassword && (
                <p className="text-sm text-red-600 mt-2">
                  {errors.newPassword.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Confirm New Password
              </label>

              <div className="relative mt-2">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  {...register("confirmNewPassword", {
                    required: "Please confirm your password",
                    validate: (value) =>
                      value === newPassword ||
                      "Passwords do not match",
                  })}
                  className={`${inputStyle} ${
                    errors.confirmNewPassword
                      ? "border-red-500 focus:ring-red-500"
                      : ""
                  }`}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  className="absolute right-3 top-2.5"
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-500" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-500" />
                  )}
                </button>
              </div>

              {errors.confirmNewPassword && (
                <p className="text-sm text-red-600 mt-2">
                  {errors.confirmNewPassword.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-primary-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-700 transition disabled:opacity-50"
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
