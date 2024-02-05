import React, { useState } from "react";
import { ReactComponent as CloseButton } from "../../resources/close-button.svg";
import "./SetNumberSection.css";
import { TextInput } from "../../elements/textInput/TextInput";
import { Textinputv2 } from '../../elements/textInputv2/TextInputv2';
import { PopupV2 } from "../../elements/popupV2/PopupV2";
import { PrimaryButton } from "../../elements/button/Button";
import { useLocation } from "react-router-dom";
import TextInputv2 from "../../elements/textInputv2/TextInputv2";

const SetNumberSection = ({
  game,
  closingTime,
  onClose,
  reload,
  setReload,
  setShowStatusUpdate,
}) => {
  const [winNumber, setWinNumber] = useState(
    game?.winNumber === "Awaiting results"
      ? ""
      : game?.winNumber.split("-").join("")
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [userIp, setUserIp] = useState("");
  const [locationDetails, setLocationDetails] = useState({});

  const location = useLocation();

  const [showConfirmation, setShowConfirmation] = useState(false);
  const pickNumber = Number(game?.gameType?.substring(4));

  const fetchUserIp = () => {
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
        }
      })
      .catch((err) => {
        console.log("fetching user ip failed with error", err);
      });
  };

  const getLocationDetails = async (lat, long) => {
    const resp = await fetch(
      `https://geocode.maps.co/reverse?lat=${lat}&lon=${long}`
    );
    const data = await resp.json();
    return (
      (data.address.city ?? data.address.county) + ", " + data.address.state
    );
  };

  const fetchUserLocation = () => {
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
          let locationDetails
          try {
            locationDetails = await getLocationDetails(
              coords.latitude,
              coords.longitude
            );
          } catch {
            console.log('some thing went wrong while getting location')
            setLocationDetails({
              latitude: coords.latitude,
              longitude: coords.longitude,
              location: 'Click here',
            });
          }
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

  const handleSetNumber = () => {
    fetchUserIp();
    fetchUserLocation();
    if (winNumber === "") {
      setErrorMessage("Win number can't be empty.");
      return;
    }
    if (pickNumber == 4 && winNumber.length != 4) {
      setErrorMessage("Invalid win number.");
      return;
    }
    if (pickNumber == 3 && winNumber.length != 3) {
      setErrorMessage("Invalid win number.");
      return;
    }
    setErrorMessage("");
    setShowConfirmation(true);
  };

  const handleSetConfirm = () => {
    console.log(locationDetails);
    console.log("Confirmation!");

    fetch(process.env.REACT_APP_WIN_NUMBERS_HOST + "/games/winnumbers", {
      method: "POST",
      headers: { 
        "x-username": location.state.userDetails.userName,
        'auth-token': localStorage.getItem('token'),
      },
      body: JSON.stringify({
        game_instance_id: game.id,
        location: locationDetails.location,
        ip_address: userIp,
        coordinates: `${locationDetails.latitude}, ${locationDetails.longitude}`,
        win_number: winNumber.split("").join("-"),
      }),
    })
      .then((resp) => {
        if (resp.status == 200) {
          setShowStatusUpdate("Win number updated");
          setReload(!reload);
          setTimeout(() => setShowStatusUpdate(""), 5000);
          onClose();
        } else {
          console.log("Response status isnt 200");
        }
      })
      .catch((err) => console.log(err));
  };

  console.log('game details:', game)

  return (
    <>
      <div className="setNumberOverlay">
        <div className="titleRow">
          <div className="numberTitle">Set manual win number</div>
          <div className="closeButton" onClick={onClose}>
            <CloseButton />
          </div>
        </div>
        <div className="subheading">Details</div>
        <div className="gameDetails">
          <p className="attrName">Game</p>
          <p className="attrValue">
            {game?.stateName + " " + game?.slot + " " + game?.gameType}
          </p>
        </div>
        <div className="timeDetails">
          <p className="attrName">Actual closing time</p>
          <p className="attrValue">{closingTime}</p>
        </div>
        <TextInputv2
          label="Manual win number"
          width="100%"
          onChange={setWinNumber}
          defaultValue={winNumber}
          errorState={errorMessage}
        />
        {errorMessage && <span className="error-msg">{errorMessage}</span>}
        <div className="setNumberButton">
          <PrimaryButton
            label="Save"
            style={{ width: "100%" }}
            type="primary"
            onClick={handleSetNumber}
          />
        </div>
      </div>
      {showConfirmation && (
        <PopupV2
          title={"Are you sure you?"}
          subheading={"Set win number:"}
          gameName={game?.stateName + " " + game?.slot + " " + game?.gameType}
          winNumber={winNumber}
          buttonText="Confirm"
          onButtonClick={() => handleSetConfirm()}
          onClose={() => setShowConfirmation(false)}
        />
      )}
    </>
  );
};

export default SetNumberSection;
