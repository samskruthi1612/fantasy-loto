import { PrimaryButton } from '../../../elements/button/Button'
import './EditWinRatio.css'
import { useEffect, useState } from 'react'
import {ReactComponent as CloseButton} from '../../../resources/close-button.svg'
import { TextInput } from '../../../elements/textInput/TextInput'
import { Checkbox } from '@mui/material'
import { PopupV3 } from '../../../elements/popupV3/popupV3'
import { formatToAmount, formatToCurrency, validateCurrencyFormat } from '../../../util/currencyformatter'
import { capitalizeFirstLetter } from '../../../util/stringUtils'
import { CenterFantasyLoader } from '../../../elements/fantasyLotoLoader/FantasyLotoLoader'
import { useLocation } from 'react-router-dom'
import { useFetchGet } from '../../../hooks/useFetchGet'
import { fetchUserIp } from '../../../api/fetchUserIp'
import { fetchUserLocation } from '../../../api/fetchUserLocation'
import TextInputv2 from '../../../elements/textInputv2/TextInputv2'

export const EditWinRatio = ({betType, onClose, onSave, onError}) => {
    const location = useLocation();
    const [showConfirmationPopup, setShowConfirmationPopup] = useState(false);
    const [pick3ratio, setPick3ratio] = useState(betType.ratioPick3)
    const [pick3ratioErrMsg, setPick3ratioErrMsg] = useState('')
    const [pick4ratio, setPick4ratio] = useState(betType.ratioPick4)
    const [pick4ratioErrMsg, setPick4ratioErrMsg] = useState('')
    const [betTypeLimit, setBetTypeLimit] = useState(formatToCurrency(betType.noLimit?0:betType.limitSet))
    const [betTypeLimitErrMsg, setBetTypeLimitErrMsg] = useState('')
    const [noLimitChecked, setNoLimitChecked] = useState(betType.noLimit);
    const [visibleOnApp, setVisibleOnApp] = useState(betType.visibility)

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
        if(isNaN(pick3ratio) || !Number.isInteger(Number(pick3ratio))) {
            setPick3ratioErrMsg('ratio must be an integer without decimals')
            invalidInputs = true
        }
        if(isNaN(pick4ratio) || !Number.isInteger(Number(pick4ratio))) {
            setPick4ratioErrMsg('ratio must be an integer without decimals')
            invalidInputs = true
        }
        if(!noLimitChecked && !validateCurrencyFormat(betTypeLimit)) {
            setBetTypeLimitErrMsg('Invalid currency format entered for bet limit')
            invalidInputs = true
        }
        if(userIpErrMsg!=='' || locationErrorMsg!=='') {
            invalidInputs = true
        }
        if(invalidInputs)
            return
        setShowConfirmationPopup(true)
    }

    const onSubmit = () => {
        setLoading(true)
        fetch(process.env.REACT_APP_WIN_RATIO+'/bet-types', {
            headers: {
                'x-username': location.state.userDetails.userName,
                'auth-token': localStorage.getItem('token'),
            },
            method: 'POST',
            body: JSON.stringify({
                bet_Type: betType.betType,
                win_ratio: {
                    pick3: Number(pick3ratio),
                    pick4: Number(pick4ratio)
                },
                bet_type_limit: noLimitChecked?-1:formatToAmount(betTypeLimit),
                no_limit: noLimitChecked,
                location: locationDetails.location,
                coordinates: `${locationDetails.latitude}, ${locationDetails.longitude}`,
                ip_address: userIp,
                visible_on_mobile: visibleOnApp
            })
        })
        .then(resp => {
            if(resp.status === 200) {
                onSave()
            } else {
                console.log('Api responded failed status:', resp.status)
                onError()
            }
            setLoading(false)
        }).catch(err => {
            console.log('Api call to update win-ratio/limit failed with error', err)
            onError()
        })
    }

    return <>
        {
            loading && <CenterFantasyLoader />   
        }
        <div className='editWinRatioDrawer'>
            <div className='editWinRatioTitleRow'>
                <div className='editWinRatioTitle'>
                    {capitalizeFirstLetter(betType.betType)}
                </div>
                <div className='closeDrawer'>
                    <CloseButton onClick={onClose} />
                </div>
            </div>
            <div className='editWinRatioContent'>
                <div className='editWinRatioInputLabel'>Set win ratio</div>
                <div className='editWinRatioInputs'>
                    <div>
                        <TextInputv2 label={'Win ratio for Pick 3'} onChange={setPick3ratio} defaultValue={betType.ratioPick3} />
                        {pick3ratioErrMsg && <div className='formErrorMessage'>{pick3ratioErrMsg}</div>}
                    </div>
                    <div>
                        <TextInputv2 label={'Win ratio for Pick 4'} onChange={setPick4ratio} defaultValue={betType.ratioPick4} />
                        {pick4ratioErrMsg && <div className='formErrorMessage'>{pick4ratioErrMsg}</div>}
                    </div>
                </div>
                <div className='editWinRatioLimit'>
                    <div className='editWinRatioInputLabel'>Limit for bet-type</div>
                    <div className='flexRow'>
                        <Checkbox defaultChecked={noLimitChecked} onChange={()=>setNoLimitChecked(cur=>!cur)} />
                        <div className='checkboxLabel'>No limit</div>
                    </div>
                </div>
                <TextInputv2 label={'Limit'} onChange={setBetTypeLimit} disabled={noLimitChecked} defaultValue={noLimitChecked?'':betTypeLimit} />
                {betTypeLimitErrMsg && <div className='formErrorMessage'>{betTypeLimitErrMsg}</div>}
                <div className='editWinRatioInputLabel'>Visible on Mobileapp</div>
                <div className='flexRow'>
                    <Checkbox defaultChecked={visibleOnApp} onChange={()=>setVisibleOnApp(cur=>!cur)} />
                    <div className='checkboxLabel'>Yes</div>
                </div>
                <div className='subText'>
                {   !visibleOnApp?'This bet-type will be hidden on mobile app.':
                        (noLimitChecked?'This bet-type will appear on mobile app with no limit.'
                        :`This bet-type will appear on mobile app, until the win-amount on this bet-type reaches ${betTypeLimit}. After that mobile app hides this Bet type on mobile app.`)}
                </div>
            </div>
            {(userIpErrMsg || locationErrorMsg) && <div className='formErrorMessage'>{userIpErrMsg==''?locationErrorMsg:userIpErrMsg}</div>}
            <div className='editWinRatioButton'>
                <PrimaryButton label={'Save'} type={'primary'} onClick={validateAndSave} style={{width:'100%'}}/>
            </div>
        </div>
        {showConfirmationPopup && 
            <PopupV3
            title={"Are you sure you?"}
            subheading={"You want to set:"}
            inputs={[
                {key: `${capitalizeFirstLetter(betType.betType)} Pick 3 win ratio`, value: `1:${pick3ratio}`},
                {key: `${capitalizeFirstLetter(betType.betType)} Pick 4 win ratio`, value: `1:${pick4ratio}`},
                {key: `${capitalizeFirstLetter(betType.betType)} Bet type limit`, value: `${noLimitChecked?'No Limit':validateCurrencyFormat(betTypeLimit)?betTypeLimit:formatToCurrency(betTypeLimit)}`},
                {key: 'Visible on mobileapp', value: `${visibleOnApp?'Yes':'No'}`},
            ]}
            buttonText="Confirm"
            onButtonClick={onSubmit}
            onClose={() => setShowConfirmationPopup(false)}
          />
        }
    </>
}