export type DashboardCurrency = 'ZAR' | 'USD' | 'GBP' | 'EUR';
export type DashboardRates = Record<DashboardCurrency, number>;

// All supported currencies use two decimal places; amounts remain in cents.
export function convertDashboardAmount(amount: number, from: DashboardCurrency, to: DashboardCurrency, rates: DashboardRates) {
    if (from === to) return amount;
    if (!Number.isFinite(rates[from]) || rates[from] <= 0 || !Number.isFinite(rates[to]) || rates[to] <= 0) {
        throw new Error('Exchange rate unavailable');
    }
    return Math.round(amount / rates[from] * rates[to]);
}
