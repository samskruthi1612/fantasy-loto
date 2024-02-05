import {ReactComponent as SuccessIcon} from '../../resources/success-icon.svg'
import { ReactComponent as CloseButton } from '../../resources/close-button.svg'
import './Alert.css'

export const Alert = ({message, style, onClick}) => {
    return (
        <div className="toastAlert" style={style}>
            <SuccessIcon height="33.33px" width="33.33px" />
            {message}
            <CloseButton className="toastCloseButton" height="17.58" width="17.58px" onClick={onClick} />
        </div>
    )
}