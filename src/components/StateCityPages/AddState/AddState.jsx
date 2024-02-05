import { TextInput } from '../../../elements/textInput/TextInput'
import { ReactComponent as CloseButton } from '../../../resources/close-button.svg'
import React, { useState } from 'react'
import './AddState.css'
import { PrimaryButton } from '../../../elements/button/Button'
import { Dropdown } from '../../../elements/dropdown/Dropdown'
import { useLocation } from 'react-router-dom'
import TextInputv2 from '../../../elements/textInputv2/TextInputv2'

const AddState = ({onClose, reload, setReload, setShowStatusUpdate}) => {
    const location = useLocation();

    const [stateName, setStateName] = useState('')
    const [countryName, setCountryName] = useState('Bahamas')

    const [errorState, setErrorState] = useState('')
    const [errorCountry, setErrorCountry] = useState('')

    const [errorRequest, setErrorRequest] = useState('')


    const countries = [
        {
            label: 'Bahamas',
            value: 'Bahamas'
        }
    ]


    const handleAddState = () => {
        if (countryName === '') {
            setErrorCountry("Please select a Country")
            return
        }
        setErrorCountry('')
        if (stateName === '') {
            setErrorState("Please enter a state name")
            return
        }
        setErrorState('')

        fetch(process.env.REACT_APP_STATE_CITY_API_HOST + '/states', {
            method: 'POST',
            headers: {
                'x-username': location.state.userDetails.userName,
                'auth-token': localStorage.getItem('token'),
            },
            body: JSON.stringify({
                country: countryName,
                name: stateName,
            })
        }).then((resp) => {
            if (resp.status == 200) {
                setShowStatusUpdate("State has been added")
                setReload(!reload)
                setTimeout(() => {
                    setShowStatusUpdate('')
                }, 5000)
                onClose()
            }
            else {
                resp.json().then(data => {
                    if (data.error === "country and state combination already exists")
                        setErrorRequest("Country and state combination already exists")
                    else
                        setErrorRequest("Unable to add State")
                })
                .catch((e) => {
                setErrorRequest("Unable to add State")
            })
            }
        })
        .catch((err) => console.log(err))
    }

  return (
    <>
        <div className='AddStateOverlay'>
            <div className='titleRow'>
                <div className="addTitle">Add State</div>
                <div className='closeButton' onClick={onClose}><CloseButton /></div>
            </div>

            <div className='AddState'>
                <div className='inputs'>
                    <Dropdown
                        label="Name of Country"
                        defaultValue={countryName}
                        options={[]}
                        onChange={(value) => setCountryName(value)}
                        deafultLabel="Bahamas"
                        resest={countryName == ''}
                        disabled={true}
                        errorState={errorCountry}
                    />
                    {errorCountry && <span className='error-msg'>{errorCountry}</span>}
                    <TextInputv2 
                        label="Name of State" 
                        width="100%" onChange={setStateName} 
                        defaultValue={stateName}
                        errorState={errorState}    
                    />
                    {errorState && <span className='error-msg'>{errorState}</span>}

                </div>
                {errorRequest && <span className='error-msg'>{errorRequest}</span>}

            </div>
            <div className='addStateButton'><PrimaryButton label="Save" style={{width:"100%"}} type="primary" onClick={handleAddState} /></div>
        </div>
    </>
  )
}

export default AddState