import React from 'react'

import './RuleInfo.css'


import { ReactComponent as CloseButton } from '../../../resources/close-button.svg'
import { Checkbox } from '@mui/material'

const RuleInfo = ({infoRule, onClose}) => {
  return (
    <>
        <div className='RuleInfoOverlay'>
            <div className='titleRow'>
                <div className="infoTitle">{infoRule?.name}</div>
                <div className='closeButton' onClick={onClose}><CloseButton /></div>
            </div>
            <p className='sectionTitle'>Display on Screens</p>
            <div className='checkboxSide firstCheck'>
                <Checkbox checked={infoRule?.screen_display.game_rules} disabled />
                <p className='checkboxDesc'>Game Rules</p>
            </div>
            <div className='checkboxSide'>
                <Checkbox checked={infoRule?.screen_display.tc} disabled />
                <p className='checkboxDesc'>Terms And Conditions</p>
            </div>
            <p className='sectionTitle'>Description</p>
            <p className='ruleDesc'>{infoRule?.description}</p>
            </div>
    </>
  )
}

export default RuleInfo