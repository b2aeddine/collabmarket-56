
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface InputFieldProps {
  label: string;
  type?: "text" | "email" | "password" | "tel" | "number" | "date" | "url";
  name?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
}

export const InputField = ({
  label,
  type = "text",
  name,
  placeholder,
  value,
  onChange,
  error,
  description,
  required = false,
  disabled = false
}: InputFieldProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={name} className="text-sm font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <Input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={error ? "border-red-500" : ""}
      />
      {description && (
        <p className="text-sm text-gray-600">{description}</p>
      )}
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};
