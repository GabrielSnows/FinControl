import {
  ArrowRight,
  Download,
  Plus,
  Trash2,
} from "lucide-react";

import { FinButton } from "../finui/Button";

export default function Playground() {
  return (
    <div className="min-h-screen bg-[#09090b] px-4 py-8 text-zinc-50 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10">
          <p className="text-sm font-medium text-zinc-500">
            FinUI
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            FinButton Playground
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
            Primeiro componente oficial do Design System do
            FinControl 2.0.
          </p>
        </header>

        <div className="space-y-6">
          <PlaygroundSection
            title="Variantes"
            description="As quatro aparências disponíveis."
          >
            <FinButton variant="primary">
              Primary
            </FinButton>

            <FinButton variant="secondary">
              Secondary
            </FinButton>

            <FinButton variant="ghost">
              Ghost
            </FinButton>

            <FinButton variant="destructive">
              Destructive
            </FinButton>
          </PlaygroundSection>

          <PlaygroundSection
            title="Tamanhos"
            description="Pequeno, médio e grande."
          >
            <FinButton size="sm">
              Pequeno
            </FinButton>

            <FinButton size="md">
              Médio
            </FinButton>

            <FinButton size="lg">
              Grande
            </FinButton>
          </PlaygroundSection>

          <PlaygroundSection
            title="Com ícones"
            description="Ícones Lucide mantêm tamanho e alinhamento consistentes."
          >
            <FinButton
              leftIcon={<Plus />}
            >
              Nova conta
            </FinButton>

            <FinButton
              variant="secondary"
              leftIcon={<Download />}
            >
              Exportar
            </FinButton>

            <FinButton
              variant="ghost"
              rightIcon={<ArrowRight />}
            >
              Continuar
            </FinButton>

            <FinButton
              variant="destructive"
              leftIcon={<Trash2 />}
            >
              Excluir
            </FinButton>
          </PlaygroundSection>

          <PlaygroundSection
            title="Estados"
            description="Carregamento, desabilitado e largura completa."
          >
            <FinButton loading>
              Salvando
            </FinButton>

            <FinButton disabled>
              Desabilitado
            </FinButton>

            <div className="w-full max-w-sm">
              <FinButton fullWidth>
                Botão com largura completa
              </FinButton>
            </div>
          </PlaygroundSection>
        </div>
      </div>
    </div>
  );
}

type PlaygroundSectionProps = {
  title: string;
  description: string;
  children: React.ReactNode;
};

function PlaygroundSection({
  title,
  description,
  children,
}: PlaygroundSectionProps) {
  return (
    <section className="rounded-2xl border border-zinc-800 bg-[#111113] p-5 sm:p-6">
      <div className="mb-6">
        <h2 className="text-base font-semibold">
          {title}
        </h2>

        <p className="mt-1 text-sm text-zinc-500">
          {description}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {children}
      </div>
    </section>
  );
}