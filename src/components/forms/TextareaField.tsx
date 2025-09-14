
import React from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface TextareaFieldProps {
  label: string;
  name?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  error?: string;
  rows?: number;
  required?: boolean;
  description?: string;
}

export const TextareaField = ({
  label,
  name,
  placeholder,
  value,
  onChange,
  error,
  rows = 3,
  required = false,
  description
}: TextareaFieldProps) => {
  const inputName = name || label.toLowerCase().replace(/\s+/g, '_');
  
  return (
    <div className="space-y-2">
      <Label htmlFor={inputName}>
        {label} {required && "*"}
      </Label>
      <Textarea
        id={inputName}
        name={inputName}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        rows={rows}
        className={error ? "border-red-500" : ""}
        required={required}
      />
      {description && (
        <p className="text-sm text-gray-500">{description}</p>
      )}
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};
