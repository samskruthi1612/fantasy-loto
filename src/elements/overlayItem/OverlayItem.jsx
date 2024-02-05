import './OverlayItem.css'

export const OverlayItem = ({ label, onClick}) => {
    const onClickAndStop = (event) => {
        event.stopPropagation()
        onClick(event)
    }
    return <div className="overlayItem" onClick={onClickAndStop}>
        {label}
    </div>
}