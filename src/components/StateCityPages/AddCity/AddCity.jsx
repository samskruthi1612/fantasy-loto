import { TextInput } from '../../../elements/textInput/TextInput'
import { ReactComponent as CloseButton } from '../../../resources/close-button.svg'
import React, { useState } from 'react'

import './AddCity.css'
import { PrimaryButton } from '../../../elements/button/Button'

import { Dropdown } from '../../../elements/dropdown/Dropdown'
import { useLocation } from 'react-router-dom'
import TextInputv2 from '../../../elements/textInputv2/TextInputv2'

const AddCity = ({onClose, stateOptions, reload, setReload, setShowStatusUpdate}) => {
    const location = useLocation();

    const [cityName, setCityName] = useState('')
    const [stateName, setStateName] = useState('')
    const [countryName, setCountryName] = useState('Bahamas')

    const [errorCity, setErrorCity] = useState('')
    const [errorState, setErrorState] = useState('')
    const [errorCountry, setErrorCountry] = useState('')

    const [errorRequest, setErrorRequest] = useState('')

    const states = stateOptions.map(item => ({
        label: item,
        value: item
    }))

    const handleAddCity = () => {
        setErrorRequest('')
        if (countryName === '') {
            setErrorCountry("Please select a Country")
            return
        }
        setErrorCountry('')
        if (stateName === '') {
            setErrorState("Please select a State")
            return
        }
        setErrorState('')
        if(cityName === '') {
            setErrorCity("Please enter a city name")
            return
        }
        setErrorCity('')
        
        fetch(process.env.REACT_APP_STATE_CITY_API_HOST + '/cities', {
            method: 'POST',
            headers: {
                'x-username': location.state.userDetails.userName,
                'auth-token': localStorage.getItem('token'),
            },
            body: JSON.stringify({
                country: countryName,
                state: stateName,
                name: cityName,
            })
        }).then((resp) => {
            if (resp.status === 200) {
                console.log("Added City")
                setShowStatusUpdate("City has been added")
                setReload(!reload)
                setTimeout(() => {
                    setShowStatusUpdate('')
                }, 5000)
                onClose()

            }
            else {
                resp.json().then(data => {
                    if (data.error === "country and state and city combination already exists")
                        setErrorRequest("Country and state and city combination already exists")
                    else
                        setErrorRequest("Unable to add City")
                })
                .catch((e) => {
                setErrorRequest("Unable to add City")
            })
            }
        })
        .catch((err) => console.log(err))
    }

  return (
    <>
        <div className='AddCityOverlay'>
            <div className='titleRow'>
                <div className="addTitle">Add City</div>
                <div className='closeButton' onClick={onClose}><CloseButton /></div>
            </div>

            <div className='AddCity'>
                <div className='inputs'>
                    <Dropdown
                        label="Name of Country"
                        defaultValue={countryName}
                        options={[]}
                        onChange={(value) => setCountryName(value)}
                        deafultLabel="Bahamas"
                        resest={countryName === ''}
                        disabled={true}
                        errorState={errorCountry}
                    />
                    {errorCountry && <span className='error-msg'>{errorCountry}</span>}
                    <Dropdown
                        label="Name of State"
                        defaultValue={stateName}
                        options={states}
                        onChange={(value) => setStateName(value)}
                        deafultLabel="Choose a State"
                        resest={stateName === ''}
                        errorState={errorState}
                    />
                    {errorState && <span className='error-msg'>{errorState}</span>}
                    <TextInputv2 
                        label="Name of City" 
                        width="100%" onChange={setCityName} 
                        defaultValue={cityName}
                        errorState={errorCity}    
                    />
                    {errorCity && <span className='error-msg'>{errorCity}</span>}

                </div>
                {errorRequest && <span className='error-msg'>{errorRequest}</span>}
            </div>
            <div className='addCityButton'><PrimaryButton label="Save" style={{width:"100%"}} type="primary" onClick={handleAddCity} /></div>
        </div>
    </>
  )
}

export default AddCity