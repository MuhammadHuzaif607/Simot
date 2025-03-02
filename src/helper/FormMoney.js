export const formatMoney = (amount, currency = 'EUR', locale = 'en-US') => {
  if (amount === null || amount === undefined || amount === '') {
    return '';
  }

  return amount.toLocaleString(locale, {
    style: 'currency',
    currency: currency,
  });
};
