import {
  ArrowRight,
  Building2,
  Car,
  Download,
  Dumbbell,
  GraduationCap,
  House,
  Mail,
  Plus,
  Search,
  ShoppingCart,
  Trash2,
  WalletCards,
} from "lucide-react";

import {
  FinCard,
  FinCardContent,
  FinCardDescription,
  FinCardFooter,
  FinCardHeader,
  FinCardTitle,
} from "../finui/Card";

import {
  FinModal,
  FinModalContent,
  FinModalDescription,
  FinModalFooter,
  FinModalHeader,
  FinModalTitle,
} from "../finui/Modal";

import {
  useFinToast,
} from "../finui/Toast";

import { useState } from "react";

import { FinButton } from "../finui/Button";
import { FinInput } from "../finui/Input";
import { FinDatePicker } from "../finui/DatePicker";
import { FinSelect } from "../finui/Select";

import type { FinSelectOption } from "../finui/Select";

const accountOptions: FinSelectOption[] = [
  {
    value: "inter-pf",
    label: "Inter PF",
    description: "Conta pessoal",
    icon: <WalletCards />,
  },
  {
    value: "inter-pj",
    label: "Inter PJ",
    description: "Conta da empresa",
    icon: <Building2 />,
  },
  {
    value: "carteira",
    label: "Carteira",
    description: "Dinheiro em espécie",
    icon: <WalletCards />,
  },
];

const categoryOptions: FinSelectOption[] = [
  {
    value: "mercado",
    label: "Mercado",
    icon: <ShoppingCart />,
  },
  {
    value: "carro",
    label: "Carro",
    icon: <Car />,
  },
  {
    value: "casa",
    label: "Casa",
    icon: <House />,
  },
  {
    value: "academia",
    label: "Academia",
    icon: <Dumbbell />,
  },
  {
    value: "estudos",
    label: "Estudos",
    icon: <GraduationCap />,
  },
];

export default function Playground() {

  const [selectedDate, setSelectedDate] =
  useState("");

  const [selectedAccount, setSelectedAccount] =
  useState("");

  const [selectedCategory, setSelectedCategory] =
  useState("");

  const [selectedSimpleCategory, setSelectedSimpleCategory] =
  useState("");

  const [modalOpen, setModalOpen] =
  useState(false);

  const { showToast } = useFinToast();

  return (
    <div className="min-h-screen bg-[#09090b] px-4 py-8 text-zinc-50 sm:px-6 lg:px-10">
      <div className="mx-auto w-full max-w-6xl overflow-x-hidden">
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

        <div className="w-full space-y-10">
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

          <ComponentGroup
            title="FinSelect"
            description="Seleção personalizada com pesquisa e navegação pelo teclado."
          >
            <PlaygroundSection
              title="Seleção de conta"
              description="Opções com ícone, descrição e pesquisa."
            >
              <div className="grid w-full gap-5 md:grid-cols-2">
                <FinSelect
                  label="Conta"
                  value={selectedAccount}
                  options={accountOptions}
                  onChange={(newValue) =>
                    setSelectedAccount(newValue)
                  }
                  placeholder="Selecione uma conta"
                  searchPlaceholder="Pesquisar conta..."
                  helperText="Escolha a conta afetada pela movimentação."
                />

                <FinSelect
                  label="Categoria"
                  value={selectedCategory}
                  options={categoryOptions}
                  onChange={(newValue) =>
                    setSelectedCategory(newValue)
                  }
                  placeholder="Selecione uma categoria"
                  searchPlaceholder="Pesquisar categoria..."
                />
              </div>
            </PlaygroundSection>

            <PlaygroundSection
              title="Estados"
              description="Erro, desabilitado e sem pesquisa."
            >
              <div className="grid w-full gap-5 md:grid-cols-2">
                <FinSelect
                  label="Categoria obrigatória"
                  value=""
                  options={categoryOptions}
                  onChange={() => undefined}
                  placeholder="Selecione uma categoria"
                  error="Selecione uma categoria."
                />

                <FinSelect
                  label="Campo desabilitado"
                  value="inter-pf"
                  options={accountOptions}
                  onChange={() => undefined}
                  disabled
                />

                <FinSelect
                  label="Lista simples"
                  value={selectedSimpleCategory}
                  options={categoryOptions}
                  onChange={(newValue) =>
                    setSelectedSimpleCategory(newValue)
                  }
                  searchable={false}
                />              
              </div>
            </PlaygroundSection>
          </ComponentGroup>

          <ComponentGroup
            title="FinCard"
            description="Superfícies leves para organizar informações sem pesar a interface."
          >
            <PlaygroundSection
              title="Cards financeiros"
              description="Exemplos de uso no Dashboard e nas telas principais."
            >
              <div className="grid w-full gap-5 md:grid-cols-2 xl:grid-cols-3">
                <FinCard>
                  <FinCardHeader>
                    <FinCardDescription>
                      Saldo disponível
                    </FinCardDescription>
                  </FinCardHeader>

                  <FinCardContent>
                    <strong className="block text-3xl font-semibold tracking-tight text-zinc-50">
                      R$ 4.280,00
                    </strong>

                    <p className="mt-2 text-sm text-zinc-500">
                      Atualizado hoje
                    </p>
                  </FinCardContent>
                </FinCard>

                <FinCard variant="subtle">
                  <FinCardHeader>
                    <FinCardTitle>
                      Resumo do mês
                    </FinCardTitle>

                    <FinCardDescription>
                      Receitas e despesas registradas.
                    </FinCardDescription>
                  </FinCardHeader>

                  <FinCardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-sm text-zinc-500">
                          Receitas
                        </span>

                        <strong className="font-medium text-zinc-100">
                          R$ 3.200,00
                        </strong>
                      </div>

                      <div className="flex items-center justify-between gap-4">
                        <span className="text-sm text-zinc-500">
                          Despesas
                        </span>

                        <strong className="font-medium text-zinc-100">
                          R$ 1.870,00
                        </strong>
                      </div>
                    </div>
                  </FinCardContent>
                </FinCard>

                <FinCard variant="interactive">
                  <FinCardHeader>
                    <FinCardTitle>
                      Inter PJ
                    </FinCardTitle>

                    <FinCardDescription>
                      Conta empresarial
                    </FinCardDescription>
                  </FinCardHeader>

                  <FinCardContent>
                    <strong className="block text-2xl font-semibold text-zinc-50">
                      R$ 1.250,00
                    </strong>
                  </FinCardContent>

                  <FinCardFooter>
                    <span className="text-sm text-zinc-500">
                      Clique para visualizar
                    </span>
                  </FinCardFooter>
                </FinCard>
              </div>
            </PlaygroundSection>

            <PlaygroundSection
              title="Com ações"
              description="Cards também podem receber botões e controles no rodapé."
            >
              <div className="w-full max-w-xl">
                <FinCard>
                  <FinCardHeader>
                    <FinCardTitle>
                      Backup dos dados
                    </FinCardTitle>

                    <FinCardDescription>
                      Exporte uma cópia das suas informações.
                    </FinCardDescription>
                  </FinCardHeader>

                  <FinCardContent>
                    <p className="text-sm leading-6 text-zinc-400">
                      O arquivo inclui contas, movimentações,
                      dívidas e objetivos.
                    </p>
                  </FinCardContent>

                  <FinCardFooter className="justify-end">
                    <FinButton variant="secondary">
                      Cancelar
                    </FinButton>

                    <FinButton>
                      Exportar backup
                    </FinButton>
                  </FinCardFooter>
                </FinCard>
              </div>
            </PlaygroundSection>
          </ComponentGroup>

          <ComponentGroup
            title="FinModal"
            description="Diálogos fluidos, acessíveis e adaptados ao celular."
          >
            <PlaygroundSection
              title="Modal básico"
              description="Exemplo com formulário e ações."
            >
              <FinButton
                onClick={() => setModalOpen(true)}
              >
                Abrir modal
              </FinButton>

              <FinModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
              >
                <FinModalHeader>
                  <FinModalTitle>
                    Nova conta
                  </FinModalTitle>

                  <FinModalDescription>
                    Cadastre uma nova conta no FinControl.
                  </FinModalDescription>
                </FinModalHeader>

                <FinModalContent>
                  <div className="space-y-5">
                    <FinInput
                      label="Nome exibido"
                      placeholder="Ex.: Inter PJ"
                    />

                    <FinSelect
                      label="Tipo de conta"
                      value=""
                      options={[
                        {
                          value: "bank",
                          label: "Conta bancária",
                        },
                        {
                          value: "wallet",
                          label: "Carteira",
                        },
                      ]}
                      onChange={() => undefined}
                      searchable={false}
                    />

                    <FinInput
                      label="Saldo inicial"
                      placeholder="0,00"
                      inputMode="decimal"
                    />
                  </div>
                </FinModalContent>

                <FinModalFooter>
                  <FinButton
                    variant="secondary"
                    onClick={() =>
                      setModalOpen(false)
                    }
                  >
                    Cancelar
                  </FinButton>

                  <FinButton>
                    Salvar conta
                  </FinButton>
                </FinModalFooter>
              </FinModal>
            </PlaygroundSection>
          </ComponentGroup>

          <ComponentGroup
            title="FinToast"
            description="Feedbacks rápidos que confirmam ações sem interromper o usuário."
          >
            <PlaygroundSection
              title="Tipos"
              description="Sucesso, informação, atenção e erro."
            >
              <FinButton
                onClick={() =>
                  showToast({
                    title: "Conta adicionada.",
                    description:
                      "A nova conta já está disponível.",
                    type: "success",
                  })
                }
              >
                Mostrar sucesso
              </FinButton>

              <FinButton
                variant="secondary"
                onClick={() =>
                  showToast({
                    title: "Backup criado.",
                    description:
                      "Guarde o arquivo em um local seguro.",
                    type: "info",
                  })
                }
              >
                Mostrar informação
              </FinButton>

              <FinButton
                variant="secondary"
                onClick={() =>
                  showToast({
                    title: "Atenção necessária.",
                    description:
                      "Confira os dados antes de continuar.",
                    type: "warning",
                  })
                }
              >
                Mostrar atenção
              </FinButton>

              <FinButton
                variant="destructive"
                onClick={() =>
                  showToast({
                    title: "Não foi possível salvar.",
                    description:
                      "Tente novamente em alguns instantes.",
                    type: "error",
                  })
                }
              >
                Mostrar erro
              </FinButton>
            </PlaygroundSection>

            <PlaygroundSection
              title="Duração"
              description="O toast pode fechar automaticamente ou permanecer visível."
            >
              <FinButton
                variant="secondary"
                onClick={() =>
                  showToast({
                    title: "Toast rápido.",
                    duration: 1500,
                    type: "info",
                  })
                }
              >
                1,5 segundo
              </FinButton>

              <FinButton
                variant="secondary"
                onClick={() =>
                  showToast({
                    title: "Fechamento manual.",
                    description:
                      "Este toast permanecerá até ser fechado.",
                    duration: 0,
                    type: "info",
                  })
                }
              >
                Sem fechamento automático
              </FinButton>
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

      <div className="flex w-full flex-wrap items-start gap-3">
        {children}
      </div>
    </section>
  );
}