import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { LogsButton } from "../shared/LogsButton/LogsButton";
import { Alert } from "../../elements/alert/Alert";
import { Drawer } from "@material-ui/core";
import { ErrorAlert } from "../../elements/alert/ErrorAlert";
import { DataTable } from "../../elements/dataTable/DataTable";
import { CenterFantasyLoader } from "../../elements/fantasyLotoLoader/FantasyLotoLoader";
import { superAdminRole } from '../../util/constants';
import { formatToCurrency } from "../../util/currencyformatter";
import { EditBetNumber } from "./EditBetNumber/EditBetNumber";

const LimitAmount = ({amount, readOnlyUser, onClick}) => {
    return <div className={`${readOnlyUser?'':'linkText clickable'}`} onClick={onClick}>
      {amount>=0?formatToCurrency(amount):'No limit set yet'}
    </div>
}

export const BetNumberLimit = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state: {userDetails}} = location;
  
  const [showStatusUpdate, setShowStatusUpdate] = useState("");
  const [showSetSection, setShowSetSection] = useState(false);
  const [betTypeDetails, setBetTypeDetails] = useState({});
  const [errorMsgUpdatingValues, setErrorMsgUpdatingValues] = useState("");

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [pick3limitAmount, setPick3LimitAmount] = useState(0);
  const [pick4limitAmount, setPick4LimitAmount] = useState(0);

  const readOnlyUser = userDetails.userRole !== superAdminRole

  const columnConfig = [{
    gridColumns: 4,
    name: "Game type",
  },{
    gridColumns: 4,
    name: "Bet range",
  },{
    gridColumns: 4,
    name: "Bet limit",
    isReactElement: true,
  }]

  const onLimitAmountClicked = (betTypeName, betFrom, betTo, betTypeLimit) => {
    if(readOnlyUser) return
    setShowSetSection(true)
    setBetTypeDetails({
      betTypeName,
      betFrom,
      betTo,
      betTypeLimit,
    })
  }

  const getRowContent = () => [[{
    text: 'Pick 3'
  },{
    text: '000-999'
  },{
    Element: LimitAmount,
    props: {amount: pick3limitAmount,readOnlyUser, onClick: () => onLimitAmountClicked('Pick 3','000','999',pick3limitAmount)}
  }],[{
    text: 'Pick 4'
  },{
    text: '0000-9999'
  },{
    Element: LimitAmount,
    props: {amount: pick4limitAmount, readOnlyUser, onClick: () => onLimitAmountClicked('Pick 4','0000','9999',pick4limitAmount)}
  }]]

  const fetchBetTypeLimits = ()=>{
    setLoading(true)
    fetch(process.env.REACT_APP_BET_NUMBER_LIMIT, {
      headers: {
        'x-username':userDetails.userName,
        'auth-token': localStorage.getItem('token'),
      }
    })
    .then(resp=>{
      if(resp.status==200) {
        resp.json().then(data => {
          setPick3LimitAmount(data['pick3']['000-999'])
          setPick4LimitAmount(data['pick4']['0000-9999'])
        })
      } else {
        console.log('API call failed with status',resp.status)
        setErrorMsg('Some thing went wrong, please try again later')
      }
      setLoading(false)
    })
    .catch(err=>{
      console.log('API call failed with error: ', err)
      setErrorMsg('Some thing went wrong, please try again later')
      setLoading(false)
    })
  }

  useEffect(fetchBetTypeLimits, [])

  return (
    <>
    {
      (loading) && <CenterFantasyLoader />
    }
    <div className="pageDisplay">
      <div className="pageHeader">
        <div className="pageTitle">Bet number limit</div>
        <div className="pageTitleRight">
          {!readOnlyUser && <LogsButton onClick={()=>navigate('/home/betNumberLimit/logs', {state: {...location.state, userDetails}})} />}
        </div>
      </div>

      <DataTable
        spacing={2}
        totalColumns={12}
        columnConfig={columnConfig}
        rowContent={getRowContent()}
      />

      {(!loading && errorMsg!=='') && <div className="tableErrorMsg">
        {errorMsg!==''?errorMsg:'Error fetching bet number limits.'}
      </div>}
      
      {showSetSection && <Drawer 
        anchor="right" 
        open={showSetSection}
        onClose={() => {
          setShowSetSection(false);
          setBetTypeDetails({});
        }}
      >
        <EditBetNumber
          betTypeDetails={betTypeDetails} 
          onClose={() => {
            setShowSetSection(false);
            setBetTypeDetails({});
          }} 
          onSave={()=>{
            setShowSetSection(false)
            setShowStatusUpdate('Bet number limit is updated successfully')
            fetchBetTypeLimits()
            setTimeout(()=>setShowStatusUpdate(''), 5000)
          }}
          onError={()=>{
            setShowSetSection(false)
            setErrorMsgUpdatingValues('Failed to update bet number limit')
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