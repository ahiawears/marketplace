import React, { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

interface OtpModalProps {
  onClose: () => void;
  onSubmit: (otp: string) => void;
}

const OtpModal: React.FC<OtpModalProps> = ({ onClose, onSubmit }) => {
  const [otp, setOtp] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.trim()) {
      onSubmit(otp);
    } else {
      alert("Please enter a valid OTP.");
    }
  };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded shadow-lg w-96">
                <h2 className="text-lg font-semibold mb-4">Enter OTP</h2>
                <form onSubmit={handleSubmit}>
                    <Input
                        type="text"
                        placeholder="Enter OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        required
                    />
                    <div className="mt-4 flex justify-end gap-2">
                        <Button type="button" onClick={onClose} className="bg-gray-500">
                            Cancel
                        </Button>
                        <Button type="submit" className="bg-blue-500">
                            Submit
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default OtpModal;
