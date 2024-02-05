import {ReactComponent as ProfileIcon} from '../../../../resources/top nav bar/profile.svg'
import './Profile.css'

export const Profile = ({onClick, profilePic,name}) => {
    return (
        <div className='profileContainer'>
        <div className="profile" onClick={onClick}>
            {profilePic == null && <ProfileIcon />}
            {profilePic != null && <img class="miniProfilePic"src={profilePic}/>}
        </div>
        <div className='profileName'>
            {name}
        </div>
        </div>
    )
}