import { OverlayItem } from '../overlayItem/OverlayItem'
import './OverlayOptions.css'

export const OverlayOptions = ({options, span='Left', width}) => {
    return (
        <div className={`overlayOptions overlay${span}`} style={{width:width}}>
            {
                options.map((option, idx)=>
                    <OverlayItem label={option.label} onClick={option.onClick} key={idx} />
                )
            }
        </div>
    )
}