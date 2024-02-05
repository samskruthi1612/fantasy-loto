import './GameLogs.css';
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { DataTable } from '../../../elements/dataTable/DataTable';
import { ReactComponent as BackArrow } from '../../../resources/back_arrow.svg';
import { ReactComponent as PreviousPage } from '../../../resources/previous_page.svg';
import { ReactComponent as NextPage } from '../../../resources/next_page.svg';
import { FilterBar } from "../../FilterBar/FilterBar";
import { convertToUIDate, convertToEstTimeZone } from '../../../util/dateUtils';
import { DropdownV2 } from '../../../elements/dropdownV2/DropDownV2';
import { capitalizeFirstLetter } from '../../../util/stringUtils';
import { ReactComponent as LocationIcon } from '../../../resources/location_on.svg';
import { CenterFantasyLoader } from '../../../elements/fantasyLotoLoader/FantasyLotoLoader';

const Location = ({coordinates, locationDetails}) => {
    return (<a href={'https://www.google.com/maps/search/?api=1&query='+coordinates.replaceAll(' ','')} 
                style={{textDecoration:'none', color: '#000000', display:'flex', 'flexDirection':'row'}}
                target="_blank" rel="noreferrer"
            >
        {locationDetails===''?coordinates: locationDetails}
        <LocationIcon />
    </a>)
}

const IpAddress = ({ipAddress}) => {
    const [showIp, setShowIp] = useState(false)
    return (<>{showIp?ipAddress : 
        <div className='clickable' style={{textDecoration:'underline', 'color':'#007AFF'}} onClick={()=>setShowIp(true)}>
            View
        </div>}</>)
}

export const GameLogs = () => {

    const location = useLocation();
    const navigate = useNavigate();
    const { state: {userDetails}} = location;
    const {userRole} = userDetails;
    
    const mockGameLogs = [{
        "id": "7571c904-7f27-43e5-b510-0a1ad9b4d15d",
        "gameId": "all",
        "gameDetails": "",
        "oldBeforeValue": 0,
        "oldDuration": "",
        "newBeforeValue": 0,
        "newDuration": "",
        "user": "Sahi Testing API",
        "location": "some location",
        "cordinates": "at some place",
        "ipAddress": "194.98.89.01:32",
        "updatedTime": "2023-06-03T00:54:29.893587043-04:00"
    },
    {
        "id": "06d63182-7e35-4b55-a0fa-d2f224c3c8fe",
        "gameId": "all",
        "gameDetails": "",
        "oldBeforeValue": 0,
        "oldDuration": "",
        "newBeforeValue": 0,
        "newDuration": "",
        "user": "super.admin@test.com",
        "location": "some location",
        "cordinates": "at some place",
        "ipAddress": "194.98.89.01:32",
        "updatedTime": "2023-06-03T00:53:56.718904867-04:00"
    },
    {
        "id": "c6517fd2-4ff5-4ca1-86f4-2250f18d9b29",
        "gameId": "all",
        "gameDetails": "",
        "oldBeforeValue": 0,
        "oldDuration": "",
        "newBeforeValue": 0,
        "newDuration": "",
        "user": "super.admin@test.com",
        "location": "some location",
        "cordinates": "at some place",
        "ipAddress": "194.98.89.01:32",
        "updatedTime": "2023-06-02T13:26:11.07466319-04:00"
    }]

    const getMockGameLogs = () => {
        const ar = []
        for(let i=0;i<50;i++) {
            ar.push(mockGameLogs[0])
            ar.push(mockGameLogs[1])
            ar.push(mockGameLogs[2])
        }
        return ar
    }

    const [gameLogs, setGameLogs] = useState([]);
    const [gameApiLogs, setGameApiLogs] = useState([]);
    const [scanKey, setScanKey] = useState('');
    const [loading, setLoading] = useState(true);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [pageNum, setPageNum] = useState(0);
    const [searchValue, setSearchValue] = useState('');
    const [searchAttribute, setSearchAttribute] = useState('');
    const [sortValue, setSortValue] = useState('None');
    const [sortOrder, setSortOrder] = useState('None');
    const [sortedLabel, setSortedLabel] = useState('None');
    const [applyAllFilterLabel, setApplyAllFilterLabel] = useState('');
    const [applyAllFilterValue, setApplyAllFilterValue] = useState('');
    const [gameDetailsFilterValues, setGameDetailsFilterValues] = useState([]);
    const [startDateFilterValue, setStartDateFilterValue] = useState('');
    const [endDateFilterValue, setEndDateFilterValue] = useState('');
    const [beforeFilterDurationType,setBeforeFilterDurationType] = useState('');
    const [beforeFilterFromValue, setBeforeFilterFromValue] = useState();
    const [beforeFilterToValue, setBeforeFilterToValue] = useState();
    const [afterFilterDurationType,setAfterFilterDurationType] = useState('');
    const [afterFilterFromValue, setAfterFilterFromValue] = useState();
    const [afterFilterToValue, setAfterFilterToValue] = useState();

    const fetchLogs = (apiScanKey) => {
        fetch(process.env.REACT_APP_GAME_API_AUDIT_URL, {
            headers: {
                'auth-token': localStorage.getItem('token')
            }
        })
        .then(resp => {
            if(resp.status ===200) {
                resp.json().then(data => {
                    setGameLogs((data?.auditLog??[]).map(log => ({...log, updatedTime: new Date(log.updatedTime*1000)})))
                    setGameApiLogs((data?.auditLog??[]).map(log => ({...log, updatedTime: new Date(log.updatedTime*1000)})))
                    setLoading(false)
                })
            } else {
                console.log('fetching audit logs failed with status', resp.status)
                setGameLogs([])
                setGameApiLogs([])
                setLoading(false)
            }
        })
        .catch((err) => {
            console.log('fetching audit logs failed with error', err)
            setGameLogs([])
            setGameApiLogs([])
            setLoading(false)
        })
    }

    useEffect(() => {
        fetchLogs(scanKey)
    }, [])

    const sortOptions = []
    const clearSort = () => {
        setSortValue('None')
        setSortedLabel('None')
    }

    const gameFilterDetails = {
        type: 'multiValue',
        label: 'Game Details',
        currentValues: gameDetailsFilterValues,
        options: [...new Set((gameApiLogs??[]).map(p => p.gameDetails===''?'No game details':p.gameDetails))].sort((a, b) => {
            if(a.toLowerCase()<b.toLowerCase()) return -1
            if(a.toLowerCase()>b.toLowerCase()) return 1
            return 0
        }),
        onChange: setGameDetailsFilterValues,
        clearFilterValue: (value) => {
            setGameDetailsFilterValues(vals => vals.filter(val => val !== value))
        }
    }

    const applyAllFilterDetails = {
        type: 'singleValue',
        label: 'Apply all',
        prefixCurrentValue: 'Apply all',
        currentValue: applyAllFilterValue,
        currentLabel: applyAllFilterLabel,
        options: [{label:'Yes', value: 'yes'}, {label: 'No', value: 'no'}],
        onChange: (value) => {
            setApplyAllFilterLabel(capitalizeFirstLetter(value))
            setApplyAllFilterValue(value)
        },
        clearFilter: () => {
            setApplyAllFilterValue('')
            setApplyAllFilterLabel('')
        }
    }

    const beforeValueFilterDetails = {
        type: 'gameEditValue',
        label: 'Before Value',
        prefixCurrentValue: 'Before value',
        durationTypeOptions: [{label: 'Hours',value: 'hours'},{label: 'Minutes',value: 'minutes'}],
        currentDurationTypeValue: beforeFilterDurationType,
        onDurationTypeChange: setBeforeFilterDurationType,
        setFromValue: setBeforeFilterFromValue,
        currentFromValue: beforeFilterFromValue,
        setToValue: setBeforeFilterToValue,
        currentToValue: beforeFilterToValue,
        clearFilter: () => {
            setBeforeFilterDurationType('')
            setBeforeFilterFromValue(null)
            setBeforeFilterToValue(null)
        }
    }

    const afterValueFilterDetails = {
        type: 'gameEditValue',
        label: 'After Value',
        prefixCurrentValue: 'After value',
        durationTypeOptions: [{label: 'Hours',value: 'hours'},{label: 'Minutes',value: 'minutes'}],
        currentDurationTypeValue: afterFilterDurationType,
        onDurationTypeChange: setAfterFilterDurationType,
        setFromValue: setAfterFilterFromValue,
        currentFromValue: afterFilterFromValue,
        setToValue: setAfterFilterToValue,
        currentToValue: afterFilterToValue,
        clearFilter: () => {
            setAfterFilterDurationType('')
            setAfterFilterFromValue(null)
            setAfterFilterToValue(null)
        }
    }

    const startDateFilterDetails = {
        type: 'date',
        label: 'Start Date',
        prefixCurrentValue: 'Start Date',
        currentValue: startDateFilterValue,
        onChange: setStartDateFilterValue,
        clearFilter: () => {
            setStartDateFilterValue('')
        }
    }

    const endDateFilterDetails = {
        type: 'date',
        label: 'End Date',
        prefixCurrentValue: 'End date',
        currentValue: endDateFilterValue,
        onChange: setEndDateFilterValue,
        clearFilter: () => {
            setEndDateFilterValue('')
        }
    }

    //filter if any data changes
    useEffect(() => {
        if(!loading) {
            let filteredLogs = gameApiLogs.filter((log) => 
                log.gameDetails.toLowerCase().includes(searchValue.toLowerCase())
                || log.user.toLowerCase().includes(searchValue.toLowerCase())
                || log.gameId.toLowerCase().includes(searchValue.toLowerCase())
                || (log.oldBeforeValue + ' ' +log.oldDuration).toLowerCase().includes(searchValue)
                || (log.newBeforeValue + ' '+log.newDuration).toLowerCase().includes(searchValue)
                || log.location.toLowerCase().includes(searchValue.toLowerCase())
                || log.cordinates.includes(searchValue)
                || log.ipAddress.toLowerCase().includes(searchValue.toLowerCase())
            )
            if(applyAllFilterValue==='yes') {
                filteredLogs = filteredLogs.filter(log => log.gameId === 'all')
            } else if (applyAllFilterValue==='no') {
                filteredLogs = filteredLogs.filter(log => log.gameId !== 'all')
            }
            if(gameDetailsFilterValues.length>0) {
                filteredLogs = filteredLogs.filter(log => gameDetailsFilterValues.includes(log.gameDetails) || (gameDetailsFilterValues.includes('No game details') && log.gameDetails===''))
            }
            if(beforeFilterDurationType!=='') {
                filteredLogs = filteredLogs.filter(log => {
                    const currentOldBeforeDuration = log.oldValue?.split(' ')[1]
                    const currentOldBeforeValue = Number(log.oldValue?.split(' ')[0])
                    return currentOldBeforeDuration===beforeFilterDurationType && currentOldBeforeValue>=beforeFilterFromValue && currentOldBeforeValue<=beforeFilterToValue
                })
            }
            if(afterFilterDurationType!=='') {
                filteredLogs = filteredLogs.filter(log => {
                    const currentNewDuration = log.newValue?.split(' ')[1]
                    const currentNewValue = Number(log.newValue?.split(' ')[0])
                    return currentNewDuration===afterFilterDurationType && currentNewValue>=afterFilterFromValue && currentNewValue<=afterFilterToValue
                })
            }
            if(startDateFilterValue!=='') {
                filteredLogs = filteredLogs.filter(log => {
                    const logTime = convertToEstTimeZone(log.updatedTime)
                    
                    const startDateFilterTime = startDateFilterValue.$d
                    return logTime.getFullYear()>startDateFilterTime.getFullYear()
                        || (logTime.getFullYear()===startDateFilterTime.getFullYear() && logTime.getMonth() > startDateFilterTime.getMonth())
                        || (logTime.getFullYear()===startDateFilterTime.getFullYear() && logTime.getMonth() === startDateFilterTime.getMonth() && logTime.getDate() >= startDateFilterTime.getDate())
                })
            }
            if(endDateFilterValue!=='') {
                filteredLogs = filteredLogs.filter(log => {
                    const logTime = convertToEstTimeZone(log.updatedTime)
                    
                    const endDateFilterTime = endDateFilterValue.$d
                    return logTime.getFullYear()<endDateFilterTime.getFullYear()
                        || (logTime.getFullYear()===endDateFilterTime.getFullYear() && logTime.getMonth() < endDateFilterTime.getMonth())
                        || (logTime.getFullYear()===endDateFilterTime.getFullYear() && logTime.getMonth() === endDateFilterTime.getMonth() && logTime.getDate() <= endDateFilterTime.getDate())
                })
            }
            setGameLogs(filteredLogs)
            if(pageNum>=Math.ceil(filteredLogs.length/rowsPerPage)) {
                setPageNum(Math.ceil(filteredLogs.length/rowsPerPage)-1>=0?Math.ceil(filteredLogs.length/rowsPerPage)-1: 0)
            }
        }
    },[gameApiLogs, searchValue, applyAllFilterValue, gameDetailsFilterValues, beforeFilterDurationType, beforeFilterFromValue, beforeFilterToValue, afterFilterDurationType, afterFilterFromValue, afterFilterToValue, startDateFilterValue, endDateFilterValue])

    const gameColumns = [{
        gridColumns: 2,
        name: 'Date and Time'
    },{
        gridColumns: 1,
        name: 'User'
    },{
        gridColumns: 1,
        name: 'Game ID'
    },{
        gridColumns: 2,
        name: 'Game details'
    },{
        gridColumns: 1,
        name: 'Before value'
    },{
        gridColumns: 1,
        name: 'After value'
    },{
        gridColumns: 1,
        name: 'Apply all'
    },{
        gridColumns: 2,
        name: 'Location',
        isReactElement: true
    }, {
        gridColumns: 1,
        name: 'IP Address',
        isReactElement: true
    }]

    const mapToRowContent = (auditLogs) => {
        return auditLogs.map(auditLog => {
            console.log('mapping log to row content', auditLog)
            return [...[
                    convertToUIDate(convertToEstTimeZone(auditLog.updatedTime)), 
                    auditLog.user, 
                    auditLog.gameId,
                    auditLog.gameDetails, 
                    auditLog.oldValue,
                    auditLog.newValue,
                    auditLog.gameId=='all'?'Yes':'No'
                ].map(text => ({text})),
                {
                    Element: Location,
                    props: {coordinates: auditLog.cordinates, locationDetails: auditLog.location}
                }, {
                    Element: IpAddress,
                    props: {ipAddress: auditLog.ipAddress}
                }
            ]
        })
    }

    const lastPageNumber = Math.ceil(gameLogs.length/rowsPerPage)

    return (<>{loading?
        <CenterFantasyLoader />
        : <div className="gamesLogsPage">
            <div className="gamesLogsTitleRow">
                <div className="gamesLogsBackButton clickable" onClick={()=>navigate('/home/games', location)}>
                    <BackArrow />
                </div>
                <div className="gamesLogsTitle">
                    Game Logs
                </div>
            </div>
    
            <FilterBar 
                onSearchValueChange={setSearchValue} 
                currentSearchValue={searchValue}
                sortOptions={sortOptions} 
                sortedLabel={sortedLabel} 
                clearSort={clearSort}
                filters={[applyAllFilterDetails, gameFilterDetails, beforeValueFilterDetails, afterValueFilterDetails, startDateFilterDetails, endDateFilterDetails]}
            />

            <div className='gamePagesRow'>
                <div>Rows per page</div>
                <DropdownV2
                    style={{width:'56px', height:'32px', padding: '8px'}}
                    label=''
                    currentLabel={rowsPerPage}
                    options={[{label:10, value: 10},{label:15, value: 15},{label:20, value: 20}]} 
                    onChange={(val)=>{setRowsPerPage(val)}} 
                />
                {pageNum>0 && 
                        <>
                            <div className='pageNavigationButton clickable' onClick={()=>setPageNum(page=>page-1)}>
                                <PreviousPage />
                            </div>
                            <div style={{marginTop:'auto'}}>...</div>
                        </>
                }
                <div className='pageNavigationButton clickable' onClick={()=>setPageNum(pageNum)}>
                    {pageNum+1}
                </div>
                {pageNum<lastPageNumber-1 && 
                    <>
                        <div style={{marginTop:'auto'}}>...</div>
                        <div className='pageNavigationButton clickable' onClick={()=>setPageNum(page=>page+1)}>
                            <NextPage />
                        </div>
                    </>
                }
            </div>

            <DataTable
                spacing={2}
                columnConfig={gameColumns}
                rowContent={mapToRowContent(gameLogs.slice(pageNum*rowsPerPage, (pageNum+1)*rowsPerPage) ?? [])}
            />

            <div className='gamePagesRow'>
                <div>Rows per page</div>
                <DropdownV2
                    style={{width:'56px', height:'32px', padding: '8px'}}
                    label=''
                    currentLabel={rowsPerPage}
                    options={[{label:10, value: 10},{label:15, value: 15},{label:20, value: 20}]} 
                    onChange={(val)=>{setRowsPerPage(val)}} 
                />
                {pageNum>0 && 
                        <>
                            <div className='pageNavigationButton clickable' onClick={()=>setPageNum(page=>page-1)}>
                                <PreviousPage />
                            </div>
                            <div style={{marginTop:'auto'}}>...</div>
                        </>
                }
                <div className='pageNavigationButton clickable' onClick={()=>setPageNum(pageNum)}>
                    {pageNum+1}
                </div>
                {pageNum<lastPageNumber-1 && 
                    <>
                        <div style={{marginTop:'auto'}}>...</div>
                        <div className='pageNavigationButton clickable' onClick={()=>setPageNum(page=>page+1)}>
                            <NextPage />
                        </div>
                    </>
                }
            </div>
            
        </div>}</>)
}