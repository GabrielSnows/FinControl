type InputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  min?: string;
  step?: string;
};

export default function Input({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  min,
  step,
}: InputProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-300">
        {label}
      </label>

      <input
        type={type}
        value={value}
        min={min}
        step={step}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-slate-600 bg-slate-900 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-500"
      />
    </div>
  );
}