import { useState } from "react";

import { Plus } from "lucide-react";

import type { Account } from "../types/Account";

import BankSelect from "../components/BankSelect/BankSelect";

import type { Bank } from "../data/banks";

const [selectedBank, setSelectedBank] = useState<Bank>();

export default function Accounts() {

    const [accounts, setAccounts] = useState<Account[]>([]);

    function addAccount(){

        const name = prompt("Nome da conta");

        if(!name) return;

        const balance = Number(prompt("Saldo inicial") || 0);

        const account: Account = {

            id: Date.now(),

            name,

            balance,

            icon:"🏦"

        };

        setAccounts([...accounts, account]);

    }

    return(

        <div>

            <div className="flex justify-between items-center mb-8">

                <h1 className="text-4xl font-bold">

                    Contas

                </h1>

                <BankSelect 
                    value={selectedBank}
                    onChange={setSelectedBank}
                />

                <p className="mt-6 text-lg">

                    Banco selecionado:

                    {" "}

                    <strong>

                        {selectedBank?.name ?? "Nenhum"}

                    </strong>

                </p>

                <button
                    onClick={addAccount}
                    className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 hover:bg-blue-700 transition"
                >

                    <Plus size={18}/>

                    Nova Conta

                </button>

            </div>

            <div className="space-y-4">

                {

                    accounts.length===0 ?

                    (

                        <div className="rounded-xl border border-slate-700 bg-slate-800 p-8 text-center text-slate-400">

                            Nenhuma conta cadastrada.

                        </div>

                    )

                    :

                    (

                        accounts.map(account=>(

                            <div
                                key={account.id}
                                className="flex justify-between items-center rounded-xl bg-slate-800 p-5"
                            >

                                <div className="flex gap-4 items-center">

                                    <span className="text-3xl">

                                        {account.icon}

                                    </span>

                                    <h2 className="text-xl">

                                        {account.name}

                                    </h2>

                                </div>

                                <strong>

                                    {account.balance.toLocaleString("pt-BR",{

                                        style:"currency",

                                        currency:"BRL"

                                    })}

                                </strong>

                            </div>

                        ))

                    )

                }

            </div>

        </div>

    );

}