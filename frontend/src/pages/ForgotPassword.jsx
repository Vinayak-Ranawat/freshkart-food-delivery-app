// ForgotPassword.jsx
import axios from "axios";
import React, { useState } from "react";
import { TbArrowBigLeftLines } from "react-icons/tb";
import { useNavigate } from "react-router-dom";
import { serverUrl } from "../App";
import { ClipLoader } from "react-spinners";

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    setLoading(true);
    try {
      await axios.post(`${serverUrl}/api/auth/send-otp`, { email }, { withCredentials: true });
      setError(""); setStep(2); setLoading(false);
    } catch (error) { setError(error?.response?.data?.message); setLoading(false); }
  }

  const handleVerifyOtp = async () => {
    setLoading(true);
    try {
      await axios.post(`${serverUrl}/api/auth/verify-otp`, { email, otp }, { withCredentials: true });
      setError(""); setStep(3); setLoading(false);
    } catch (error) { setError(error?.response?.data?.message); setLoading(false); }
  }

  const handleResetPassword = async () => {
    if (newPassword != confirmPassword) return null;
    setLoading(true);
    try {
      await axios.post(`${serverUrl}/api/auth/reset-password`, { email, newPassword }, { withCredentials: true });
      setError(""); setLoading(false); navigate("/signin");
    } catch (error) { setError(error?.response?.data?.message); setLoading(true); }
  }

  const inputClass = "w-full px-4 py-2 border border-blue-100 rounded-xl shadow-sm text-sm focus:ring-2 focus:ring-blue-300 focus:outline-none bg-blue-50";
  const btnClass = "w-full py-2.5 bg-orange-500 text-white font-semibold text-base rounded-xl shadow-md hover:bg-orange-400 hover:scale-[1.02] transition-all duration-300";

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50 p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-md border border-blue-100 p-6 relative">
        <button onClick={() => navigate("/signin")} className="absolute left-4 top-4 text-blue-500 hover:text-blue-600 transition-colors duration-300">
          <TbArrowBigLeftLines size={28} />
        </button>
        <h1 className="text-2xl font-bold text-blue-600 text-center mb-6">Forgot Password</h1>

        {step === 1 && (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input type="email" placeholder="Enter your registered email" className={inputClass} onChange={(e) => setEmail(e.target.value)} value={email} />
            </div>
            <button type="button" onClick={handleSendOtp} className={btnClass} disabled={loading}>
              {loading ? <ClipLoader size={20} color="white" /> : "Send OTP"}
            </button>
            {error && <p className="text-red-500 text-center text-sm mt-1">⚠ {error}</p>}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Enter OTP</label>
              <input type="text" placeholder="Enter OTP" className={inputClass} onChange={(e) => setOtp(e.target.value)} value={otp} />
            </div>
            <button type="button" onClick={handleVerifyOtp} className={btnClass} disabled={loading}>
              {loading ? <ClipLoader size={20} color="white" /> : "Verify OTP"}
            </button>
            {error && <p className="text-red-500 text-center text-sm mt-1">⚠ {error}</p>}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input type="password" placeholder="Enter New Password" onChange={(e) => setNewPassword(e.target.value)} value={newPassword} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Verify New Password</label>
              <input type="password" placeholder="Verify New Password" className={inputClass} onChange={(e) => setConfirmPassword(e.target.value)} value={confirmPassword} />
            </div>
            <button type="button" className={btnClass} onClick={handleResetPassword} disabled={loading}>
              {loading ? <ClipLoader size={20} color="white" /> : "Reset Password"}
            </button>
            {error && <p className="text-red-500 text-center text-sm mt-1">⚠ {error}</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;