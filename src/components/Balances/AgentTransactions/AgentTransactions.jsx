import { DataTable } from '../../../elements/dataTable/DataTable'
import {ReactComponent as BackArrow} from '../../../resources/back_arrow.svg'
import { FilterBar } from '../../FilterBar/FilterBar'
import './AgentTransactions.css'
import { useState } from 'react'
import { useLocation,useNavigate } from 'react-router-dom'

const TransactionDetails=({amount})=>{
    return <div className='amountFormat'>{amount}</div>
}

const IPaddress=({coordinates})=>{
    const [viewCoords,setViewCoords]=useState(false)
    return(
        <div onClick={()=>setViewCoords(true)}>{viewCoords?coordinates:<div className='IPformat'>View</div>}</div>
    )
}
export const AgentTransactions=()=>{
    const [searchValue, setSearchValue] = useState('');
    const location=useLocation();
    const navigate=useNavigate();
    const agentName='Test Agent'
    const agentTransColConfig=[{
        gridColumns: 1,
        name: 'Date & time'
    },{
        gridColumns:2,
        name:'Made by'
    },{
        gridColumns:2,
        name:'Trxn Details'
    },{
        gridColumns:1,
        name:'Trxn Amount',
        isReactElement:true
    },{
        gridColumns:2,
        name:'Available balance',
    },{
        gridColumns:2,
        name:'Location',
    },{
        gridColumns:1,
        name:'IP',
        isReactElement:true
    }]
    const agentRowContent=[
    [
     { text: '27 Jun 2021, 00:00' },
     { text: 'Kristin Watson (Cashier)' },
     { text: 'Added agent balance' },
     { Element:TransactionDetails,props:{amount:'+ $300.56'} },
     { text: '$2700.56' },
     { text: '24 street, Daylight, NY, US.' },
     { Element:IPaddress,props:{coordinates:'10.12.11.17'} }
    ],[
     { text: '10 May 2021, 00:00' },
     { text: 'Watson Jauan (Agent)' },
     { text: 'Void Ticket #3433' },
     { Element:TransactionDetails,props:{amount:'- $200.00'} },
     { text: '$2400.00' },
     { text: '24 street, Daylight, NY, US.' },
     { Element:IPaddress,props:{coordinates:'10.12.11.17'} }
    ],[
     { text: '03 May 2021, 00:00' },
     { text: 'Watson Jauan (Agent)' },
     { text: 'Sales Ticket #3451' },
     { Element:TransactionDetails,props:{amount:'- $300.00'} },
     { text: '$2200.00' },
     { text: '24 street, Daylight, NY, US.' },
     { Element:IPaddress,props:{coordinates:'10.12.11.17'} }
    ],[
     { text: '23 Apr 2020, 00:00' },
     { text: 'Watson Jauan (Agent)' },
     { text: 'Payout customer Ticket# 3421(9)' },
     { Element:TransactionDetails,props:{amount:'- $100.00'} },
     { text: '$2500.00' },
     { text: '24 street, Daylight, NY, US.' },
     { Element:IPaddress,props:{coordinates:'10.12.11.17'} }
    ],[
     { text: '16 Apr 2021, 00:00' },
     { text: 'Watson Jauan (Agent)' },
     { text: 'Deposits balance to admin' },
     { Element:TransactionDetails,props:{amount:'- $100.00'} },
     { text: '$2600.00' },
     { text: '24 street, Daylight, NY, US.' },
     { Element:IPaddress,props:{coordinates:'10.12.11.17'} }
    ],[
     { text: '12 Apr 2021, 00:00' },
     { text: 'Kristin Watson (Cashier)' },
     { text: 'Deducted agent balance' },
     { Element:TransactionDetails,props:{amount:'+ $300.00'} },
     { text: '$2700.00' },
     { text: '24 street, Daylight, NY, US.' },
     { Element:IPaddress,props:{coordinates:'10.12.11.17'} }
    ],[
     { text: '09 Mar 2021, 00:00' },
     { text: 'Alexander Lee (Admin)' },
     { text: 'Added agent balance' },
     { Element:TransactionDetails,props:{amount:'+ $3000.00'} },
     { text: '$3000' },
     { text: '24 street, Daylight, NY, US. ' },
     { Element:IPaddress,props:{coordinates:'10.12.11.17'} }
    ]]
    return <>
    <div className='HeaderRow'>
        <div className='backArrow' onClick={() => navigate('/home/balance/agentBalances',location)}><BackArrow/></div>
        <div className='headerTitle'>Agent Transactions</div>
        <div className='agentDetails'>({agentName})</div>
    </div>
    <div className='FilterBar'>
        <FilterBar
        onSearchValueChange={setSearchValue}  
        sortedLabel='None' 
        filters={[]}
        />
    </div>
    <div className='adminTransTable'><DataTable spacing={2} columnConfig={agentTransColConfig} rowContent={agentRowContent}/></div>
    </>

}