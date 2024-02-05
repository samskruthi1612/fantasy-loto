import './FilterBar.css'
import { useState, useRef } from 'react';
import { TextInput } from '../../elements/textInput/TextInput'
import {ReactComponent as FiltersIcon} from '../../resources/filters.svg'
import {ReactComponent as SortIcon} from '../../resources/sort.svg'
import { ReactComponent as CloseButton } from '../../resources/close-button.svg'
import {ReactComponent as DownArrow} from '../../resources/down_arrow.svg'
import Checkbox from '@mui/material/Checkbox';
import { OverlayOptions } from "../../elements/overlayOptions/OverlayOptions";
import { Dropdown } from '../../elements/dropdown/Dropdown';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/de';
import { format } from 'date-fns';
import { makeStyles } from '@material-ui/core/styles';
import { Drawer } from "@mui/material";
import { PrimaryButton } from '../../elements/button/Button';
import { capitalizeFirstLetter } from '../../util/stringUtils'
import { DropdownV2 } from '../../elements/dropdownV2/DropDownV2';
import { styled } from '@mui/system';
import { useClickOutHandler } from '../../hooks/useClickOutHandler';
import { NumRangeFilter } from './filterTypes/NumRangeFilter';
import TextInputv2 from '../../elements/textInputv2/TextInputv2';

const SingleValueFilter = ({label, currentValue, currentLabel, options, onChange, clearFilter}) => {
    return <div className='filter'>
        <Dropdown 
            label={label} 
            defaultValue={currentValue} 
            options={options} 
            onChange={(value)=>{onChange(value)}} 
            deafultLabel={currentLabel} 
            reset={currentValue===''} 
        />
    </div>
}

const useStyles = makeStyles({
    datePicker: {
        width: '300px',
        height: '48px',
    
        background: '#FFFFFF',
        border: '1px solid #EBEBEB',
        'border-radius': '8px',
    },
  })

const CalendarFilter = ({label, currentValue, onChange, clearFilter}) => {
    const classes = useStyles();
    console.log('getting current Value for calendar as', currentValue)
    return <div className='filter'>
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="us">
        <DatePicker 
            label={label}
            format='YYYY-MM-DD'
            value={currentValue===''?null:currentValue}
            onChange={onChange}
        />
        </LocalizationProvider>
    </div>
}

const MultiValueFilter = ({label, currentValues, options, onChange}) => {
    const [showFilterOptions, setShowFilterOptions] = useState(false);
    
    const getInitialStates = (options, currentValues) => {
        const states = {}
        options.map(opt => {
            states[opt] = currentValues.includes(opt)
        })
        return states
    }

    const valueStates = getInitialStates(options, currentValues)

    const applyFilters = () => {
        onChange(options.filter(val => valueStates[val]))
        setShowFilterOptions(false)
    }

    return <>
    <div className='filter filterField clickable' onClick={()=>setShowFilterOptions(true)}>
        {currentValues.length===0?
            <div className='filterPlaceHolder'>{label}</div>
            : <div className='filterText'>
                <div className='filterLabel'>{label}</div>
                <div className='filterValue'>{currentValues.join(', ')}</div>
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
                        <div className='multiFilterTitle'>Select {label}</div>
                        <div className='closeMultiFilterButton clickable' onClick={()=>setShowFilterOptions(false)}>
                            <CloseButton />
                        </div>
                    </div>
                    <div className='filterCheckboxes'>
                            {options.map((option)=>(<div className='filterCheckboxLabelCombo'>
                                        <Checkbox defaultChecked={valueStates[option]} size="small" onClick={()=>{valueStates[option] = !valueStates[option]}}/>
                                        <div className="fitlerCheckBoxLabel">{capitalizeFirstLetter(option)}</div>
                                    </div>))}
                    </div>
                    <div className='applyFilterButton'>
                        <PrimaryButton label="Apply" onClick={applyFilters} style={{width:'100%'}} type='primary' />
                    </div>
                </div>
            </Drawer>
        }
    </>
}

const GameEditValueFilter = ({label, durationTypeOptions, currentDurationTypeValue, onDurationTypeChange, setFromValue, currentFromValue, setToValue, currentToValue}) => {
    const [showFilterOptions, setShowFilterOptions] = useState(false);
    
    const [durationType, setDurationType] = useState(currentDurationTypeValue)
    const [newFromValue, setNewFromValue] = useState(currentFromValue)
    const [newToValue, setNewToValue] = useState(currentToValue)
    const [errorMsg, setErrorMsg]  = useState('')

    const applyFilters = () => {
        if(durationType === '') {
            setErrorMsg('Duration type is mandatory field')
        }
        if(isNaN(Number(newFromValue))) {
            setErrorMsg('From value should be a number')
            return
        } if(isNaN(Number(newToValue))) {
            setErrorMsg('To value should be a number')
            return
        } if(Number(newFromValue)>Number(newToValue)) {
            setErrorMsg('From value should be less than to value')
            return
        }
        onDurationTypeChange(durationType)
        setFromValue(newFromValue)
        setToValue(newToValue)
        setShowFilterOptions(false)
    }

    return <>
    <div className='filter filterField clickable' onClick={()=>setShowFilterOptions(true)}>
        {currentDurationTypeValue===''?
            <div className='filterPlaceHolder'>{label}</div>
            : <div className='filterText'>
                <div className='filterLabel'>{label}</div>
                <div className='filterValue'>{currentFromValue} - {currentToValue} {durationType}</div>
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
                        <div className='multiFilterTitle'>Select {label}</div>
                        <div className='closeMultiFilterButton clickable' onClick={()=>setShowFilterOptions(false)}>
                            <CloseButton />
                        </div>
                    </div>
                    <div style={{width:'100%', display: 'flex', flexDirection: 'column', gap: '8px'}}>
                        <DropdownV2 label={'Duration type'} currentLabel={capitalizeFirstLetter(durationType)} options={durationTypeOptions} onChange={setDurationType} style={{width:'100%'}}/>
                        <TextInput label={'From'} defaultValue={newFromValue} onChange={setNewFromValue} width={'100%'} />
                        <TextInput label={'To'} defaultValue={newToValue} onChange={setNewToValue} width={'100%'} />
                        {errorMsg!=='' && <div className='redText'>{errorMsg}</div>}
                    </div>
                    <div className='applyFilterButton'>
                        <PrimaryButton label="Apply" onClick={applyFilters} style={{width:'100%'}} type='primary' />
                    </div>
                </div>
            </Drawer>
        }
    </>
}

const DateRangeFilter = ({label, currentValue, onChange}) => {
    return <div className='filter'>
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="us">
        <DatePicker 
            label={label}
            format='YYYY-MM-DD'
            value={currentValue===''?null:currentValue}
            onChange={onChange}
        />
        </LocalizationProvider>
    </div>
}

// params:
//     searchAttributes: {
//         options: list of options to be shown in search attribues dropdown
//         currentSearchAttribute: current value selected for search attribute
//         onChange: callback when an option is selected from dropdown
//     }
export const FilterBar = ({onSearchValueChange, sortOptions, sortedLabel, clearSort, filters, currentSearchValue, searchAttributes}) => {
    const [showSortOptions, setShowSortOptions] = useState(false);
    const sortOptionsRef = useRef();
    useClickOutHandler(sortOptionsRef, ()=>setShowSortOptions(false))
    const [showFilters, setShowFilters] = useState(false);
    return (
        <>
            <div className="filtersRow">
                <div style={{position: 'relative'}}>
                    <TextInputv2 label={'Search'} defaultValue={currentSearchValue} onChange={onSearchValueChange} width={"280px"} />
                    {(searchAttributes!==undefined && searchAttributes.options.length>0) &&
                        <div className='searchAttributesDropdown'>
                            <DropdownV2 
                                options={searchAttributes.options.map(op => ({label: op, value: op}))} 
                                currentLabel={searchAttributes.currentSearchAttribute} 
                                onChange={searchAttributes.onChange} 
                                style={{position:'absolute', right: '14px', top: '14px', height: '24px', width: '120px', backgroundColor: '#EBEBEB'}} />
                        </div>
                    }
                </div>
                <div className="filtersButton clickable" onClick={()=>setShowFilters(show=>!show)}>
                    <div className="filtersIcon">
                        <FiltersIcon />
                    </div>
                    <div className="filtersButtonText">
                        Filters
                    </div>
                </div>
                {sortOptions?.length >0 && <div className="sort clickable" onClick={()=>setShowSortOptions(showSortOptions=>!showSortOptions)} ref={sortOptionsRef}>
                    <div className="sortIcon">
                        <SortIcon />
                    </div>
                    <div className="sortText">
                        Sort by
                    </div>
                    {showSortOptions && 
                        <OverlayOptions options={sortOptions} span='Left' width={'max-content'}/>
                    }
                </div>}
                {sortedLabel !== 'None' &&
                    <div className="sortedLabel">
                        <div className="sortedLabelText">
                            {sortedLabel}
                        </div>
                        <div className="removeSort clickable">
                            <CloseButton height='10px' width='10px' onClick={clearSort}/>
                        </div>
                    </div>
                }
                {filters.flatMap((filterDetails)=> {
                    if(filterDetails.type==='singleValue'&& filterDetails.currentValue !== '')
                        return <div className='currentFilterValue'>
                            <div className="currentFilterValueText">
                                {(filterDetails.prefixCurrentValue?filterDetails.prefixCurrentValue+' : ':'')+capitalizeFirstLetter(filterDetails.currentLabel ?? filterDetails.currentValue)}
                            </div>
                            <div className="removeSort clickable">
                                <CloseButton height='10px' width='10px' onClick={()=>{filterDetails.clearFilter()}}/>
                            </div>
                        </div>
                    if(filterDetails.type==='numRange' && filterDetails.currentValues.length>0)
                        return <div className='currentFilterValue'>
                            <div className="currentFilterValueText">
                                {(filterDetails.label + ': ')+filterDetails.currentValues[0] + '-' + filterDetails.currentValues[1]}
                            </div>
                            <div className="removeSort clickable">
                                <CloseButton height='10px' width='10px' onClick={()=>{filterDetails.clearFilterValue()}}/>
                            </div>
                        </div>
                    if(filterDetails.type==='date' && filterDetails.currentValue !== '')
                        return <div className='currentFilterValue'>
                            <div className="currentFilterValueText">
                                {(filterDetails.prefixCurrentValue?filterDetails.prefixCurrentValue+' : ':'')+format(filterDetails.currentValue.$d, 'yyyy-MM-dd')}
                            </div>
                            <div className="removeSort clickable">
                                <CloseButton height='10px' width='10px' onClick={()=>{filterDetails.clearFilter()}}/>
                            </div>
                        </div>
                    if(filterDetails.type==='dateRange' && filterDetails.currentValue !== '')
                        return <div className='currentFilterValue'>
                            <div className="currentFilterValueText">
                                {(filterDetails.prefixCurrentValue?filterDetails.prefixCurrentValue+' : ':'')+format(filterDetails.currentValue.$d, 'yyyy-MM-dd')}
                            </div>
                            <div className="removeSort clickable">
                                <CloseButton height='10px' width='10px' onClick={()=>{filterDetails.clearFilter()}}/>
                            </div>
                        </div>
                    if(filterDetails.type==='multiValue')
                        return filterDetails.currentValues.map(val => {
                            return <div className='currentFilterValue'>
                            <div className="currentFilterValueText">
                                {(filterDetails.prefixCurrentValue?filterDetails.prefixCurrentValue+' : ':'')+capitalizeFirstLetter(val)}
                            </div>
                            <div className="removeSort clickable">
                                <CloseButton height='10px' width='10px' onClick={()=>{filterDetails.clearFilterValue(val)}} />
                            </div>
                        </div>
                        })
                        if(filterDetails.type==='gameEditValue')
                            return filterDetails.currentDurationTypeValue === ''?<></>:<div className='currentFilterValue'>
                                <div className="currentFilterValueText">
                                    {(filterDetails.prefixCurrentValue?filterDetails.prefixCurrentValue+' : ':'')+filterDetails.currentFromValue}-{filterDetails.currentToValue} {filterDetails.currentDurationTypeValue}
                                </div>
                                <div className="removeSort clickable">
                                    <CloseButton height='10px' width='10px' onClick={()=>{filterDetails.clearFilter()}} />
                                </div>
                            </div>
                })}
            </div>
            {showFilters &&
                <div className='filters'>
                    {
                        filters.map((filterDetails, idx) => {
                            if(filterDetails.type === 'singleValue')
                                return <SingleValueFilter 
                                            label={filterDetails.label} 
                                            currentValue={filterDetails.currentValue} 
                                            currentLabel={filterDetails.currentLabel}
                                            options={filterDetails.options} 
                                            onChange={filterDetails.onChange} 
                                            clearFilter={filterDetails.clearFilter}
                                            key={idx} 
                                        />
                            if(filterDetails.type === 'numRange')
                                return <NumRangeFilter
                                            label={filterDetails.label}
                                            variant={filterDetails.variant}
                                            currentValues={filterDetails.currentValues}
                                            onChange={filterDetails.onChange}
                                        />
                            if(filterDetails.type === 'date')
                                return <CalendarFilter 
                                            label={filterDetails.label} 
                                            currentValue={filterDetails.currentValue} 
                                            onChange={filterDetails.onChange} 
                                            clearFilter={filterDetails.clearFilter}
                                        />
                            if(filterDetails.type === 'dateRange')
                                return <DateRangeFilter
                                            label={filterDetails.label} 
                                            currentValue={filterDetails.currentValue} 
                                            onChange={filterDetails.onChange}
                                        />
                            if(filterDetails.type === 'multiValue')
                                return <MultiValueFilter 
                                            label={filterDetails.label} 
                                            options={filterDetails.options}
                                            currentValues={filterDetails.currentValues} 
                                            onChange={filterDetails.onChange} 
                                        />
                            if(filterDetails.type === 'gameEditValue')
                                return <GameEditValueFilter
                                            label={filterDetails.label}
                                            durationTypeOptions={filterDetails.durationTypeOptions}
                                            currentDurationTypeValue={filterDetails.currentDurationTypeValue}
                                            onDurationTypeChange={filterDetails.onDurationTypeChange}
                                            setFromValue={filterDetails.setFromValue}
                                            currentFromValue={filterDetails.currentFromValue}
                                            setToValue={filterDetails.setToValue}
                                            currentToValue={filterDetails.currentToValue}
                                        />
                        })
                    }
                </div>
            }
        </>
    )
}