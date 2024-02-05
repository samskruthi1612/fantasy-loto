const getLocationDetails = async (lat, long) => {
  try {
    const resp = await fetch(
      `https://geocode.maps.co/reverse?lat=${lat}&lon=${long}`
    );
    const data = await resp.json();
    return (
      (data.address.city ?? data.address.county) + ", " + data.address.state
    );
  } catch {
    console.log('some thing went wrong while fetching location')
    return 'Click here'
  }
};

export const fetchUserLocation = (setLocationDetails, setErrorMessage) => {
    const geolocationAPI = navigator.geolocation;
    if (!geolocationAPI) {
      console.log("Geolocation API is not available in your browser!");
      setErrorMessage("Unable to access location for logging");
    } else {
      console.log("Geo location: ", geolocationAPI);
      geolocationAPI.getCurrentPosition(
        async (position) => {
          const { coords } = position;
          console.log(position);
          const locationDetails = await getLocationDetails(
            coords.latitude,
            coords.longitude
          );
          setLocationDetails({
            latitude: coords.latitude,
            longitude: coords.longitude,
            location: locationDetails,
          });
        },
        (error) => {
          console.log("Something went wrong getting your position!", error);
          setErrorMessage("Unable to access location for logging");
          // setLocationDetails({
          //   latitude: 'lat',
          //   longitude: 'long',
          //   location: 'Failed to get location name',
          // });
        }
      );
    }
  };