import { DateTime } from "luxon"
import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { DataTable } from "../../../elements/dataTable/DataTable"
import { CenterFantasyLoader } from "../../../elements/fantasyLotoLoader/FantasyLotoLoader"
import { formatToAmount, formatToCurrency, validateCurrencyFormat } from "../../../util/currencyformatter"
import { convertToUIDate } from "../../../util/dateUtils"
import { capitalizeFirstLetter } from "../../../util/stringUtils"
import { FilterBarV2 } from "../../FIlterBarV2/FilterBarV2"
import { PageNavigation } from "../../PageNavigation/PageNavigation"
import { BackButton } from "../../shared/BackButton/BackButton"
import { IpAddress } from "../../shared/IpAddress/IpAddress"
import { Location } from "../../shared/Location/Location"

export const BetNumberLimitLogs = () => {
    const navigate = useNavigate()
    const location = useLocation()

	const mockLogs = [{
		timestamp: 1699285510,
		betType: 'pick3',
		user: 'Kevin Dean',
		beforeValue: 5500,
		afterValue: 6000,
		ipAddress: '255.166.12.5',
		coordinates: '10.3802386, 123.9734747',
		location: 'Hyderabad, Telangana',
	},{
		timestamp: 1699285690,
		betType: 'pick4',
		user: 'Kevin SuperA',
		beforeValue: 7200,
		afterValue: 4600,
		ipAddress: '255.166.12.5',
		coordinates: '10.3802386, 123.9734747',
		location: 'Hyderabad, Telangana',
	}]

	const {state: {userDetails}} = location
  const [loading, setLoading] = useState(true);

  const [searchValue, setSearchValue] = useState("");
  const [searchColumn, setSearchColumn] = useState("");
  const [beforeValueRange, setBeforeValueRange] = useState([]);
  const [afterValueRange, setAfterValueRange] = useState([]);
  const [logDateFromFilterValue, setLogDateFromFilterValue] = useState("");
  const [logDateToFilterValue, setLogDateToFilterValue] = useState("");

  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [pageNum, setPageNum] = useState(0);
  const [moreRecordsIndicator, setMoreRecordsIndicator] = useState(true)

  const [logsDetails, setLogsDetails] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');

  const beforeValueRangeFilterConfig = {
    type:'numRange',
    label:'Before Value',
    variant: 'currency',
    currentValues:beforeValueRange,
    onChange:setBeforeValueRange,
    clearFilterValue:()=>setBeforeValueRange([])
  }

  const afterValueRangeFilterConfig = {
    type:'numRange',
    label:'After Value',
    variant: 'currency',
    currentValues:afterValueRange,
    onChange:setAfterValueRange,
    clearFilterValue:()=>setAfterValueRange([])
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
    { label: "Game type", value: "Game type"},
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
    if(beforeValueRange?.length>0) {
      ApiQueryParams['before_value'] = beforeValueRange?.join(',')
    }
    if(afterValueRange?.length>0) {
      ApiQueryParams['after_value'] = afterValueRange?.join(',')
    }
    if(searchValue !== undefined && searchValue !== '') {
      console.log('searching value present')
      ApiQueryParams['search_value'] = searchValue
      if(searchColumn === 'User') {
        ApiQueryParams['search_key'] = 'user'
      } else if(searchColumn === 'Game type') {
        ApiQueryParams['search_key'] = 'game_type'
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
    fetch(process.env.REACT_APP_BET_NUMBER_LIMIT_AUDIT + "?" + new URLSearchParams(ApiQueryParams), {
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
                    new Date(item.audit_time * 1000).toLocaleString("en-US", {
                      timeZone: "America/Nassau",
                    })
                  ),
                  gameType: item.game_type,
                  beforeValue: item.before_value,
                  afterValue: item.after_value,
                  address: item.location,
                  coordinates: item.geo_coordinates,
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

  useEffect(cleanRefresh, [beforeValueRange, afterValueRange, logDateFromFilterValue, logDateToFilterValue]);

  const triggerNextBatch = () => {
    console.log(`calling next batch with scroll id ${logsDetails[logsDetails.length-1].id}`)
    fetchLogsData(logsDetails[logsDetails.length-1].id)
  }

  useEffect(()=>{if(!loading && logsDetails?.length>0 && logsDetails?.length<=(rowsPerPage*(pageNum+2)) && moreRecordsIndicator) {
    triggerNextBatch()
  }}, [rowsPerPage, setRowsPerPage, pageNum, setPageNum, logsDetails?.length, moreRecordsIndicator])

	const betNumberLimitLogsColumns = [
		{
		  gridColumns: 5,
		  name: "Date and Time",
		},
		{
		  gridColumns: 3,
		  name: "User",
		},
		{
		  gridColumns: 3,
		  name: "Game Type",
		},
		{
		  gridColumns: 3,
		  name: "Before value",
		},
		{
		  gridColumns: 3,
		  name: "After value",
		},
		{
		  gridColumns: 4,
		  name: "Location",
		  isReactElement: true
		},
		{
			gridColumns: 3,
			name: "IP Address",
			isReactElement: true
		}
	  ];
	
	  const mapToRowContent = (data) => data.map(log => [
		...[log.timestamp, log.user, capitalizeFirstLetter(log.gameType), formatToCurrency(log.beforeValue), formatToCurrency(log.afterValue)].map(text => ({text})),
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
      <div className="pageDisplay">
        <div className="pageHeader">
          <div className="pageTitleLeft">
            <BackButton onClick={()=>navigate('/home/betNumberLimit', location)} />
            <div className="pageTitle">Bet number limit logs</div>
          </div>
        </div>
        <div className="pageDisplay">
          <FilterBarV2
            onSearchValueChange={setSearchValue}
            filters={[beforeValueRangeFilterConfig, afterValueRangeFilterConfig, logDateFromFilters, logDateToFilters]}
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
            totalColumns={24} 
            columnConfig={betNumberLimitLogsColumns} 
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
      </div>
    </>
}