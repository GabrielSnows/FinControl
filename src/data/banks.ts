import inter from "../assets/banks/inter.svg";
import nubank from "../assets/banks/nubank.svg";
import itau from "../assets/banks/itau.svg";
import bradesco from "../assets/banks/bradesco.svg";
import bb from "../assets/banks/bb.svg";
import caixa from "../assets/banks/caixa.svg";
import mercadoPago from "../assets/banks/mercado-pago.svg";
import picpay from "../assets/banks/picpay.svg";
import carteira from "../assets/banks/carteira.png";

export interface Bank {
  id: number;
  name: string;
  image: string;
  type: "bank" | "wallet";
}

export const banks: Bank[] = [
  {
    id: 1,
    name: "Inter",
    image: inter,
    type: "bank",
  },
  {
    id: 2,
    name: "Nubank",
    image: nubank,
    type: "bank",
  },
  {
    id: 3,
    name: "Itaú",
    image: itau,
    type: "bank",
  },
  {
    id: 4,
    name: "Bradesco",
    image: bradesco,
    type: "bank",
  },
  {
    id: 5,
    name: "Banco do Brasil",
    image: bb,
    type: "bank",
  },
  {
    id: 6,
    name: "Caixa",
    image: caixa,
    type: "bank",
  },
  {
    id: 7,
    name: "Mercado Pago",
    image: mercadoPago,
    type: "wallet",
  },
  {
    id: 8,
    name: "PicPay",
    image: picpay,
    type: "wallet",
  },
  {
    id: 9,
    name: "Carteira",
    image: carteira,
    type: "wallet",
  },
];