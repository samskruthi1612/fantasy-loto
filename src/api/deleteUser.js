export const deleteUser = (userid, role, setLoading, onSuccess, onError) => {
    setLoading(true)
    console.log('deleting agent')
    fetch(process.env.REACT_APP_USER_API_URL+'?' + new URLSearchParams({userid, role}), {
        method: 'DELETE',
        headers: {
            'auth-token': localStorage.getItem('token')
        }
    })
    .then((resp) => {
        setLoading(false)
        if(resp.status==200) {
            console.log('delete successful')
            onSuccess()
        } else {
            console.log('delete failed', resp.status)
            if(onError) {
                onError()
            }
        }
    })
    .catch(()=> {
        setLoading(false)
        console.log('delete api error')
        if(onError) {
            onError()
        }
    })
}