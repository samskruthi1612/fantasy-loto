import styles from './EditBetNumber.module.css'
import {useState, useEffect} from 'react'
import { useLocation } from 'react-router-dom'
import {ReactComponent as CloseButton} from '../../../resources/close-button.svg'
import { PrimaryButton } from '../../../elements/button/Button'
import TextInputv2 from '../../../elements/textInputv2/TextInputv2'
import { formatToAmount, formatToCurrency, validateCurrencyFormat } from '../../../util/currencyformatter'
import { CenterFantasyLoader } from "../../../elements/fantasyLotoLoader/FantasyLotoLoader";
import { fetchUserIp } from '../../../api/fetchUserIp'
import { fetchUserLocation } from '../../../api/fetchUserLocation'

export const EditBetNumber = ({
    betTypeDetails:{betTypeName, betFrom, betTo, betTypeLimit},
     onClose, 
     onSave, 
     onError}) => {

    const location = useLocation();
    const [betLimitText, setBetLimitText] = useState(formatToCurrency(betTypeLimit));
    const [betLimitTextError, setBetLimitTextError] = useState('');
    const [loading, setLoading] = useState(false)
    const [userIp, setUserIp] = useState('')
    const [userIpErrMsg, setUserIpErrMsg] = useState('')
    const [locationDetails, setLocationDetails] = useState(null);
    const [locationErrorMsg, setLocationErrorMsg] = useState('');

    useEffect(() => {
        fetchUserIp(setUserIp, setUserIpErrMsg)
        if(locationDetails==null) {
            fetchUserLocation(setLocationDetails, setLocationErrorMsg)
        }
    }, [])

    const validateAndSave = () => {
        let invalidInputs = false
        if(!betLimitText || !validateCurrencyFormat(betLimitText)) {
            setBetLimitTextError("Bet limit must be a valid currency amount")
            invalidInputs = true
        }
        if(userIpErrMsg!=='' || locationErrorMsg!=='') {
            invalidInputs = true
        }
        if(invalidInputs)
            return
        postEditDetails()
    }

    const postEditDetails = () => {
        setLoading(true)
        fetch(process.env.REACT_APP_BET_NUMBER_LIMIT, {
            method: 'POST',
            headers: {
                'x-username':location.state.userDetails.userName,
                'auth-token': localStorage.getItem('token'),
            },
            body: JSON.stringify({
                game_type: betTypeName.toLowerCase().replace(' ',''),
                limit: formatToAmount(betLimitText),
                location: locationDetails.location,
                coordinates: `${locationDetails.latitude}, ${locationDetails.longitude}`,
                ip_address: userIp
            })
          })
          .then((resp)=>{
            setLoading(false)
            if(resp.status==200) {
                onSave()
            }
            else {
                console.log('API call failed with status', resp.status)
                onError()
            }
          })
          .catch(err=>{
            setLoading(false)
            console.log('Something went wrong with error', err)
            onError()
          })
    }

    return <>
        {loading && <CenterFantasyLoader />}
        <div className={`${styles.editBatchDrawer}`}>
            <div className={`${styles.drawerTitleRow}`}>
                <div className={`${styles.drawerTitleText}`}>
                    Bet limit
                </div>
                <div className={`${styles.closeButton} clickable`} onClick={onClose}>
                    <CloseButton />
                </div>
            </div>
            <div className={`${styles.inputsGroup}`}>
                <TextInputv2 label='Game type' defaultValue={betTypeName} disabled={true}  />
                <TextInputv2 label='Bet from' defaultValue={betFrom} disabled={true} />
                <TextInputv2 label='Bet to' defaultValue={betTo} disabled={true} />
                <TextInputv2 label='Set bet limit' defaultValue={betLimitText} onChange={setBetLimitText} errorState={betLimitTextError} errorMessage={betLimitTextError} />
            </div>
            {(userIpErrMsg || locationErrorMsg) && <div className='formErrorMessage'>{userIpErrMsg==''?locationErrorMsg:userIpErrMsg}</div>}
            <PrimaryButton type='primary' label='Save' style={{width:'100%'}} onClick={validateAndSave} />
        </div>
    </>
}