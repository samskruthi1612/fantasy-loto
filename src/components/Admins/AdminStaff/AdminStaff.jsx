import './AdminStaff.css'
import {ReactComponent as BackArrow} from '../../../resources/back_arrow.svg'
import { useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react';
import { DataTable } from '../../../elements/dataTable/DataTable'
import { TextInput } from '../../../elements/textInput/TextInput'
import { CircularProgress, Grid } from '@mui/material';
import { CenterFantasyLoader } from '../../../elements/fantasyLotoLoader/FantasyLotoLoader';
import { capitalizeFirstLetter, convertToUIMobileNumber } from '../../../util/stringUtils';
import {ReactComponent as ProfileIcon} from '../../../resources/top nav bar/profile.svg'
import { FilterBar } from "../../FilterBar/FilterBar";

const Name = ({ name, profilePic }) => <>
    {(profilePic == undefined || profilePic == null || profilePic == "") && <ProfileIcon />}
    {(profilePic != undefined && profilePic != null && profilePic != "") && <img class="miniProfilePic"src={profilePic}/>}
    {capitalizeFirstLetter(name)}
</>

const Status = ({status}) => 
    <div className={`adminStaffStatusText ${status=='active'?'adminStaffStatusTextActive':'adminStaffStatusTextInactive'}`}>
        {status=='active'?'Active':'In-Active'}
    </div>

export const AdminStaff = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [onlyStaffDetails, setOnlyStaffDetails] = useState({profiles: [], count: {total:0, active: 0}})
    const [onlyAgentDetails, setOnlyAgentDetails] = useState({profiles: [], count: {total:0, active: 0}})

    const [staffDetails, setStaffDetails] = useState({profiles:[], count: {total:0, active: 0}});
    const [staffApiDetails, setStaffApiDetails] = useState({profiles:[], count: {total:0, active: 0}});
    const [searchValue, setSearchValue] = useState('');
    const [sortValue, setSortValue] = useState('None');
    const [sortOrder, setSortOrder] = useState('None');
    const [sortedLabel, setSortedLabel] = useState('None');
    const [statusFilter, setStatusFilter] = useState('');
    const [statusFilterLabel, setStatusFilterLabel] = useState('');
    const [createdDateFilterValue, setCreatedDateFilterValue] = useState('');
    const [cityFilterValues, setCityFilterValues] = useState([]);
    const [stateFilterValues, setStateFilterValues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [agentLoading, setAgentLoading] = useState(true);

    const statusFilters = {
        type: 'singleValue',
        label: 'Status',
        currentValue: statusFilter,
        currentLabel: statusFilterLabel,
        options: [
            {
                label: 'Active',
                value: 'active'
            },
            {
                label: 'In-Active',
                value: 'inactive'
            }
        ],
        onChange: (value) => {
            setStatusFilter(value)
            setStatusFilterLabel(value==='active'?'Active':'In-Active')
        },
        clearFilter: () => {
            setStatusFilter('')
            setStatusFilterLabel('')
        }
    }

    const createdDateFilter = {
        type: 'date',
        label: 'Created on',
        currentValue: createdDateFilterValue,
        onChange: setCreatedDateFilterValue,
        clearFilter: () => {
            setCreatedDateFilterValue('')
        }
    }

    const cityFilters = {
        type: 'multiValue',
        label: 'City',
        currentValues: cityFilterValues,
        options: [... new Set((staffApiDetails.profiles??[]).map(p => p.city))],
        onChange: setCityFilterValues,
        clearFilterValue: (value) => {
            setCityFilterValues(vals => vals.filter(val => val !== value))
        }
    }

    const stateFilters = {
        type: 'multiValue',
        label: 'State',
        currentValues: stateFilterValues,
        options: [... new Set((staffApiDetails.profiles??[]).map(p => p.state))],
        onChange: setStateFilterValues,
        clearFilterValue: (value) => {
            setStateFilterValues(vals => vals.filter(val => val !== value))
        }
    }

    useEffect(() => {
        fetch(process.env.REACT_APP_USER_API_URL+'?' + new URLSearchParams({
            adminid: location.state.adminid
        }), {
            method: 'GET',
            headers: {
                'x-channel': 'staff',
                'x-role': 'staff',
                'auth-token': localStorage.getItem('token'),
            }
        })
        .then((resp)=> {
            if(resp.status==200) {
                resp.json().then(data => {
                    setOnlyStaffDetails({...data, profiles: data.profiles?.filter(p => p.status !== 'Archived')})
                    setLoading(false)
                })
            } else {
                console.log('api call failed with status', resp.status)
                setOnlyStaffDetails({profiles:[], count: {total:0, active: 0}})
                setLoading(false)
            }
        })
        .catch(() => {
            console.log('staff api failed for given admins')
            setOnlyStaffDetails({profiles:[], count: {total:0, active: 0}})
            setLoading(false)
        })
    }, [])

    useEffect(() => {
        fetch(process.env.REACT_APP_USER_API_URL+'?' + new URLSearchParams({
            adminid: location.state.adminid
        }), {
            method: 'GET',
            headers: {
                'x-channel': 'agent',
                'auth-token': localStorage.getItem('token'),
            }
        })
        .then((resp)=> {
            if(resp.status==200) {
                resp.json().then(data => {
                    setOnlyAgentDetails({...data, profiles: data.profiles?.filter(p => p.status !== 'Archived')})
                    setAgentLoading(false)
                })
            } else {
                console.log('agents api failed for given admins with response', resp.status)
                setOnlyAgentDetails({profiles:[], count: {total:0, active: 0}})
                setAgentLoading(false)
            }
        })
        .catch(() => {
            console.log('agents api failed for given admins')
            setOnlyAgentDetails({profiles:[], count: {total:0, active: 0}})
            setAgentLoading(false)
        })
    }, [])

    useEffect(()=> {
        if(!loading && !agentLoading) {
            const combinedData = {
                profiles: [...(onlyStaffDetails.profiles??[]), ...(onlyAgentDetails.profiles??[])],
                count: {
                    total: onlyStaffDetails.count.total + onlyAgentDetails.count.total,
                    active: onlyStaffDetails.count.active + onlyAgentDetails.count.active
                }
            }
            setStaffApiDetails(combinedData)
            setStaffDetails(combinedData)
        }
    }, [onlyStaffDetails, loading, onlyAgentDetails, agentLoading])

    const sortOptions = [
        {
            label: 'Name (A-Z)',
            onClick: ()=>{
                setSortValue('name')
                setSortOrder('asc')
                setSortedLabel('Name (A-Z)')
            }
        },
        {
            label: 'Name (Z-A)',
            onClick: ()=>{
                setSortValue('name')
                setSortOrder('dsc')
                setSortedLabel('Name (Z-A)')
            }
        },
        {
            label: 'Role (A-Z)',
            onClick: ()=>{
                setSortValue('role')
                setSortOrder('asc')
                setSortedLabel('Role (A-Z)')
            }
        },
        {
            label: 'Role (Z-A)',
            onClick: ()=>{
                setSortValue('role')
                setSortOrder('dsc')
                setSortedLabel('Role (Z-A)')
            }
        },
        {
            label: 'Status (Active first)',
            onClick: ()=>{
                setSortValue('status')
                setSortOrder('asc')
                setSortedLabel('Status (Active first)')
            }
        },
        {
            label: 'Status (Inactive first)',
            onClick: ()=>{
                setSortValue('status')
                setSortOrder('dsc')
                setSortedLabel('Status (Inactive first)')
            }
        },
    ]

    const clearSort = () => {
        setSortValue('None')
        setSortedLabel('None')
    }

    useEffect(() => {
        if(!loading && !agentLoading) {
            const profiles = staffApiDetails.profiles
            const nameSorter = (p1, p2) => (sortOrder === 'dsc'?-1:1) * p1.name.toLowerCase().localeCompare(p2.name.toLowerCase())
            const roleSorter = (p1, p2) => (sortOrder === 'dsc'?-1:1) * p1.userRole.toLowerCase().localeCompare(p2.userRole.toLowerCase())
            const createdDateSorter = (p1, p2) => {
                if(p1.createTime<p2.createTime) return (sortOrder === 'dsc'?-1:1) * -1
                if(p1.createTime===p2.createTime) return (sortOrder === 'dsc'?-1:1) * 0
                return (sortOrder === 'dsc'?-1:1) * 1
            }
            const statusSorter = (p1, p2) => (sortOrder === 'dsc'?-1:1) * p1.status.toLowerCase().localeCompare(p2.status.toLowerCase())
            let filteredProfiles = (profiles ?? [])
            if(searchValue)
            filteredProfiles = filteredProfiles.filter((staff) => 
                staff.name.toLowerCase().includes(searchValue.toLowerCase()) || staff.userName.toLowerCase().includes(searchValue.toLowerCase()) || staff.phoneNumber.includes(searchValue)
            )
            if(statusFilter !== '')
                filteredProfiles = filteredProfiles.filter(p=> p.status === statusFilter)
            if(createdDateFilterValue !== '') {
                filteredProfiles = filteredProfiles.filter(p=> {
                    const dateObj = new Date(p.createTime)
                    const createdDateFilterDateObj = createdDateFilterValue.$d
                    return dateObj.getFullYear() === createdDateFilterDateObj.getFullYear() &&
                        dateObj.getMonth() === createdDateFilterDateObj.getMonth() &&
                        dateObj.getDate() === createdDateFilterDateObj.getDate()
                })
            }
            if(cityFilterValues.length !== 0) {
                filteredProfiles = filteredProfiles.filter(p => cityFilterValues.includes(p.city))
            }
            if(stateFilterValues.length !== 0) {
                filteredProfiles = filteredProfiles.filter(p => stateFilterValues.includes(p.state))
            }
            let sortedProfiles = filteredProfiles
            if(sortValue === 'name')
                sortedProfiles = filteredProfiles.sort(nameSorter)
            else if(sortValue === 'role')
                sortedProfiles = filteredProfiles.sort(roleSorter)
            else if(sortValue === 'createdDate')
                sortedProfiles = filteredProfiles.sort(createdDateSorter)
            if(sortValue === 'status')
                sortedProfiles = filteredProfiles.sort(statusSorter)
            setStaffDetails({
                profiles: sortedProfiles,
                count: staffApiDetails.count
            })
        }
    }, [staffApiDetails, loading, searchValue, sortValue, sortOrder, statusFilter, createdDateFilterValue, cityFilterValues, stateFilterValues])

    const mapToRowContent= (givenStaffDetails) => givenStaffDetails.map(staff => ([
            {
                Element: Name,
                props: {name: staff.name, profilePic: staff.profile_pic}
            },
            ...[staff.userName, convertToUIMobileNumber(staff.phoneNumber), staff.city + ', ' + staff.state, location.state.adminName, capitalizeFirstLetter(staff.userRole)].map(text => ({text})), {
                    Element: Status,
                    props: {status: staff.status}
            }
        ]
    ))

    return (
        <>{(loading || agentLoading)?
            <CenterFantasyLoader />
            : <div className='adminStaffPage'>
            <div className="adminStaffTitleRow">
                <div className="adminStaffBackButton" onClick={()=>navigate('/home/admins', location)}>
                    <BackArrow />
                </div>
                <div className="adminStaffTitle">
                    {`${location.state.adminName}'s staff`}
                </div>
                <div className='adminsStaffBothStats'>
                    <div className="adminStaffStats" style={{'margin-left':'auto', 'margin-right':'auto'}}>
                        <div className="adminStaffCount">{staffDetails.count.total}</div>
                        <div className="adminStaffStatLabel">Total staff</div>
                    </div>
                    <div className="adminStaffStats" style={{'margin-left':'auto'}}>
                        <div className="adminStaffCount">{staffDetails.count.active}</div>
                        <div className="adminStaffStatLabel">Active staff</div>
                    </div>
                </div>
            </div>

            <FilterBar 
                onSearchValueChange={setSearchValue} 
                sortOptions={sortOptions} 
                sortedLabel={sortedLabel} 
                clearSort={clearSort}
                filters={[statusFilters, cityFilters, stateFilters]}
            />

            <DataTable
                spacing={2}
                columnConfig={[{
                    gridColumns: 2,
                    name: 'Name',
                    isReactElement: true
                },{
                    gridColumns: 2,
                    name: 'Username'
                },{
                    gridColumns: 2,
                    name: 'Phone number'
                },{
                    gridColumns: 2,
                    name: 'Location'
                },{
                    gridColumns: 2,
                    name: 'Admin'
                },{
                    gridColumns: 1,
                    name: 'Role'
                },{
                    gridColumns: 1,
                    name: 'Status',
                    isReactElement: true
                }]}
                rowContent={mapToRowContent(staffDetails.profiles ?? [])}
            />
        </div>}</>
    )
}