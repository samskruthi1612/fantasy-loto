export const fetchFunc = (url, method, headers, body, setLoading, onSuccess, onError) => {
    setLoading(true)
    fetch(url, {
      method,
      headers: {
        'auth-token': localStorage.getItem('token'),
        ...headers
      },
      body: JSON.stringify(body)
    })
    .then(resp => {
        setLoading(false)
        if(resp.status === 200) {
            onSuccess()
        } else {
            console.log('API call failed with status: ', resp.status)
            onError('API call failed with status: ', resp.status)
        }
    })
    .catch(err => {
        console.log('API call failed with error', err)
        setLoading(false)
        onError('API call failed with unkown error')
    })
}