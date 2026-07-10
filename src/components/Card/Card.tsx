type CardProps = {
  title: string;
  value: string;
  color?: string;
};

export default function Card({
  title,
  value,
  color = "text-white",
}: CardProps) {
  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-800 p-6 shadow-lg">
      <p className="text-sm text-slate-400">{title}</p>

      <h2 className={`mt-3 text-3xl font-bold ${color}`}>
        {value}
      </h2>
    </div>
  );
}