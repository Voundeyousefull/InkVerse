export function formatCurrency(cents: number, currency = "USD") {
  return (cents / 100).toFixed(2) + " " + currency;
}
