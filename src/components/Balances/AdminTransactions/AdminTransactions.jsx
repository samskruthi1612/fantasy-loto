import { DataTable } from '../../../elements/dataTable/DataTable'
import {ReactComponent as BackArrow} from '../../../resources/back_arrow.svg'
import { FilterBar } from '../../FilterBar/FilterBar'
import './AdminTransactions.css'
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

export const AdminTransactions=() => {
    const [searchValue, setSearchValue] = useState('');
    const location=useLocation();
    const navigate=useNavigate();
    const adminName='Surya'
    const Franchise='Test123'
    const adminTransColConfig=[{
        gridColumns: 2,
        name: 'Date & time'
    },{
        gridColumns:2,
        name:'Made by'
    },{
        gridColumns:2,
        name:'Trxn Details'
    },{
        gridColumns:2,
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
    const adminRowContent=[
        [{ text: '21 Mar 2021, 23:00' },
         { text: 'Kevin Dean (SuperAdmin)' },
         { text: 'Added admin balance' },
         { Element:TransactionDetails,props:{amount:'+ $200'} },
         { text: '$3710.56' },
         { text: '24 street, Daylight, NY, US.' },
         { Element:IPaddress,props:{coordinates:'10.12.11.17'} }
        ],[
         { text: '20 Mar 2021, 23:00' },
         { text: 'Kevin Dean (SuperAdmin)' },
         { text: 'Deducted admin balance' },
         { Element:TransactionDetails,props:{amount:'- $40.00'} },
         { text: '$3510.00' },
         { text: '24 street, Daylight, NY, US.' },
         { Element:IPaddress,props:{coordinates:'10.12.11.17'} }
        ],[
         { text: '20 Mar 2021, 23:00' },
         { text: 'Alexander Lee (Admin)' },
         { text: 'Added agent balance to Smith' },
         { Element:TransactionDetails,props:{amount:'- $250.00'} },
         { text: '$3550.00' },
         { text: '24 street, Daylight, NY, US.' },
         { Element:IPaddress,props:{coordinates:'10.12.11.17'} }
        ],[
         { text: '20 Mar 2021, 23:00' },
         { text: 'Alexander Lee (Admin)' },
         { text: 'Deducted balance from Smith (Agent)' },
         { Element:TransactionDetails,props:{amount:'+ $100.00'} },
         { text: '$3800.00' },
         { text: '24 street, Daylight, NY, US.' },
         { Element:IPaddress,props:{coordinates:'10.12.11.17'} }
        ],[
         { text: '19 Mar 2021, 23:00' },
         { text: 'Albert Flores (Cashier)' },
         { text: 'Added agent balance to Smith' },
         { Element:TransactionDetails,props:{amount:'- $09.05'} },
         { text: '$3700.00' },
         { text: '24 street, Daylight, NY, US.' },
         { Element:IPaddress,props:{coordinates:'10.12.11.17'} }
        ],[
         { text: '19 Mar 2021, 23:00' },
         { text: 'Albert Flores (Cashier)' },
         { text: 'Deducted balance from Smith (Agent)' },
         { Element:TransactionDetails,props:{amount:'+ $10.00'} },
         { text: '$3709.05' },
         { text: '24 street, Daylight, NY, US.' },
         { Element:IPaddress,props:{coordinates:'10.12.11.17'} }
        ],[
         { text: '18 Mar 2021, 23:00' },
         { text: 'Albert Flores (Cashier)' },
         { text: 'Payout customer Ticket# 1234(3)' },
         { Element:TransactionDetails,props:{amount:'- $200.20'} },
         { text: '$3699.05' },
         { text: '24 street, Daylight, NY, US.' },
         { Element:IPaddress,props:{coordinates:'10.12.11.17'} }
        ],[
         { text: '18 Mar 2021, 23:00' },
         { text: 'Alexander Lee (Admin)' },
         { text: 'Payout customer Ticket# 3601(5)' },
         { Element:TransactionDetails,props:{amount:'- $100.75'} },
         { text: '$3899.25' },
         { text: '24 street, Daylight, NY, US. ' },
         { Element:IPaddress,props:{coordinates:'10.12.11.17'} }
        ]
    ]
return <>
    <div className='HeaderRow'>
        <div className='backArrow' onClick={() => navigate('/home/balance',location)}><BackArrow/></div>
        <div className='headerTitle'>Admin Transactions</div>
        <div className='adminDetails'>({adminName}, {Franchise})</div>
    </div>
    <div className='FilterBar'>
        <FilterBar
        onSearchValueChange={setSearchValue} 
        sortedLabel='None' 
        filters={[]}
        />
    </div>
    <div className='adminTransTable'><DataTable spacing={2} columnConfig={adminTransColConfig} rowContent={adminRowContent} totalColumns={13}/></div>
    </>
}