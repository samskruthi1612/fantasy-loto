import { useEffect, useState, useRef } from "react"
import { OverlayOptions } from "../overlayOptions/OverlayOptions"
import './DropDownV3.css'
import {ReactComponent as DownArrow} from '../../resources/down_arrow.svg'

export const DropdownV3 = ({label, options, onChange, currentValue, errorState, style}) => {
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
            {currentValue === ''?
                <div className="dropdownPlaceHolder">{label}</div>
                : <div className="dropdownText">
                    <div className="dropdownLabel">
                        {label}
                    </div>
                    <div className="dropdownValue">{options?.find(opt => opt.value === currentValue)?.label ?? ''}</div>
                </div>
            }
            <div className="dropdownDownArrow" onClick={()=>setShowOptions((curState)=>!curState)}>
                <DownArrow onClick={()=>setShowOptions((curState)=>!curState)} />
            </div>
            {showOptions && <OverlayOptions options={options.map(mapToDropDownOption)} width={"100%"} />}
        </div>
    )
}