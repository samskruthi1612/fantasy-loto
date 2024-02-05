import { ReactComponent as BackArrow } from "../../../resources/back_arrow.svg";
import { useLocation, useNavigate } from "react-router-dom";

import './WinRatioLogs.css'
import { useState, useEffect } from "react";
import { DataTable } from "../../../elements/dataTable/DataTable";
import { IpAddress } from "../../shared/IpAddress/IpAddress";
import { Location } from "../../shared/Location/Location";
import { useFetchGet } from "../../../hooks/useFetchGet";
import { DateTime } from "luxon";
import { convertToUIDate } from "../../../util/dateUtils";
import { CenterFantasyLoader } from "../../../elements/fantasyLotoLoader/FantasyLotoLoader";
import { PageNavigation } from "../../PageNavigation/PageNavigation";
import { FilterBarV2 } from "../../FIlterBarV2/FilterBarV2";
import { capitalizeFirstLetter } from "../../../util/stringUtils";
import { formatToAmount, formatToCurrency, validateCurrencyFormat } from "../../../util/currencyformatter";

const ValuesList = ({values}) => {
  const keyMappings = {
    'pick3': 'P3 ratio',
    'pick4': 'P4 ratio',
    'limit': 'Limit',
    'visible_on_mobile': 'Visible',
    'reset_limit': 'Available limit',
  }
  if(values===undefined || values===null) {
    return <></>
  }
  return (
    <>
      <ul>{
        Object.keys(values).map(key => {
          if(values[key]===null || values[key]===undefined || values[key]==='')
            return <></>
          let formattedValue = values[key]
          if(key === 'pick3' || key === 'pick4') formattedValue = '1:'+Math.floor(formattedValue)
          if(key === 'limit' || key==='reset_limit'){ 
            formattedValue = isNaN(formattedValue)?formattedValue:formatToCurrency(formattedValue)
          }
          return <li>{keyMappings[key]}= {formattedValue}</li>
        }) 
      }</ul>
    </>
  )
}

export const WinRatioLogs = () => {

  const location = useLocation();
  const navigate = useNavigate();
  const {state: {userDetails}} = location
  const [loading, setLoading] = useState(true);

  const [searchValue, setSearchValue] = useState("");
  const [searchColumn, setSearchColumn] = useState("");
  const [betTypeOptionsLoading, betTypeOptions] = useFetchGet(process.env.REACT_APP_WIN_RATIO+'/bet-types', [], userDetails.userName)
  const [betTypeFilterValues, setBetTypeFilterValues] = useState([]);
  const [noLimitFilterValue, setNoLimitFilterValue] = useState('');
  const [visibleOnMobileFilterValue, setVisibleOnMobileFilterValue] = useState('');
  const [limitResetFilterValue, setLimitResetFilterValue] = useState('');
  const [logDateFromFilterValue, setLogDateFromFilterValue] = useState("");
  const [logDateToFilterValue, setLogDateToFilterValue] = useState("");

  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [pageNum, setPageNum] = useState(0);
  const [lastPageNumber, setLastPageNumber] = useState(5);
  const [moreRecordsIndicator, setMoreRecordsIndicator] = useState(true)

  const [logsDetails, setLogsDetails] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');

  const betTypeFilters = {
    type: "multiValue",
    label: "Bet Type",
    currentValues: betTypeFilterValues,
    options: betTypeOptionsLoading?[]:[...new Set(betTypeOptions?.map(betType=> betType.bet_type)??[])],
    onChange: setBetTypeFilterValues,
    clearFilterValue: (value) => {
      setBetTypeFilterValues((vals) => vals.filter((val) => val !== value));
    },
  };

  const noLimitFilters = {
    type: 'singleValue',
    label: 'No limit',
    currentValue: noLimitFilterValue,
    currentLabel: noLimitFilterValue,
    prefixCurrentValue: 'No limit',
    options: ['Before', 'After'].map((option)=>({label:option, value:option})),
    onChange: (value) => setNoLimitFilterValue(value),
    clearFilter: () => setNoLimitFilterValue('')
  }

  const visibleOnMobileFilters = {
    type: 'singleValue',
    label: 'Visible on app',
    currentValue: visibleOnMobileFilterValue,
    currentLabel: visibleOnMobileFilterValue,
    prefixCurrentValue: 'Visible',
    options: ['Before', 'After'].map((option)=>({label:option, value:option})),
    onChange: (value) => setVisibleOnMobileFilterValue(value),
    clearFilter: () => setVisibleOnMobileFilterValue('')
  }

  const limitResetFilters = {
    type: 'singleValue',
    label: 'Limit reset',
    currentValue: limitResetFilterValue,
    currentLabel: limitResetFilterValue,
    prefixCurrentValue: 'Limit reset',
    options: ['Include', 'Exclude'].map(op => ({label:op, value: op})),
    onChange: setLimitResetFilterValue,
    clearFilter: ()=>setLimitResetFilterValue('')
  }

  const logDateFromFilters = {
    type: "date",
    label: "From Date",
    currentValue: logDateFromFilterValue,
    prefixCurrentValue: 'From Date',
    onChange: setLogDateFromFilterValue,
    clearFilter: () => {
      setLogDateFromFilterValue("");
    },
  };

  const logDateToFilters = {
    type: "date",
    label: "To Date",
    currentValue: logDateToFilterValue,
    prefixCurrentValue: 'To Date',
    onChange: setLogDateToFilterValue,
    clearFilter: () => {
      setLogDateToFilterValue("");
    },
  };

  const searchOptions = [
    { label: "User", value: "User" },
    { label: "Bet type", value: "Bet type"},
    { label: "Before", value: "Before" },
    { label: "After", value: "After" },
    { label: "Location", value: "Location" },
  ];

  const fetchLogsData = (scrollId) => {
    setLoading(true)
    setErrorMsg('')
    const ApiQueryParams = {}
    ApiQueryParams['scroll_limit'] = 50
    if(logDateFromFilterValue!==null && logDateFromFilterValue!==undefined && logDateFromFilterValue.length!=0) {
      ApiQueryParams['start_time'] = DateTime.fromJSDate(logDateFromFilterValue.$d).endOf('day').setZone('America/Nassau').startOf('day').toUnixInteger()
    }
    if(logDateToFilterValue!==null && logDateToFilterValue!==undefined && logDateToFilterValue.length!=0) {
      ApiQueryParams['end_time'] = DateTime.fromJSDate(logDateToFilterValue.$d).endOf('day').setZone('America/Nassau').endOf('day').toUnixInteger()
    }
    if(betTypeFilterValues?.length>0) {
      ApiQueryParams['bet_type'] = betTypeFilterValues.join(',')
    }
    if(noLimitFilterValue!==null && noLimitFilterValue!==undefined && noLimitFilterValue!=='') {
      ApiQueryParams['no_limit'] = noLimitFilterValue.toLowerCase()
    }
    if(visibleOnMobileFilterValue!==null && visibleOnMobileFilterValue!==undefined && visibleOnMobileFilterValue!=='') {
      ApiQueryParams['no_limit'] = visibleOnMobileFilterValue.toLowerCase()
    }
    if(limitResetFilterValue!==null && limitResetFilterValue!==undefined && limitResetFilterValue!=='') {
      ApiQueryParams['limit_reset'] = true
    }
    if(searchValue !== undefined && searchValue !== '') {
      ApiQueryParams['search_value'] = searchValue
      if(searchColumn === 'User') {
        ApiQueryParams['search_key'] = 'user'
      } else if(searchColumn === 'Bet type') {
        ApiQueryParams['search_key'] = 'bet_type'
      } else if(searchColumn === 'Before') {
        ApiQueryParams['search_key'] = 'before'
        if(isNaN(searchValue) && validateCurrencyFormat(searchValue)) {
          ApiQueryParams['search_value'] = formatToAmount(searchValue)
        }
      } else if(searchColumn === 'After') {
        ApiQueryParams['search_key'] = 'after'
        if(isNaN(searchValue) && validateCurrencyFormat(searchValue)) {
          ApiQueryParams['search_value'] = formatToAmount(searchValue)
        }
      } else if(searchColumn === 'Location') {
        ApiQueryParams['search_key'] = 'location'
      }
    }
    if(scrollId!==undefined) {
      ApiQueryParams['scroll_id'] = scrollId
    }
    fetch(process.env.REACT_APP_WIN_RATIO + "/bet-types/audit?" + new URLSearchParams(ApiQueryParams), {
      method: "GET",
      headers: {
        "x-username": location.state.userDetails.userName,
        'auth-token': localStorage.getItem('token'),
      },
    })
      .then((resp) => {
        if (resp.status == 200) {
          resp.json().then((data) => {
            setLoading(false)
            if(data===null || data.length===0) {
              setMoreRecordsIndicator(false)
            }
            setLogsDetails(currentData=>
              [...currentData,
              ...data.map((item) => {
                return {
                  timestamp: convertToUIDate(
                    new Date(item.timestamp * 1000).toLocaleString("en-US", {
                      timeZone: "America/Nassau",
                    })
                  ),
                  betType: item.bet_type,
                  beforeValue: item.before,
                  afterValue: item.after,
                  address: item.location,
                  coordinates: item.coordinates,
                  location: item.location,
                  ipAddress: item.ipaddress,
                  user: item.user,
                  id: item.id
                };
              })]
            );
          });
        } else if (resp.status == 400) {
          setLoading(false)
          setErrorMsg('Oops, Couldnt find any records with given inputs. Please check search and filters and try again')
        } else if ([500,502,503].includes(resp.status)) {
          setLoading(false)
          setErrorMsg('Oops, Something went wrong, please try again')
        }
      })
      .catch((error) => {
        setLoading(false)
        setErrorMsg('Oops, Something went wrong, please try again')
        console.log(error)
      });
  };

  const resetToFirstPageWithEmptyData = () => {
    setPageNum(0)
    setMoreRecordsIndicator(true)
    setLogsDetails([])
  }

  const cleanRefresh = () => {
    resetToFirstPageWithEmptyData()
    fetchLogsData()
  }

  useEffect(cleanRefresh, [betTypeFilterValues, noLimitFilterValue, visibleOnMobileFilterValue, limitResetFilterValue, logDateFromFilterValue, logDateToFilterValue]);

  const triggerNextBatch = () => {
    console.log(`calling next batch with scroll id ${logsDetails[logsDetails.length-1].id}`)
    fetchLogsData(logsDetails[logsDetails.length-1].id)
  }

  useEffect(()=>{if(!loading && logsDetails?.length>0 && logsDetails?.length<=(rowsPerPage*(pageNum+2)) && moreRecordsIndicator) {
    triggerNextBatch()
  }}, [rowsPerPage, setRowsPerPage, pageNum, setPageNum, logsDetails?.length, moreRecordsIndicator])

  const winRatioLogsColumns = [
    {
      gridColumns: 2,
      name: "Date and Time",
    },
    {
      gridColumns: 2,
      name: "User",
    },
    {
      gridColumns: 1,
      name: "Bet Type",
    },
    {
      gridColumns: 2,
      name: "Before value",
      isReactElement: true,
    },
    {
      gridColumns: 2,
      name: "After value",
      isReactElement: true,
    },
    {
      gridColumns: 2,
      name: "Location",
      isReactElement: true
    },
    {
        gridColumns: 1,
        name: "IP Address",
        isReactElement: true
    }
  ];

  const mapToRowContent = (data) => data.map(log => [
    ...[log.timestamp, log.user, capitalizeFirstLetter(log.betType)].map(text => ({text})),
    {
      Element: ValuesList,
      props: {values: log.beforeValue}
    },
    {
      Element: ValuesList,
      props: {values: log.afterValue}
    },
    {
        Element: Location,
        props: {coordinates: log.coordinates, locationDetails: log.location}
    },
    {
        Element: IpAddress,
        props: {ipAddress: log.ipAddress}
    }
  ])

    return <>
        {loading && <CenterFantasyLoader />}
        <div className="winRatioLogsPage">
            <div className="winRatioLogsHeader">
              <div className="winRatioLogsTitle">
                  <div
                  className="logsBackButton clickable"
                  onClick={() => navigate("/home/winratio", location)}
                  >
                  <BackArrow />
                  </div>
                  Bet type & win-ratio logs
              </div>
            </div>

            <FilterBarV2
              onSearchValueChange={setSearchValue}
              filters={[betTypeFilters, noLimitFilters, visibleOnMobileFilters, limitResetFilters, logDateFromFilters, logDateToFilters]}
              currentSearchValue={searchValue}
              sortedLabel="None"
              searchOptions={searchOptions}
              searchColumn={searchColumn}
              setSearchColumn={setSearchColumn}
              applySearch={cleanRefresh}
            />

            <PageNavigation
              dataLoading={loading}
              rowsPerPage={rowsPerPage} 
              setRowsPerPage={setRowsPerPage} 
              pageNum={pageNum} 
              setPageNum={setPageNum} 
              currentDataLength={logsDetails?.length} 
              moreRecordsIndicator={moreRecordsIndicator}
              triggerNextBatch={triggerNextBatch} 
            />

            <DataTable
                spacing={2}
                columnConfig={winRatioLogsColumns}
                rowContent={mapToRowContent(logsDetails?.slice(rowsPerPage*pageNum, rowsPerPage*(pageNum+1)))}
            />

            {(!loading && (logsDetails?.length==0 || errorMsg!=='')) && <div className="tableErrorMsg">
              {errorMsg!==''?errorMsg:'No records found with given criteria'}
            </div>}

            <PageNavigation 
              dataLoading={loading}
              rowsPerPage={rowsPerPage} 
              setRowsPerPage={setRowsPerPage} 
              pageNum={pageNum} 
              setPageNum={setPageNum} 
              currentDataLength={logsDetails?.length} 
              moreRecordsIndicator={moreRecordsIndicator}
              triggerNextBatch={triggerNextBatch} 
            />

        </div>
    </>
}