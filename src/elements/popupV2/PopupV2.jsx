import { PrimaryButton } from '../button/Button'
import { ReactComponent as CloseButton } from '../../resources/close-button.svg'
import { ReactComponent as RightArrow } from '../../resources/right-arrow.svg'
import './PopupV2.css'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@material-ui/core';
import {useState} from 'react'


export const PopupV2 = ({title, buttonText, onButtonClick, onClose, signinpopup, subheading, winNumber, gameName}) => {
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
            <p className='subheadingPopup'>{subheading}</p>
            <div className='detailsPopup'>
                <p className='gameNamePopup'>{gameName}</p>
                <div className='rightArrowPopup'>
                    <RightArrow />
                </div>
                <p className='winNumberPopup'>{winNumber.split('').join('-')}</p>
            </div>
            {/* <div className='popupButton'> */}
                <PrimaryButton 
                    label={buttonText} 
                    type="teritary" 
                    style={{width:'100%', background: '#20B020'}}
                    onClick={onButtonClick}
                />
            {/* </div> */}
        </div>
        </DialogContent>
        </Dialog>
    )
}