import { ReactComponent as BackArrow } from "../../../resources/back_arrow.svg";
import styles from './BackButton.module.css'

export const BackButton = ({onClick}) => {
    return <div className={`${styles.backButton} clickable`} onClick={onClick}>
        <BackArrow />
    </div>
}