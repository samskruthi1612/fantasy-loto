import './Button.css'
import {useEffect, useState} from 'react'

export const PrimaryButton = ({label, onClick, style, type, height}) => {
    
    const [disabled, setDisabled] = useState(false);
    const onButtonClick = () => {
        onClick()
    }

    if(type === 'secondary' || type === 'primary' || type==='teritary')
        return (
            <button className={`button ${type}`} style={style} disabled={disabled} onClick={onButtonClick}>
                {label}
            </button>
        )   
    return <></>

}