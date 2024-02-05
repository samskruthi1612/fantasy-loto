import './AddAgent.css'
import {useState, useEffect, useRef} from 'react'
import { CircularProgress, Grid } from '@mui/material';
import { TextInput } from '../../../elements/textInput/TextInput'
import { PrimaryButton } from '../../../elements/button/Button';
import defaultProfilePic from '../../../resources/profile-pic-super-admin-side-bar.png'
import Checkbox from '@mui/material/Checkbox';
import { useNavigate, useLocation } from 'react-router-dom';
import { Dropdown } from '../../../elements/dropdown/Dropdown';
import { DropdownV3 } from '../../../elements/dropdownV3/DropDownV3';
import { formatToAmount, validateCurrencyFormat, formatToCurrency } from '../../../util/currencyformatter'
import { formatCommissionToAmount, validateCommissionFormat, formatToCommission } from '../../../util/commissionFormatter'
import { CenterFantasyLoader } from '../../../elements/fantasyLotoLoader/FantasyLotoLoader';
import { useCityGet } from '../../../hooks/useCityGet';
import { useStateGet } from '../../../hooks/useStateGet'
import TextInputv2 from '../../../elements/textInputv2/TextInputv2';
import eyeIcon from '../../../resources/show_eye.svg'

export const AddAgent = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const mapToNewAgentDetails = (editAgentFlag, agentDetails, loggedUser) => {
        if(editAgentFlag) {
            return {
                ...agentDetails,
                phoneNumber: agentDetails.phoneNumber.substring(3),
                balance: formatToCurrency(agentDetails.balance),
                purchaseLimit: formatToCurrency(agentDetails.purchaseLimit),
                commission: formatToCommission(agentDetails.commission),
                profilePic: agentDetails.profile_pic !== undefined && agentDetails.profile_pic !== null ? agentDetails.profile_pic : defaultProfilePic
            }
        }
        return {
            "userName": "",
            "password": "",
            "name": "",
            "userRole": "agent",
            "managerID": loggedUser.userRole === 'admin'?loggedUser.userName:loggedUser.managerID,
            "managerName": loggedUser.userRole === 'admin'?loggedUser.name:loggedUser.managerName,
            "phoneNumber": "",
            "city": "",
            "state": "",
            "franchise": loggedUser.franchise,
            "balance": "",
            "purchaseLimit": "",
            "commission": "",
            "depositStatus": "Pending",
            "profilePic": defaultProfilePic,
            "screens": {
                "balance": true,
                "play": true,
                "scan": true, 
                "transactionList": true,
                "winnerNumberList": true,
                "soldoutNumberList": true,
                "voidTickets": true,
                "settings": true
            },
            "status": "active"
        }
    }

    const hiddenFileInput = useRef(null);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showPassword, setShowPassword] = useState(false); 


    // Programatically click the hidden file input element
    // when the Button component is clicked
    const handleClick = event => {
        hiddenFileInput.current.click();
    };

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
                    setInvalidProfilePic("")
                    };
                    reader.readAsDataURL(fileUploaded);
                }
            } else {
                setInvalidProfilePic("Image type should be PNG or JPG")
            }
        }
    };

    const {state: {editAgentFlag, agentDetails}} = location
    const [newAgentDetails, setNewAgentDetails] = useState(()=>mapToNewAgentDetails(editAgentFlag, agentDetails, location.state.loggedUser));
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
    const [invalidConfirmPasswordMsg, setInvalidConfirmPasswordMsg] = useState('');
    const [invalidBalanceMsg, setInvalidBalanceMsg] = useState('');
    const [invalidPurchaseLimitMsg, setInvalidPurchaseLimitMsg] = useState('');
    const [invalidProfilePic, setInvalidProfilePic] = useState('');
    const [invalidCommissionMsg, setInvalidCommissionMsg] = useState('');

    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('')

    const updateBalance = (newBalance) => setNewAgentDetails((newAdminData) => ({...newAdminData, balance: newBalance}))
    const updatePurchaseLimit = (newPurchaseLimit) => setNewAgentDetails((newAdminData) => ({...newAdminData, purchaseLimit: newPurchaseLimit}))
    const updateCommission = (newCommission) => setNewAgentDetails((newAdminData) => ({...newAdminData, commission: newCommission}))

    
    const updateName = (newName) => setNewAgentDetails((newAgentData) => ({...newAgentData, name: newName}))
    const updateUserName = (newUsername) => setNewAgentDetails((newAgentData) => ({...newAgentData, userName: newUsername}))
    const updatePhoneNumber = (newPhoneNumber) => setNewAgentDetails((newAgentData) => ({...newAgentData, phoneNumber: newPhoneNumber}))
    const updateCity = (newCity) => setNewAgentDetails((newAgentData) => ({...newAgentData, city: newCity}))
    const updateState = (newState) => {
        setNewAgentDetails((newAgentData) => ({...newAgentData, state: newState}))
        const currentCities = citiesList
        .filter(city => city.state === newState)
        if(!currentCities.map(city => city.name).includes(newAgentDetails.city)) {
            updateCity('')
        }
        setCityOptions(citiesList
            .filter(city => city.state === newState)
            .map(cityData => ({
            label: cityData.name,
            value: cityData.name
        })))
    }
      const [newPassword, setNewPassword] = useState("");

    const updatePassword = (newPassword) => setNewAgentDetails((newAgentData) => ({...newAgentData, password: newPassword}))
    const updateConfirmPassword = (newConfirmPassword) => setConfirmNewPassword(newConfirmPassword)

   const updateCheckBox = (key) => () => setNewAgentDetails((newAgentData) => ({...newAgentData, screens: {...newAgentData.screens, [key]: !newAgentData.screens[key]}}))

   const updateProfilePic = (newPic) => setNewAgentDetails((newAgentData) => ({...newAgentData, profilePic:newPic}))
    const validRequestData = () => {
        
        let validRequest = true
        if(!newAgentDetails.name) {
            setInvalidNameMsg('Please enter a name')
            console.log('settting invalid request')
            validRequest = false
        } else {
            setInvalidNameMsg('')
        }
        const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,})$/
        if(!newAgentDetails.userName) {
            setInvalidUserNameMsg('Please enter a user name')
            console.log('settting invalid request')
            validRequest = false
        } else if(!newAgentDetails.userName.match(emailRegex)) {
            setInvalidUserNameMsg('user name should be a valid email')
            console.log('settting invalid request')
            validRequest = false
        } else {
            setInvalidUserNameMsg('')
        }
        const phoneNumberRegex = /^\d{7}$/
        if(!newAgentDetails.phoneNumber.match(phoneNumberRegex)) {
            setInvalidPhoneNumberMsg('Phone Number must have only numbers and exactly 7 digits')
            console.log('settting invalid request')
            validRequest = false
        } else {
            setInvalidPhoneNumberMsg('')
        }
        if(!newAgentDetails.city) {
            setInvalidCityMsg('Please select a city')
            console.log('settting invalid request')
            validRequest = false
        } else {
            setInvalidCityMsg('')
        }
        if(!newAgentDetails.state) {
            setInvalidStateMsg('Please select a state')
            console.log('settting invalid request')
            validRequest = false
        } else {
            setInvalidStateMsg('')
        }
        if(!editAgentFlag && !newAgentDetails.password) {
            setInvalidPasswordMsg('Password cannot be empty')
            console.log('settting invalid request')
            validRequest = false
        }
        else if(confirmNewPassword != newAgentDetails.password) {
            setInvalidPasswordMsg('Password and confirm password are not matching')
            setInvalidConfirmPasswordMsg('Password and confirm password are not matching')
            console.log('settting invalid request')
            validRequest = false
        }
        else if(confirmNewPassword && confirmNewPassword.length < 8) {
            setInvalidPasswordMsg('Password must be 8 or more characters')
            console.log('settting invalid request')
            validRequest = false
        }
        else {
            setInvalidPasswordMsg('')
        }

        if((!editAgentFlag || newAgentDetails.password) && !confirmNewPassword) {
            setInvalidConfirmPasswordMsg('Confirm password cannot be empty')
            console.log('settting invalid request')
            validRequest = false
        } else {
            setInvalidConfirmPasswordMsg('')
        }

        if(!newAgentDetails.balance) {
            setInvalidBalanceMsg('Balance is mandatory field')
            validRequest = false
        } else if(newAgentDetails.balance && !validateCurrencyFormat(newAgentDetails.balance)) {
            setInvalidBalanceMsg('Please enter a valid amount')
            console.log('settting invalid request')
            validRequest = false
        } else {
            setInvalidBalanceMsg('')
        }

        if(!newAgentDetails.purchaseLimit) {
            setInvalidPurchaseLimitMsg('Purchase limit is mandatory field')
        } else if(newAgentDetails.purchaseLimit && !validateCurrencyFormat(newAgentDetails.purchaseLimit)) {
            setInvalidPurchaseLimitMsg('Please enter a valid amount')
            console.log('settting invalid request')
            validRequest = false
        } else {
            setInvalidPurchaseLimitMsg('')
        }

        if(!newAgentDetails.commission) {
            setInvalidCommissionMsg('Commission is mandatory field')
        } else if(newAgentDetails.commission && !validateCommissionFormat(newAgentDetails.commission)) {
            setInvalidCommissionMsg('Please enter a valid amount')
            console.log('settting invalid request')
            validRequest = false
        } else {
            setInvalidCommissionMsg('')
        }
        
        return validRequest
    }


    const submitAgentData = () => {
        if(!validRequestData()) {
            console.log('invalid data not submitting request')
            return
        }
        setLoading(true)
        setErrorMsg('')
        const addAgentUrl = process.env.REACT_APP_USER_API_URL
        const addAgentHeaders = {
            'x-channel': 'agent',
            'auth-token': localStorage.getItem('token'),
        }
        const editAgentHeaders = {
            'x-channel':'details',
            'x-role':'agent',
            'auth-token': localStorage.getItem('token'),
        }
        fetch(addAgentUrl, {
            method: editAgentFlag? 'PUT' :'POST',
            headers: editAgentFlag? editAgentHeaders : addAgentHeaders,
            body: JSON.stringify({
                ...newAgentDetails,
                phoneNumber: '242'+newAgentDetails.phoneNumber,
                balance: formatToAmount(newAgentDetails.balance),
                purchaseLimit: formatToAmount(newAgentDetails.purchaseLimit),
                commission: formatCommissionToAmount(newAgentDetails.commission)
            })
        })
        .then((resp) => {
            if(resp.status == 200) {
                if (defaultProfilePic != newAgentDetails.profilePic) {
                    saveProfilePic()
                } else {
                    navigate('/home/agent', location)
                }
            } else if(resp.status === 400) {
                resp.json().then(data => {
                    if(data.description === 'username  already exists')
                        setInvalidUserNameMsg('User is already exist, please try different email')
                    else
                        setErrorMsg('Something went wrong. Please try again later')
                })
                setLoading(false)
            } else {
                setErrorMsg('Something went wrong. Please try again later')
                console.log('some error occured')
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
                'x-username': newAgentDetails.userName,
                'scope': 'profile',
            },
            body: newAgentDetails.profilePic.split(",")[1] // send only base 64 formatted string
        })
        .then(resp => {
            if (resp.status == 200) {
                navigate('/home/agent', location)
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
                .filter(city => city.state === newAgentDetails.state)
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
            <div className="addAgentPage">
                <div className="addAgentsTitleRow">
                    {editAgentFlag?'Edit':'Add'} Agent
                </div>
                <Grid container spacing={2}>
                    <Grid item lg={8}>
                        <div className='addAgentTextFields'>
                            <div className='addAgentSubHeading'>Profile Details</div>
                            <TextInputv2 label="Name" onChange={updateName} defaultValue={newAgentDetails.name} errorState={invalidNameMsg} />
                            {invalidNameMsg && <div className="formErrorMessage">{invalidNameMsg}</div>}
                            <TextInputv2 label="Username" onChange={editAgentFlag?()=>{}:updateUserName} disabled={editAgentFlag} defaultValue={newAgentDetails.userName} errorState={invalidUserNameMsg} />
                            {invalidUserNameMsg && <div className="formErrorMessage">{invalidUserNameMsg}</div>}
                            <Grid container spacing={2}>
                                <Grid item lg={2}><TextInputv2 label="code" defaultValue={"(242)"} disabled={true} /></Grid>
                                <Grid item lg={10}>
                                    <TextInputv2 label="Phone number" onChange={updatePhoneNumber} defaultValue={newAgentDetails.phoneNumber} errorState={invalidPhoneNumberMsg} />
                                    {invalidPhoneNumberMsg && <div className="formErrorMessage">{invalidPhoneNumberMsg}</div>}
                                </Grid>
                            </Grid>
                            <Grid container spacing={2}>
                                <Grid item lg={6}>
                                    <Dropdown label="State" onChange={updateState} options={stateOptions} defaultValue={newAgentDetails.state} errorState={invalidStateMsg} />
                                    {invalidStateMsg && <div className="formErrorMessage">{invalidStateMsg}</div>}
                                </Grid>
                                <Grid item lg={6}>
                                    <DropdownV3 label="City" onChange={updateCity} options={cityOptions} currentValue={newAgentDetails.city} errorState={invalidCityMsg} />
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
              />
              <div
                className="eye-icon"
                onClick={() => togglePasswordVisibility("confirm")}
              >
                <img src={eyeIcon} alt="Eye Icon" />
              </div>
            </div>                            
            {invalidConfirmPasswordMsg && <div className="formErrorMessage">{invalidConfirmPasswordMsg??""}</div>}
                <div className='addAgentSubHeading'>Balance management</div>
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
                {/* {console.log(newAdminDetails.balance.replace('$',''))} */}
                <div className="adminAmount">

                  <TextInputv2
                    label="Balance"
                    onChange={updateBalance}
                    defaultValue={newAgentDetails.balance.replace('$','')}
                    errorState={invalidBalanceMsg}
                    // value={newAdminDetails.balance}  
                  />
                </div>
              </div>                            
              {invalidBalanceMsg && <div className="formErrorMessage">{invalidBalanceMsg??""}</div>}
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
                {/* {console.log(newAdminDetails.balance.replace('$',''))} */}
                <div className="adminAmount">

                  <TextInputv2
                    label="Purchase limit"
                    onChange={updatePurchaseLimit}
                    defaultValue={newAgentDetails.purchaseLimit.replace('$','')}
                    errorState={invalidBalanceMsg}
                    // value={newAdminDetails.balance}  
                  />
                </div>
              </div>                               
              {invalidPurchaseLimitMsg && <div className="formErrorMessage">{invalidPurchaseLimitMsg??""}</div>}
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
                    label="Commission %"
                    onChange={updateCommission}
                    defaultValue={newAgentDetails.commission.replace('%','')}
                    errorState={invalidCommissionMsg}
                    // value={newAdminDetails.commission}

                  />
                </div>
              </div>                            {invalidCommissionMsg && <div className="formErrorMessage">{invalidCommissionMsg??""}</div>}
                        </div>
                    </Grid>
                    <Grid item lg={4}>
                        <div className='addAgentPicRoleConfigs'>
                            <div className='profilePicDiv'>
                                <img src={newAgentDetails.profilePic} className='profileImage'/>
                            </div>
                            {invalidProfilePic && <div className="formErrorMessage">{invalidProfilePic ?? ""}</div>}
                            <PrimaryButton label="Upload" style={{width:"74px", height:"40px", padding: "10px 0px"}} type="secondary" onClick={handleClick}  />
                            <input type="file" style={{ "display": "none" }} ref={hiddenFileInput} onChange={handleChange} />
                            <div className='imageSizeText'>Image should be less than 5 mb</div>
                            <div className='addAgentRoleConfigs'>
                                <div className='addAgentSubHeading'>Agent role configurations</div>
                                <div className='flexCheckbox'>
                                    <Checkbox defaultChecked={newAgentDetails.screens.balance} size="small" onClick={updateCheckBox('balance')}/>
                                    <div className="checkBoxLabel">View all balance tiles</div>
                                </div>
                                <div className='flexCheckbox'>
                                    <Checkbox defaultChecked={newAgentDetails.screens.play} size="small" onClick={updateCheckBox('play')}/>
                                    <div className="checkBoxLabel">Play</div>
                                </div>
                                <div className='flexCheckbox'>
                                    <Checkbox defaultChecked={newAgentDetails.screens.scan} size="small" onClick={updateCheckBox('scan')}/>
                                    <div className="checkBoxLabel">Scan</div>
                                </div>
                                <div className='flexCheckbox'>
                                    <Checkbox defaultChecked={newAgentDetails.screens.transactionList} size="small" onClick={updateCheckBox('transactionList')}/>
                                    <div className="checkBoxLabel">Transaction list</div>
                                </div>
                                <div className='flexCheckbox'>
                                    <Checkbox defaultChecked={newAgentDetails.screens.winnerNumberList} size="small" onClick={updateCheckBox('winnerNumberList')}/>
                                    <div className="checkBoxLabel">Winner number list</div>
                                </div>
                                <div className='flexCheckbox'>
                                    <Checkbox defaultChecked={newAgentDetails.screens.soldoutNumberList} size="small" onClick={updateCheckBox('soldoutNumberList')}/>
                                    <div className="checkBoxLabel">Sold out number list</div>
                                </div>
                                <div className='flexCheckbox'>
                                    <Checkbox defaultChecked={newAgentDetails.screens.voidTickets} size="small" onClick={updateCheckBox('voidTickets')}/>
                                    <div className="checkBoxLabel">Void tickets list</div>
                                </div>
                                <div className='flexCheckbox'>
                                    <Checkbox defaultChecked={newAgentDetails.screens.settings} size="small" onClick={updateCheckBox('settings')}/>
                                    <div className="checkBoxLabel">Settings</div>
                                </div>
                            </div>
                        </div>
                    </Grid>
                </Grid>
                <div className='formErrorMessage'>{errorMsg}</div>
                <div className='addAgentSaveRow'>
                    <PrimaryButton label='Cancel' type='secondary' onClick={()=>navigate('/home/agent', location)}/>
                    <PrimaryButton label='Save' type='primary' onClick={submitAgentData} />
                </div>
            </div>
            {loading && <CenterFantasyLoader />}
        </>
    )
}