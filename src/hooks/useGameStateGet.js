import {useState, useEffect} from 'react';

export const useGameStateGet = (userName) => {
    const [gameStateList, setGameStateList] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        fetch(process.env.REACT_APP_WIN_NUMBERS_HOST + '/filter-values/game_states', {
            headers: {
                'x-username': userName,
                'auth-token': localStorage.getItem('token'),
            }
        })
        .then(resp => {
            if(resp.status === 200) {
                resp.json().then(data => {
                    setGameStateList(data)
                    setLoading(false)
                })
            } else {
                console.log('Get game states call failed with status ', resp.status)
                setLoading(false)
            }
        }).catch(err => {
            console.log('Get game states call failed with error ', err)
            setLoading(false)
        })
    }, [])
    return [loading, gameStateList];
}
