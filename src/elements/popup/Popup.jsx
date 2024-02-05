import { PrimaryButton } from '../button/Button'
import { ReactComponent as CloseButton } from '../../resources/close-button.svg'
import './Popup.css'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@material-ui/core';
import {useState} from 'react'


export const Popup = ({title, buttonText, onButtonClick, onClose, signinpopup}) => {
    const [openDialog, setOpenDialog] = useState(true);
    return (
        <Dialog open={openDialog} onClose={onClose}>
            <DialogContent>
        <div className={`popup ${signinpopup?'signinpopup':''}`}>
            <div className='popupTitleClose'>
                <div className='popupTitle'>
                    {title}
                </div>
                <div className='popupCloseButton' onClick={onClose}>
                    <CloseButton />
                </div>
            </div>
            {/* <div className='popupButton'> */}
                <PrimaryButton 
                    label={buttonText} 
                    type="teritary" 
                    style={{width:'100%'}}
                    onClick={onButtonClick}
                />
            {/* </div> */}
        </div>
        </DialogContent>
        </Dialog>
    )
}