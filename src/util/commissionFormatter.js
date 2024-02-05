export const formatToCommission = (amount) => {
    return amount*100+'%'
}

export const validateCommissionFormat = (commissionString) => {
    const commissionRegex = /^100(\.(0){1,2})?\%?$|^([1-9][0-9])(\.(\d{1,2}))?\%?$|^([1-9])(\.(\d{1,2}))?\%?$/
    return !!commissionString.match(commissionRegex)
}

export const formatCommissionToAmount = (commissionString) => {
    return Number(commissionString.replace('%',''))/100
}