import './GameManagement.css'
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {DataTable} from '../../elements/dataTable/DataTable'
import Checkbox from '@mui/material/Checkbox';
import { CircularProgress, Drawer } from '@mui/material';
import { FilterBar } from "../FilterBar/FilterBar";
import { superAdminRole, adminRole, closedGameStatus } from '../../util/constants'
import {ReactComponent as PreviousPage} from '../../resources/previous_page.svg'
import {ReactComponent as NextPage} from '../../resources/next_page.svg'
import {ReactComponent as RefershIcon} from '../../resources/refresh-icon.svg'
import { ReactComponent as BackupIcon} from '../../resources/backup.svg'
import { ReactComponent as CloseButton } from '../../resources/close-button.svg'
import { ReactComponent as LogsIcon } from '../../resources/bookmarklogs.svg'
import { PrimaryButton } from "../../elements/button/Button";
import { TextInput } from '../../elements/textInput/TextInput';
import { Alert } from '../../elements/alert/Alert';
import { Dropdown } from '../../elements/dropdown/Dropdown';
import { DropdownV2 } from '../../elements/dropdownV2/DropDownV2';
import { capitalizeFirstLetter } from '../../util/stringUtils';
import { calculateTimeLeft, convertToUIDate, convertToEstTimeZone, convertEpochsToUIDate } from '../../util/dateUtils';
import { CenterFantasyLoader } from '../../elements/fantasyLotoLoader/FantasyLotoLoader';
import TextInputv2 from '../../elements/textInputv2/TextInputv2';
import { apiLoadTime } from '../../api/apiLoadTime';

const FantasyLotoClosingTime = ({userRole, game, userDetails, triggerRefresh, showUpdateSuccessMessage, userIp}) => {
    const [closingTimeSlideBarOpen, setClosingTimeSlideBarOpen] = useState(false)
    const crossedFantasyLotoClosingTime = new Date().getTime() > new Date(game.fantasyLotoClosingTime).getTime()
    const allowEdits = !crossedFantasyLotoClosingTime && game.status !== closedGameStatus && userRole===superAdminRole
    const millis = new Date(game.nextDrawDate).getTime() - new Date(game.fantasyLotoClosingTime).getTime()
    const minutes = Math.ceil(millis/(60*1000))
    const hours = minutes/60
    const [before, setBefore] = useState(minutes%60===0?hours:minutes);
    const [duration, setDuration] = useState(minutes%60===0?'hours':'minutes');
    const [applyAll, setApplyAll] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    
    const [geoLocationDetails, setGeoLocationDetails] = useState();

    const postClosingTime = (lat, long, locationDetails) => {
        const millis = new Date(game.nextDrawDate).getTime() - new Date(game.fantasyLotoClosingTime).getTime()
        const minutes = Math.ceil(millis/(60*1000))
        const hours = minutes/60
        fetch(process.env.REACT_APP_GAME_API_HOST, {
            method: 'POST',
            headers: {
                'auth-token': localStorage.getItem('token')
            },
            body: JSON.stringify({
                "gameId" : `${applyAll?'all':game.gameId}`,
                "type": "closing",
                "game_instance_id": Number(game.id),
                "gameDetails" : `${game.state} ${game.slot} ${game.gameName}`,
                "oldValue": `${minutes===0?'':minutes%60===0?hours:minutes} ${minutes===0?'':minutes%60===0?'hours':'minutes'}`,
                "newValue": `${Number(before)} ${duration}`,
                "user": userDetails.userName,
                "location": locationDetails,
                "cordinates": `${lat}, ${long}`,
                "ipAddress": userIp
            })
        })
        .then(resp => {
            if(resp.status === 200) {
                setClosingTimeSlideBarOpen(false)
                showUpdateSuccessMessage()
                triggerRefresh()
            } else {
                console.log('update time failed with resp', resp)
                setErrorMsg('Something went wron, please try again later')
            }
        })
        .catch((err) => {
            console.log('update time failed with error', err)
            setErrorMsg('Something went wron, please try again later')
        })
    }

    const getLocationDetails = async (lat, long) => {
        const resp = await fetch(`https://geocode.maps.co/reverse?lat=${lat}&lon=${long}`)
        const data = await resp.json()
        return (data.address.city ?? data.address.county) + ', ' + data.address.state
    }

    const submitClosingTime = () => {
        if(isNaN(parseFloat(before)) || !Number.isInteger(Number(before))) {
            console.log('inputs not valid, cannot post the update')
            setErrorMsg('Please enter an integer for time before')
            return
        } else if (!duration) {
            console.log('duration is not selected')
            setErrorMsg('Please select hours/minutes')
            return
        }
        const geolocationAPI = navigator.geolocation;
        console.log(geolocationAPI)
        if (!geolocationAPI) {
            console.log('Geolocation API is not available in your browser!')
            setErrorMsg('Unable to access location for audit purposes')
        } else {
            geolocationAPI.getCurrentPosition(async (position) => {
              const { coords } = position;
              console.log(position)
            
            let locationDetails
            try {  
                locationDetails = await getLocationDetails(coords.latitude, coords.longitude)
            } catch {
                console.log('Some thing went wrong while getting location')
                postClosingTime(coords.latitude, coords.longitude, 'Click here')
                return
            }
              console.log(coords.latitude, coords.longitude, locationDetails)
              postClosingTime(coords.latitude, coords.longitude, locationDetails)
            }, (error) => {
              console.log('Something went wrong getting your position!', error)
              setErrorMsg('Unable to access location for audit purposes')
            })
        }
    }

    return <>
        <div className={`${allowEdits?'linkText clickable':(crossedFantasyLotoClosingTime && game.status !== closedGameStatus?'redText':'')}`} onClick={allowEdits?()=>setClosingTimeSlideBarOpen(true):()=>{}}>
            {convertToUIDate(convertToEstTimeZone(game.fantasyLotoClosingTime))}
        </div>
        {closingTimeSlideBarOpen &&
            <Drawer anchor='right' open={closingTimeSlideBarOpen} onClose={()=>setClosingTimeSlideBarOpen(false)}>
                <div className="editGameClosingTime">
                    <div className="editGameClosingTimeTitleRow">
                        <div className="editGameClosingTimeTitle">Fantasy loto closing time</div>
                        <div className='closeEditGameClosingTimeButton clickable' onClick={()=>setClosingTimeSlideBarOpen(false)}><CloseButton /></div>
                    </div>
                    <div className='editGameClosingTimeDetails'>
                        <div className='editGameClosingTimeDetailsText'>
                            Details
                        </div>
                        <div className='editGameClosingTimeDetailRow'>
                            <div className='editGameClosingTimeDetailKey'>
                                Game
                            </div>
                            <div className='editGameClosingTimeDetailValue'>
                                {game.state + ' ' + game.slot + ' ' + capitalizeFirstLetter(game.gameName)}
                            </div>
                        </div>
                        <div className='editGameClosingTimeDetailRow'>
                            <div className='editGameClosingTimeDetailKey'>
                                Actual closing time
                            </div>
                            <div className='editGameClosingTimeDetailValue'>
                                {convertToUIDate(convertToEstTimeZone(game.nextDrawDate))}
                            </div>
                        </div>
                        <div className='editGameClosingTimeDetailRow'>
                            <div className='editGameClosingTimeDetailKey'>
                                Fantasy loto closing time
                            </div>
                            <div className='editGameClosingTimeDetailValue'>
                                {convertToUIDate(convertToEstTimeZone(game.fantasyLotoClosingTime))}
                            </div>
                        </div>
                        <div className='setNewClosingTimeText'>
                            Set new Fantasy loto closing time
                        </div>
                        <div className='newClosingTimeInputs'>
                            <TextInputv2 label={'Before'} defaultValue={before} maskInput={false} width={'83px'} onChange={(val)=>{setBefore(val)}} />
                            <div style={{width:'130px'}}>
                                <Dropdown label='Duration' options={[{label: 'Hours', value: 'hours'}, {label: 'Minutes', value: 'minutes'}]} defaultValue={duration} onChange={(val)=>{setDuration(val)}} />
                            </div>
                            <div>of Actual closing time</div>
                        </div>
                        <div className='applyForAllHouses'>
                            <Checkbox defaultChecked={applyAll} size="small" onClick={()=>{setApplyAll(cur=>!cur)}}/>
                            <div className='appltForAllHousesText'>
                                Apply for all upcoming games
                            </div>
                        </div>
                        {applyAll && <div className='applyForAllHousesDescription'>
                        Note: Selecting this option will apply this FantasyLoto closing time for all the houses, please makesure you notify the franchises.
                        </div>}
                        {errorMsg && <div className='redText'>{errorMsg}</div>}
                    </div>
                    <div className="applyGameClosingTimeButton">
                        <PrimaryButton 
                            type="primary"
                            label={'Save'} 
                            onClick={submitClosingTime} 
                            style={{width:'100%'}} 
                        />
                    </div>
                </div>
            </Drawer>
        }
    </>
}

const Status = ({status, timeLeft}) => 
    <>
        <div className='gameStatusCommentsParent'>
            <div className={`gameStatusText ${status!==closedGameStatus?'gameStatusTextActive':'gameStatusTextInactive'}`}>
                {status!==closedGameStatus?'Upcoming':'Closed'}
            </div>
            {timeLeft && <div className="gameStatusComments">
                                        Closing in {timeLeft}
                                    </div>}
        </div>
    </>

const WinNumbers = ({winNumbers, status}) => {
    console.log()
    return (
        <div className='winNumbersHoverParent'>
            <div className='winNumbers'>
                {status===closedGameStatus?(winNumbers===""?"Awaiting results":winNumbers):'Declare soon'}
            </div>
            {(status === closedGameStatus && winNumbers === '') && 
                <div className='triggerApiHover'>
                    Update the API Trigger
                </div>
            }
        </div>
    )
}

export const GameManagement = () => {

    const location = useLocation();
    const navigate = useNavigate();
    const { state: {userDetails}} = location;
    const {userRole} = userDetails;

    const [gameDetails, setGameDetails] = useState([]);
    const [gameApiDetails, setGameApiDetails] = useState([]);
    const [lastUpdateTime, setLastUpdateTime] = useState('')
    const [userIp, setUserIp] = useState('');
    const [loading, setLoading] = useState(true);
    const [gameApiUpdateTriggerLoading, setGameApiUdpateTriggerLoading] = useState(false);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [pageNum, setPageNum] = useState(0);
    const [searchValue, setSearchValue] = useState('');
    const [sortValue, setSortValue] = useState('None');
    const [sortOrder, setSortOrder] = useState('None');
    const [slotFilterValues, setSlotFilterValues] = useState([]);
    const [lotteryHouseFilterValues, setLotteryHouseFilterValues] = useState([]);
    const [gameTypeFilterLabel, setGameTypeFilterLabel] = useState('');
    const [gameTypeFilterValue, setGameTypeFilterValue] = useState('');
    const [gameStatusFilterLabel, setGameStatusFilterLabel] = useState('');
    const [gameStatusFilterValue, setGameStatusFilterValue] = useState('');
    const [actualClosingDateFilterValue, setActualClosingDateFilterValue] = useState('');
    const [fantasyClosingDateFilterValue, setFantasyClosingDateFilterValue] = useState('');
    const [sortedLabel, setSortedLabel] = useState('None');

    const [showUpdateSuccessMessage, setShowUpdateSuccessMessage] = useState(false)
    
    const fetchGames = () => {
        setLoading(true)
        fetch(process.env.REACT_APP_GAME_API_HOST, {
            method: 'GET',
            headers: {
                'x-channel': 'all',
                'auth-token': localStorage.getItem('token'),
            }
        })
        .then(resp => {
            if(resp.status==200) {
                resp.json().then(data => {
                    setGameApiDetails(data?.map(game => ({
                        ...game,
                        nextDrawDate: new Date(game.nextDrawDate*1000),
                        fantasyLotoClosingTime: new Date(game.fantasyLotoClosingTime*1000)
                    })))
                    setGameDetails(data?.map(game => ({
                        ...game,
                        nextDrawDate: new Date(game.nextDrawDate*1000),
                        fantasyLotoClosingTime: new Date(game.fantasyLotoClosingTime*1000)
                    })))
                    setLoading(false)
                })
            } else {
                console.log('resp status not 200', resp.status)
                setLoading(false)
            }
        })
        .catch(()=>{
            console.log('error getting games list')
            setLoading(false)
        })
    }

    const fetchLastUpdateTime = () => {
        apiLoadTime(setLastUpdateTime)
    }

    const fetchUserIp = () => {
        fetch('https://api64.ipify.org/?format=json')
        .then(resp => {
            if(resp.status===200) {
                resp.json().then(data => {
                    console.log('fetched users ip is ', data.ip)
                    setUserIp(data.ip)
                })
            } else {
                console.log('fetching user ip failed with status', resp.status)
            }
        })
        .catch(err => {
            console.log('fetching user ip failed with error', err)
        })
    }

    const triggerGamesAPIUpdate = () => {
        console.log('Game API update trigger clicked')
        setGameApiUdpateTriggerLoading(true)
        fetch(process.env.REACT_APP_GAME_API_HOST +'/load', {
            headers: {
                'x-username': userDetails.userName,
                'x-channel': 'loadtime',
                'auth-token': localStorage.getItem('token'),
            }
        })
        .then(resp => {
            if(resp.status===200) {
                console.log('Game API update trigger success')
                setGameApiUdpateTriggerLoading(false)
                triggerRefresh()
            } else {
                console.log('game api update trigger failed with resp status', resp.status)
                setGameApiUdpateTriggerLoading(false)
            }
        })
        .catch((err) => {
            console.log('game api update trigger failed with error', err)
            setGameApiUdpateTriggerLoading(false)
        })
    }

    const triggerRefresh = () => {
        fetchGames()
        fetchLastUpdateTime()
        fetchUserIp()
    }

    useEffect(fetchGames, [])

    useEffect(() => {
        fetchLastUpdateTime()
        fetchUserIp()
    }, [])

    const sortOptions = [
        {
            label: 'Actual Closing time (new-old)',
            onClick: () => {
                setSortValue('actualClosingTime')
                setSortOrder('dsc')
                setSortedLabel('Actual Closing Time (new-old)')
            }
        },
        {
            label: 'Actual Closing time (old-new)',
            onClick: () => {
                setSortValue('actualClosingTime')
                setSortOrder('asc')
                setSortedLabel('Actual Closing Time (old-new)')
            }
        },
        {
            label: 'Game (A-Z)',
            onClick: () => {
                setSortValue('game')
                setSortOrder('asc')
                setSortedLabel('Game (A-Z)')
            }
        },
        {
            label: 'Game (Z-A)',
            onClick: () => {
                setSortValue('game')
                setSortOrder('dsc')
                setSortedLabel('Game (Z-A)')
            }
        }
    ]
    const clearSort = () => {
        setSortValue('None')
        setSortedLabel('None')
    }

    const lotteryHouseFilters = {
        type: 'multiValue',
        label: 'State Name',
        currentValues: lotteryHouseFilterValues,
        options: [...new Set((gameApiDetails??[]).map(p => p.state))].sort((a, b) => {
            if(a.toLowerCase()<b.toLowerCase()) return -1
            if(a.toLowerCase()>b.toLowerCase()) return 1
            return 0
        }),
        onChange: setLotteryHouseFilterValues,
        clearFilterValue: (value) => {
            setLotteryHouseFilterValues(vals => vals.filter(val => val !== value))
        }
    }

    const slotFilters = {
        type: 'multiValue',
        label: 'Slot',
        currentValues: slotFilterValues,
        options: [...new Set((gameApiDetails??[]).map(p => p.slot!==''?p.slot:'No slot'))].sort((a, b) => {
            if(a.toLowerCase()<b.toLowerCase()) return -1
            if(a.toLowerCase()>b.toLowerCase()) return 1
            return 0
        }),
        onChange: setSlotFilterValues,
        clearFilterValue: (value) => {
            setSlotFilterValues(vals => vals.filter(val => val !== value))
        }
    }

    const gameTypeFilters = {
        type: 'singleValue',
        label: 'Game type',
        currentValue: gameTypeFilterValue,
        currentLabel: gameTypeFilterLabel,
        options: [...new Set((gameApiDetails ?? []).map(admin => admin.gameName))]
                    .sort((a, b) => {
                        if(a.toLowerCase()<b.toLowerCase()) return -1
                        if(a.toLowerCase()>b.toLowerCase()) return 1
                        return 0
                    })
                    .map(fr => ({label:capitalizeFirstLetter(fr), value: fr})),
        onChange: (value) => {
            setGameTypeFilterValue(value)
            setGameTypeFilterLabel(capitalizeFirstLetter(value))
        },
        clearFilter: () => {
            setGameTypeFilterValue('')
            setGameTypeFilterLabel('')
        }
    }

    const gameStatusFilters = {
        type: 'singleValue',
        label: 'Game status',
        currentValue: gameStatusFilterValue,
        currentLabel: gameStatusFilterLabel,
        options: [{label:'Closed', value:'closed'}, {label:'Upcoming', value:'upcoming'}],
        onChange: (value) => {
            setGameStatusFilterValue(value)
            setGameStatusFilterLabel(value)
        },
        clearFilter: () => {
            setGameStatusFilterValue('')
            setGameStatusFilterLabel('')
        }
    }

    const actualClosingDateFilters = {
        type: 'date',
        label: 'Actual closing Time',
        currentValue: actualClosingDateFilterValue,
        onChange: setActualClosingDateFilterValue,
        clearFilter: () => {
            setActualClosingDateFilterValue('')
        }
    }

    const fantasyClosingDateFilters = {
        type: 'date',
        label: 'Fantasy closing Time',
        currentValue: fantasyClosingDateFilterValue,
        onChange: setFantasyClosingDateFilterValue,
        clearFilter: () => {
            setFantasyClosingDateFilterValue('')
        }
    }

    useEffect(() => {
        if(!loading) {
            const gameSorter = (p1, p2) => (sortOrder === 'dsc'?-1:1) * p1.gameName.toLowerCase().localeCompare(p2.gameName.toLowerCase())
            const actualClosingTimeSorter = (p1, p2) => {
                if(new Date(p1.actualClosingTime).getTime()<new Date(p2.actualClosingTime).getTime()) return (sortOrder === 'dsc'?-1:1) * -1
                if(new Date(p1.actualClosingTime).getTime()===new Date(p2.actualClosingTime).getTime()) return (sortOrder === 'dsc'?-1:1) * 0
                return (sortOrder === 'dsc'?-1:1) * 1
            }

            const games = gameApiDetails
            let filteredGames = games.filter((game) => 
                game.state.toLowerCase().includes(searchValue.toLowerCase()) 
                || game.gameId.toLowerCase().includes(searchValue.toLowerCase())
                || game.slot.toLowerCase().includes(searchValue.toLowerCase()) 
                || game.gameName.toLowerCase().includes(searchValue.toLowerCase())
                || (game.status === closedGameStatus && game.lastDrawNumbers.includes(searchValue))
            )
            console.log('after search filter', filteredGames)
            if(slotFilterValues.length !== 0) {
                filteredGames = filteredGames.filter(game => slotFilterValues.includes(game.slot) || (slotFilterValues.includes('No slot') && game.slot === ''))
            }
            if(lotteryHouseFilterValues.length !== 0) {
                filteredGames = filteredGames.filter(game => lotteryHouseFilterValues.includes(game.state))
            }
            if(gameTypeFilterValue !== '') {
                filteredGames = filteredGames.filter(game => game.gameName === gameTypeFilterValue)
            }
            if(gameStatusFilterValue !== '') {
                filteredGames = filteredGames.filter(game => game.status === gameStatusFilterValue)
            }
            if(actualClosingDateFilterValue !== '') {
                filteredGames = filteredGames.filter(p=> {
                    const dateObj = convertToEstTimeZone(p.nextDrawDate)
                    const actualClosingDateFilterDateObj = actualClosingDateFilterValue.$d
                    return dateObj.getFullYear() === actualClosingDateFilterDateObj.getFullYear() &&
                        dateObj.getMonth() === actualClosingDateFilterDateObj.getMonth() &&
                        dateObj.getDate() === actualClosingDateFilterDateObj.getDate()
                })
            }
            if(fantasyClosingDateFilterValue !== '') {
                filteredGames = filteredGames.filter(p=> {
                    const dateObj = convertToEstTimeZone(p.fantasyLotoClosingTime)
                    const createdDateFilterDateObj = fantasyClosingDateFilterValue.$d
                    return dateObj.getFullYear() === createdDateFilterDateObj.getFullYear() &&
                        dateObj.getMonth() === createdDateFilterDateObj.getMonth() &&
                        dateObj.getDate() === createdDateFilterDateObj.getDate()
                })
            }
            if(sortValue === 'actualClosingTime') {
                filteredGames = filteredGames.sort(gameSorter)
            } else if(sortValue === 'game') {
                filteredGames = filteredGames.sort(actualClosingTimeSorter)
            }
            setGameDetails(filteredGames)
            if(pageNum>=Math.ceil(filteredGames.length/rowsPerPage)) {
                setPageNum(Math.ceil(filteredGames.length/rowsPerPage)-1>=0?Math.ceil(filteredGames.length/rowsPerPage)-1: 0)
            }
        }
    }, [searchValue, slotFilterValues, lotteryHouseFilterValues, gameTypeFilterValue, gameStatusFilterValue, actualClosingDateFilterValue, fantasyClosingDateFilterValue, sortValue, sortOrder, gameApiDetails])

    const gameColumns = [{
        gridColumns: 1,
        name: 'Game ID'
    },{
        gridColumns: 2,
        name: 'State Name'
    }, {
        gridColumns: 1,
        name: 'Slot'
    },{
        gridColumns: 1,
        name: 'Game type'
    },{
        gridColumns: 2,
        name: 'Actual closing time'
    },{
        gridColumns: 2,
        name: 'Fantasy loto closing time',
        isReactElement: true
    },{
        gridColumns: 1,
        name: 'Win number',
        isReactElement: true
    },{
        gridColumns: 2,
        name: 'Status',
        isReactElement: true
    }]

    const mapToRowContent = (gameDetails, userRole) => {
        return gameDetails.map(game=>
            [
                ...[game.gameId, capitalizeFirstLetter(game.state), capitalizeFirstLetter(game.slot), capitalizeFirstLetter(game.gameName), convertToUIDate(convertToEstTimeZone(game.nextDrawDate))].map(text => ({text})),
                {
                    Element: FantasyLotoClosingTime,
                    props: {userRole, game, userDetails: location.state.userDetails, triggerRefresh,
                        showUpdateSuccessMessage: () => {
                            setShowUpdateSuccessMessage(true)
                            setTimeout(()=>setShowUpdateSuccessMessage(false), 4000)
                        },
                        userIp
                    }
                },
                {
                    Element: WinNumbers,
                    props: {winNumbers: game.lastDrawNumbers, status: game.status}
                },
                {
                    Element: Status,
                    props: {status: game.status, timeLeft: game.status!==closedGameStatus?calculateTimeLeft(game.nextDrawDate):''}
                }
            ])
    }

    const lastPageNumber = Math.ceil(gameDetails.length/rowsPerPage)

    return (<>
    {
        gameApiUpdateTriggerLoading && <CenterFantasyLoader />
    }
    {loading?
        <CenterFantasyLoader />
        : <div className="gamesPage">
            <div className="gamesTitleRow">
                <div className="gamesTitle">
                    Games
                </div>
                <div className='gameTitleRowRightPanel'>
                    <div className='gamesUpdateTime'>
                        <div className='gamesUpdateTimeText'>
                            Last data received on
                        </div>
                        <div className='gamesUpdateTimeValue'>
                            {lastUpdateTime}
                        </div>
                    </div>
                    {(userRole===superAdminRole || userRole===adminRole) && <div className='gamesAPIRefreshButtonHoverParent'>
                        <div className='gamesAPIRefreshButton clickable' onClick={triggerGamesAPIUpdate}>
                            <BackupIcon />
                        </div>
                        <div className='gamesAPIRefreshHoverText'>
                        Update the API Trigger
                        </div>
                    </div>}
                    <div className='gamesRefreshButton clickable' onClick={triggerRefresh}>
                        <RefershIcon />
                    </div>
                    {userRole===superAdminRole && <div className='gameLogsButton clickable' onClick={()=>navigate('/home/games/logs', location)}>
                        <LogsIcon />
                        <div className='gameLogsButtonText'>
                            Logs
                        </div>
                    </div>}
                </div>
            </div>
    
            <FilterBar 
                onSearchValueChange={setSearchValue} 
                sortOptions={[]} 
                sortedLabel={sortedLabel} 
                clearSort={clearSort}
                filters={[lotteryHouseFilters, slotFilters, gameTypeFilters, gameStatusFilters, actualClosingDateFilters, fantasyClosingDateFilters]}
                currentSearchValue={searchValue}
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
                rowContent={mapToRowContent(gameDetails.slice(pageNum*rowsPerPage, (pageNum+1)*rowsPerPage) ?? [], userRole)}
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
            
        </div>}
        
        {showUpdateSuccessMessage &&
            <Alert 
                message={`Closing time updated successfully`}
                style={{position:'fixed', left:'24px', bottom:'16px', 'z-index':'2'}} 
                onClick={()=>setShowUpdateSuccessMessage(false)}
            />
        }
        </>)
}