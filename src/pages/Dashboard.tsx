import Card from "../components/Card/Card";

export default function Dashboard() {
  return (
    <div>

      <h1 className="mb-8 text-4xl font-bold">
        Dashboard
      </h1>

      <div className="grid gap-5 lg:grid-cols-3">

        <Card
          title="Saldo Total"
          value="R$ 0,00"
        />

        <Card
          title="Receitas"
          value="R$ 0,00"
          color="text-green-400"
        />

        <Card
          title="Despesas"
          value="R$ 0,00"
          color="text-red-400"
        />

      </div>

      <div className="mt-8 rounded-2xl border border-slate-700 bg-slate-800 p-6">

        <h2 className="text-xl font-semibold">
          Contas
        </h2>

        <p className="mt-4 text-slate-400">
          Nenhuma conta cadastrada.
        </p>

      </div>

    </div>
  );
}