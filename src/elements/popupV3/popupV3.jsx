import { PrimaryButton } from '../button/Button'
import { ReactComponent as CloseButton } from '../../resources/close-button.svg'
import { ReactComponent as RightArrow } from '../../resources/right-arrow.svg'
import './popupV3.css'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@material-ui/core';
import {useState} from 'react'


export const PopupV3 = ({title, buttonText, onButtonClick, onClose, signinpopup, subheading, inputs}) => {
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
            <ul>{inputs.map(input => <li><div className='detailsPopup'>
                <p className='gameNamePopup'>{input.key}</p>
                <div className='rightArrowPopup'>
                    <RightArrow />
                </div>
                <p className='winNumberPopup'>{input.value}</p>
            </div></li>)}
            </ul>
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