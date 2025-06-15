/**
 * Formátuje číselnou hodnotu jako měnu v CZK.
 * @param {number | null | undefined} value - Hodnota k formátování.
 * @returns {string} Formátovaný řetězec měny nebo výchozí text, pokud je hodnota neplatná.
 */
export const formatCurrency = (value) => {
  if (value === null || value === undefined) {
    return 'Není k dispozici';
  }
  return new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK' }).format(value);
};