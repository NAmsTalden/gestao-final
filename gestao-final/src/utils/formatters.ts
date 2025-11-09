// src/utils/formatters.ts

/**
 * Formata um número ou string numérica como moeda brasileira (BRL).
 * Ex: 12345.67 se torna "R$ 12.345,67"
 * @param value O valor a ser formatado.
 * @returns A string formatada.
 */
export const formatCurrency = (value: number | string): string => {
    const numericValue = typeof value === 'string' 
      ? parseFloat(value.replace(/[^0-9,-]+/g, "").replace(",", ".")) 
      : value;
  
    if (isNaN(numericValue)) {
      return "R$ 0,00";
    }
  
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(numericValue);
  };
  
  /**
   * Converte uma string de moeda formatada de volta para um número simples para edição.
   * Ex: "R$ 12.345,67" se torna "12345.67"
   * @param value A string de moeda.
   * @returns Uma string contendo apenas o número.
   */
  export const parseCurrency = (value: string): string => {
    if (!value) return "";
    return value.replace(/[^0-9,-]+/g, "").replace(",", ".");
  };