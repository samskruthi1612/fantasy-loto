import { useEffect, useState, useRef } from "react"
import { OverlayOptions } from "../overlayOptions/OverlayOptions"
import './Dropdown.css'
import {ReactComponent as DownArrow} from '../../resources/down_arrow.svg'

export const Dropdown = ({label, options, onChange, defaultValue, errorState, deafultLabel, reset, style, disabled}) => {
    const [showOptions, setShowOptions] = useState(false);
    const [currentValue, setCurrentValue] = useState(defaultValue);
    const [currentLabel, setCurrentLabel] = useState(deafultLabel??defaultValue);

    const dropdownRef = useRef();
    const mapToDropDownOption = (option) => ({
        label: option.label,
        onClick: ()=>{
            onChange(option.value)
            setCurrentValue(option.value)
            setCurrentLabel(option.label)
            setShowOptions(false)
        }
    })

    useEffect(() => {
        if(reset) {
            setCurrentLabel(deafultLabel??defaultValue)
            setCurrentValue(defaultValue)
        }
    })

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
              setShowOptions(false);
            }
          }
      
          document.addEventListener('click', handleClickOutside);
          return () => {
            document.removeEventListener('click', handleClickOutside);
          };
    }, [])

    return (
        <div className={`dropdown ${errorState?'dropdownError':''} clickable ${disabled?'dropdownDisabled':'' }`}
            style={style} 
            onClick={()=>{
                if (!disabled)
                    setShowOptions((curState)=>!curState)
                }}
            ref={dropdownRef}
            >
            {currentLabel === ''?
                <div className="dropdownPlaceHolder">{label}</div>
                : <div className="dropdownText">
                    <div className="dropdownLabel">
                        {label}
                    </div>
                    <div className="dropdownValue">{currentLabel}</div>
                </div>
            }
            <div className="dropdownDownArrow" onClick={()=>{
                if (!disabled)
                    setShowOptions((curState)=>!curState)
                }}>
                <DownArrow onClick={()=>{
                if (!disabled)
                    setShowOptions((curState)=>!curState)
                }} />
            </div>
            {showOptions && <OverlayOptions options={options.map(mapToDropDownOption)} width={"100%"} />}
        </div>
    )
}