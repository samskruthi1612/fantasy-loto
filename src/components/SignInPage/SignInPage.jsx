import React, { useEffect, useState } from "react";
import { PrimaryButton } from "../../elements/button/Button";
import Checkbox from "@mui/material/Checkbox";
import { useNavigate } from "react-router-dom";
import { TextInput } from "../../elements/textInput/TextInput";
import qtLogoImagee from "../../resources/Qt_logo_imagee.png";
import eyeIcon from '../../resources/show_eye.svg';
import "./SignInPage.css";
import { Grid } from "@mui/material";
import fantasyLotoImage from "../../resources/fantasy_loto_image.png";
import Cookies from "universal-cookie";
import { Popup } from "../../elements/popup/Popup";
import TextInputv2 from "../../elements/textInputv2/TextInputv2";
import { FantasyLotoLoader } from "../../elements/fantasyLotoLoader/FantasyLotoLoader";

export const SignInPage = () => {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [userNameInvalidMsg, setUserNameInvalidMsg] = useState("");
  const [passwordInvalidMsg, setPasswordInvalidMsg] = useState("");
//   const [keepSignedIn, setKeepSignedIn] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // Define showPassword state
  const navigate = useNavigate();
//   const cookies = new Cookies();

  const signInHandler = () => {
    if (!userName) {
      setUserNameInvalidMsg("Please enter your email");
    }
    if (!password) {
      setPasswordInvalidMsg("Please enter your password");
    }
    if (!userName || !password) {
      return;
    }
    setUserNameInvalidMsg("");
    setPasswordInvalidMsg("");
    fetch(process.env.REACT_APP_USER_API_LOGIN_URL, {
      method: "POST",
      headers: {
        "x-username": userName,
      },
      body: JSON.stringify({
        userid: userName,
        passcode: password,
      }),
    })
      .then((resp) => {
        if (resp.status == 200) {
          resp.json().then((data) => {
            localStorage.setItem('token', data.user?.token)
            // setUser(data.user)
            if (data.user?.role !== "agent") {
              // setLoginSuccess(resp.status == 200)
              sessionStorage.setItem("showSignInAlert", true);
              navigate("/home", {
                state: { userId: userName, name: data.user?.name },
              });
              // setShowSignInAlert(resp.status == 200)
            } else {
              setUserNameInvalidMsg("Agents cannot login into web app");
            }
          });
          // navigate('/home', {state: {userId: userName}})
        } else if (resp.status == 400 || resp.status == 403) {
          resp.json().then((data) => {
            if (data.error === "password does not match")
              setPasswordInvalidMsg("Password incorrect");
            else if (data.error === "user not found")
              setUserNameInvalidMsg("Username doesn't exist");
            else if (data.error === "inactive Profile") setShowPopup(true);
          });
        } else {
          console.log("login api failed with status", resp.status);
          setPasswordInvalidMsg("Error logging into the system");
        }
      })
      .catch(() => {
        console.log("error signing in");
      });
  };
  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      signInHandler();
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prevState) => !prevState);
  };
  

  return (
    <>
      <FantasyLotoLoader />
      <Grid container spacing={2} justifyContent="center">
        <div className="background">
          <Grid item lg={1}>
            <div></div>
          </Grid>
          <Grid item lg={3}>
            <img src={fantasyLotoImage} className="fantasyLotoImage" />
          </Grid>
          <Grid item lg={1}>
            <div></div>
          </Grid>
          <Grid item lg={6}>
            <div className="frame" tabIndex={0} onKeyPress={handleKeyPress}>
              <div className="title">Sign in to get started</div>
              <TextInputv2
                label="User name"
                maskInput={false}
                width="100%"
                onChange={setUserName}
                errorState={userNameInvalidMsg}
                errorMessage={userNameInvalidMsg}
              />
              <div className="password">
              <TextInputv2
                label="Password"
                maskInput={!showPassword}
                type={showPassword ? "text" : "password"}
                width="100%"
                onChange={setPassword}
                errorState={passwordInvalidMsg}
                errorMessage={passwordInvalidMsg}
              />
              <div className="signIn-eye" onClick={togglePasswordVisibility}>
              <img src={eyeIcon} alt="Eye Icon" />
              </div>{" "}
              </div>
              {/* <div className="formErrorMessage">{passwordInvalidMsg}</div> */}
              {/* <div className="advancedOptions">
                <Checkbox
                  defaultChecked
                  size="small"
                  onClick={() => setKeepSignedIn((flag) => !flag)}
                />
                <div className="checkBoxLabel">Keep me logged in</div>
                <div
                  className="forgotPassword"
                  onClick={() => navigate("/forgotPassword")}
                >
                  Forgot Password
                </div>
              </div> */}
              <PrimaryButton
                label="Sign in"
                onClick={signInHandler}
                style={{ width: "100%" }}
                type="primary"
              />
            </div>
          </Grid>
          <Grid item lg={1}>
            <div></div>
          </Grid>
        </div>
      </Grid>
      {showPopup && (
        <Popup
          title={
            "You are not allowed to login to the Fantasy Loto, Please contact your administrator for further assistance"
          }
          buttonText="Ok"
          onButtonClick={() => setShowPopup(false)}
          onClose={() => setShowPopup(false)}
          signinpopup={true}
        />
      )}
      <div className="qtSignin">
        <div className="qtImg">
          <img src={qtLogoImagee} alt="" className="qtLogo" />
        </div>
        <div className="qtInfo">
          <h2>Developed by</h2>
          <h3>QualyTrust IT Services, India</h3>
        </div>
      </div>
    </>
  );
};
