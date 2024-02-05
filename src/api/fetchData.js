export const fetchData = (url, setLoading, onData, onError) => {
    setLoading(true)
    fetch(url, {
      headers:{
        'auth-token': localStorage.getItem('token')
      }
    })
      .then((resp) => {
        if (resp.status === 200) {
            resp.json().then((data) => {
              onData(data);
            });
        } else {
            console.log("fetching data failed with status", resp.status);
            onError('Failed to fetch data')
        }
        setLoading(false)
      })
      .catch((err) => {
        console.log("fetching data failed with error", err);
        onError(err)
        setLoading(false)
      });
};