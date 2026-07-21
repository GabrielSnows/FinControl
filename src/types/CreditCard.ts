export type CreditCardBrand =
  | "Visa"
  | "Mastercard"
  | "Elo"
  | "American Express"
  | "Hipercard"
  | "Outro";

export interface CreditCard {
  id: number;

  /**
   * Banco emissor do cartão.
   * Utilizado para reutilizar os ícones já existentes.
   */
  bankId: number;

  /**
   * Nome que será exibido no aplicativo.
   * Ex.: "Nubank", "Inter Platinum", "BB Ourocard".
   */
  name: string;

  /**
   * Logo do banco emissor.
   */
  image: string;

  /**
   * Bandeira do cartão.
   */
  brand: CreditCardBrand;

  /**
   * Limite total disponível para o cartão.
   */
  limit: number;

  /**
   * Dia do vencimento da fatura.
   * Valores entre 1 e 31.
   */
  dueDay: number;

  createdAt: string;
}