import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { LogsButton } from "../shared/LogsButton/LogsButton";
import { Alert } from "../../elements/alert/Alert";
import { ErrorAlert } from "../../elements/alert/ErrorAlert";
import { DataTable } from "../../elements/dataTable/DataTable";
import { CenterFantasyLoader } from "../../elements/fantasyLotoLoader/FantasyLotoLoader";
import { superAdminRole } from '../../util/constants';
import { formatToAmount, formatToCurrency, validateCurrencyFormat } from "../../util/currencyformatter";
import { StatusWithHoverText } from "../shared/StatusWithHoverText/StatusWithHoverText";
import styles from './LotteryLimit.module.css'
import { EditLotteryLimit } from "./EditLotteryLimit/EditLotteryLimit";
import { Drawer } from "@material-ui/core";
import { FilterBar } from "../FilterBar/FilterBar";
import { capitalizeFirstLetter } from "../../util/stringUtils";
import { PageNavigation } from "../PageNavigation/PageNavigation";
import { calculateTimePast, convertEpochsToUIDate } from "../../util/dateUtils";

const LimitAmount = ({amount, statusActive, limitNotSet, readOnlyUser, onClick}) => {
    return <div className={`${readOnlyUser?'':'linkText clickable'}`} onClick={onClick}>
      {!statusActive?'Not applicable':limitNotSet?'No limit set yet':formatToCurrency(amount)}
    </div>
}

const Statuses = ({rowItem}) => {
    return <div className={`${styles.statuses}`}>
        <StatusWithHoverText statusText={rowItem.statusActive?'Active':'In-active'} variant={rowItem.statusActive?'active':'inactive'} hoverText={rowItem.statusComments} width='80px' />
        {rowItem.statusActive && <StatusWithHoverText statusText={rowItem.limitReached?'Limit reached':'Available'} variant={rowItem.limitReached?'inactive':'active'} hoverText={rowItem.availabilityComments} width='120px' />}
    </div>
}

export const LotteryLimit = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { state: {userDetails}} = location;
  
  const mockData = [{
    gameId: 1,
    house: 'New York',
    slot: 'evening',
    gameType: 'pick3',
    limitNotSet: false,
    defaultLimit: 300000,
    limitReached: false,
    availableLimit: 282802,
    statusActive: true,
  },{
    gameId: 2,
    house: 'scottsdale',
    slot: 'morning',
    gameType: 'pick4',
    limitNotSet: true,
    defaultLimit: 100,
    limitReached: false,
    availableLimit: 100,
    statusActive: false,
    statusComments: 'Inactive since past 24hrs'
  }]

  const [showEditLimitSection, setShowEditLimitSection] = useState(false);
  const [lotteryLimitRecord, setLotteryLimitRecord] = useState({});
  const [showStatusUpdate, setShowStatusUpdate] = useState("");
  const [errorMsgUpdatingValues, setErrorMsgUpdatingValues] = useState("");

  const [searchValue, setSearchValue] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [loading, setLoading] = useState(false);
  const [lotteryLimitData, setLotteryLimitData] = useState([])
  const [lotteryLimitApiData, setLotteryLimitApiData] = useState([])

  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [pageNum, setPageNum] = useState(0);

  const [houseFilterValues, setHouseFilterValues] = useState([]);
  const [slotFilterValues, setSlotFilterValues] = useState([]);
  const [gameTypeFilter, setGameTypeFilter] = useState('');
  const [gameTypeFilterLabel, setGameTypeFilterLabel] = useState('');
  const [defaultLimitRangeFilterValues, setDefaultLimitRangeFilterValues] = useState([]);
  const [availableLimitRangeFilterValues, setAvailableLimitRangeFilterValues] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [statusFilterLabel, setStatusFilterLabel] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('');
  const [availabilityFilterLabel, setAvailabilityFilterLabel] = useState('');
    
  const houseFiltersConfig = {
    type: 'multiValue',
    label: 'House',
    currentValues: houseFilterValues,
    options: [...new Set((lotteryLimitApiData??[]).map(p => capitalizeFirstLetter(p.house)))].sort((a, b) => {
        if(a.toLowerCase()<b.toLowerCase()) return -1
        if(a.toLowerCase()>b.toLowerCase()) return 1
        return 0
    }),
    onChange: setHouseFilterValues,
    clearFilterValue: (value) => {
      setHouseFilterValues(vals => vals.filter(val => val !== value))
    }
  }

  const slotFiltersConfig = {
    type: 'multiValue',
    label: 'Slot',
    currentValues: slotFilterValues,
    options: [...new Set((lotteryLimitApiData??[]).map(p => p.slot!==''?capitalizeFirstLetter(p.slot):'No slot'))].sort((a, b) => {
        if(a.toLowerCase()<b.toLowerCase()) return -1
        if(a.toLowerCase()>b.toLowerCase()) return 1
        return 0
    }),
    onChange: setSlotFilterValues,
    clearFilterValue: (value) => {
      setSlotFilterValues(vals => vals.filter(val => val !== value))
    }
  }

  const defaultLimitRangeFiltersConfig = {
    type:'numRange',
    label:'Default Limit',
    variant: 'currency',
    currentValues:defaultLimitRangeFilterValues,
    onChange:setDefaultLimitRangeFilterValues,
    clearFilterValue:()=>setDefaultLimitRangeFilterValues([])
  }

  const availableLimitRangeFiltersConfig = {
    type:'numRange',
    label:'Available Limit',
    variant: 'currency',
    currentValues:availableLimitRangeFilterValues,
    onChange:setAvailableLimitRangeFilterValues,
    clearFilterValue:()=>setAvailableLimitRangeFilterValues([])
  }

  const gameTypeFiltersConfig = {
    type: 'singleValue',
    label: 'Game type',
    currentValue: gameTypeFilter,
    currentLabel: gameTypeFilterLabel,
    options: [
        {
          label: 'Pick3',
          value: 'Pick3'
        },
        {
          label: 'Pick4',
          value: 'Pick4'
        }
    ],
    onChange: (value) => {
        setGameTypeFilter(value)
        setGameTypeFilterLabel(value)
    },
    clearFilter: () => {
        setGameTypeFilter('')
        setGameTypeFilterLabel('')
    }
  }

  const statusFiltersConfig = {
    type: 'singleValue',
    label: 'Status',
    currentValue: statusFilter,
    currentLabel: statusFilterLabel,
    options: [
        {
            label: 'Active',
            value: 'active'
        },
        {
            label: 'In-Active',
           value: 'inactive'
        }
    ],
    onChange: (value) => {
        setStatusFilter(value)
        setStatusFilterLabel(value==='active'?'Active':'In-Active')
    },
    clearFilter: () => {
        setStatusFilter('')
        setStatusFilterLabel('')
    }
  }

  const availabilityFiltersConfig = {
    type: 'singleValue',
    label: 'Availability',
    currentValue: availabilityFilter,
    currentLabel: availabilityFilterLabel,
    options: [
        {
          label: 'Available',
          value: 'available'
        },
        {
          label: 'Limit reached',
          value: 'limitReached'
        }
    ],
    onChange: (value) => {
      setAvailabilityFilter(value)
      setAvailabilityFilterLabel(value==='available'?'Available':'Limit reached')
    },
    clearFilter: () => {
      setAvailabilityFilter('')
      setAvailabilityFilterLabel('')
    }
  }

  const fetchLotteryLimitData = () => {
    setLoading(true)
    fetch(process.env.REACT_APP_LOTTERY_LIMIT, {
      headers: {
        'x-username':userDetails.userName,
        'auth-token': localStorage.getItem('token'),
      }
    })
    .then(resp => {
      if(resp.status===200) {
        resp.json().then(data => {
          const mappedData = data?.houses?.map(record => {
            const statusActive = record.instances[0].closing_time*1000 > new Date().getTime()
            const availableLimit = record.instances[0].limit
            return {
              gameId: record.game_id,
              house: record.house,
              slot: record.slot,
              gameType: record.game_type,
              limitNotSet: !record.is_default_limit_set,
              defaultLimit: record.default_limit,
              statusActive: statusActive,
              statusComments: !statusActive?'Inactive for past '.concat(calculateTimePast(record.instances[0].closing_time)):'',
              availableLimit: availableLimit,
              limitReached: availableLimit<=0,
              availabilityComments: availableLimit<=0?convertEpochsToUIDate(record.instances[0].limit_reached_time):'',
            }
          })
          setLotteryLimitApiData(mappedData)
          setLotteryLimitData(mappedData)
        })
      } else {
        console.log('Lottery limit api failed with status:', resp.status)
      }
      setLoading(false)
    })
    .catch(err => {
      console.log('Failed to fetch lottery limit data with error:', err)
      setLoading(false)
    })
  }

  useEffect(fetchLotteryLimitData, []);

  useEffect(()=>{
    setPageNum(0)
    let filteredRecords = lotteryLimitApiData
    if(searchValue!=='') {
      filteredRecords = filteredRecords.filter(rec => {
        const searchVal = searchValue.toLowerCase()
        return rec.house.toLowerCase().includes(searchVal)
          || rec.slot.toLowerCase().includes(searchVal)
          || rec.gameType.toLowerCase().includes(searchVal)
      })
    }
    if(houseFilterValues.length>0) {
      filteredRecords = filteredRecords.filter(rec => houseFilterValues.includes(capitalizeFirstLetter(rec.house)))
    }
    if(slotFilterValues.length>0) {
      filteredRecords = filteredRecords.filter(rec => slotFilterValues.includes(capitalizeFirstLetter(rec.slot)) || (slotFilterValues.includes('No slot') && rec.slot === ''))
    }
    if(gameTypeFilter!=='') {
      filteredRecords = filteredRecords.filter(rec => rec.gameType.toLowerCase() === gameTypeFilter.toLowerCase())
    }
    if(defaultLimitRangeFilterValues.length>0) {
      filteredRecords = filteredRecords.filter(rec => !rec.limitNotSet && rec.defaultLimit>=defaultLimitRangeFilterValues[0] && rec.defaultLimit<=defaultLimitRangeFilterValues[1])
    }
    if(availableLimitRangeFilterValues.length>0) {
      filteredRecords = filteredRecords.filter(rec => !rec.limitNotSet && rec.statusActive && rec.availableLimit>=availableLimitRangeFilterValues[0] && rec.availableLimit<=availableLimitRangeFilterValues[1])
    }
    if(statusFilter!=='') {
      filteredRecords = filteredRecords.filter(rec => rec.statusActive === (statusFilter === 'active'))
    }
    if(availabilityFilter!=='') {
      filteredRecords = filteredRecords.filter(rec => rec.statusActive && (rec.limitReached === (availabilityFilter === 'limitReached')))
    }
    setLotteryLimitData(filteredRecords)
  },[searchValue, houseFilterValues, slotFilterValues, gameTypeFilter, defaultLimitRangeFilterValues, availableLimitRangeFilterValues, statusFilter, availabilityFilter])

  const readOnlyUser = userDetails.userRole !== superAdminRole

  const columnConfig = [{
    gridColumns: 2,
    name: "House",
  },{
    gridColumns: 2,
    name: "Slot",
  },{
    gridColumns: 2,
    name: "Game type",
  },{
    gridColumns: 3,
    name: "Default limit",
    isReactElement: true,
  },{
    gridColumns: 3,
    name: "Available limit",
    isReactElement: true,
  },{
    gridColumns: 4,
    name: "Status",
    isReactElement: true,
  }]

  const openEditLimitSection = ({gameId, house, slot, gameType, defaultLimit, statusActive}) => {
    if(readOnlyUser) return
    setShowEditLimitSection(true)
    setLotteryLimitRecord({gameId, house, slot, gameType, defaultLimit, statusActive})
  }
  
  const mapToRowContent = (data) => data.map(rowItem => [
      ...[capitalizeFirstLetter(rowItem.house), capitalizeFirstLetter(rowItem.slot), capitalizeFirstLetter(rowItem.gameType)].map(text => ({text})),
      {
        Element: LimitAmount,
        props: {amount: rowItem.defaultLimit, statusActive: true, limitNotSet: rowItem.limitNotSet, readOnlyUser, onClick: ()=>openEditLimitSection(rowItem)}
      },{
        Element: LimitAmount,
        props: {amount: rowItem.availableLimit, statusActive: rowItem.statusActive, limitNotSet: rowItem.limitNotSet, readOnlyUser, onClick: ()=>openEditLimitSection(rowItem)}
      },{
        Element: Statuses,
        props: {rowItem}
      }
  ])

  return (
    <>
    {
      (loading) && <CenterFantasyLoader />
    }
    <div className="pageDisplay">
      <div className="pageHeader">
        <div className="pageTitle">Lottery limit</div>
        <div className="pageTitleRight">
          {!readOnlyUser && <LogsButton onClick={()=>navigate('/home/lotteryLimit/logs', location)} />}
        </div>
      </div>

      <FilterBar
        onSearchValueChange={setSearchValue}
        sortOptions={[]}
        sortedLabel={'None'}
        clearSort={()=>{}}
        filters={[houseFiltersConfig, slotFiltersConfig, gameTypeFiltersConfig, defaultLimitRangeFiltersConfig, availableLimitRangeFiltersConfig, statusFiltersConfig, availabilityFiltersConfig]}
        currentSearchValue={searchValue}
      />

      <PageNavigation
        dataLoading={loading}
        rowsPerPage={rowsPerPage} 
        setRowsPerPage={setRowsPerPage} 
        pageNum={pageNum} 
        setPageNum={setPageNum} 
        currentDataLength={lotteryLimitData?.length} 
        moreRecordsIndicator={false}
      />

      <DataTable
        spacing={2}
        totalColumns={16}
        columnConfig={columnConfig}
        rowContent={mapToRowContent(lotteryLimitData?.slice(rowsPerPage*pageNum, rowsPerPage*(pageNum+1)))}
      />

      <PageNavigation
        dataLoading={loading}
        rowsPerPage={rowsPerPage} 
        setRowsPerPage={setRowsPerPage} 
        pageNum={pageNum} 
        setPageNum={setPageNum} 
        currentDataLength={lotteryLimitData?.length} 
        moreRecordsIndicator={false}
      />

      {(!loading && (errorMsg!=='' || lotteryLimitData.length==0)) && <div className="tableErrorMsg">
        {errorMsg!==''?errorMsg:'No records found with given criteria'}
      </div>}
      
      {showEditLimitSection && <Drawer 
        anchor="right" 
        open={showEditLimitSection}
        onClose={() => {
          setShowEditLimitSection(false);
          setLotteryLimitRecord({});
        }}
      >
        <EditLotteryLimit
          lotteryLimitRecord={lotteryLimitRecord} 
          onClose={() => {
            setShowEditLimitSection(false);
            setLotteryLimitRecord({});
          }} 
          onSave={()=>{
            setShowEditLimitSection(false)
            setShowStatusUpdate('Lottery limit is updated successfully')
            fetchLotteryLimitData()
            setTimeout(()=>setShowStatusUpdate(''), 5000)
          }}
          onError={()=>{
            setShowEditLimitSection(false)
            setErrorMsgUpdatingValues('Failed to update lottery limit')
            setTimeout(()=>setErrorMsgUpdatingValues(''), 5000)
          }}
        />
      </Drawer>}

      {showStatusUpdate && (
        <Alert
          message={showStatusUpdate}
          style={{ position: "fixed", left: "24px", bottom: "16px" }}
          onClick={() => setShowStatusUpdate("")}
        />
      )}
      {errorMsgUpdatingValues &&
        <ErrorAlert 
          message={errorMsgUpdatingValues}
          style={{ position: "fixed", left: "24px", bottom: "16px" }}
          onClick={() => setErrorMsgUpdatingValues("")}
        />
      }
    </div>
  </>)

}