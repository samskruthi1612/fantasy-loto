import '../FilterBarV2.css'
import styles from './NumRangeFilter.module.css'
import { useState } from 'react';
import { ReactComponent as CloseButton } from '../../../resources/close-button.svg'
import {ReactComponent as DownArrow} from '../../../resources/down_arrow.svg'
import { Drawer } from "@mui/material";
import { PrimaryButton } from '../../../elements/button/Button';
import TextInputv2 from '../../../elements/textInputv2/TextInputv2'
import { formatToAmount, formatToCurrency, validateCurrencyFormat } from '../../../util/currencyformatter';
import { formatCommissionToAmount, formatToCommission, validateCommissionFormat } from '../../../util/commissionFormatter';

export const NumRangeFilter=({label,currentValues,variant,onChange})=>{

    let convertToUI, convertToNum, validateInput
    switch(variant) {
        case 'currency':
            validateInput = validateCurrencyFormat
            convertToUI = formatToCurrency
            convertToNum = formatToAmount
            break;
        case 'commission':
            validateInput = validateCommissionFormat
            convertToUI = formatToCommission
            convertToNum = formatCommissionToAmount
            break;
        case 'number':
        default:
            validateInput = (input) => !Number.isNaN(input)
            convertToUI = (input) => input
            convertToNum = (textString) => parseFloat(textString)
            break;
    }

    const [showFilterOptions, setShowFilterOptions] = useState(false);
    const [lowRange,setLowRange] = useState(convertToUI(currentValues[0]??''));
    const [lowRangeErr, setLowRangeErr] = useState('')
    const [highRange,setHighRange] = useState(convertToUI(currentValues[1]??''));
    const [highRangeErr, setHighRangeErr] = useState('')

    const applyFilters=()=>{
        const err1 = validateInput(lowRange)?'':'Please enter valid '.concat(variant)
        const err2 = validateInput(highRange)?'':'Please enter valid '.concat(variant)
        setLowRangeErr(err1)
        setHighRangeErr(err2)
        if(err1 || err2)
            return
        const lowNum = convertToNum(lowRange)
        const highNum = convertToNum(highRange)
        if(lowNum>highNum) {
            setHighRangeErr('Please enter value greater than '.concat(lowRange))
            return
        }
        onChange(currentValues=[lowNum,highNum])
        setShowFilterOptions(false)
    }

    return <>
    <div className='filter filterField clickable' onClick={()=>setShowFilterOptions(true)}>
        {currentValues.length==0?
            <div className='filterPlaceHolder'>{label}</div>
            : <div className='filterText'>
                <div className='filterLabel'>{label}</div>
                <div className='filterValue'>{currentValues[0] + '-' + currentValues[1]}</div>
            </div>
        }
        <div className='arrowBlock'>
            <DownArrow height={"10px"} width={"10px"} />
        </div>
    </div>
    {showFilterOptions &&
            <Drawer
                anchor='right'
                open={showFilterOptions}
                onClose={()=>setShowFilterOptions(false)}
            >
                <div className='multiFilterDrawer'>
                    <div className='multiFilterTitleRow'>
                        <div className='multiFilterTitle'>Set {label} Range</div>
                        <div className='closeMultiFilterButton clickable' onClick={()=>setShowFilterOptions(false)}>
                            <CloseButton />
                        </div>
                    </div>
                    <div className={`${styles.filterRangeInputs}`}>
                        <TextInputv2 label="From" defaultValue={lowRange} onChange={setLowRange} errorState={lowRangeErr} errorMessage={lowRangeErr} width="100%"/>
                        <TextInputv2 label="To" defaultValue={highRange} onChange={setHighRange} errorState={highRangeErr} errorMessage={highRangeErr} width="100%"/>
                    </div>
                    <div className='applyFilterButton'>
                        <PrimaryButton label="Apply" onClick={applyFilters} style={{width:'100%'}} type='primary' />
                    </div>
                </div>
            </Drawer>
        }
    </>

}