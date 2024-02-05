import { convertEpochsToUIDate } from "../util/dateUtils"

export const apiLoadTime = (onLastUpdateTime, onError) => {
    fetch(process.env.REACT_APP_GAME_API_HOST, {
        headers: {
            'x-channel': 'loadtime',
            'auth-token': localStorage.getItem('token')
        }
    })
    .then(resp => {
        if(resp.status === 200) {
            resp.json().then(data => onLastUpdateTime(convertEpochsToUIDate(data.loadTime)))
        } else {
            console.log('error ocurred while fetching last update time', resp.status)
            if(onError) {
                onError('error ocurred while fetching last update time' + resp.status)
            }
        }
    })
    .catch((err) => {
        console.log('error occured while fetching last update time', err)
        if(onError) {
            onError('error occured while fetching last update time' + err)
        }
    })
}