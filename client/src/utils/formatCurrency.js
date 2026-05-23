export function formatCurrency(value) {
  return new Intl.NumberFormat("bn-BD", {
    style: "currency",
    currency: "USD",
  }).format(value);
}
