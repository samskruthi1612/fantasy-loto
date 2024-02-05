import {useState, useEffect} from 'react';

export const useFetchGet = (url, defaultValue, userName) => {
    const [data, setData] = useState(defaultValue);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        fetch(url, {
            headers: {
                'x-username': userName,
                'auth-token': localStorage.getItem('token'),
            }
        })
        .then(resp => {
            if(resp.status === 200) {
                resp.json().then(data => {
                    setData(data)
                    setLoading(false)
                })
            } else {
                console.log('Get call failed with status ', resp.status)
                setLoading(false)
            }
        }).catch(err => {
            console.log('Get call failed with error ', err)
            setLoading(false)
        })
    }, [])
    return [loading, data];
}
