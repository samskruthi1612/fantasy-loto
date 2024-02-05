import {ReactComponent as SuccessIcon} from '../../resources/success-icon.svg'
import { ReactComponent as CloseButton } from '../../resources/close-button.svg'
import ErrorIcon from '../../resources/exclamantion-mark.png'
import './ErrorAlert.css'

export const ErrorAlert = ({message, style, onClick}) => {
    return (
        <div className="errorContainer" style={style}>
            <img src={ErrorIcon} className='errorIcon' />
            <div className='messageContainer'>
            <p className='errorMessage'>{message}</p>
            </div>
            <CloseButton className="toastCloseButton" height="17.58" width="17.58px" onClick={onClick} />
        </div>
    )
}