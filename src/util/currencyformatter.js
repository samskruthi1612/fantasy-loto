const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
});

export const formatToCurrency = (amount) => {
    return formatter.format(amount)
}

export const validateCurrencyFormat = (currencyString) => {
    const currencyRegex = /(?=.*?\d)^\$?(([1-9]\d{0,2}(,\d{3})*)|[1-9]\d+)?(.\d{1,2})?$/
    return !!currencyString.match(currencyRegex)
}

export const formatToAmount = (currencyString) => {
    return Number(currencyString.replace('$','').replaceAll(',',''))
}