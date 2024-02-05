import {useState, useEffect} from 'react';

export const useCityGet = (userName) => {
    const [cityList, setCityList] = useState();
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        fetch(process.env.REACT_APP_STATE_CITY_API_HOST + '/cities', {
            headers: {
                'x-username': userName,
                'auth-token': localStorage.getItem('token'),
            }})
        .then(resp => {
            if(resp.status === 200) {
                resp.json().then(data => {
                    setCityList(data)
                    setLoading(false)
                })
            } else {
                console.log('Get city call failed with status ', resp.status)
                setLoading(false)
            }
        }).catch(err => {
            console.log('Get city call failed with error ', err)
            setLoading(false)
        })
    }, [])
    return [loading, cityList];
}
