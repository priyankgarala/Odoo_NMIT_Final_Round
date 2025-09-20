import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { verifyOtp } from "../api/auth.js";

export default function VerifyOTP() {
  const [email, setEmail] = useState(""); // user email
  const [otp, setOtp] = useState("");

  const navigate = useNavigate();

  const handleVerifyOTP = async () => {
    try {
      const res = await verifyOtp(email, otp);
      navigate('/');
      console.log(res);
      // alert(res.data.message);
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert("OTP verification failed");
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 p-4">
      <h2 className="text-xl font-bold">Verify OTP</h2>
      <input
        type="email"
        placeholder="Enter email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border p-2 rounded"
      />
      <input
        type="text"
        placeholder="Enter OTP"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        className="border p-2 rounded"
      />
      <button onClick={handleVerifyOTP} className="bg-blue-600 text-white px-4 py-2 rounded">
        Verify OTP
      </button>
    </div>
  );
}
