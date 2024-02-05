import {ReactComponent as HamburgerIcon} from '../../../../resources/top nav bar/hamburger.svg'
import  './Hamburger.css'

export const Hamburger = ({onClick}) => {
    return (
        <div className="hamburger" onClick={onClick}>
            <HamburgerIcon />
        </div>
    )
}