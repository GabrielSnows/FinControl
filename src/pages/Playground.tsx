import {
  ArrowRight,
  Download,
  Mail,
  Plus,
  Search,
  Trash2,
  WalletCards,
} from "lucide-react";

import { useState } from "react";

import { FinButton } from "../finui/Button";
import { FinInput } from "../finui/Input";
import { FinDatePicker } from "../finui/DatePicker";

export default function Playground() {

  const [selectedDate, setSelectedDate] =
  useState("");

  return (
    <div className="min-h-screen bg-[#09090b] px-4 py-8 text-zinc-50 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10">
          <p className="text-sm font-medium text-zinc-500">
            FinUI
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Component Playground
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
            Laboratório visual do Design System do
            FinControl 2.0.
          </p>
        </header>

        <div className="space-y-10">
          <ComponentGroup
            title="FinButton"
            description="Ações discretas, leves e consistentes."
          >
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
              <FinButton leftIcon={<Plus />}>
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
          </ComponentGroup>

          <ComponentGroup
            title="FinInput"
            description="Campos claros, silenciosos e fáceis de compreender."
          >
            <PlaygroundSection
              title="Campo básico"
              description="Label, placeholder e texto auxiliar."
            >
              <div className="grid w-full gap-5 md:grid-cols-2">
                <FinInput
                  label="Nome da conta"
                  placeholder="Ex.: Inter PJ"
                  helperText="Use um nome que diferencie esta conta."
                />

                <FinInput
                  label="Saldo inicial"
                  placeholder="0,00"
                  inputMode="decimal"
                />
              </div>
            </PlaygroundSection>

            <PlaygroundSection
              title="Com ícones"
              description="Ícones podem complementar o significado do campo."
            >
              <div className="grid w-full gap-5 md:grid-cols-2">
                <FinInput
                  label="Pesquisar"
                  placeholder="Buscar movimentação"
                  leftIcon={<Search />}
                />

                <FinInput
                  label="Conta"
                  placeholder="Selecione uma conta"
                  leftIcon={<WalletCards />}
                />

                <FinInput
                  label="E-mail"
                  type="email"
                  placeholder="nome@exemplo.com"
                  leftIcon={<Mail />}
                />

                <FinDatePicker
                  label="Data"
                  value={selectedDate}
                  onChange={setSelectedDate}
                  helperText="Clique para selecionar uma data."
                />
              </div>
            </PlaygroundSection>

            <PlaygroundSection
              title="Estados"
              description="Erro, preenchido e desabilitado."
            >
              <div className="grid w-full gap-5 md:grid-cols-2">
                <FinInput
                  label="Valor"
                  defaultValue="-20"
                  error="O valor não pode ser negativo."
                  inputMode="decimal"
                />

                <FinInput
                  label="Nome exibido"
                  defaultValue="Inter PF"
                  helperText="Este nome será mostrado no aplicativo."
                />

                <FinInput
                  label="Campo desabilitado"
                  defaultValue="Não pode ser alterado"
                  disabled
                />

                <FinInput
                  aria-label="Campo sem label"
                  placeholder="Campo sem label visível"
                />
              </div>
            </PlaygroundSection>
          </ComponentGroup>
        </div>
      </div>
    </div>
  );
}

type ComponentGroupProps = {
  title: string;
  description: string;
  children: React.ReactNode;
};

function ComponentGroup({
  title,
  description,
  children,
}: ComponentGroupProps) {
  return (
    <section>
      <div className="mb-5">
        <h2 className="text-xl font-semibold tracking-tight">
          {title}
        </h2>

        <p className="mt-1 text-sm text-zinc-500">
          {description}
        </p>
      </div>

      <div className="space-y-5">
        {children}
      </div>
    </section>
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
        <h3 className="text-base font-semibold">
          {title}
        </h3>

        <p className="mt-1 text-sm text-zinc-500">
          {description}
        </p>
      </div>

      <div className="flex flex-wrap items-start gap-3">
        {children}
      </div>
    </section>
  );
}