import {leftNavBarItem} from './LeftNavBarItem.css'

export const LeftNavBarItem = ({ Vector, label, onClick }) => {
    return <div className="leftNavBarItem" onClick={onClick}>
        <div className='lefNavBarIcon'><Vector fill="#000000" /></div>
        <div className='label'>{label}</div>
    </div>
}