import React, { useEffect, useState, useRef } from "react";
import { ReactComponent as LogsIcon } from "../../resources/bookmarklogs.svg";
import "./WinRatio.css";
import { DataTable } from "../../elements/dataTable/DataTable";
import { ReactComponent as MoreOptions } from '../../resources/more_options.svg';
import { ReactComponent as RefreshButton } from '../../resources/refreshrefresh-small.svg';
import { OverlayOptions } from "../../elements/overlayOptions/OverlayOptions";
import { superAdminRole } from '../../util/constants';
import { FilterBar } from "../FilterBar/FilterBar";
import { Drawer } from "@material-ui/core";
import { EditWinRatio } from "./EditWinRatio/EditWinRatio";
import { useLocation, useNavigate } from "react-router-dom";
import { Alert } from "../../elements/alert/Alert";
import { CenterFantasyLoader } from "../../elements/fantasyLotoLoader/FantasyLotoLoader";

import { capitalizeFirstLetter } from "../../util/stringUtils";
import { formatToCurrency } from "../../util/currencyformatter";
import { useClickOutHandler } from "../../hooks/useClickOutHandler";
import { withHoverText } from "../../hoc/withHoverText";
import { ErrorAlert } from "../../elements/alert/ErrorAlert";
import { fetchUserIp } from '../../api/fetchUserIp';
import { fetchUserLocation } from '../../api/fetchUserLocation';
import { convertEpochsToUIDate } from "../../util/dateUtils";

const deriveStatusText = (betTypeUiData) => {
  return !betTypeUiData.noLimit && betTypeUiData.limitAvailable<=0?'Limit reached': (betTypeUiData.visibility?'Active':'Hidden')
}

const MoreOptionsButton = ({showEditRatio}) => {
  const [showOptions, setShowOptions] = useState(false);
  const moreOptionsRef = useRef(null);

  useClickOutHandler(moreOptionsRef, ()=>setShowOptions(false))

  return (
      <>
          <div className="agentMoreOptions" onClick={()=>setShowOptions(currentState=>!currentState)}  ref={moreOptionsRef}>
              <MoreOptions />
              {showOptions && 
                  <OverlayOptions options={[
                      {
                          label: 'Edit',
                          onClick: showEditRatio
                      },
                  ]} />
              }
          </div>
      </>
  )
}

const RefreshLimitButton = ({userIp, locationDetails, betTypeName, limitReached, onBetLimitReset, onBetLimitResetFailure}) => {
  const location = useLocation();
  const [loading, setLoading] = useState(false)

  const onLimitResetClick = () => {
    setLoading(true)
    fetch(process.env.REACT_APP_WIN_RATIO+'/bet-types?'+new URLSearchParams({
      bet_type: betTypeName,
      location: locationDetails.location,
      coordinates: `${locationDetails.latitude}, ${locationDetails.longitude}`,
      ipaddress: userIp
    }), {
      headers: {
        'x-username': location.state.userDetails.userName,
        'auth-token': localStorage.getItem('token'),
      },
      method: 'PUT'
    })
    .then(resp => {
      if(resp.status==200) {
        onBetLimitReset()
      } else {
        onBetLimitResetFailure()
      }
      setLoading(false)
    })
    .catch(err => {
      console.log('API call failed with error: ', err)
      onBetLimitResetFailure()
      setLoading(false)
    })
  }

  const RefreshLimitButtonWithHover = withHoverText(
    <div className="clickable"><RefreshButton onClick={onLimitResetClick} /></div>,
    'Reset limit'
  )

  return <>
    {loading && <CenterFantasyLoader />}
    {limitReached && <RefreshLimitButtonWithHover />}
  </>

}

const Status = ({comments, limitReached, betTypeUiData}) => {
  
  const statusText = deriveStatusText(betTypeUiData)

  const StatusTextWithHover = withHoverText(
  <div className={`winRatioText ${!limitReached && betTypeUiData.visibility?'winRatioTextActive':'winRatioTextInactive'}`}>
    {statusText}
  </div> , statusText==='Limit reached'?comments:'')

  return <div className='winRatioMoreOptions'>
        <StatusTextWithHover />
    </div>
}

export const WinRatio = () => {
    const location = useLocation();
  const { state: {userDetails}} = location;
  const navigate = useNavigate();

  const [showSetSection, setShowSetSection] = useState(false);
  const [game, setGame] = useState(null);

  const [showStatusUpdate, setShowStatusUpdate] = useState("");
  const [errorMsgUpdatingValues, setErrorMsgUpdatingValues] = useState("");

  const [loading, setLoading] = useState(true);
  const mockResults = [{
    'betType': 'Straight',
    'ratioPick3': '1:100',
    'ratioPick4': '1:120',
    'limitSet': '$2000',
    'limitAvailable': '$1333',
    'visibility': true
  },{
    'betType': 'Box',
    'ratioPick3': '1:100',
    'ratioPick4': '1:120',
    'limitSet': '$2000',
    'limitAvailable': '$1333',
    'visibility': true
  },{
    'betType': 'Box',
    'ratioPick3': '1:100',
    'ratioPick4': '1:120',
    'limitSet': '$2000',
    'limitAvailable': '$0',
    'comments': '09 Sep 2023 05:30PM',
    'visibility': true
  },{
    'betType': 'High Loot',
    'ratioPick3': '1:100',
    'ratioPick4': '1:120',
    'limitSet': '$2000',
    'limitAvailable': '$1333',
    'visibility': false,
  }]
  const [resultDetails, setResultDetails] = useState([]);
  const [apiResultDetails, setApiResultDetails] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  const [statusFilterValue, setStatusFilterValue] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [userIp, setUserIp] = useState('')
  const [userIpErrMsg, setUserIpErrMsg] = useState('')
  const [locationDetails, setLocationDetails] = useState(null);
  const [locationErrorMsg, setLocationErrorMsg] = useState('');

  useEffect(() => {
    fetchUserIp(setUserIp, setUserIpErrMsg)
    if(locationDetails==null) {
        fetchUserLocation(setLocationDetails, setLocationErrorMsg)
    }
  }, [])

  const statusFilters = {
    type: 'singleValue',
    label: 'Status',
    currentValue: statusFilterValue,
    currentLabel: statusFilterValue,
    options: ['Active', 'Hidden', 'Limit reached'].map((option)=>({label:option, value:option})),
    onChange: (value) => setStatusFilterValue(value),
    clearFilter: () => setStatusFilterValue('')
  }

  const mapToUiData = (apiData) => {
    const byBetType = apiData.reduce((curMap, apiBetTypeRecord) => {
      if(curMap[apiBetTypeRecord.bet_type]===undefined) {
        curMap[apiBetTypeRecord.bet_type] = {
          betType: apiBetTypeRecord.bet_type,
          ratioPick3: apiBetTypeRecord.game_type==='pick3'? apiBetTypeRecord.win_ratio : 0,
          ratioPick4: apiBetTypeRecord.game_type==='pick4'? apiBetTypeRecord.win_ratio : 0,
          limitSet: apiBetTypeRecord.actual_limit,
          limitAvailable: apiBetTypeRecord.available_limit,
          noLimit: apiBetTypeRecord.no_limit,
          visibility: apiBetTypeRecord.visibile_on_mobile,
          limitReachedTime: apiBetTypeRecord.limit_reached_time
        }
      } else {
        curMap[apiBetTypeRecord.bet_type] = {
          ...curMap[apiBetTypeRecord.bet_type],
          ratioPick3: apiBetTypeRecord.game_type==='pick3'? apiBetTypeRecord.win_ratio : curMap[apiBetTypeRecord.bet_type].ratioPick3,
          ratioPick4: apiBetTypeRecord.game_type==='pick4'? apiBetTypeRecord.win_ratio : curMap[apiBetTypeRecord.bet_type].ratioPick4
        }
      }
      return curMap
    }, {})
    console.log('Mapped response', Object.values(byBetType))
    return Object.values(byBetType)
  }

  const fetchWinRatios = () => {
    setLoading(true)
    setErrorMsg('')
    fetch(process.env.REACT_APP_WIN_RATIO+'/bet-types', {
      headers: {
        'x-username': userDetails.userName,
        'auth-token': localStorage.getItem('token'),
      }
    })
    .then(resp => {
      if(resp.status==200) {
        resp.json().then(data => {
          setApiResultDetails(mapToUiData(data))
        })
      } else {
        console.log('API call failed with status',resp.status)
        setErrorMsg('Some thing went wrong, please try again later')
      }
      setLoading(false)
    })
    .catch(err => {
      console.log('API call failed with error: ', err)
      setErrorMsg('Some thing went wrong, please try again later')
      setLoading(false)
    })
  }

  const triggerRefresh = () => {
    fetchWinRatios()
  }

  useEffect(triggerRefresh, [userDetails])

  useEffect(() => {
    let filteredRecords = apiResultDetails
    if(searchValue!=='') {
      filteredRecords = filteredRecords.filter(record => record.betType?.toLowerCase()?.includes(searchValue?.toLowerCase()) 
            || `1:${record.ratioPick3}`.includes(searchValue) || `1:${record.ratioPick4}`.includes(searchValue)
            || record.limitSet?.toString()?.includes(searchValue) || formatToCurrency(record.limitSet).includes(searchValue)
            || record.limitAvailable?.toString()?.includes(searchValue) || formatToCurrency(record.limitAvailable).includes(searchValue))
    }
    if(statusFilterValue!=='') {
      filteredRecords = filteredRecords.filter(record => deriveStatusText(record) === statusFilterValue)
    }
    setResultDetails(filteredRecords)
  }, [apiResultDetails, searchValue, statusFilterValue])

  const onBetLimitReset = () => {
    setShowStatusUpdate('Bet type limit is reset successfully')
    triggerRefresh()
    setTimeout(()=>setShowStatusUpdate(''), 5000)
  }

  const onBetLimitResetFailure = () => {
    setErrorMsgUpdatingValues('Failed to reset the bet limit')
    setTimeout(()=>setErrorMsgUpdatingValues(''), 5000)
  }

  const readOnlyUser = userDetails.userRole !== superAdminRole

  const manualWinResultsColumns = [
    {
      gridColumns: 5,
      name: "Bet type",
    },
    {
      gridColumns: 9,
      name: "Win ratio for pick 3",
    },
    {
      gridColumns: 9,
      name: "Win ratio for pick 4",
    },
    {
      gridColumns: 9,
      name: "Bet type limit set",
    },
    {
      gridColumns: 12,
      name: "Bet type limit available",
    },
    {
      gridColumns: 2,
      name: '',
      isReactElement: true,
    },
    {
      gridColumns: 12,
      name: "Visibility on App",
      isReactElement: true,
    },
    {
      gridColumns: 2,
      name: '',
      isReactElement: true,
    }
  ];

  const readOnlyColumns = [
    {
      gridColumns: 5,
      name: "Bet type",
    },
    {
      gridColumns: 9,
      name: "Win ratio for pick 3",
    },
    {
      gridColumns: 9,
      name: "Win ratio for pick 4",
    },
    {
      gridColumns: 9,
      name: "Bet type limit set",
    },
    {
      gridColumns: 12,
      name: "Bet type limit available",
    },
    {
      gridColumns: 12,
      name: "Visibility on App",
      isReactElement: true,
    }
  ]

  const mapToRowContent = (data) => {
    return data.map((betType) => [
      ...[capitalizeFirstLetter(betType.betType), `1:${betType.ratioPick3}`, `1:${betType.ratioPick4}`,betType.noLimit?'No Limit':formatToCurrency(betType.limitSet), betType.noLimit?'No Limit':formatToCurrency(betType.limitAvailable)].map(text => ({text})),
      {
        Element: RefreshLimitButton,
        props: {userIp, locationDetails, betTypeName: betType.betType, limitReached: !betType.noLimit && betType.limitAvailable<=0, onBetLimitReset, onBetLimitResetFailure}
      },
      {
        Element: Status,
        props: {comments: convertEpochsToUIDate(betType.limitReachedTime), limitReached: !betType.noLimit && betType.limitAvailable<=0, betTypeUiData: betType}
      },
      {
        Element: MoreOptionsButton,
        props: {showEditRatio: ()=>{
          setGame(betType)
          setShowSetSection(true)
        }}
      }
    ])
  };

  const mapToReadOnlyRowContent = (data) => {
    return data.map((betType) => [
      ...[capitalizeFirstLetter(betType.betType), `1:${betType.ratioPick3}`, `1:${betType.ratioPick4}`,betType.noLimit?'No Limit':formatToCurrency(betType.limitSet), betType.noLimit?'No Limit':formatToCurrency(betType.limitAvailable)].map(text => ({text})),
      {
        Element: Status,
        props: {comments: convertEpochsToUIDate(betType.limitReachedTime), limitReached: !betType.noLimit && betType.limitAvailable<=0, betTypeUiData: betType}
      }
    ])
  }

    return (
        <>
        {
          (loading) && <CenterFantasyLoader />
        }
        <div className="winRatioPage">
          <div className="winRatioHeader">
            <div className="winRatioTitle">Bet type</div>
            <div className="right">
              {!readOnlyUser && <div
                className="logsBtn clickable"
                onClick={() => navigate("/home/winratio/logs", location)}
              >
                <LogsIcon />
                <div className="logsText">Logs</div>
              </div>}
            </div>
          </div>

          <FilterBar
            onSearchValueChange={setSearchValue}
            sortOptions={[]}
            sortedLabel={'None'}
            clearSort={()=>{}}
            filters={[statusFilters]}
            currentSearchValue={searchValue}
          />
  
          <DataTable
            spacing={2}
            totalColumns={60}
            columnConfig={readOnlyUser?readOnlyColumns:manualWinResultsColumns}
            rowContent={readOnlyUser?mapToReadOnlyRowContent(resultDetails):mapToRowContent(resultDetails)}
          />
  
          {(!loading && (resultDetails?.length==0 || errorMsg!=='')) && <div className="tableErrorMsg">
            {errorMsg!==''?errorMsg:'No records found with given criteria'}
          </div>}
          
          {showSetSection && <Drawer 
            anchor="right" 
            open={showSetSection}
            onClose={() => {
              setShowSetSection(false);
              setGame(null);
            }}
          >
            <EditWinRatio 
              betType={game} 
              onClose={() => {
                setShowSetSection(false);
                setGame(null);
              }} 
              onSave={()=>{
                setShowSetSection(false)
                setShowStatusUpdate('Bet type limit is updated successfully')
                triggerRefresh()
                setTimeout(()=>setShowStatusUpdate(''), 5000)
              }}
              onError={()=>{
                setShowSetSection(false)
                setErrorMsgUpdatingValues('Failed to update bet type limit')
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
      </>
    )
}