import "./AddAdmin.css";
import { useCallback, useEffect, useState, useRef } from "react";
import { Grid, CircularProgress } from "@mui/material";
import { TextInput } from "../../../elements/textInput/TextInput";
import TextInputv2 from '../../../elements/textInputv2/TextInputv2';
import { PrimaryButton } from "../../../elements/button/Button";
import eyeIcon from "../../../resources/show_eye.svg";
import defaultProfilePic from "../../../resources/profile-pic-super-admin-side-bar.png";
import Checkbox from "@mui/material/Checkbox";
import { useNavigate, useLocation } from "react-router-dom";
import { Dropdown } from "../../../elements/dropdown/Dropdown";
import {
  formatToAmount,
  validateCurrencyFormat,
  formatToCurrency,
} from "../../../util/currencyformatter";
import {
  formatCommissionToAmount,
  validateCommissionFormat,
  formatToCommission,
} from "../../../util/commissionFormatter";
import { CenterFantasyLoader } from "../../../elements/fantasyLotoLoader/FantasyLotoLoader";
import { useCityGet } from "../../../hooks/useCityGet";
import { useStateGet } from "../../../hooks/useStateGet";
import { DropdownV2 } from "../../../elements/dropdownV2/DropDownV2";
import { DropdownV3 } from "../../../elements/dropdownV3/DropDownV3";

export const AddAdmin = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const mapToNewAdminDetails = useCallback(
    (editAdminFlag, currentAdminDetails) => {
      if (editAdminFlag) {
        console.log("editing admin");
        return {
          ...currentAdminDetails,
          balance: formatToCurrency(currentAdminDetails.balance),
          phoneNumber: currentAdminDetails.phoneNumber.substring(3),
          commission: formatToCommission(currentAdminDetails.commission),
          profilePic:
            currentAdminDetails.profile_pic !== undefined &&
            currentAdminDetails.profile_pic !== null &&
            currentAdminDetails.profile_pic !== ""
              ? currentAdminDetails.profile_pic
              : defaultProfilePic,
        };
      }
      return {
        userName: "",
        name: "",
        userRole: "admin",
        managerID: "super.admin@test.com",
        phoneNumber: "",
        city: "",
        state: "",
        franchise: "",
        balance: "",
        commission: "",
        profilePic: defaultProfilePic,
        screens: {
          balance: true,
          deposit: true,
          payout: true,
          lottery: true,
          game: true,
          betType: true,
          betLimit: true,
          staff_cashier: true,
          agents: true,
          reports: true,
        },
        status: "active",
      };
    },
    []
  );

  const {
    state: { editAdminFlag, currentAdminDetails },
  } = location;
  const [newAdminDetails, setNewAdminDetails] = useState(() =>
    mapToNewAdminDetails(editAdminFlag, currentAdminDetails)
  );

  const [confirmNewPassword, setConfirmNewPassword] = useState();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [invalidNameMsg, setInvalidNameMsg] = useState("");
  const [invalidUserNameMsg, setInvalidUserNameMsg] = useState("");
  const [invalidCityMsg, setInvalidCityMsg] = useState("");
  const [invalidStateMsg, setInvalidStateMsg] = useState("");
  const [invalidFranchiseMsg, setInvalidFranchiseMsg] = useState("");
  const [invalidPhoneNumberMsg, setInvalidPhoneNumberMsg] = useState("");
  const [invalidBalanceMsg, setInvalidBalanceMsg] = useState("");
  const [invalidPasswordMsg, setInvalidPasswordMsg] = useState("");
  const [invalidConfirmPasswordMsg, setInvalidConfirmPasswordMsg] =
    useState("");
  const [invalidCommissionMsg, setInvalidCommissionMsg] = useState("");
  const [invalidProfilePic, setInvalidProfilePic] = useState("");
  const [citiesLoading, citiesList] = useCityGet(location.state.userName);
  const [cityOptions, setCityOptions] = useState();
  const [statesLoading, statesList] = useStateGet(location.state.userName);
  const [stateOptions, setStateOptions] = useState();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Create a reference to the hidden file input element
  const hiddenFileInput = useRef(null);

  // Programatically click the hidden file input element
  // when the Button component is clicked
  const handleClick = (event) => {
    hiddenFileInput.current.click();
  };
  const togglePasswordVisibility = (field) => {
    if (field === "password") {
      setShowPassword((prevShowPassword) => !prevShowPassword);
    } else if (field === "confirmPassword") {
      setShowConfirmPassword(
        (prevShowConfirmPassword) => !prevShowConfirmPassword
      );
    }
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

  const updateName = (newName) =>
    setNewAdminDetails((newAdminData) => {
      const returning = { ...newAdminData, name: newName };
      console.log(
        "updating state of new admin data from",
        newAdminData,
        " to: ",
        returning
      );
      return returning;
    });
  const updateUserName = (newUsername) =>
    setNewAdminDetails((newAdminData) => ({
      ...newAdminData,
      userName: newUsername,
    }));
  const updatePhoneNumber = (newPhoneNumber) =>
    setNewAdminDetails((newAdminData) => ({
      ...newAdminData,
      phoneNumber: newPhoneNumber,
    }));
  const updateCity = (newCity) =>
    setNewAdminDetails((newAdminData) => ({ ...newAdminData, city: newCity }));
  const updateState = (newState) => {
    setNewAdminDetails((newAdminData) => ({
      ...newAdminData,
      state: newState,
    }));
    const currentCities = citiesList.filter((city) => city.state === newState);
    if (
      !currentCities.map((city) => city.name).includes(newAdminDetails.city)
    ) {
      updateCity("");
    }
    setCityOptions(
      citiesList
        .filter((city) => city.state === newState)
        .map((cityData) => ({
          label: cityData.name,
          value: cityData.name,
        }))
    );
  };
  const updateFranchise = (newFranchise) =>
    setNewAdminDetails((newAdminData) => ({
      ...newAdminData,
      franchise: newFranchise,
    }));
  const updatePassword = (newPassword) => {
    setNewAdminDetails((newAdminData) => ({
      ...newAdminData,
      password: newPassword,
    }));
  };
  const updateConfirmPassword = (newConfirmPassword) =>
    setConfirmNewPassword(newConfirmPassword);
  const updateBalance = (newBalance) =>
    setNewAdminDetails((newAdminData) => {
      return { ...newAdminData, balance: newBalance };
    });
  const updateCommission = (newCommission) =>
    setNewAdminDetails((newAdminData) => ({
      ...newAdminData,
      commission: newCommission,
    }));

  const updateScreenBalance = () =>
    setNewAdminDetails((newAdminData) => ({
      ...newAdminData,
      screens: {
        ...newAdminData.screens,
        balance: !newAdminData.screens.balance,
      },
    }));
  const updateScreenDeposit = () =>
    setNewAdminDetails((newAdminData) => ({
      ...newAdminData,
      screens: {
        ...newAdminData.screens,
        deposit: !newAdminData.screens.deposit,
      },
    }));
  const updateScreenPayout = () =>
    setNewAdminDetails((newAdminData) => ({
      ...newAdminData,
      screens: {
        ...newAdminData.screens,
        payout: !newAdminData.screens.payout,
      },
    }));
  const updateScreenLottery = () =>
    setNewAdminDetails((newAdminData) => ({
      ...newAdminData,
      screens: {
        ...newAdminData.screens,
        lottery: !newAdminData.screens.lottery,
      },
    }));
  const updateScreenGame = () =>
    setNewAdminDetails((newAdminData) => ({
      ...newAdminData,
      screens: { ...newAdminData.screens, game: !newAdminData.screens.game },
    }));
  const updateScreenBetLimit = () =>
    setNewAdminDetails((newAdminData) => ({
      ...newAdminData,
      screens: {
        ...newAdminData.screens,
        betLimit: !newAdminData.screens.betLimit,
      },
    }));
  const updateScreenBetType = () =>
    setNewAdminDetails((newAdminData) => ({
      ...newAdminData,
      screens: {
        ...newAdminData.screens,
        betType: !newAdminData.screens.betType,
      },
    }));
  const updateScreenStaffCashier = () =>
    setNewAdminDetails((newAdminData) => ({
      ...newAdminData,
      screens: {
        ...newAdminData.screens,
        staff_cashier: !newAdminData.screens.staff_cashier,
      },
    }));
  const updateScreenAgent = () =>
    setNewAdminDetails((newAdminData) => ({
      ...newAdminData,
      screens: {
        ...newAdminData.screens,
        agents: !newAdminData.screens.agents,
      },
    }));
  const updateScreenReports = () =>
    setNewAdminDetails((newAdminData) => ({
      ...newAdminData,
      screens: {
        ...newAdminData.screens,
        reports: !newAdminData.screens.reports,
      },
    }));
  const updateProfilePic = (newPic) =>
    setNewAdminDetails((newAdminData) => ({
      ...newAdminData,
      profilePic: newPic,
    }));

  const validRequestData = () => {
    let validRequest = true;
    if (!newAdminDetails.name) {
      setInvalidNameMsg("Please enter a name");
      validRequest = false;
    } else {
      setInvalidNameMsg("");
    }
    const emailRegex =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,})$/;
    if (!newAdminDetails.userName) {
      setInvalidUserNameMsg("Please enter a user name");
      validRequest = false;
    } else if (!newAdminDetails.userName.match(emailRegex)) {
      setInvalidUserNameMsg("user name should be a valid email");
      validRequest = false;
    } else {
      setInvalidUserNameMsg("");
    }
    const phoneNumberRegex = /^\d{7}$/;
    if (!newAdminDetails.phoneNumber.match(phoneNumberRegex)) {
      setInvalidPhoneNumberMsg(
        "Phone Number must have only numbers and 7 digits"
      );
      validRequest = false;
    } else {
      setInvalidPhoneNumberMsg("");
    }
    if (!newAdminDetails.city) {
      setInvalidCityMsg("Please select a city");
      validRequest = false;
    } else {
      setInvalidCityMsg("");
    }
    if (!newAdminDetails.state) {
      setInvalidStateMsg("Please select a state");
      validRequest = false;
    } else {
      setInvalidStateMsg("");
    }
    if (!newAdminDetails.franchise) {
      setInvalidFranchiseMsg("Please select a franchise");
      validRequest = false;
    } else {
      setInvalidFranchiseMsg("");
    }
    if (
      newAdminDetails.balance &&
      validateCurrencyFormat(newAdminDetails.balance)
    ) {
      // setNewAdminDetails((newAdminData) => ({...newAdminData, balance: formatToAmount(newAdminData.balance)}))
      setInvalidBalanceMsg("");
    } else {
      setInvalidBalanceMsg(
        "Balance is mandatory and should be in proper currency format"
      );
      validRequest = false;
    }
    if (!editAdminFlag && !newAdminDetails.password) {
      setInvalidPasswordMsg("Password cannot be empty");
      validRequest = false;
    } else if (confirmNewPassword != newAdminDetails.password) {
      setInvalidPasswordMsg("Password and confirm password are not matching");
      setInvalidConfirmPasswordMsg(
        "Password and confirm password are not matching"
      );
      validRequest = false;
    } else if (confirmNewPassword && confirmNewPassword.length < 8) {
      setInvalidPasswordMsg("Password must be 8 or more characters");
      validRequest = false;
    } else {
      setInvalidPasswordMsg("");
      setInvalidConfirmPasswordMsg("");
    }
    if (
      newAdminDetails.commission &&
      validateCommissionFormat(newAdminDetails.commission)
    ) {
      // setNewAdminDetails((newAdminData) => ({...newAdminData, commission: formatCommissionToAmount(newAdminData.commission)}))
      setInvalidCommissionMsg("");
    } else {
      setInvalidCommissionMsg(
        "Commission is mandatory and can only have numbers between 0-100 followed by %"
      );
      validRequest = false;
    }
    return validRequest;
  };

  const submitAdminData = () => {
    if (!validRequestData()) {
      console.log("invalid data not submitting request");
      return;
    }
    setLoading(true);
    setErrorMsg("");
    const addAdminUrl = process.env.REACT_APP_USER_API_URL;
    const addAdminHeaders = {
      "x-channel": "admin",
      "auth-token": localStorage.getItem("token"),
    };
    const editAdminHeaders = {
      "x-channel": "details",
      "x-role": "admin",
      "auth-token": localStorage.getItem("token"),
    };
    fetch(addAdminUrl, {
      method: editAdminFlag ? "PUT" : "POST",
      headers: editAdminFlag ? editAdminHeaders : addAdminHeaders,
      body: JSON.stringify({
        ...newAdminDetails,
        phoneNumber: "242" + newAdminDetails.phoneNumber,
        balance: formatToAmount(newAdminDetails.balance),
        commission: formatCommissionToAmount(newAdminDetails.commission),
      }),
    })
      .then((resp) => {
        if (resp.status == 200) {
          if (defaultProfilePic != newAdminDetails.profilePic) {
            saveProfilePic();
          } else {
            navigate("/home/admins", location);
          }
        } else if (resp.status === 400) {
          resp.json().then((data) => {
            if (data.description === "username  already exists")
              setInvalidUserNameMsg(
                "Username already exists, please try different email"
              );
            else if (
              data.description ===
              "franchise name  is already exist, please try different name"
            )
              setInvalidFranchiseMsg(
                "Franchise name already exists, please try different name"
              );
            else setErrorMsg("Something went wrong, Please try again later");
          });
          setLoading(false);
        } else {
          console.log("some error occured");
          setErrorMsg("Something went wrong, Please try again later");
          setLoading(false);
        }
      })
      .catch(() => {
        console.log("some error occured");
        setErrorMsg("Something went wrong, Please try again later");
        setLoading(false);
      });
  };

  const saveProfilePic = () => {
    fetch(process.env.REACT_APP_IMAGE_URL, {
      method: "POST",
      headers: {
        "x-username": newAdminDetails.userName,
        scope: "profile",
      },
      body: newAdminDetails.profilePic.split(",")[1], // send only base 64 formatted string
    })
      .then((resp) => {
        if (resp.status == 200) {
          navigate("/home/admins", location);
          console.log("image uploaded successfully");
        } else {
          navigate("/home/admins", location);
          console.log("error occured!");
        }
      })
      .catch(() => {
        console.log("Error saving profile pic!");
        setLoading(false);
      });
  };

  useEffect(() => {
    if (!citiesLoading && !statesLoading) {
      setStateOptions(
        statesList.map((stateData) => ({
          label: stateData.name,
          value: stateData.name,
        }))
      );
      setCityOptions(
        citiesList
          .filter((city) => city.state === newAdminDetails.state)
          .map((cityData) => ({
            label: cityData.name,
            value: cityData.name,
          }))
      );
    } else {
      setStateOptions([]);
      setCityOptions([]);
    }
  }, [citiesLoading, citiesList, statesLoading, statesList]);

  return (
    <>
      <div className="addAdminPage">
        <div className="addAdminsTitleRow">
          {editAdminFlag ? "Edit" : "Add"} Admin
        </div>
        <Grid container spacing={2}>
          <Grid item lg={8}>
            <div className="addAdminTextFields">
              <div className="addAdminSubHeading">Profile Details</div>
              <TextInputv2
                label="Name"
                onChange={updateName}
                defaultValue={newAdminDetails.name}
              />
              {invalidNameMsg && (
                <div className="formErrorMessage">{invalidNameMsg}</div>
              )}
              <TextInputv2
                label="Username"
                onChange={editAdminFlag ? () => {} : updateUserName}
                disabled={editAdminFlag}
                defaultValue={newAdminDetails.userName}
              />
              {invalidUserNameMsg && (
                <div className="formErrorMessage">{invalidUserNameMsg}</div>
              )}
              <div className="adminPhoneNumberInput">
                <div className="adminPhoneNumberCode">
                  <TextInput
                    label="Country code"
                    defaultValue={"(242)"}
                    disabled={true}
                  />
                </div>
                <div className="adminPhoneNumberValue">
                  <TextInputv2
                    label="Phone number"
                    onChange={updatePhoneNumber}
                    defaultValue={newAdminDetails.phoneNumber}
                    errorState={invalidPhoneNumberMsg}
                  />
                  {invalidPhoneNumberMsg && (
                    <div className="formErrorMessage">
                      {invalidPhoneNumberMsg}
                    </div>
                  )}
                </div>
              </div>
              <Grid container spacing={2}>
                <Grid item lg={6}>
                  <Dropdown
                    label="State"
                    onChange={updateState}
                    options={stateOptions}
                    defaultValue={newAdminDetails.state}
                  />
                  {invalidStateMsg && (
                    <div className="formErrorMessage">{invalidStateMsg}</div>
                  )}
                </Grid>
                <Grid item lg={6}>
                  <DropdownV3
                    label="City"
                    onChange={updateCity}
                    options={cityOptions}
                    currentValue={newAdminDetails.city}
                  />
                  {invalidCityMsg && (
                    <div className="formErrorMessage">{invalidCityMsg}</div>
                  )}
                </Grid>
              </Grid>
              <TextInputv2
                label="Franchise"
                onChange={updateFranchise}
                defaultValue={newAdminDetails.franchise}
              />
              {invalidFranchiseMsg && (
                <div className="formErrorMessage">{invalidFranchiseMsg}</div>
              )}
              <div className="password">
                <TextInputv2
                  label="Password"
                  maskInput={!showPassword}
                  type={showPassword ? "text" : "password"}
                  onChange={updatePassword}
                  errorState={invalidPasswordMsg}
                />
                <div
                  className="eye-icon"
                  onClick={() => togglePasswordVisibility("password")}
                >
                  <img src={eyeIcon} alt="Eye Icon" />
                </div>
              </div>{" "}
              {invalidPasswordMsg && (
                <div className="formErrorMessage">
                  {invalidPasswordMsg ?? ""}
                </div>
              )}
              <div className="password">
                <TextInputv2
                  label="Confirm Password"
                  maskInput={!showConfirmPassword}
                  type={showConfirmPassword ? "text" : "password"}
                  onChange={updateConfirmPassword}
                  errorState={invalidConfirmPasswordMsg}
                />
                <div
                  className="eye-icon"
                  onClick={() => togglePasswordVisibility("confirmPassword")}
                >
                  <img src={eyeIcon} alt="Eye Icon" />
                </div>
              </div>{" "}
              {invalidConfirmPasswordMsg && (
                <div className="formErrorMessage">
                  {invalidConfirmPasswordMsg ?? ""}
                </div>
              )}
              <div className="addAdminSubHeading">Balance management</div>
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
                    label="Admin balance"
                    onChange={updateBalance}
                    defaultValue={newAdminDetails.balance.replace('$','')}
                    errorState={invalidBalanceMsg}
                    // value={newAdminDetails.balance}  
                  />
                </div>
              </div>
              {invalidBalanceMsg && (
                <div className="formErrorMessage">
                  {invalidBalanceMsg ?? ""}
                </div>
              )}
              <div className="balanceManagement">
                <div className="adminbalance">
                  <input
                    type="text"
                    class="textInput dollar "
                    placeholder="Country code"
                    disabled={true}
                    value="%"
                  />
                </div>
                <div className="adminAmount">
                  <TextInputv2
                    label="Admin commission in %"
                    onChange={updateCommission}
                    defaultValue={newAdminDetails.commission.replace('%','')}
                    errorState={invalidCommissionMsg}
                    // value={newAdminDetails.commission}

                  />
                </div>
              </div>
              {invalidCommissionMsg && (
                <div className="formErrorMessage">
                  {invalidCommissionMsg ?? ""}
                </div>
              )}
            </div>
          </Grid>
          <Grid item lg={4}>
            <div className="addAdminPicRoleConfigs">
              <div className="profilePicDiv">
                <img
                  src={newAdminDetails.profilePic}
                  className="profileImage"
                />
              </div>
              {invalidProfilePic && (
                <div className="formErrorMessage">
                  {invalidProfilePic ?? ""}
                </div>
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
              <div className="imageSizeText">
                Image should be less than 5 mb
              </div>
              <div className="addAdminRoleConfigs">
                <div className="addAdminSubHeading">
                  Admin role configurations
                </div>
                <div className="flexCheckbox">
                  <Checkbox
                    defaultChecked={newAdminDetails.screens.balance}
                    size="small"
                    onClick={updateScreenBalance}
                  />
                  <div className="checkBoxLabel">Balance management</div>
                </div>
                <div className="flexCheckbox">
                  <Checkbox
                    defaultChecked={newAdminDetails.screens.deposit}
                    size="small"
                    onClick={updateScreenDeposit}
                  />
                  <div className="checkBoxLabel">Deposit management</div>
                </div>
                <div className="flexCheckbox">
                  <Checkbox
                    defaultChecked={newAdminDetails.screens.payout}
                    size="small"
                    onClick={updateScreenPayout}
                  />
                  <div className="checkBoxLabel">Payout management</div>
                </div>
                <div className="flexCheckbox">
                  <Checkbox
                    defaultChecked={newAdminDetails.screens.lottery}
                    size="small"
                    onClick={updateScreenLottery}
                  />
                  <div className="checkBoxLabel">Lottery management</div>
                </div>
                <div className="flexCheckbox">
                  <Checkbox
                    defaultChecked={newAdminDetails.screens.game}
                    size="small"
                    onClick={updateScreenGame}
                  />
                  <div className="checkBoxLabel">Game management</div>
                </div>
                <div className="flexCheckbox">
                  <Checkbox
                    defaultChecked={newAdminDetails.screens.betLimit}
                    size="small"
                    onClick={updateScreenBetLimit}
                  />
                  <div className="checkBoxLabel">Bet limit management</div>
                </div>
                <div className="flexCheckbox">
                  <Checkbox
                    defaultChecked={newAdminDetails.screens.betType}
                    size="small"
                    onClick={updateScreenBetType}
                  />
                  <div className="checkBoxLabel">
                    Bet type & Win ratio management
                  </div>
                </div>
                <div className="flexCheckbox">
                  <Checkbox
                    defaultChecked={newAdminDetails.screens.staff_cashier}
                    size="small"
                    onClick={updateScreenStaffCashier}
                  />
                  <div className="checkBoxLabel">
                    Staff & Cashier management
                  </div>
                </div>
                <div className="flexCheckbox">
                  <Checkbox
                    defaultChecked={newAdminDetails.screens.agents}
                    size="small"
                    onClick={updateScreenAgent}
                  />
                  <div className="checkBoxLabel">Agent management</div>
                </div>
                <div className="flexCheckbox">
                  <Checkbox
                    defaultChecked={newAdminDetails.screens.reports}
                    size="small"
                    onClick={updateScreenReports}
                  />
                  <div className="checkBoxLabel">Reports management</div>
                </div>
              </div>
            </div>
          </Grid>
        </Grid>
        <div className="formErrorMessage">{errorMsg}</div>
        <div className="addAdminSaveRow">
          <PrimaryButton
            label="Cancel"
            type="secondary"
            onClick={() => navigate("/home/admins", location)}
          />
          <PrimaryButton
            label="Save"
            type="primary"
            onClick={submitAdminData}
          />
        </div>
      </div>
      {loading && <CenterFantasyLoader />}
    </>
  );
};
