import { ReactComponent as LogsIcon } from "../../../resources/bookmarklogs.svg";
import { useNavigate } from "react-router-dom";
import styles from './LogsButton.module.css'

export const LogsButton = ({onClick}) => {
    const navigate = useNavigate();

    return (
        <div
            className={`${styles.logsBtn} clickable`}
            onClick={onClick}
          >
            <LogsIcon />
            <div className={`${styles.logsText}`}>Logs</div>
          </div>
    )
}