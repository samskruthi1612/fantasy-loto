import './ApiTriggerButton.css'
import { ReactComponent as BackupIcon } from "../../../resources/backup.svg";

export const ApiTriggerButton = ({userName, setLoading, triggerRefresh}) => {

    const triggerGamesAPIUpdate = () => {
        console.log('Game API update trigger clicked')
        setLoading(true)
        fetch(process.env.REACT_APP_GAME_API_HOST +'/load', {
            headers: {
                'x-username': userName,
                'x-channel': 'loadtime',
                'auth-token': localStorage.getItem('token'),
            }
        })
        .then(resp => {
            if(resp.status===200) {
                console.log('Game API update trigger success')
                setLoading(false)
                triggerRefresh()
            } else {
                console.log('game api update trigger failed with resp status', resp.status)
                setLoading(false)
            }
        })
        .catch((err) => {
            console.log('game api update trigger failed with error', err)
            setLoading(false)
        })
    }

    return (
        <div className="refreshBtnParent" onClick={triggerGamesAPIUpdate}>
            <div className="triggerApiRefreshBtn clickable">
                <BackupIcon />
            </div>
            <div className="refreshHoverText">Update the API Trigger</div>
        </div>
    )
}