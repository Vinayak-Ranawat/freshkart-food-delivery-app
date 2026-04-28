import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from "react-router-dom";
import { serverUrl } from "../App";
import axios from "axios";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../firebase";
import { ClipLoader } from "react-spinners";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";

export default function SignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("user");
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const handleSignUp = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const result = await axios.post(`${serverUrl}/api/auth/signup`, {
        fullName, email, password, mobile, role
      }, { withCredentials: true });
      dispatch(setUserData(result.data));
      setError("");
    } catch (error) {
      setError(error?.response?.data?.message);
    } finally {
      setLoading(false);
    }
  }

  const handleGoogleAuth = async () => {
    if (!mobile) return setError("Mobile number is required");
    if (loading) return;
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const { data } = await axios.post(`${serverUrl}/api/auth/google-auth`, {
        fullName: result.user.displayName, email: result.user.email, role, mobile
      }, { withCredentials: true });
      dispatch(setUserData(data));
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-md p-8">

        <div className="flex justify-center mb-6">
          <h1 className="text-3xl font-bold text-blue-600 tracking-wide">FreshKart</h1>
        </div>

        <h2 className="text-lg font-semibold text-gray-800 text-center mb-6">
          Create Your Account
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input type="text" placeholder="John Doe"
              className="w-full px-4 py-3 border border-blue-100 rounded-xl text-sm bg-blue-50 focus:ring-2 focus:ring-blue-300 focus:outline-none"
              onChange={(e) => setFullName(e.target.value)} value={fullName} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" placeholder="you@example.com"
              className="w-full px-4 py-3 border border-blue-100 rounded-xl text-sm bg-blue-50 focus:ring-2 focus:ring-blue-300 focus:outline-none"
              onChange={(e) => setEmail(e.target.value)} value={email} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mobile</label>
            <input type="tel" placeholder="+91 9876543210"
              className="w-full px-4 py-3 border border-blue-100 rounded-xl text-sm bg-blue-50 focus:ring-2 focus:ring-blue-300 focus:outline-none"
              onChange={(e) => setMobile(e.target.value)} value={mobile} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} placeholder="********"
                className="w-full px-4 py-3 border border-blue-100 rounded-xl text-sm bg-blue-50 focus:ring-2 focus:ring-blue-300 focus:outline-none"
                onChange={(e) => setPassword(e.target.value)} value={password} />
              <span
                className="absolute right-3 top-3.5 text-gray-400 cursor-pointer select-none"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setShowPassword(prev => !prev)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>

          <div className="flex space-x-2">
            {["user", "owner", "deliveryBoy"].map((r) => (
              <button key={r} type="button" onClick={() => setRole(r)}
                className={`px-3 py-1.5 text-sm rounded-xl font-medium transition-all duration-300
                  ${role === r
                    ? "bg-orange-500 text-white scale-105"
                    : "bg-transparent border border-blue-300 text-blue-600 hover:bg-blue-500 hover:text-white hover:scale-105"}`}
              >
                {r}
              </button>
            ))}
          </div>

          <button
            className="w-full py-3 bg-orange-500 hover:bg-orange-400 text-white font-semibold text-sm rounded-xl shadow-md transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={handleSignUp}
            disabled={loading}>
            {loading ? <ClipLoader size={20} color="white" /> : "Sign Up"}
          </button>

          {error && <p className="text-red-500 text-center text-sm">⚠ {error}</p>}

          <button
            className="w-full flex items-center justify-center gap-2 py-3 bg-white text-gray-800 font-medium text-sm rounded-xl border border-gray-200 hover:bg-gray-50 shadow-sm transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={handleGoogleAuth}
            disabled={loading}>
            <FcGoogle className="text-xl" />
            <span>Sign Up with Google</span>
          </button>
        </div>

        <p className="text-sm text-gray-500 text-center mt-6">
          Already have an account?{" "}
          <span className="text-orange-500 font-medium cursor-pointer hover:underline"
            onClick={() => navigate("/signin")}>
            Sign In
          </span>
        </p>
      </div>
    </div>
  );
}