export const fetchUserIp = (setUserIp, setErrorMsg) => {
  fetch("https://api64.ipify.org/?format=json")
    .then((resp) => {
    if (resp.status === 200) {
        resp.json().then((data) => {
        console.log(data);
        console.log("fetched users ip is ", data.ip);
        setUserIp(data.ip);
        });
    } else {
        console.log("fetching user ip failed with status", resp.status);
        setErrorMsg('Failed to fetch User Ip')
    }
    })
    .catch((err) => {
    console.log("fetching user ip failed with error", err);
    setErrorMsg('Error while fetching user ip')
    });
};