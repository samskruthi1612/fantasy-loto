import "./ProfileSection.css";
import { ReactComponent as CloseButton } from "../../../resources/close-button.svg";
import defaultProfilePic from "../../../resources/profile-pic-super-admin-side-bar.png";
import eyeIcon from "../../../resources/show_eye.svg";
import { PrimaryButton } from "../../../elements/button/Button";
import { TextInput } from "../../../elements/textInput/TextInput";
import  TextInputv2  from "../../../elements/textInputv2/TextInputv2";
import { useState, useRef } from "react";
import {
  formatToAmount,
  validateCurrencyFormat,
  formatToCurrency,
} from "../../../util/currencyformatter";
import { superAdminRole } from "../../../util/constants";

export const ProfileSection = ({ userDetails, onClose, triggerRefresh }) => {
  const mockFn = () => {};
  const {
    name,
    userName,
    password,
    userRole,
    phoneNumber,
    city,
    state,
    balance,
    franchise,
    profilePic,
  } = userDetails;

  const isSuperAdmin = userRole === superAdminRole;
  const isAdmin = userRole === "admin";
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const mapToNewUserDetails = (currentUserDetails) => {
    return {
      userName: currentUserDetails.userName,
      name: currentUserDetails.name,
      balance: currentUserDetails.balance,
      phoneNumber: currentUserDetails.phoneNumber.substring(3),
      profilePic:
        currentUserDetails.profile_pic !== undefined &&
        currentUserDetails.profile_pic !== null &&
        currentUserDetails.profile_pic !== ""
          ? currentUserDetails.profile_pic
          : defaultProfilePic,
    };
  };

  const [newUserDetails, setNewUserDetails] = useState(
    mapToNewUserDetails(userDetails)
  );
  const [currentPassword, setCurrentPassword] = useState("");
  const [invalidCurrentPasswordMsg, setInvalidCurrentPasswordMsg] =
    useState("");
  const [newPassword, setNewPassword] = useState("");
  const [invalidNewPasswordMsg, setInvalidNewPasswordMsg] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [invalidConfirmNewPasswordMsg, setInvalidConfirmNewPasswordMsg] =
    useState("");
  const [showProfileUpdated, setShowProfileUpdated] = useState(false);
  const [invalidProfilePic, setInvalidProfilePic] = useState("");
  const [invalidBalance, setInvalidBalance] = useState(false);
  const [invalidPhoneNumberMsg, setInvalidPhoneNumberMsg] = useState("");

  // Create a reference to the hidden file input element
  const hiddenFileInput = useRef(null);

  // Programatically click the hidden file input element
  // when the Button component is clicked
  const handleClick = (event) => {
    hiddenFileInput.current.click();
  };

  const handleChange = (event) => {
    const fileUploaded = event.target.files[0];
    if (fileUploaded) {
      const fileType = event.target.files[0].type;
      let file_size = event.target.files[0].size;
      if (
        fileType == "image/png" ||
        fileType == "image/jpg" ||
        fileType == "image/jpeg"
      ) {
        if (file_size > 5000000) {
          setInvalidProfilePic("Uploaded logo size must less 5MB");
        } else {
          const reader = new FileReader();
          reader.onload = () => {
            const base64Data = reader.result;
            updateProfilePic(base64Data);
            setInvalidProfilePic("");
          };
          reader.readAsDataURL(fileUploaded);
        }
      } else {
        setInvalidProfilePic("Image type should be PNG or JPG");
      }
    }
  };

  const updateName = (name) =>
    setNewUserDetails((user) => ({ ...user, name: name }));
  const updatePhoneNumber = (phoneNumber) =>
    setNewUserDetails((user) => ({ ...user, phoneNumber: phoneNumber }));
  const updateBalance = (balance) => {
    if (validateCurrencyFormat(balance)) {
      setInvalidBalance(false);
      setNewUserDetails((user) => ({
        ...user,
        balance: formatToAmount(balance),
      }));
    } else {
      setInvalidBalance(true);
    }
  };
  const onNewPasswordChange = (newPasswordValue) => {
    setNewPassword(newPasswordValue);
  };
  const onConfirmNewPasswordChange = (confirmNewPasswordValue) => {
    setConfirmNewPassword(confirmNewPasswordValue);
  };

  const updateProfilePic = (newPic) =>
    setNewUserDetails((user) => ({ ...user, profilePic: newPic }));
  const validateRequest = () => {
    let validRequest = true;
    console.log(currentPassword, newPassword, confirmNewPassword);

    const phoneNumberRegex = /^\d{7}$/;
    if (!newUserDetails.phoneNumber.match(phoneNumberRegex)) {
      setInvalidPhoneNumberMsg(
        "Phone Number must have only numbers and exactly 7 digits"
      );
      validRequest = false;
    } else {
      setInvalidPhoneNumberMsg("");
    }

    if (
      currentPassword !== "" ||
      newPassword !== "" ||
      confirmNewPassword !== ""
    ) {
      if (currentPassword === "") {
        setInvalidCurrentPasswordMsg(
          "Current password is required for updating password"
        );
        validRequest = false;
      } else {
        setInvalidCurrentPasswordMsg("");
      }
      if (newPassword === "") {
        setInvalidNewPasswordMsg(
          "New password is required for updating password when current password is entered"
        );
        validRequest = false;
      } else if (newPassword.length < 8) {
        setInvalidNewPasswordMsg("Password must have atleast 8 characters");
      } else {
        setInvalidNewPasswordMsg("");
      }
      if (confirmNewPassword === "") {
        setInvalidConfirmNewPasswordMsg(
          "Confirm New password is required for updating password when current password is entered"
        );
        validRequest = false;
      } else {
        setInvalidConfirmNewPasswordMsg("");
      }
    }
    if (newPassword !== confirmNewPassword) {
      setInvalidConfirmNewPasswordMsg(
        "ConfirmPassword not matching with new password"
      );
      validRequest = false;
    }
    if (password === "" && newPassword === "" && confirmNewPassword === "") {
      setInvalidCurrentPasswordMsg("");
      setInvalidNewPasswordMsg("");
      setInvalidConfirmNewPasswordMsg("");
    }
    return validRequest;
  };

  const submitNewUserDetails = () => {
    if (!validateRequest()) return;
    fetch(process.env.REACT_APP_USER_API_URL, {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "x-channel": "edit",
        "auth-token": localStorage.getItem("token"),
      },
      body: JSON.stringify(
        newPassword
          ? {
              ...newUserDetails,
              oldPassword: currentPassword,
              newPassword,
              phoneNumber: "(242) " + newUserDetails.phoneNumber,
            }
          : {
              ...newUserDetails,
              phoneNumber: "242" + newUserDetails.phoneNumber,
            }
      ),
    }).then((resp) => {
      if (resp.status === 200) {
        setShowProfileUpdated(true);
        onClose();
        if (newUserDetails.profilePic != defaultProfilePic) {
          saveProfilePic();
        }
        triggerRefresh(
          newPassword
            ? "Password updated successfully"
            : "Profile updated successfully"
        );
      } else {
        console.log("profile update failed", resp.status);
        if (resp.status === 400) {
          resp
            .json()
            .then((data) =>
              setInvalidCurrentPasswordMsg(data.detailedDescription)
            );
        }
      }
    });
  };
  const togglePasswordVisibility = (passwordType) => {
    switch (passwordType) {
      case "current":
        setShowCurrentPassword((prevShow) => !prevShow);
        break;
      case "new":
        setShowNewPassword((prevShow) => !prevShow);
        break;
      case "confirm":
        setShowConfirmPassword((prevShow) => !prevShow);
        break;
      default:
        break;
    }
  };

  const saveProfilePic = () => {
    fetch(process.env.REACT_APP_IMAGE_URL, {
      method: "POST",
      headers: {
        "x-username": userDetails.userName,
        scope: "profile",
        'auth-token': localStorage.getItem('token'),
      },
      body: newUserDetails.profilePic.split(",")[1], // send only base 64 formatted string
    })
      .then((resp) => {
        if (resp.status == 200) {
          console.log("image uploaded successfully");
          triggerRefresh("Profile updated successfully");
        }
      })
      .catch(() => {
        console.log("Error saving profile pic!");
      });
  };
  return (
    <>
      <div className="profileOverlay">
        <div className="titleRow">
          <div className="profileTitle">Profile</div>
          <div className="closeButton" onClick={onClose}>
            <CloseButton />
          </div>
        </div>

        <div className="updateDetails">
          <div className="profilePicDiv">
            <img src={newUserDetails.profilePic} className="profileImage" />
          </div>
          {invalidProfilePic && (
            <div className="formErrorMessage">{invalidProfilePic ?? ""}</div>
          )}
          <PrimaryButton
            label="Upload"
            style={{ width: "74px", height: "40px", padding: "10px 0px" }}
            type="secondary"
            onClick={handleClick}
          />
          <input
            type="file"
            style={{ display: "none" }}
            ref={hiddenFileInput}
            onChange={handleChange}
          />
          <div className="textInputs">
            <TextInputv2
              label="Name"
              width="100%"
              onChange={updateName}
              defaultValue={name}
            />

            <TextInputv2
              label="Username"
              width="100%"
              defaultValue={userName}
              disabled={true}
            />

            {isSuperAdmin && (
              <TextInputv2
                label="Brand name"
                width="100%"
                disabled={true}
                defaultValue={"Fantasy Loto"}
              />
            )}

            {!isSuperAdmin && (
              <TextInputv2
                label="Franchise"
                width="100%"
                disabled={true}
                defaultValue={franchise}
              />
            )}

            {(isSuperAdmin || isAdmin) && (
               <div className="balanceManagement">
               <div className="adminbalance">
                 <input
                   type="text"
                   class="textInput dollar "
                   placeholder="Country code"
                   disabled={true}
                   value="$"
                 />
               </div>
               <div className="adminAmount">

                 <TextInputv2
                   label="Account balance"
                   width="100%"
                   disabled={!isSuperAdmin}
                   onChange={isSuperAdmin ? updateBalance : () => {}}
                   defaultValue={formatToCurrency(balance).replace('$','')}
                   // value={newAdminDetails.balance}  
                 />
               </div>
             </div>
            )}
            {invalidBalance && (
              <div className="formErrorMessage">
                {"Please enter valid currency"}
              </div>
            )}

            <div className="profileMobileNumber">
              <div className="adminPhoneNumberCode">
              <TextInputv2
                label="Code"
                width="75px"
                disabled={true}
                defaultValue={"(242)"}
              />
              </div>
              <div className="adminPhoneNumberValue">
                <TextInputv2
                  label="Mobile number"
                  width="100%"
                  onChange={updatePhoneNumber}
                  defaultValue={phoneNumber.substring(3)}
                />
                {invalidPhoneNumberMsg && (
                  <div className="formErrorMessage">
                    {invalidPhoneNumberMsg ?? ""}
                  </div>
                )}
              </div>
            </div>
            <div className="setPasswordLabel">Set new password</div>
            <div className="password">
              <TextInputv2
                label="Current password"
                maskInput={showCurrentPassword}
                type={showCurrentPassword ? "text" : "password"}
                width="100%"
                onChange={setCurrentPassword}
                defaultValue={password}
              />
              <div
                className="eye-icon"
                onClick={() => togglePasswordVisibility("current")}
              >
                <img src={eyeIcon} alt="Eye Icon" />
              </div>
            </div>
            {invalidCurrentPasswordMsg && (
              <div className="formErrorMessage">
                {invalidCurrentPasswordMsg ?? ""}
              </div>
            )}
            {/* <div className="setPasswordLabel">
        Set new password */}
            <div className="password">
              <TextInputv2
                label="New Password"
                maskInput={showNewPassword}
                type={showNewPassword ? "text" : "password"}
                width="100%"
                onChange={onNewPasswordChange}
                defaultValue={password}
              />
              <div
                className="eye-icon"
                onClick={() => togglePasswordVisibility("new")}
              >
                <img src={eyeIcon} alt="Eye Icon" />
              </div>
            </div>
            {invalidNewPasswordMsg && (
              <div className="formErrorMessage">
                {invalidNewPasswordMsg ?? ""}
              </div>
            )}
            {/* <div className="setPasswordLabel">
        Set new password */}
            <div className="password">
              <TextInputv2
                label="Confirm password"
                maskInput={showConfirmPassword}
                type={showConfirmPassword ? "text" : "password"}
                width="100%"
                onChange={onConfirmNewPasswordChange}
                defaultValue={password}
              />
              <div
                className="eye-icon"
                onClick={() => togglePasswordVisibility("confirm")}
              >
                <img src={eyeIcon} alt="Eye Icon" />
              </div>
            </div>
            {invalidConfirmNewPasswordMsg && (
              <div className="formErrorMessage">
                {invalidConfirmNewPasswordMsg ?? ""}
              </div>
            )}
          </div>
        </div>

        <div className="profileSave">
          <PrimaryButton
            label="Save"
            style={{ width: "100%" }}
            type="primary"
            onClick={submitNewUserDetails}
          />
        </div>
      </div>
      {/* {showProfileUpdated && 
            <Alert 
                message="Profile updated successfully" 
                style={{position:'absolute', right:'10px', top:'72px'}} 
                onClick={()=>setShowSignInAlert(false)}
            />} */}
    </>
  );
};
