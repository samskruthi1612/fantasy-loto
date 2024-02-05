import { DataTable } from '../../../elements/dataTable/DataTable'
import {ReactComponent as BackArrow} from '../../../resources/back_arrow.svg'
import { FilterBar } from '../../FilterBar/FilterBar'
import './AgentBalances.css'
import { useState } from 'react'
import { useLocation,useNavigate } from 'react-router-dom'

const AgentBalance=({amount})=>{
    const location=useLocation()
    const navigate=useNavigate()
    return <>
        <div className='agentBalance'  onClick={()=> navigate('/home/balance/agentTransactions',location)}>{amount}</div>
    </>
}

const AgentStatus =({status}) =>{
    return(
        <div className={`agentStatusText ${status=='active'?'agentStatusTextactive':'agentStatusTextinactive'}`}>
        {status=='active'?'Active':'In-Active'}
      </div>
      );
}

export const AgentBalances=()=>{
    const adminName='Test123'
    const [searchValue, setSearchValue] = useState('');
    const location=useLocation();
    const navigate=useNavigate();
    const agentBalColConfig=[{
        gridColumns: 2,
        name: 'Agent name'
    },{
        gridColumns:2,
        name:'Location'
    },{
        gridColumns:3,
        name:'Agent commission %'
    },{
        gridColumns:2,
        name:'Agent sells limit'
    },{
        gridColumns:2,
        name:'Agent balance',
        isReactElement:true
    },{
        gridColumns:1,
        name:'Status',
        isReactElement:true
    }]
    const agentBalRowContent=[
    [
     { text: 'Watson Juan' },
     { text: 'New York city' },
     { text: '80%' },
     { text: 'No limit' },
     { Element:AgentBalance,props:{amount:'$778.00'} },
     { Element:AgentStatus,props:{status:'active'} }
    ],[
     { text: 'Savannah Nguyen' },
     { text: 'New York city' },
     { text: '80%' },
     { text: '$4023.00' },
     { Element:AgentBalance,props:{amount:'$778.00'} },
     { Element:AgentStatus,props:{status:'active'} }
    ],[
     { text: 'Ralph Edwards' },
     { text: 'New York city' },
     { text: '80%' },
     { text: 'No limit' },
     { Element:AgentBalance,props:{amount:'$778.00'} },
     { Element:AgentStatus,props:{status:'active'} }
    ],[
     { text: 'Cameron Williamson' },
     { text: 'New York city' },
     { text: '80%' },
     { text: 'No limit' },
     { Element:AgentBalance,props:{amount:'$778.00'} },
     { Element:AgentStatus,props:{status:'inactive'} }
    ],[
     { text: 'Jacob Jones' },
     { text: 'New York city' },
     { text: '80%' },
     { text: '$4023.00' },
     { Element:AgentBalance,props:{amount:'$778.00'} },
     { Element:AgentStatus,props:{status:'inactive'} }
    ],[
     { text: 'Jenny Wilson' },
     { text: 'New York city' },
     { text: '80%' },
     { text: '$4023.00' },
     { Element:AgentBalance,props:{amount:'$778.00'} },
     { Element:AgentStatus,props:{status:'inactive'} }
    ],[
     { text: 'Kathryn Murphy' },
     { text: 'New York city' },
     { text: '80%' },
     { text: '$4023.00' },
     { Element:AgentBalance,props:{amount:'$778.00'} },
     { Element:AgentStatus,props:{status:'active'} }
    ]]
    return <>
        <div className='HeaderRow'>
        <div className='backArrow' onClick={() => navigate('/home/balance',location)}><BackArrow/></div>
        <div className='headerTitle'>Agents balance</div>
        <div className='agentDetails'>(Agents under {adminName})</div>
    </div>
    <div className='FilterBar'>
        <FilterBar
        onSearchValueChange={setSearchValue}  
        sortedLabel='None' 
        filters={[]}
        />
    </div>
    <div className='agentsBalanceTable'><DataTable spacing={2} columnConfig={agentBalColConfig} rowContent={agentBalRowContent}/></div>
    </>
}