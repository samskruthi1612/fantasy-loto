export const capitalizeFirstLetter = (str) => str?str.charAt(0).toUpperCase() + str.slice(1):'';

export const convertToUIMobileNumber = (phoneNum) => 
        '('+phoneNum?.substring(0,3) + ') ' + phoneNum?.substring(3,6) + '-' + phoneNum?.substring(6)