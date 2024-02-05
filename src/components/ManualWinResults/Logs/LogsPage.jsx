import React, { useEffect, useState } from "react";
import "./LogsPage.css";
import { ReactComponent as BackArrow } from "../../../resources/back_arrow.svg";
import { useLocation, useNavigate } from "react-router-dom";
import { DataTable } from "../../../elements/dataTable/DataTable";

import { ReactComponent as LocationPin } from "../../../resources/location_on.svg";
import { FilterBarV2 } from "../../FIlterBarV2/FilterBarV2";
import { convertToUIDate } from "../../../util/dateUtils";
import { CenterFantasyLoader } from "../../../elements/fantasyLotoLoader/FantasyLotoLoader";
import { PageNavigation } from "../../PageNavigation/PageNavigation";
import { useFetchGet } from "../../../hooks/useFetchGet";
import { DateTime } from "luxon";

const LocationField = ({ latt, long, address }) => {
  return (
    <div className="location-container">
      <p className="address-text">{address}</p>
      <a href={`https://maps.google.com/?q=${latt},${long}`} target="_blank" rel="noreferrer">
        <LocationPin />
      </a>
    </div>
  );
};

const IPAddressField = ({ ipaddress }) => {
  const [showIP, setShowIP] = useState(false);

  return (
    <div className="ipaddress-container">
      {!showIP && (
        <p className="ipaddressView" onClick={() => setShowIP(true)}>
          View
        </p>
      )}
      {showIP && <p className="ipaddresstext">{ipaddress}</p>}
    </div>
  );
};

const LogsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {state: {userDetails}} = location
  const [loading, setLoading] = useState(true);

  const [searchValue, setSearchValue] = useState("");
  const [searchColumn, setSearchColumn] = useState("");

  const [gameFilterOptionsLoading, gameFilterOptions] = useFetchGet(process.env.REACT_APP_WIN_NUMBERS_HOST+'/filter-values/game_ids', {}, userDetails.userName)
  const [gameDetailsFilterValues, setGameDetailsFilterValues] = useState([]);
  const [logDateFromFilterValue, setLogDateFromFilterValue] = useState("");
  const [logDateToFilterValue, setLogDateToFilterValue] = useState("");

  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [pageNum, setPageNum] = useState(0);
  const [lastPageNumber, setLastPageNumber] = useState(5);
  const [moreRecordsIndicator, setMoreRecordsIndicator] = useState(true)


  const [logsDetails, setLogsDetails] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');

  const gameDetailsFilters = {
    type: "multiValue",
    label: "Game Details",
    currentValues: gameDetailsFilterValues,
    options: Object.values(gameFilterOptions),
    onChange: setGameDetailsFilterValues,
    clearFilterValue: (value) => {
      setGameDetailsFilterValues((vals) => vals.filter((val) => val !== value));
    },
  };

  const logDateFromFilters = {
    type: "date",
    label: "From Date",
    currentValue: logDateFromFilterValue,
    onChange: setLogDateFromFilterValue,
    clearFilter: () => {
      setLogDateFromFilterValue("");
    },
  };

  const logDateToFilters = {
    type: "date",
    label: "To Date",
    currentValue: logDateToFilterValue,
    onChange: setLogDateToFilterValue,
    clearFilter: () => {
      setLogDateToFilterValue("");
    },
  };

  const manualLogsColumns = [
    {
      gridColumns: 2,
      name: "Date & Time",
    },
    {
      gridColumns: 1,
      name: "User",
    },
    {
      gridColumns: 2,
      name: "Game details",
    },
    {
      gridColumns: 2,
      name: "Before value",
    },
    {
      gridColumns: 2,
      name: "After value",
    },
    {
      gridColumns: 2,
      name: "Location",
      isReactElement: true,
    },
    {
      gridColumns: 1,
      name: "IP Address",
      isReactElement: true,
    },
  ];

  const searchOptions = [
    { label: "Game", value: "Game" },
    { label: "Before", value: "Before" },
    { label: "After", value: "After" },
    { label: "Location", value: "Location" },
  ];

  const mapToRowContent = (data) => {
    console.log("Date at logs row content", data)
    return data.map((row, index) => [
      ...[
        row.dateTime,
        row.user,
        row.gameDetails,
        (row.beforeValue===''?"Awaiting results":row.beforeValue) + (row.is_manual_before?" (Manual)":" (Default)"),
        row.afterValue + (row.is_manual_after?" (Manual)":" (Default)"),
      ].map((text) => ({ text })),
      {
        Element: LocationField,
        props: {
          address: row.address,
          latt: row.lattitude,
          long: row.longitude,
        },
      },
      {
        Element: IPAddressField,
        props: { ipaddress: row.ipaddress },
      },
    ]);
  };

  const fetchLogsData = (scrollId) => {
    setLoading(true)
    setErrorMsg('')
    const ApiQueryParams = {}
    ApiQueryParams['audit_type'] = 'winnumber'
    ApiQueryParams['scroll_limit'] = 50
    if(logDateFromFilterValue!==null && logDateFromFilterValue!==undefined && logDateFromFilterValue.length!=0) {
      ApiQueryParams['start_time'] = DateTime.fromJSDate(logDateFromFilterValue.$d).endOf('day').setZone('America/Nassau').startOf('day').toUnixInteger()
    }
    if(logDateToFilterValue!==null && logDateToFilterValue!==undefined && logDateToFilterValue.length!=0) {
      ApiQueryParams['end_time'] = DateTime.fromJSDate(logDateToFilterValue.$d).endOf('day').setZone('America/Nassau').endOf('day').toUnixInteger()
    }
    if(gameDetailsFilterValues?.length>0) {
      ApiQueryParams['game'] = gameDetailsFilterValues?.join(',')
    }
    if(searchValue !== undefined && searchValue !== '') {
      ApiQueryParams['search_value'] = searchValue
      if(searchColumn === 'Game') {
        ApiQueryParams['search_key'] = 'game'
      } else if(searchColumn === 'Before') {
        ApiQueryParams['search_key'] = 'winnumber_before'
        ApiQueryParams['search_value'] = searchValue?.replace(/-/g, '').split('').join('-')
      } else if(searchColumn === 'After') {
        ApiQueryParams['search_key'] = 'winnumber_after'
        ApiQueryParams['search_value'] = searchValue?.replace(/-/g, '').split('').join('-')
      } else if(searchColumn === 'Location') {
        ApiQueryParams['search_key'] = 'location'
      }
    }
    if(scrollId!==undefined) {
      ApiQueryParams['scroll_id'] = scrollId
    }
    fetch(process.env.REACT_APP_WIN_NUMBERS_HOST + "/games/audit?" + new URLSearchParams(ApiQueryParams), {
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
                  ...item,
                  dateTime: convertToUIDate(
                    new Date(item.audit_time * 1000).toLocaleString("en-US", {
                      timeZone: "America/Nassau",
                    })
                  ),
                  gameDetails: item.game_name,
                  beforeValue: item.before_value,
                  afterValue: item.after_value,
                  address: item.location,
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

  useEffect(cleanRefresh, [logDateFromFilterValue, logDateToFilterValue, gameDetailsFilterValues]);

  const triggerNextBatch = () => {
    console.log(`calling next batch with scroll id ${logsDetails[logsDetails.length-1].id}`)
    fetchLogsData(logsDetails[logsDetails.length-1].id)
  }

  useEffect(()=>{if(!loading && logsDetails?.length>0 && logsDetails?.length<=(rowsPerPage*(pageNum+2)) && moreRecordsIndicator) {
    triggerNextBatch()
  }}, [rowsPerPage, setRowsPerPage, pageNum, setPageNum, logsDetails?.length, moreRecordsIndicator])
  

  return (
    <>
      {loading && <CenterFantasyLoader />}
      <div className="manualLogsPage">
        <div className="manualLogsHeader">
          <div className="manualLogsTitle">
            <div
              className="logsBackButton clickable"
              onClick={() => navigate("/home/manualwinresults", location)}
            >
              <BackArrow />
            </div>
            Manual win results Logs
          </div>
        </div>

        <FilterBarV2
          onSearchValueChange={setSearchValue}
          filters={[gameDetailsFilters, logDateFromFilters, logDateToFilters]}
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
          triggerNextBatch={triggerNextBatch} />

        <DataTable
          spacing={2}
          columnConfig={manualLogsColumns}
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
          triggerNextBatch={triggerNextBatch} />
      </div>
    </>
  );
};

export default LogsPage;
