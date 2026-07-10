type InputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
};

export default function Input({
  label,
  value,
  onChange,
  type = "text",
}: InputProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm text-slate-300">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-600 bg-slate-900 p-3 outline-none focus:border-emerald-500"
      />
    </div>
  );
}