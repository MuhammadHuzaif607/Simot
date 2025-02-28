export const formatMoney = (amount, currency = "EUR", locale = "en-US") => {
    return amount.toLocaleString(locale, {
      style: "currency",
      currency: currency,
    });
  };