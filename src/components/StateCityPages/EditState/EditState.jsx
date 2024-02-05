import { TextInput } from '../../../elements/textInput/TextInput'
import { ReactComponent as CloseButton } from '../../../resources/close-button.svg'
import React, { useState } from 'react'

import './EditState.css'
import { PrimaryButton } from '../../../elements/button/Button'

import { Dropdown } from '../../../elements/dropdown/Dropdown'
import { useLocation } from 'react-router-dom'
import TextInputv2 from '../../../elements/textInputv2/TextInputv2'

const EditState = ({onClose, editState, editIndex, reload, setReload, setShowStatusUpdate}) => {
    const location = useLocation();

    const [stateName, setStateName] = useState(editState?.name)
    const [countryName, setCountryName] = useState(editState?.country)

    const [errorState, setErrorState] = useState('')
    const [errorCountry, setErrorCountry] = useState('')
    
    const [errorRequest, setErrorRequest] = useState('')

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
            method: 'PUT',
            headers: {
                'x-username': location.state.userDetails.userName,
                'auth-token': localStorage.getItem('token'),
            },
            body: JSON.stringify({
                id: editState.id,
                country: countryName,
                name: stateName,
            })
        }).then((resp) => {
            if (resp.status == 200) {
                console.log("Edited State")
                setShowStatusUpdate("State has been updated")
                setReload(!reload)
                setTimeout(() => {
                    setShowStatusUpdate('')
                }, 5000)
                onClose()
            }
            else {
                console.log("Editing state failed")
                setErrorRequest("Unable to edit state")
            }
        })
        .catch((err) => console.log(err))
    }

    console.log(editState)

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
                        deafultLabel={editState?.country}
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

export default EditState