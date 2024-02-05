import {useState, useRef, useEffect} from 'react'
import './TextInput.css'

export const TextInput = ({ label, maskInput, onChange, width, defaultValue, errorState, disabled }) => {
    const [input, setInput] = useState(label);
    const onInputHandler = (event)=>{
        setInput(event.target.value)
        onChange(event.target.value)
    }
    return (
        <input 
            type={maskInput?"password":"text"} 
            className={`textInput ${errorState?'error':''}`}
            style={{width}}
            onInput={disabled?()=>{}:onInputHandler} 
            placeholder={label} 
            defaultValue={defaultValue??''}
            disabled={disabled?true:false}
        />
    )
}