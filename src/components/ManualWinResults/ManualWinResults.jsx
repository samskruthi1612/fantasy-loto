import React, { useEffect, useState } from "react";
import { ReactComponent as RefreshIcon } from "../../resources/refresh-icon.svg";
import { ReactComponent as LogsIcon } from "../../resources/bookmarklogs.svg";
import { ReactComponent as NextPage } from "../../resources/next_page.svg";
import { ReactComponent as PreviousPage } from "../../resources/previous_page.svg";
import { ReactComponent as BackupIcon } from "../../resources/backup.svg";
import "./ManualWinResults.css";
import { DataTable } from "../../elements/dataTable/DataTable";
import { DropdownV2 } from "../../elements/dropdownV2/DropDownV2";
import { Drawer } from "@material-ui/core";
import SetNumberSection from "./SetNumberSection";
import { PrimaryButton } from "../../elements/button/Button";
import { useLocation, useNavigate } from "react-router-dom";
import { FilterBarV2 } from "../FIlterBarV2/FilterBarV2";
import { convertEpochsToUIDate, convertToUIDate } from "../../util/dateUtils";
import { Alert } from "../../elements/alert/Alert";
import { CenterFantasyLoader } from "../../elements/fantasyLotoLoader/FantasyLotoLoader";
import { useGameStateGet } from "../../hooks/useGameStateGet";
import { useGameSlotGet } from '../../hooks/useGameSlotGet';

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

const WinNumber = ({ winNumber, resultType, handleClick }) => {
  return (
    <div className="winNumberContainer">
      <p className="resultsText">{winNumber}</p>
      {resultType === "Default" ? (
        <PrimaryButton
          label="Set"
          onClick={() => handleClick()}
          style={{ height: "26px", "font-size": "12px", width: "75px" }}
          type="primary"
        />
      ) : (
        <PrimaryButton
          label="Edit"
          onClick={() => handleClick()}
          style={{
            height: "26px",
            "font-size": "12px",
            width: "75px",
            background: "transparent",
            color: "#007AFF",
            "border-color": "#007AFF",
          }}
          type="primary"
        />
      )}
    </div>
  );
};

const PageNavigation = ({dataLoading, rowsPerPage, setRowsPerPage, pageNum, setPageNum, currentDataLength, moreRecordsIndicator, triggerNextBatch}) => {
  return (
    <div className="manualWinPagesRow">
          <div>Rows per page</div>
          <DropdownV2
            style={{ width: "56px", height: "32px", padding: "8px" }}
            label=""
            currentLabel={rowsPerPage}
            options={[
              { label: 10, value: 10 },
              { label: 15, value: 15 },
              { label: 20, value: 20 },
            ]}
            onChange={(val) => {
              setRowsPerPage(val);
            }}
          />
          {pageNum > 0 && (
            <>
              <div
                className="pageNavigationButton clickable"
                onClick={() => setPageNum((page) => page - 1)}
              >
                <PreviousPage />
              </div>
              <div style={{ marginTop: "auto" }}>...</div>
            </>
          )}
          <div
            className="pageNavigationButton clickable"
            onClick={() => setPageNum(pageNum)}
          >
            {pageNum + 1}
          </div>
          {((rowsPerPage*(pageNum+1)<currentDataLength) || moreRecordsIndicator) && (
            <>
              <div style={{ marginTop: "auto" }}>...</div>
              <div
                className="pageNavigationButton clickable"
                onClick={() => {
                  setPageNum((page) => page + 1)
                }}
              >
                <NextPage />
              </div>
            </>
          )}
        </div>
  )
}

const ManualWinResults = () => {
  const location = useLocation();
  const { state: {userDetails}} = location;
  const navigate = useNavigate();

  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [pageNum, setPageNum] = useState(0);
  const [moreRecordsIndicator, setMoreRecordsIndicator] = useState(true);

  const [showSetSection, setShowSetSection] = useState(false);
  const [game, setGame] = useState(null);

  const [sortedLabel, setSortedLabel] = useState("None");
  const [sortValue, setSortValue] = useState("None");
  const [sortOrder, setSortOrder] = useState("None");
  const [searchValue, setSearchValue] = useState("");
  const [searchColumn, setSearchColumn] = useState("");

  const [stateFilterValues, setStateFilterValues] = useState([]);
  const [stateFilterOptionsLoading, stateFilterOptions] = useGameStateGet(userDetails.userName)
  const [slotFilterValues, setSlotFilterValues] = useState([]);
  const [slotFilterOptionsLoading, slotFilterOptions] = useGameSlotGet(userDetails.userName)
  const [gameTypeFilterValues, setGameTypeFilterValues] = useState([]);
  const [resultTypeFilterValue, setResultTypeFilterValue] = useState('');
  const [winNumberFilter, setWinNumberFilter] = useState("");
  const [winNumberFilterLabel, setWinNumberFilterLabel] = useState("");
  const [closingDateFromFilterValue, setClosingDateFromFilterValue] = useState("");
  const [closingDateToFilterValue, setClosingDateToFilterValue] = useState("");

  const [showStatusUpdate, setShowStatusUpdate] = useState("");

  const [loading, setLoading] = useState(false);
  const [gameApiUpdateTriggerLoading, setGameApiUdpateTriggerLoading] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState('')
  const [reload, setReload] = useState(false);
  const [resultDetails, setResultDetails] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');

  const resetToFirstPageWithEmptyData = () => {
    setPageNum(0)
    setMoreRecordsIndicator(true)
    setResultDetails([])
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

  const gameTypeFilters = {
    type: "multiValue",
    label: "Game Type",
    currentValues: gameTypeFilterValues,
    options: ['Pick 3', 'Pick 4'],
    onChange: setGameTypeFilterValues,
    clearFilterValue: (value) => {
      setGameTypeFilterValues((vals) => vals.filter((val) => val !== value));
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

  const manualWinResultsColumns = [
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
      gridColumns: 2,
      name: "Date & time",
    },
    {
      gridColumns: 3,
      name: "Win number",
      isReactElement: true,
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

  const clearSort = () => {
    setSortValue("None");
    setSortedLabel("None");
  };

  const handleSetClick = (game) => {
    setGame(game);
    setShowSetSection(true);
  };

  const searchOptions = [
    { label: "State name", value: "State name" },
    { label: "Win number", value: "Win number" },
  ];

  const mapToRowContent = (data) => {
    return data.map((row) => [
      ...[row.stateID, row.stateName, row.slot, row.gameType, row.dateTime].map(
        (text) => ({ text })
      ),
      {
        Element: WinNumber,
        props: { winNumber: row.winNumber, resultType: row.resultType , handleClick: () => handleSetClick(row) },
      },
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

  const fetchResultsData = (scrollId) => {
    setLoading(true);
    setErrorMsg('');
    const ApiQueryParams = {}
    if(stateFilterValues?.length>0) {
      ApiQueryParams['state'] = stateFilterValues.join(',')
    }
    if(slotFilterValues?.length>0) {
      ApiQueryParams['game_slot'] = slotFilterValues.join(',')
    }
    if(gameTypeFilterValues?.length>0) {
      ApiQueryParams['game_type'] = gameTypeFilterValues.map((type) => {
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
      const epochs = DateTime.fromJSDate(closingDateFromFilterValue.$d).endOf('day').setZone('America/Nassau').startOf('day').toUnixInteger()
      ApiQueryParams['start_time'] =  epochs
    }
    if(closingDateToFilterValue!=='' && closingDateToFilterValue!==null && closingDateToFilterValue!==undefined) {
      const epochs = DateTime.fromJSDate(closingDateToFilterValue.$d).endOf('day').setZone('America/Nassau').endOf('day').toUnixInteger()
      ApiQueryParams['end_time'] = epochs
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
            setResultDetails((currentData) =>
              [
                ...(currentData??[]),
              ...data.map((item) => {
                return {
                  ...item,
                  stateID: item.game_id,
                  stateName: item.state_name,
                  state: "",
                  gameType: `Pick ${item.game_type.substring(4)}`,
                  dateTime: convertToUIDate(
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
              })]
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

  const cleanRefresh = ()=> {
    resetToFirstPageWithEmptyData()
    triggerRefresh()
  }

  useEffect(cleanRefresh, [reload, stateFilterValues, slotFilterValues, gameTypeFilterValues, resultTypeFilterValue, winNumberFilter, closingDateFromFilterValue, closingDateToFilterValue]);

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

const fetchLastUpdateTime = () => {
  apiLoadTime(setLastUpdateTime)
}

  const triggerNextBatch = () => {
    fetchResultsData(resultDetails[resultDetails.length-1].id)
  }

  useEffect(() => {
    if(!loading && resultDetails?.length>0 && resultDetails?.length<=(rowsPerPage*(pageNum+2)) && moreRecordsIndicator) {
      triggerNextBatch()
    }
  }, [rowsPerPage, pageNum, resultDetails?.length, moreRecordsIndicator])

  return (
    <>
      {
        (loading || gameApiUpdateTriggerLoading) && <CenterFantasyLoader />
      }
      <div className="manualWinResultsPage">
        <div className="manualWinResultsHeader">
          <div className="manualWinResultsTitle">Manual win results</div>
          <div className="right">
            <div className="lastUpdated">
              <div className="lastUpdatedTimeText">Last data received on</div>
              <div className="lastUpdatedTimeValue">{lastUpdateTime}</div>
            </div>
            <div className="refreshBtnParent" onClick={triggerGamesAPIUpdate}>
              <div className="triggerApiRefreshBtn clickable">
                <BackupIcon />
              </div>
              <div className="refreshHoverText">Update the API Trigger</div>
            </div>
            <div className="refreshBtn clickable" onClick={triggerRefresh}>
              <RefreshIcon />
            </div>
            <div
              className="logsBtn clickable"
              onClick={() => navigate("/home/manualwinresults/logs", location)}
            >
              <LogsIcon />
              <div className="logsText">Logs</div>
            </div>
          </div>
        </div>

        <Drawer 
          anchor="right" 
          open={showSetSection}
          onClose={() => {
            setShowSetSection(false);
            setGame(null);
          }}
        >
          <SetNumberSection
            game={game}
            closingTime={game?.dateTime}
            onClose={() => {
              setShowSetSection(false);
              setGame(null);
            }}
            reload={reload}
            setReload={setReload}
            setShowStatusUpdate={setShowStatusUpdate}
          />
        </Drawer>

        <FilterBarV2
          onSearchValueChange={setSearchValue}
          sortOptions={[]}
          sortedLabel={sortedLabel}
          clearSort={clearSort}
          filters={[
            stateFilters,
            slotFilters,
            gameTypeFilters,
            resultTypeFilters,
            winNumberFilters,
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
          currentDataLength={resultDetails?.length} 
          moreRecordsIndicator={moreRecordsIndicator}
          triggerNextBatch={triggerNextBatch} />

        <DataTable
          spacing={2}
          columnConfig={manualWinResultsColumns}
          rowContent={mapToRowContent(resultDetails?.slice(pageNum*rowsPerPage, (pageNum+1)*rowsPerPage))}
        />

        {(!loading && (resultDetails?.length==0 || errorMsg!=='')) && <div className="tableErrorMsg">
          {errorMsg!==''?errorMsg:'No records found with given criteria'}
        </div>}

        <PageNavigation 
          dataLoading={loading}
          rowsPerPage={rowsPerPage} 
          setRowsPerPage={setRowsPerPage} 
          pageNum={pageNum} 
          setPageNum={setPageNum} 
          currentDataLength={resultDetails?.length} 
          moreRecordsIndicator={moreRecordsIndicator}
          triggerNextBatch={triggerNextBatch} />
        
        {showStatusUpdate && (
          <Alert
            message={showStatusUpdate}
            style={{ position: "fixed", left: "24px", bottom: "16px" }}
            onClick={() => setShowStatusUpdate("")}
          />
        )}
      </div>
    </>
  );
};

export default ManualWinResults;
