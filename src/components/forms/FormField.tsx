
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface BaseFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  description?: string;
}

interface InputFieldProps extends BaseFieldProps {
  type?: "text" | "email" | "password" | "number" | "tel" | "date" | "url";
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name?: string;
}

interface TextareaFieldProps extends BaseFieldProps {
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  rows?: number;
}

interface SelectFieldProps extends BaseFieldProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}

export const InputField = ({ label, error, required, description, type = "text", name, placeholder, value, onChange }: InputFieldProps) => {
  const inputName = name || label.toLowerCase().replace(/\s+/g, '_');
  
  return (
    <div className="space-y-2">
      <Label htmlFor={inputName}>
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      {type === "password" ? (
        <PasswordInput
          id={inputName}
          name={inputName}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={error ? "border-red-500" : ""}
        />
      ) : (
        <Input 
          id={inputName}
          name={inputName}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={error ? "border-red-500" : ""}
        />
      )}
      {description && <p className="text-xs text-gray-500">{description}</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};

export const TextareaField = ({ label, error, required, description, ...textareaProps }: TextareaFieldProps) => {
  return (
    <div className="space-y-2">
      <Label>
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <Textarea 
        {...textareaProps}
        className={error ? "border-red-500" : ""}
      />
      {description && <p className="text-xs text-gray-500">{description}</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};

export const SelectField = ({ label, error, required, description, placeholder, value, onChange, options }: SelectFieldProps) => {
  return (
    <div className="space-y-2">
      <Label>
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className={error ? "border-red-500" : ""}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {description && <p className="text-xs text-gray-500">{description}</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};
