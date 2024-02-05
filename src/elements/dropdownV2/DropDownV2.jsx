import { useEffect, useState, useRef } from "react"
import { OverlayOptions } from "../overlayOptions/OverlayOptions"
import './DropDownV2.css'
import {ReactComponent as DownArrow} from '../../resources/down_arrow.svg'

export const DropdownV2 = ({label, options, onChange, currentLabel, errorState, style}) => {
    const [showOptions, setShowOptions] = useState(false);
    const dropdownRef = useRef();
    const mapToDropDownOption = (option) => ({
        label: option.label,
        onClick: ()=>{
            onChange(option.value)
            setShowOptions(false)
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
        <div className={`dropdown ${errorState?'dropdownError':''} clickable`}
            style={style} 
            onClick={()=>setShowOptions((curState)=>!curState)}
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
            <div className="dropdownDownArrow" onClick={()=>setShowOptions((curState)=>!curState)}>
                <DownArrow onClick={()=>setShowOptions((curState)=>!curState)} />
            </div>
            {showOptions && <OverlayOptions options={options.map(mapToDropDownOption)} width={"100%"} />}
        </div>
    )
}