import { useEffect, useState } from 'react';
import { DataTable } from '../../elements/dataTable/DataTable';
import { useLocation, useNavigate } from "react-router-dom";
import './BalanceManagement.css'
import { Drawer } from '@mui/material';
import { FilterBar } from '../FilterBar/FilterBar';
import TextInputv2 from '../../elements/textInputv2/TextInputv2';
import { ReactComponent as CloseButton } from '../../resources/close-button.svg'
import { PrimaryButton } from "../../elements/button/Button";
import {ReactComponent as ProfileIcon} from '../../resources/top nav bar/profile.svg'
import { CenterFantasyLoader, FantasyLotoLoader } from '../../elements/fantasyLotoLoader/FantasyLotoLoader';

const AdminBalance=({amount})=>{
    const navigate = useNavigate();
    const location=useLocation();
    return(
        <div className='adminBalance' onClick={()=> navigate('/home/balance/adminTransactions',location)}>{amount}</div>
    )
}
const AgentBalance=()=>{
    const navigate = useNavigate();
    const location=useLocation();
    return(
        <div className='agentBalance' onClick={()=>navigate('/home/balance/agentBalances',location)}> View </div>
    )
}
const AgentName=({val})=>{
    return(<>
        <div><ProfileIcon/>{val}</div>
        </>
    )
}
const ManageAmount=({drawerAmount,adminName})=>{
    const [showDrawer,setShowDrawer]=useState(false)
    const [changeAmount,setChangeAmount]=useState('')
    return(<>
         <div className='manageAmount' onClick={()=>setShowDrawer(true)}> Add or Deduct </div>
        { showDrawer && <Drawer anchor='right' open={showDrawer} onClose={()=>setShowDrawer(false)}><div className='manageAmountDrawer'>
            <div className='drawerTop'>
                <div className='manageAmountHeader'>Manage Amount</div>
                <div className='closeButtonManageAmount'> <CloseButton onClick={()=>setShowDrawer(false)}/></div>
            </div>
            <div className='statContainer'>
                <div className='balanceStat'>{drawerAmount}</div>
                <div className='agentName'>Available balance in {adminName}'s Account</div>
            </div>
            <div className='buttonContainer'>
            <div className='manageButton'>Add amount</div><div className='manageButton'>Deduct amount</div>
            </div>
            <TextInputv2
            label='Input amount in $'
            maskInput={false}
            onChange={setChangeAmount}
            />
            <div className='saveButton' ><PrimaryButton type='primary' label='Save' style={{width:'100%'}} /></div>
        </div></Drawer>}
    </>)
}

const AgentStatus =({status}) =>{
    return(
        <div className={`agentStatusText ${status=='active'?'agentStatusTextactive':'agentStatusTextinactive'}`}>
        {status=='active'?'Active':'In-Active'}
      </div>
      );
}

export const BalanceManagement = () =>{
    const [loading, setLoading] = useState(true);
    const [adminBalDetails, setadminBalDetails] = useState({profiles: [], count: {total:0, active:0}});
    const [adminapiBalDetails, setadminapiBalDetails] = useState({profiles: [], count: {total:0, active:0}});
    const fetchAdminBalDetails = () => {
        setLoading(true)
        console.log('user profile url', process.env.REACT_APP_USER_API_URL)
        fetch(process.env.REACT_APP_USER_API_URL, {
            method: 'GET',
            headers: {
                'x-channel': 'admin',
                'auth-token': localStorage.getItem('token'),
            }
        })
        .then(resp => {
            if(resp.status==200) {
                resp.json().then(data => {
                    setadminBalDetails({...data, profiles: data.profiles.filter(p => p.status !== 'Archived')})
                    setadminapiBalDetails({...data, profiles: data.profiles.filter(p => p.status !== 'Archived')})
                    setLoading(false)
                })
            } else {
                setadminBalDetails({profiles:[], count: {total:0, active: 0}})
                setadminapiBalDetails({profiles:[], count: {total:0, active: 0}})
                setLoading(false)
            }
        })
        .catch(() => {
            setadminapiBalDetails({profiles:[], count: {total:0, active: 0}})
            setadminBalDetails({profiles:[], count: {total:0, active: 0}})
            setLoading(false)
        })
    }
    useEffect(fetchAdminBalDetails,[])

    const mapToRowContent = (adminBalDetails) => {
        return adminBalDetails.profiles.map(admin=>
            [   {  
                    Element:AgentName,
                    props:{val:admin.name}
                },
                ...[ admin.franchise, admin.city + ', ' + admin.state, (admin.commission + '%')].map(text => ({text})),
                {
                    Element: AdminBalance,
                    props: {amount:admin.balance}
                },
                {
                    Element: AgentBalance
                },
                {
                    Element: ManageAmount,
                    props: {drawerAmount:admin.balance,adminName:admin.name}
                },
                {
                    Element: AgentStatus,
                    props: {status: admin.status}
                }
            ])
    }

    const [searchValue, setSearchValue] = useState('');
    
    const balanceColumnConfig=[{
        gridColumns: 4,
        name: 'Admin Name',
        isReactElement:true
    },{
        gridColumns:3,
        name:'Franchise'
    },{
        gridColumns:5,
        name:'Location'
    },{
        gridColumns:3,
        name:'Commission'
    },{
        gridColumns:3,
        name:'Balance',
        isReactElement:true
    },{
        gridColumns:3,
        name:'Agent Balance',
        isReactElement:true
    },{
        gridColumns:3,
        name:'Manage amount',
        isReactElement:true
    },{
        gridColumns:3,
        name:'Status',
        isReactElement:true
    }
    ]
    
    const [sortValue, setSortValue] = useState('None');
    const [sortOrder, setSortOrder] = useState('None');
    const [sortedLabel, setSortedLabel] = useState('None');
    const [cityFilterValues, setCityFilterValues] = useState([]);
    const [stateFilterValues,setStateFilterValues] = useState([]);
    const [commissionFilterValues,setCommissionFilterValues]=useState([]);
    const [adminBalValues,setAdminBalValues]=useState([]);
    
    const sortOptions = [
        {
            label: 'Status (A-Z)',
            onClick: ()=>{
                setSortValue('status')
                setSortOrder('asc')
                setSortedLabel('status (A-Z)')
            }
        },
        {
            label: 'Status (Z-A)',
            onClick: ()=>{
                setSortValue('status')
                setSortOrder('dsc')
                setSortedLabel('status (Z-A)')
            }
        }
    ]

    const clearSort = () => {
        setSortValue('None')
        setSortedLabel('None')
    }

    const cityFilters={
        type:'multiValue',
        label:'City',
        currentValues:cityFilterValues,
        options:[... new Set((adminapiBalDetails.profiles??[]).map(p=>p.city))],
        onChange: setCityFilterValues,
        clearFilterValue:(value)=>{
            setCityFilterValues(vals=>vals.filter(val=>val!==value))
        }
    }
    
    const stateFilters={
        type:'multiValue',
        label:'State',
        currentValues:stateFilterValues,
        options:[... new Set((adminapiBalDetails.profiles??[]).map(p=>p.state))],
        onChange: setStateFilterValues,
        clearFilterValue:(value)=>{
            setStateFilterValues(vals=>vals.filter(val=>val!==value))
        }
    }
    const commissionFilters={
        type:'numRange',
        variant: 'commission',
        label:'Admin Commission',
        currentValues:commissionFilterValues,
        onChange:setCommissionFilterValues,
        clearFilterValue:()=>setCommissionFilterValues([])
    }
    
    const adminBalFilters={
        type:'numRange',
        variant: 'currency',
        label:'Admin Balance',
        currentValues:adminBalValues,
        onChange:setAdminBalValues,
        clearFilterValue:()=>setAdminBalValues([])
    }
    const allFilters=[cityFilters,stateFilters,commissionFilters,adminBalFilters]
    
    useEffect(() =>{if(!loading) {

        const adminProfiles = adminapiBalDetails.profiles
        const statusSorter = (p1, p2) => (sortOrder === 'dsc'?-1:1) * p1.status.toLowerCase().localeCompare(p2.status.toLowerCase())
        let filteredadmins = adminProfiles.filter((admin) => 
            admin.name.toLowerCase().includes(searchValue.toLowerCase()) 
        )
        if(cityFilterValues.length !== 0) {
            filteredadmins = filteredadmins.filter(p => cityFilterValues.includes(p.city))
        }
        if(stateFilterValues.length !== 0) {
            filteredadmins = filteredadmins.filter(p => stateFilterValues.includes(p.state))
        }
        if(commissionFilterValues.length>0){
            filteredadmins = filteredadmins.filter(p => p.commission>=commissionFilterValues[0] && p.commission<=commissionFilterValues[1])
        }
        if(adminBalValues.length>0){
            filteredadmins = filteredadmins.filter(p => p.balance>=adminBalValues[0] && p.balance<=adminBalValues[1])
        }
        let sortedAdmins=filteredadmins
        if(sortValue === 'status')
            sortedAdmins = filteredadmins.sort(statusSorter)
    setadminBalDetails({profiles:sortedAdmins}) 
    }}
    , [cityFilterValues,stateFilterValues,commissionFilterValues,adminBalValues,searchValue,sortValue,sortOrder])
    return(
        <>{loading?<CenterFantasyLoader/>:
        <div className='balancePage'>
            <div className='balanceTitleRow'>
                <div className="balanceTitle">Balances</div>
                <div className='balanceStatsButton'>
                    <div className="balanceStats">
                        <div className="availableBalance">988m</div> {/**mocked*/}
                        <div className="statLabel">Available balance</div>
                    </div>
                    <div className="balanceStats">
                        <div className="availableBalance">877m</div> {/**mocked*/}
                        <div className="statLabel">Admin assigned balance</div>
                    </div>
                </div>
            </div>
            <FilterBar 
            onSearchValueChange={setSearchValue} 
             sortOptions={sortOptions} 
            sortedLabel={sortedLabel} 
            clearSort={clearSort}
            filters={allFilters}
            />
            <div className='adminTable'>
                <DataTable spacing={2} totalColumns={27}
                columnConfig={balanceColumnConfig}
                rowContent={mapToRowContent(adminBalDetails)}
                />
            </div>
        </div>}
        </>
    )
} 