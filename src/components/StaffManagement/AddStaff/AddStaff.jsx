import './AddStaff.css'
import {useState, useEffect, useRef } from 'react'
import { CircularProgress, Grid } from '@mui/material';
import { TextInput } from '../../../elements/textInput/TextInput'
import { PrimaryButton } from '../../../elements/button/Button';
import defaultProfilePic from '../../../resources/profile-pic-super-admin-side-bar.png'
import Checkbox from '@mui/material/Checkbox';
import { useNavigate, useLocation } from 'react-router-dom';
import { Dropdown } from '../../../elements/dropdown/Dropdown';
import { DropdownV3 } from '../../../elements/dropdownV3/DropDownV3';
import { CenterFantasyLoader } from '../../../elements/fantasyLotoLoader/FantasyLotoLoader';
import { useCityGet } from '../../../hooks/useCityGet';
import { useStateGet } from '../../../hooks/useStateGet'
import TextInputv2 from '../../../elements/textInputv2/TextInputv2';
import eyeIcon from '../../../resources/show_eye.svg'

export const AddStaff = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const mapToNewStaffDetails = (editStaffFlag, staffDetails) => {
        if(editStaffFlag) {
            return {
                ...staffDetails,
                phoneNumber: staffDetails.phoneNumber.substring(3),
                profilePic: staffDetails.profile_pic !== undefined && staffDetails.profile_pic !== null ? staffDetails.profile_pic : defaultProfilePic
            }
        }
        return {
            "userName": "",
            "password": "",
            "name": "",
            "userRole": "cashier",
            "managerID": location.state.userId,
            "phoneNumber": "",
            "franchise": location.state.userDetails.franchise,
            "city": "",
            "state": "",
            "profilePic": defaultProfilePic,
            "screens": {
                "agents": true,
                "lotteryLimit": true,
                "game": true,
                "betLimit": true,
                "reports": true,
                "balance": true,
                "deposit": true,
                "payout": true
            },
            "status": "active"
        }
    }

    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showPassword, setShowPassword] = useState(false); 

    const togglePasswordVisibility = (passwordType) => {
        switch (passwordType) {
          case "new":
            setShowPassword((prevShow) => !prevShow);
            break;
          case "confirm":
            setShowConfirmPassword((prevShow) => !prevShow);
            break;
          default:
            break;
        }
      };

    const hiddenFileInput = useRef(null);

    // Programatically click the hidden file input element
    // when the Button component is clicked
    const handleClick = event => {
        hiddenFileInput.current.click();
    };

    const handleChange = event => {
        const fileUploaded = event.target.files[0];
        if (fileUploaded) {
            const fileType =  event.target.files[0].type;
            let file_size = event.target.files[0].size;
            if (fileType == "image/png" || fileType == "image/jpg" || fileType == "image/jpeg") {
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

    const {state: {editStaffFlag, staffDetails}} = location
    const [newStaffDetails, setNewStaffDetails] = useState(()=>mapToNewStaffDetails(editStaffFlag, staffDetails));
    const [confirmNewPassword, setConfirmNewPassword] = useState();

    const [citiesLoading, citiesList] = useCityGet(location.state.userName);
    const [cityOptions, setCityOptions] = useState();
    const [statesLoading, statesList] = useStateGet(location.state.userName);
    const [stateOptions, setStateOptions] = useState();

    const [invalidNameMsg, setInvalidNameMsg] = useState('');
    const [invalidUserNameMsg, setInvalidUserNameMsg] = useState('');
    const [invalidCityMsg, setInvalidCityMsg] = useState('');
    const [invalidStateMsg, setInvalidStateMsg] = useState('');
    const [invalidPhoneNumberMsg, setInvalidPhoneNumberMsg] = useState('');
    const [invalidPasswordMsg, setInvalidPasswordMsg] = useState('');
    const [invalidCashierSubRolesMsg, setInvalidCashierSubRolesMsg] = useState('')
    const [invalidProfilePic, setInvalidProfilePic] = useState('');
    
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const updateName = (newName) => setNewStaffDetails((newStaffData) => ({...newStaffData, name: newName}))
    const updateUserName = (newUsername) => setNewStaffDetails((newStaffData) => ({...newStaffData, userName: newUsername}))
    const updatePhoneNumber = (newPhoneNumber) => setNewStaffDetails((newStaffData) => ({...newStaffData, phoneNumber: newPhoneNumber}))
    const updateCity = (newCity) => setNewStaffDetails((newStaffData) => ({...newStaffData, city: newCity}))
    const updateState = (newState) => {
        setNewStaffDetails((newStaffData) => ({...newStaffData, state: newState}))
        const currentCities = citiesList
        .filter(city => city.state === newState)
        if(!currentCities.map(city => city.name).includes(newStaffDetails.city)) {
            updateCity('')
        }
        setCityOptions(citiesList
            .filter(city => city.state === newState)
            .map(cityData => ({
            label: cityData.name,
            value: cityData.name
        })))
    }
    const updatePassword = (newPassword) => setNewStaffDetails((newStaffData) => ({...newStaffData, password: newPassword}))
    const updateConfirmPassword = (newConfirmPassword) => setConfirmNewPassword(newConfirmPassword)

    const updateCashierRole = () => setNewStaffDetails((newStaffData) => {
        if(newStaffData.userRole === 'cashier') {
            return {...newStaffData, userRole: 'staff', screens: {...newStaffData.screens, payout:false, balance: false, deposit: false}}
        } else {
            return {...newStaffData, userRole: 'cashier', screens: {...newStaffData.screens, payout:true, balance: true, deposit: true}}
        }
    })
    const updatePayoutManagement = () => setNewStaffDetails((newStaffData) => ({...newStaffData, screens: {...newStaffData.screens, payout: !newStaffData.screens.payout}}))
    const updateDepositManagement = () => setNewStaffDetails((newStaffData) => ({...newStaffData, screens: {...newStaffData.screens, deposit: !newStaffData.screens.deposit}}))
    const updateBalanceManagement = () => setNewStaffDetails((newStaffData) => ({...newStaffData, screens: {...newStaffData.screens, balance: !newStaffData.screens.balance}}))
    const updateAgentsManagement = () => setNewStaffDetails((newStaffData) => ({...newStaffData, screens: {...newStaffData.screens, agents: !newStaffData.screens.agents}}))
    const updateLotteryLimitManagement = () => setNewStaffDetails((newStaffData) => ({...newStaffData, screens: {...newStaffData.screens, lotteryLimit: !newStaffData.screens.lotteryLimit}}))
    const updateGameManagement = () => setNewStaffDetails((newStaffData) => ({...newStaffData, screens: {...newStaffData.screens, game: !newStaffData.screens.game}}))
    const updateBetLimitManagement = () => setNewStaffDetails((newStaffData) => ({...newStaffData, screens: {...newStaffData.screens, betLimit: !newStaffData.screens.betLimit}}))
    const updateScreenReports = () => setNewStaffDetails((newStaffData) => ({...newStaffData, screens: {...newStaffData.screens, reports: !newStaffData.screens.reports}}))

    const updateProfilePic = (newPic) => setNewStaffDetails((newStaffData) => ({...newStaffData, profilePic:newPic}))


    const validRequestData = () => {
        
        let validRequest = true
        if(!newStaffDetails.name) {
            setInvalidNameMsg('Please enter a name')
            validRequest = false
        } else {
            setInvalidNameMsg('')
        }
        const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,})$/
        if(!newStaffDetails.userName) {
            setInvalidUserNameMsg('Please enter a user name')
            validRequest = false
        } else if(!newStaffDetails.userName.match(emailRegex)) {
            setInvalidUserNameMsg('user name should be a valid email')
            validRequest = false
        } else {
            setInvalidUserNameMsg('')
        }
        const phoneNumberRegex = /^\d{7}$/
        if(!newStaffDetails.phoneNumber.match(phoneNumberRegex)) {
            setInvalidPhoneNumberMsg('Phone Number must have only numbers and exactly 7 digits')
            validRequest = false
        } else {
            setInvalidPhoneNumberMsg('')
        }
        if(!newStaffDetails.city) {
            setInvalidCityMsg('Please select a city')
            validRequest = false
        } else {
            setInvalidCityMsg('')
        }
        if(!newStaffDetails.state) {
            setInvalidStateMsg('Please select a state')
            validRequest = false
        } else {
            setInvalidStateMsg('')
        }
        if(!editStaffFlag && !newStaffDetails.password) {
            setInvalidPasswordMsg('Password cannot be empty')
            validRequest = false
        }
        else if(confirmNewPassword != newStaffDetails.password) {
            setInvalidPasswordMsg('Password and confirm password are not matching')
            validRequest = false
        }
        else if(confirmNewPassword && confirmNewPassword.length < 8) {
            setInvalidPasswordMsg('Password must be 8 or more characters')
            validRequest = false
        }
        else {
            setInvalidPasswordMsg('')
        }
        if(newStaffDetails.userRole === 'cashier' && (!newStaffDetails.screens.payout && !newStaffDetails.screens.deposit && !newStaffDetails.screens.balance)) {
            setInvalidCashierSubRolesMsg('Please select atleast one of cashier roles')
            validRequest = false
        } else {
            setInvalidCashierSubRolesMsg('')
        }
        return validRequest
    }

    const submitStaffData = () => {
        if(!validRequestData()) {
            console.log('invalid data not submitting request')
            return
        }
        setLoading(true)
        setErrorMsg('')
        const addStaffUrl = process.env.REACT_APP_USER_API_URL
        const addStaffHeaders = {
            'x-channel': 'staff',
            'auth-token': localStorage.getItem('token'),
        }
        const editStaffHeaders = {
            'x-channel':'details',
            'x-role':'staff',
            'auth-token': localStorage.getItem('token'),
        }
        fetch(addStaffUrl, {
            method: editStaffFlag? 'PUT' : 'POST',
            headers: editStaffFlag? editStaffHeaders : addStaffHeaders,
            body: JSON.stringify({
                ...newStaffDetails,
                phoneNumber: '242'+newStaffDetails.phoneNumber,
            })
        })
        .then((resp) => {
            if(resp.status == 200) {
                if (defaultProfilePic != newStaffDetails.profilePic) {
                    saveProfilePic()
                } else {
                    navigate('/home/staff', location)
                }
            } else if(resp.status === 400) {
                resp.json().then(data => {
                    if(data.description === 'username  already exists')
                        setInvalidUserNameMsg('Username already exists, please try different email')
                    else
                        setErrorMsg('Something went wrong. Please try again later')
                })
                setLoading(false)
            } else {
                console.log('some error occured')
                setErrorMsg('Something went wrong. Please try again later')
                setLoading(false)
            }
        })
        .catch(() => {
            setErrorMsg('Something went wrong. Please try again later')
            console.log('some error occured')
            setLoading(false)
        })
    }

    const saveProfilePic = () => {
        fetch(process.env.REACT_APP_IMAGE_URL, {
            method: "POST",
            headers: {
                'x-username': newStaffDetails.userName,
                'scope': 'profile',
                'auth-token': localStorage.getItem('token'),
            },
            body: newStaffDetails.profilePic.split(",")[1] // send only base 64 formatted string
        })
        .then(resp => {
            if (resp.status == 200) {
                navigate('/home/staff', location)
                console.log("image uploaded successfully")
            }
        })
        .catch(() => {
            console.log("Error saving profile pic!");
        })
    }

    useEffect(() => {
        if(!citiesLoading && !statesLoading) {
            setStateOptions(statesList.map(stateData => ({
                label: stateData.name,
                value: stateData.name
            })))
            setCityOptions(citiesList
                .filter(city => city.state === newStaffDetails.state)
                .map(cityData => ({
                label: cityData.name,
                value: cityData.name
            })))
        } else {
            setStateOptions([])
            setCityOptions([])
        }
    }, [citiesLoading, citiesList, statesLoading, statesList])

    return (
        <>
            <div className="addStaffPage">
                <div className="addStaffsTitleRow">
                    {editStaffFlag?'Edit':'Add'} Staff
                </div>
                <Grid container spacing={2}>
                    <Grid item lg={8}>
                        <div className='addStaffTextFields'>
                            <div className='addStaffSubHeading'>Profile Details</div>
                            <TextInputv2 label="Name" onChange={updateName} defaultValue={newStaffDetails.name} errorState={invalidNameMsg} />
                            {invalidNameMsg && <div className="formErrorMessage">{invalidNameMsg}</div>}
                            <TextInputv2 label="Username" onChange={editStaffFlag?()=>{}:updateUserName} disabled={editStaffFlag} defaultValue={newStaffDetails.userName} errorState={invalidUserNameMsg} />
                            {invalidUserNameMsg && <div className="formErrorMessage">{invalidUserNameMsg}</div>}
                            <Grid container spacing={2}>
                                <Grid item lg={2}><TextInputv2 label="code" defaultValue={"(242)"} disabled={true} /></Grid>
                                <Grid item lg={10}>
                                    <TextInputv2 label="Phone number" onChange={updatePhoneNumber} defaultValue={newStaffDetails.phoneNumber} errorState={invalidPhoneNumberMsg} />
                                    {invalidPhoneNumberMsg && <div className="formErrorMessage">{invalidPhoneNumberMsg}</div>}
                                </Grid>
                            </Grid>
                            <Grid container spacing={2}>
                                <Grid item lg={6}>
                                    <Dropdown label="State" onChange={updateState} options={stateOptions} defaultValue={newStaffDetails.state} errorState={invalidStateMsg} />
                                    {invalidStateMsg && <div className="formErrorMessage">{invalidStateMsg}</div>}
                                </Grid>
                                <Grid item lg={6}>
                                    <DropdownV3 label="City" onChange={updateCity} options={cityOptions} currentValue={newStaffDetails.city} errorState={invalidCityMsg} />
                                    {invalidCityMsg && <div className="formErrorMessage">{invalidCityMsg}</div>}
                                </Grid>
                            </Grid>
                            <div className="password">
              <TextInputv2
                label="Password"
                maskInput={showPassword}
                type={showPassword ? "text" : "password"}
                width="100%"
                onChange={updatePassword}
                errorState={invalidPasswordMsg}
              />
              <div
                className="eye-icon"
                onClick={() => togglePasswordVisibility("new")}
              >
                <img src={eyeIcon} alt="Eye Icon" />
              </div>
            </div>                                                      
            {invalidPasswordMsg && <div className="formErrorMessage">{invalidPasswordMsg??""}</div>}
            <div className="password">
              <TextInputv2
                label="Confirm Password"
                maskInput={showConfirmPassword}
                type={showConfirmPassword ? "text" : "password"}
                width="100%"
                onChange={updateConfirmPassword}
                errorState={invalidPasswordMsg==='Password and confirm password are not matching'} 
              />
              <div
                className="eye-icon"
                onClick={() => togglePasswordVisibility("confirm")}
              >
                <img src={eyeIcon} alt="Eye Icon" />
              </div>
            </div>                                         {invalidPasswordMsg==='Password and confirm password are not matching' && <div className="formErrorMessage">{invalidPasswordMsg??""}</div>}
                        </div>
                    </Grid>
                    <Grid item lg={4}>
                        <div className='addStaffPicRoleConfigs'>
                            <div className='profilePicDiv'>
                                <img src={newStaffDetails.profilePic} className='profileImage'/>
                            </div>
                            {invalidProfilePic && <div className="formErrorMessage">{invalidProfilePic ?? ""}</div>}
                            <PrimaryButton label="Upload" style={{width:"74px", height:"40px", padding: "10px 0px"}} type="secondary" onClick={handleClick}  />
                            <input type="file" style={{ "display": "none" }} ref={hiddenFileInput} onChange={handleChange} />
                            <div className='imageSizeText'>Image should be less than 5 mb</div>
                            <div className='addStaffRoleConfigs'>
                                <div className='addStaffSubHeading'>Staff role configurations</div>
                                <div className='flexCheckbox'>
                                    <Checkbox defaultChecked={newStaffDetails.userRole==='cashier'} size="small" onClick={updateCashierRole}/>
                                    <div className="checkBoxLabel">Cashier role</div>
                                </div>
                                {newStaffDetails.userRole==='cashier' &&
                                    <div className={`addStaffSubRoles ${invalidCashierSubRolesMsg?'addStaffSubRolesError':''}`}>
                                        <div className='flexCheckbox'>
                                            <Checkbox defaultChecked={newStaffDetails.screens.payout} size="small" onClick={updatePayoutManagement}/>
                                            <div className="checkBoxLabel">Payout management</div>
                                        </div>
                                        <div className='flexCheckbox'>
                                            <Checkbox defaultChecked={newStaffDetails.screens.deposit} size="small" onClick={updateDepositManagement}/>
                                            <div className="checkBoxLabel">Deposit management</div>
                                        </div>
                                        <div className='flexCheckbox'>
                                            <Checkbox defaultChecked={newStaffDetails.screens.balance} size="small" onClick={updateBalanceManagement}/>
                                            <div className="checkBoxLabel">Balance management</div>
                                        </div>
                                    </div>
                                }
                                {invalidCashierSubRolesMsg && <div className="formErrorMessage">{invalidCashierSubRolesMsg}</div>}
                                <div className='flexCheckbox'>
                                    <Checkbox defaultChecked={newStaffDetails.screens.agents} size="small" onClick={updateAgentsManagement}/>
                                    <div className="checkBoxLabel">Agents management</div>
                                </div>
                                <div className='flexCheckbox'>
                                    <Checkbox defaultChecked={newStaffDetails.screens.lotteryLimit} size="small" onClick={updateLotteryLimitManagement}/>
                                    <div className="checkBoxLabel">Lottery limit management</div>
                                </div>
                                <div className='flexCheckbox'>
                                    <Checkbox defaultChecked={newStaffDetails.screens.game} size="small" onClick={updateGameManagement}/>
                                    <div className="checkBoxLabel">Game management</div>
                                </div>
                                <div className='flexCheckbox'>
                                    <Checkbox defaultChecked={newStaffDetails.screens.betLimit} size="small" onClick={updateBetLimitManagement}/>
                                    <div className="checkBoxLabel">Bet limit management</div>
                                </div>
                                <div className='flexCheckbox'>
                                    <Checkbox defaultChecked={newStaffDetails.screens.reports} size="small" onClick={updateScreenReports}/>
                                    <div className="checkBoxLabel">Reports management</div>
                                </div>
                            </div>
                        </div>
                    </Grid>
                </Grid>
                <div className='formErrorMessage'>{errorMsg}</div>
                <div className='addStaffSaveRow'>
                    <PrimaryButton label='Cancel' type='secondary' onClick={()=>navigate('/home/staff', location)}/>
                    <PrimaryButton label='Save' type='primary' onClick={submitStaffData} />
                </div>
            </div>
            {loading && <CenterFantasyLoader />}
        </>
    )
}