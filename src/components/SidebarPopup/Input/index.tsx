import { Input } from "@/components/ui/input";

interface PopupInputProps {
  placeholder: string;
  value?: string;
  className?: string;
  onChange: (value: string) => void;
}

const PopupInput = ({ placeholder, className, value, onChange }: PopupInputProps) => {
  return (
    <Input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`mb-4 ${className ?? ""}`}
    />
  );
};

export default PopupInput;