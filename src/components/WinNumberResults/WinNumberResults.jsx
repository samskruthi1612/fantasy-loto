import React, { useEffect, useState } from "react";

import "./WinNumberResults.css";

import { ReactComponent as BackArrow } from "../../resources/back_arrow.svg";
import { ReactComponent as RefreshIcon } from "../../resources/refresh-icon.svg";
import { ReactComponent as NextPage } from "../../resources/next_page.svg";
import { ReactComponent as PreviousPage } from "../../resources/previous_page.svg";
import { ReactComponent as BackupIcon } from "../../resources/backup.svg";

import { useLocation, useNavigate } from "react-router-dom";
import { DropdownV2 } from "../../elements/dropdownV2/DropDownV2";
import { DataTable } from "../../elements/dataTable/DataTable";
import { FilterBar } from "../FilterBar/FilterBar";
import { FilterBarV2 } from "../FIlterBarV2/FilterBarV2";
import { ReactComponent as AutoRefreshIcon } from "../../resources/auto_refresh.svg";
import { ReactComponent as ExxportIcon } from "../../resources/export.svg";
import { Drawer } from "@mui/material";
import ExportSection from "./ExportSection/ExportSection";
import { convertEpochsToUIDate, convertToUIDate } from "../../util/dateUtils";
import { CenterFantasyLoader } from "../../elements/fantasyLotoLoader/FantasyLotoLoader";
import { useGameStateGet } from '../../hooks/useGameStateGet'
import { useGameSlotGet } from '../../hooks/useGameSlotGet'
import { PageNavigation } from "../PageNavigation/PageNavigation";
import { ApiTriggerButton } from "../shared/ApiTriggerButton/ApiTriggerButton";
import { DateTime } from "luxon";
import { apiLoadTime } from "../../api/apiLoadTime";

const Status = ({ status }) => {
  return (
    <div className="gameStatusParent">
      <div className={`gameInactiveText`}>{status}</div>
    </div>
  );
};

const ResultType = ({ resType }) => {
  return (
    <div
      className={`resultTypeParent ${
        resType === "Manual" ? "manualResType" : ""
      }`}
    >
      {resType}
    </div>
  );
};

const WinNumberResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { state: {userDetails}} = location;
  
  const [sortedLabel, setSortedLabel] = useState("None");
  const [sortValue, setSortValue] = useState("None");
  const [sortOrder, setSortOrder] = useState("None");
  const [searchValue, setSearchValue] = useState("");
  const [searchColumn, setSearchColumn] = useState("");

  const [slotOptionsLoading, slotFilterOptions] = useGameSlotGet(userDetails.userName)
  const [slotFilterValues, setSlotFilterValues] = useState([]);
  const [gametypeFilterValues, setGameTypeFilterValues] = useState([]);
  const [stateFilterValues, setStateFilterValues] = useState([]);
  const [stateFilterOptionsLoading, stateFilterOptions] = useGameStateGet(userDetails.userName)
  const [resultTypeFilterValue, setResultTypeFilterValue] = useState('');
  const [winNumberFilter, setWinNumberFilter] = useState("");
  const [winNumberFilterLabel, setWinNumberFilterLabel] = useState("");
  const [closingDateFromFilterValue, setClosingDateFromFilterValue] = useState("");
  const [closingDateToFilterValue, setClosingDateToFilterValue] = useState("");

  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [pageNum, setPageNum] = useState(0);
  const [lastPageNumber, setLastPageNumber] = useState();
  const [moreRecordsIndicator, setMoreRecordsIndicator] = useState(true);

  const [showExportSection, setShowExportSection] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const [loading, setLoading] = useState(false);
  const [apiUpdateTriggerLoading, setApiUdpateTriggerLoading] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState('')
  const [reload, setReload] = useState(false);
  const [refreshRunning, setRefreshRunning] = useState(false)
  const [gameDetails, setGameDetails] = useState([]);
  const [errorMsg, setErrorMsg] = useState('')

  const resetToFirstPageWithEmptyData = () => {
    setPageNum(0)
    setMoreRecordsIndicator(true)
    setGameDetails([])
  }

  const stateFilters = {
    type: "multiValue",
    label: "State",
    currentValues: stateFilterValues,
    options: stateFilterOptions,
    onChange: (values) => {
      setStateFilterValues(values)
    },
    clearFilterValue: (value) => {
      setStateFilterValues((vals) => vals.filter((val) => val !== value));
    },
  };

  const resultTypeFilters = {
    type: "singleValue",
    label: "Result Type",
    currentValue: resultTypeFilterValue,
    currentLabel: resultTypeFilterValue,
    options: ['Default','Manual'].map(op => ({label:op, value:op})),
    onChange: (value) => {
      setResultTypeFilterValue(value)
    },
    clearFilter: () => {
      setResultTypeFilterValue('');
    },
  };

  const winNumberFilters = {
    type: "singleValue",
    label: "Win Number",
    currentValue: winNumberFilter,
    currentLabel: winNumberFilterLabel,
    options: ["Awaiting results"].map(op => ({label:op, value:op})),
    onChange: () => {
      setWinNumberFilter("Awaiting results")
      setWinNumberFilterLabel("Awaiting results")
    },
    clearFilter: () => {
      setWinNumberFilter("");
      setWinNumberFilterLabel("");
    },
  };

  const closingDateFromFilters = {
    type: "date",
    label: "Start Closing date",
    currentValue: closingDateFromFilterValue,
    onChange: setClosingDateFromFilterValue,
    clearFilter: () => {
      setClosingDateFromFilterValue('');
    },
  };

  const closingDateToFilters = {
    type: "date",
    label: "End Closing date",
    currentValue: closingDateToFilterValue,
    onChange: setClosingDateToFilterValue,
    clearFilter: () => {
      setClosingDateToFilterValue('');
    },
  };

  const slotFilters = {
    type: "multiValue",
    label: "Slot",
    currentValues: slotFilterValues,
    options: slotFilterOptions,
    onChange: setSlotFilterValues,
    clearFilterValue: (value) => {
      setSlotFilterValues((vals) => vals.filter((val) => val !== value));
    },
  };

  const gameTypeFilters = {
    type: "multiValue",
    label: "Game Type",
    currentValues: gametypeFilterValues,
    options: ['Pick 3', 'Pick 4'],
    onChange: setGameTypeFilterValues,
    clearFilterValue: (value) => {
      setGameTypeFilterValues((vals) => vals.filter((val) => val !== value));
    },
  };

  const sortOptions = [
    {
      label: "Closing Time (Newest first)",
      onClick: () => {
        setSortValue("closingTIme");
        setSortOrder("dsc");
        setSortedLabel("Closing Time (Newest first)");
      },
    },
    {
      label: "Closing Time (Oldest first)",
      onClick: () => {
        setSortValue("closingTIme");
        setSortOrder("asc");
        setSortedLabel("Closing Time (Oldest first)");
      },
    },
  ];

  const clearSort = () => {
    setSortValue("None");
    setSortedLabel("None");
  };

  const winNumberResultsColumns = [
    {
      gridColumns: 1,
      name: "State ID",
    },
    {
      gridColumns: 2,
      name: "State name",
    },
    {
      gridColumns: 1,
      name: "Slot",
    },
    {
      gridColumns: 1,
      name: "Game type",
    },
    {
      gridColumns: 3,
      name: "Actual Closing Time",
    },
    {
      gridColumns: 2,
      name: "Win number",
    },
    {
      gridColumns: 1,
      name: "Result type",
      isReactElement: true,
    },
    {
      gridColumns: 1,
      name: "Status",
      isReactElement: true,
    },
  ];

  const searchOptions = [
    { label: "State name", value: "State name" },
    { label: "Win number", value: "Win number" },
  ];

  const mapToRowContent = (data) => {
    return data.map((row, index) => [
      ...[
        row.stateId,
        row.stateName,
        row.slot,
        row.gameType,
        row.closingTime,
        row.winNumber,
      ].map((text) => ({ text })),
      {
        Element: ResultType,
        props: { resType: row.resultType },
      },
      {
        Element: Status,
        props: { status: row.status },
      },
    ]);
  };

  const getApiQueryParams = () => {
    const ApiQueryParams = {}
    if(stateFilterValues?.length>0) {
      ApiQueryParams['state'] = stateFilterValues.join(',')
    }
    if(slotFilterValues?.length>0) {
      ApiQueryParams['game_slot'] = slotFilterValues.join(',')
    }
    if(gametypeFilterValues?.length>0) {
      ApiQueryParams['game_type'] = gametypeFilterValues.map((type) => {
        if(type=='Pick 3') {
          return 'pick3'
        }
        if(type=='Pick 4') {
          return 'pick4'
        }
      }).join(',')
    }
    if(resultTypeFilterValue !== undefined && resultTypeFilterValue !== '') {
      ApiQueryParams['manual'] = resultTypeFilterValue==='Default'?'0':'1'
    }
    if(winNumberFilter === 'Awaiting results') {
      ApiQueryParams['win_number'] = ''
    }
    if(closingDateFromFilterValue!=='' && closingDateFromFilterValue!==null && closingDateFromFilterValue!==undefined) {
      ApiQueryParams['start_time'] = DateTime.fromJSDate(closingDateFromFilterValue.$d).endOf('day').setZone('America/Nassau').startOf('day').toUnixInteger()
    }
    if(closingDateToFilterValue!=='' && closingDateToFilterValue!==null && closingDateToFilterValue!==undefined) {
      ApiQueryParams['end_time'] = DateTime.fromJSDate(closingDateToFilterValue.$d).endOf('day').setZone('America/Nassau').endOf('day').toUnixInteger()
    }
    if(searchValue !== undefined && searchValue !== '') {
      ApiQueryParams['search_value'] = searchValue
      if(searchColumn === 'State name') {
        ApiQueryParams['search_key'] = 'state_name'
      } else if(searchColumn === 'Win number') {
        ApiQueryParams['search_key'] = 'winnumber'
        ApiQueryParams['search_value'] = searchValue?.replace(/-/g, '').split('').join('-')
      }
    }
    return ApiQueryParams
  }

  const mapToInternalObj = (item) => {
    return {
      ...item,
      stateId: item.game_id,
      stateName: item.state_name,
      slot: item.slot,
      gameType: `Pick ${item.game_type.substring(4)}`,
      closingTime: convertToUIDate(
        new Date(item.close_time * 1000).toLocaleString("en-US", {
          timeZone: "America/Nassau",
        })
      ),
      winNumber:
        item.win_number === ""
          ? "Awaiting results"
          : item.win_number,
      resultType: item.is_manual ? "Manual" : "Default",
      status: "Closed",
    };
  }

  const fetchLastUpdateTime = () => {
    apiLoadTime(setLastUpdateTime)
  }  

  const fetchResultsData = (scrollId) => {
    console.log("Using scrollId: ", scrollId)
    setLoading(true);
    setErrorMsg('')
    const ApiQueryParams = getApiQueryParams()
    ApiQueryParams['scroll_limit'] = 50
    if(scrollId!==undefined) {
      ApiQueryParams['scroll_id'] = scrollId
    }
    fetch(process.env.REACT_APP_WIN_NUMBERS_HOST + "/games/winnumbers?" + new URLSearchParams(ApiQueryParams), {
      method: "GET",
      headers: {
        "x-username": location.state.userDetails.userName,
        'auth-token': localStorage.getItem('token'),
      },
    })
      .then((resp) => {
        if (resp.status == 200) {
          resp.json().then((data) => {
            if(data===null || data.length===0) {
              setMoreRecordsIndicator(false)
            }
            setGameDetails((currentData) =>
            [
              ...(currentData??[]),
            ...data.map(mapToInternalObj)
            ]
            );
          });
          setLoading(false);
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

  const triggerRefresh = () => {
    fetchResultsData()
    fetchLastUpdateTime()
  }

  const cleanRefresh = () => {
    resetToFirstPageWithEmptyData()
    triggerRefresh()
    fetchLastUpdateTime()
  }

  const refreshFunc = async () => {
    if(!refreshRunning) {
      try{  
        let resultsData = [];
        let newDataLength = 0;
        const ApiQueryParams = getApiQueryParams()
        setRefreshRunning(true)
        ApiQueryParams['scroll_limit'] = 100
        do {
          if(resultsData.length>0) {
            console.log('results data scroll',resultsData[resultsData?.length-1].id)
            ApiQueryParams['scroll_id'] = resultsData[resultsData?.length-1].id
          }
          const fetchResp = await fetch(process.env.REACT_APP_WIN_NUMBERS_HOST + "/games/winnumbers?" + new URLSearchParams(ApiQueryParams), {
            method: "GET",
            headers: {
              "x-username": location.state.userDetails.userName,
              'auth-token': localStorage.getItem('token'),
            },
          })
          const apiResults = await fetchResp.json()
          console.log('ApiResults ', apiResults)
          newDataLength = apiResults?.length
          if(newDataLength>0) {
            resultsData = [...resultsData, ...apiResults.map(mapToInternalObj)]
            console.log("new results data, ", resultsData)
          }
        } while(newDataLength>0 && (rowsPerPage*(pageNum+1)>resultsData.length));
        console.log("Setting new resultsData", resultsData);
        setGameDetails(resultsData);
      } catch (err) {
        console.log('Error while refreshing', err)
      } finally {
        setRefreshRunning(false)
      }
    }
  }

  useEffect(cleanRefresh, [stateFilterValues, gametypeFilterValues, slotFilterValues, resultTypeFilterValue, winNumberFilter, closingDateFromFilterValue, closingDateToFilterValue]);

  const triggerNextBatch = () => {
    fetchResultsData(gameDetails[gameDetails.length-1].id)
  }

  useEffect(()=>{if(!loading && gameDetails?.length>0 && gameDetails?.length<=(rowsPerPage*(pageNum+2)) && moreRecordsIndicator) {
    triggerNextBatch()
  }}, [rowsPerPage, setRowsPerPage, pageNum, setPageNum, moreRecordsIndicator])

  useEffect(() => {
    let autoRefreshfunc
    if (autoRefresh) {
      refreshFunc()
      autoRefreshfunc = setInterval(() => {
        refreshFunc();
      }, 1000 * 15);
      return () => clearInterval(autoRefreshfunc);
    } else {
      clearInterval(autoRefreshfunc);
    }
  }, [autoRefresh]);  

  return (
    <div className="winNumbersPage">
      {(loading || refreshRunning || apiUpdateTriggerLoading) && <CenterFantasyLoader />}
      <div className="winNumbersHeader">
        <div className="winNumbersLeft">
          <div
            className="winNumbersBackButton clickable"
            onClick={() => navigate("/home/reports", location)}
          >
            <BackArrow />
          </div>
          Win Number Results
        </div>
        <div className="winNumbersRight">
          <div className="lastUpdated">
            <div className="lastUpdatedTimeText">Last data received on</div>
            <div className="lastUpdatedTimeValue">{lastUpdateTime}</div>
          </div>
          <ApiTriggerButton userName={userDetails.userName} setLoading={setApiUdpateTriggerLoading} triggerRefresh={cleanRefresh} />
          <div
            className={`autoRefreshBtn clickable ${
              autoRefresh ? "autoRefreshActive" : ""
            }`}
            onClick={() => setAutoRefresh((prev) => !prev)}
          >
            <AutoRefreshIcon />
            <p className="autoRefreshText">Auto refresh</p>
          </div>
          <div
            className="exportBtn clickable"
            onClick={() => setShowExportSection(true)}
          >
            <ExxportIcon />
            <p className="exportText">Export</p>
          </div>
        </div>
      </div>

      <Drawer anchor="right" open={showExportSection} onClose={()=>setShowExportSection(false)}>
        <ExportSection
          onClose={() => {
            setShowExportSection(false);
          }}
        />
      </Drawer>

      <FilterBarV2
        onSearchValueChange={setSearchValue}
        sortOptions={[]}
        sortedLabel={"None"}
        clearSort={clearSort}
        filters={[
          stateFilters,
          slotFilters,
          gameTypeFilters,
          winNumberFilters,
          resultTypeFilters,
          closingDateFromFilters,
          closingDateToFilters
        ]}
        currentSearchValue={searchValue}
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
          currentDataLength={gameDetails?.length} 
          moreRecordsIndicator={moreRecordsIndicator}
          triggerNextBatch={triggerNextBatch} />

      <DataTable
        spacing={2}
        columnConfig={winNumberResultsColumns}
        rowContent={mapToRowContent(gameDetails?.slice(rowsPerPage*pageNum, rowsPerPage*(pageNum+1)))}
      />

      {(!loading && (gameDetails?.length==0 || errorMsg!=='')) && <div className="tableErrorMsg">
          {errorMsg!==''?errorMsg:'No records found with given criteria'}
      </div>}

      <PageNavigation 
          dataLoading={loading}
          rowsPerPage={rowsPerPage} 
          setRowsPerPage={setRowsPerPage} 
          pageNum={pageNum} 
          setPageNum={setPageNum} 
          currentDataLength={gameDetails?.length} 
          moreRecordsIndicator={moreRecordsIndicator}
          triggerNextBatch={triggerNextBatch} />
    </div>
  );
};

export default WinNumberResults;
