"use client";

import React, { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

interface PinModalProps {
  onClose: () => void;
  onSubmit: (pin: string) => void;
}

const PinModal: React.FC<PinModalProps> = ({ onClose, onSubmit }) => {
  const [pin, setPin] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (/^\d{4}$/.test(pin.trim())) {
      onSubmit(pin.trim());
      return;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-sm border-2 bg-white p-6 shadow-lg">
        <h2 className="mb-2 text-lg font-semibold">Enter Card PIN</h2>
        <p className="mb-4 text-sm text-stone-600">
          Your card requires an additional authorization step before payment can continue.
        </p>
        <form onSubmit={handleSubmit}>
          <Input
            type="password"
            inputMode="numeric"
            maxLength={4}
            placeholder="4-digit PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
            required
          />
          <div className="mt-4 flex justify-end gap-2">
            <Button type="button" onClick={onClose} className="bg-gray-500">
              Cancel
            </Button>
            <Button type="submit">
              Continue
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PinModal;
