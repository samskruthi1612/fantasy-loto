import dateFormat from "dateformat";

export const convertEpochsToUIDate = (epochs) => convertToUIDate(convertToEstTimeZone(new Date(epochs*1000)))

export const convertToUIDate = (dateString) => {
    const dateObj = new Date(dateString)

    const format12hrs = 'd mmm yyyy, hh:MM TT'
    const format24hrs = 'd mmm yyyy, HH:MM'
    return dateFormat(dateObj, sessionStorage.getItem('timeFormat')=='12'?format12hrs:format24hrs)
}

export const convertToEstTimeZone = (date) => {
    console.log('input date:', date)
    const ret =  convertToTimeZone(date, 'America/Nassau')
    console.log('converted date:', ret)
    return ret
}

export const convertToTimeZone = (date, tz) => {
    return new Date((typeof date === "string" ? new Date(date) : date).toLocaleString("en-US", {timeZone: tz}));
}

export const calculateTimeLeft = (dateString) => {
    const dateObj = new Date(dateString)
    const currentDateObj = new Date()
    if(dateObj<currentDateObj)
        return ""
    const millis = dateObj.getTime() - currentDateObj.getTime()
    const minutes = Math.floor(millis/(60*1000))
    const days = Math.floor(minutes/(60*24))
    const hours = Math.floor((minutes%(60*24))/60)
    return (days?days+'d ':'') + (hours>0?hours+'h ':'') + minutes%60 + 'm'
}

export const calculateTimePast = (epochs) => {
    const dateObj = new Date(epochs*1000)
    const currentDateObj = new Date()
    if(dateObj>currentDateObj)
        return ""
    const millis = currentDateObj.getTime() - dateObj.getTime()
    const minutes = Math.floor(millis/(60*1000))
    const days = Math.floor(minutes/(60*24))
    const hours = Math.floor((minutes%(60*24))/60)
    return (days?days+'d ':'') + (hours>0?hours+'h ':'') + minutes%60 + 'm'
}