type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: "primary" | "secondary";
};

export default function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
}: ButtonProps) {
  const styles =
    variant === "primary"
      ? "bg-emerald-600 hover:bg-emerald-700 text-white"
      : "bg-slate-700 hover:bg-slate-600 text-white";

  return (
    <button
      type={type}
      onClick={onClick}
      className={`rounded-xl px-5 py-3 transition ${styles}`}
    >
      {children}
    </button>
  );
}