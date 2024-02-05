import {useState, useEffect} from 'react';

export const useStateGet = (userName) => {
    const [stateList, setStateList] = useState();
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        fetch(process.env.REACT_APP_STATE_CITY_API_HOST + '/states', {
            headers: {
                'x-username': userName,
                'auth-token': localStorage.getItem('token'),
            }
        })
        .then(resp => {
            if(resp.status === 200) {
                resp.json().then(data => {
                    setStateList(data)
                    setLoading(false)
                })
            } else {
                console.log('Get state call failed with status ', resp.status)
                setLoading(false)
            }
        }).catch(err => {
            console.log('Get states call failed with error ', err)
            setLoading(false)
        })
    }, [])
    return [loading, stateList];
}
