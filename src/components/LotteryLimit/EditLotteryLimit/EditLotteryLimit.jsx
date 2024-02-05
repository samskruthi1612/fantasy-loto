import styles from './EditLotteryLimit.module.css'
import { useLocation } from 'react-router-dom'
import {useState, useEffect} from 'react'
import {ReactComponent as CloseButton} from '../../../resources/close-button.svg'
import { PrimaryButton } from '../../../elements/button/Button'
import TextInputv2 from '../../../elements/textInputv2/TextInputv2'
import { CenterFantasyLoader } from "../../../elements/fantasyLotoLoader/FantasyLotoLoader";
import { Checkbox } from '@mui/material'
import { formatToAmount, formatToCurrency, validateCurrencyFormat } from '../../../util/currencyformatter'
import { capitalizeFirstLetter } from '../../../util/stringUtils'
import { fetchUserIp } from '../../../api/fetchUserIp'
import { fetchUserLocation } from '../../../api/fetchUserLocation'

export const EditLotteryLimit = ({
    lotteryLimitRecord: {gameId, house, slot, gameType, defaultLimit, statusActive},
    onClose, 
    onSave, 
    onError}) => {

    const location = useLocation();
    const [lotteryLimitText, setLotteryLimitText] = useState(formatToCurrency(defaultLimit));
    const [lotteryLimitTextError, setLotteryLimitTextError] = useState('');
    const [applyAllSelected, setApplyAllSelected] = useState(false);

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
        if(!lotteryLimitText || !validateCurrencyFormat(lotteryLimitText)) {
            setLotteryLimitTextError("Lottery limit must be a valid currency amount")
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
        fetch(process.env.REACT_APP_LOTTERY_LIMIT, {
            method: 'POST',
            headers: {
                'x-username':location.state.userDetails.userName,
                'auth-token': localStorage.getItem('token'),
            },
            body: JSON.stringify({
                game_id: gameId,
                limit: formatToAmount(lotteryLimitText),
                apply_all: applyAllSelected,
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
                    Lottery limit
                </div>
                <div className={`${styles.closeButton} clickable`} onClick={onClose}>
                    <CloseButton />
                </div>
            </div>
            <div className={`${styles.inputsGroup}`}>
                <div className={`${styles.detailsHeading}`}>Details</div>
                <div className={`${styles.gameDetails}`}>
                    <div className={`${styles.gameDetailKey}`}>Game</div>
                    <div className={`${styles.gameDetailValue}`}>{capitalizeFirstLetter(house)} {capitalizeFirstLetter(slot)} {capitalizeFirstLetter(gameType)}</div>
                </div>
                <div className={`${styles.gameDetails}`}>
                    <div className={`${styles.gameDetailKey}`}>Status</div>
                    <div className={`${styles.gameDetailValue}`}>{statusActive?'Active':'In-active'}</div>
                </div>
                <TextInputv2 label='Default limit' defaultValue={defaultLimit>0?lotteryLimitText:''} onChange={()=>{}} disabled={true} />
                <TextInputv2 label='Set new limit' defaultValue={defaultLimit>0?lotteryLimitText:''} onChange={setLotteryLimitText} errorState={lotteryLimitTextError} errorMessage={lotteryLimitTextError} />
                <div className={`${styles.applyAllRow}`}>
                    <Checkbox defaultChecked={applyAllSelected} onChange={()=>setApplyAllSelected(sel => !sel)} />
                    <div>Apply for all houses</div>
                </div>
                <div className={`${styles.applyAllNote}`}>
                    Note: Selecting this option will apply the lottery-limit to all the houses. Please make sure to notify all the franchises.
                </div>
            </div>
            {(userIpErrMsg || locationErrorMsg) && <div className='formErrorMessage'>{userIpErrMsg==''?locationErrorMsg:userIpErrMsg}</div>}
            <PrimaryButton type='primary' label='Save' style={{width:'100%'}} onClick={validateAndSave} />
        </div>
    </>
}