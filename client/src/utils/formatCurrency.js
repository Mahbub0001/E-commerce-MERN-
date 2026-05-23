/** Format amounts in Bangladeshi Taka (৳). */
export function formatCurrency(value) {
  const amount = Number(value) || 0;
  const formatted = amount.toLocaleString("en-BD", {
    minimumFractionDigits: 0,
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  });
  return `৳${formatted}`;
}
