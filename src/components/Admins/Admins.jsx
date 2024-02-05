import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CircularProgress, Grid } from '@mui/material';
import { deleteUser } from '../../api/deleteUser'
import './Admins.css'
import { Drawer } from "@mui/material";
import { PrimaryButton } from "../../elements/button/Button";
import {ReactComponent as MoreOptions} from '../../resources/more_options.svg'
import { ReactComponent as CloseButton } from '../../resources/close-button.svg'
import {ReactComponent as ProfileIcon} from '../../resources/top nav bar/profile.svg'
import { OverlayOptions } from "../../elements/overlayOptions/OverlayOptions";
import { Alert } from '../../elements/alert/Alert';
import { Popup } from "../../elements/popup/Popup";
import { FilterBar } from "../FilterBar/FilterBar";
import { CenterFantasyLoader } from "../../elements/fantasyLotoLoader/FantasyLotoLoader";
import { convertToUIMobileNumber } from "../../util/stringUtils";

const MoreOptionsButton = ({adminid, adminName, currentAdminDetails, displayAlert, triggerRefresh, userRole}) => {
    const [loading, setLoading] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    const [showInactiveBar, setShowInactiveBar] = useState(false);
    const [showDeleteConfirmation, setShowDeleteConfirmation]= useState(false);
    const [comments, setComments] = useState();
    const moreOptionsRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();

    const makeAdminInactive = (adminid, newStatus, comments) => {
        setLoading(true)
        fetch(process.env.REACT_APP_USER_API_URL, {
            method: 'PUT',
            headers: {
                'x-channel':'status',
                'x-role':currentAdminDetails.userRole,
                'auth-token': localStorage.getItem('token'),
            },
            body: JSON.stringify({userName: adminid, status: newStatus, comments})
        })
        .then((resp) => {
            setLoading(false)
            if(resp.status==200) {
                console.log('update status successful')
                displayAlert(`Admin ${currentAdminDetails.status=='active'?'In-activated':'activated'} successfully`)
                triggerRefresh()
            } else {
                console.log('update status failed', resp.status)
            }
        })
        .catch(()=> {
            setLoading(false)
            console.log('status update api error')
        })
    }

    const deleteAdmin = (adminid) => {

        const onDeleteSuccess = () => {
            displayAlert('Admin deleted successfully')
            triggerRefresh()
        }

        deleteUser(adminid, currentAdminDetails.userRole, setLoading, onDeleteSuccess)
    }

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (moreOptionsRef.current && !moreOptionsRef.current.contains(event.target)) {
              setShowOptions(false);
            }
          }
      
          document.addEventListener('click', handleClickOutside);
          return () => {
            document.removeEventListener('click', handleClickOutside);
          };
    }, [])

    return (
        <>
            <div className="adminMoreOptions" onClick={()=>setShowOptions(currentState=>!currentState)} ref={moreOptionsRef}>
                <MoreOptions />
            </div>
            {showOptions && 
                <OverlayOptions options={[
                    {
                        label: 'View staff & agents',
                        onClick: () => navigate('/home/admins/staff', {...location, state:{...location.state, adminid, adminName}})
                    },
                    {
                        label: 'Edit',
                        onClick: ()=>navigate('/home/admins/add', 
                            {...location, state: {...location.state, editAdminFlag: true, currentAdminDetails}})
                    },
                    {
                        label: currentAdminDetails.status=='active'?'Make In-active':'Make active',
                        onClick: ()=>{
                            setShowInactiveBar(true)
                            setShowOptions(false)
                        }
                    },
                    {
                        label: 'Delete',
                        onClick: ()=>{
                            setShowDeleteConfirmation(true)
                            setShowOptions(false)
                        }
                    }
                ]} />
            }
            {showInactiveBar && <Drawer
                    anchor="right"
                    open={showInactiveBar}
                    onClose={()=>setShowInactiveBar(false)}
                >
                    <div className="makeAdminInactive">
                        <div className="makeAdminInactiveTitleRow">
                            <div className="makeAdminInactiveTitleTexts">
                                <div className="makeAdminInactiveTitle">{currentAdminDetails.status=='active'?'Make In-active':'Make active'}</div>
                                <div className="confirmInactiveAdminText">
                                    Are you sure you want to make this admin as {currentAdminDetails.status=='active'?'In-active':'active'}?
                                </div>
                            </div>
                            <div className='closeInactiveButton' onClick={()=>setShowInactiveBar(false)}><CloseButton /></div>
                        </div>
                        <div>
                            <textarea placeholder="Please state reason" onChange={(e)=>setComments(e.target.value)} style={{width: '352px'}} className="adminInactiveReason" />
                        </div>
                        <div className="makeInactiveButton">
                            <PrimaryButton 
                                type='primary' 
                                label={currentAdminDetails.status=='active'?'Make In-active':'Make active'} 
                                onClick={()=>makeAdminInactive(adminid, currentAdminDetails.status=='active'?'inactive':'active', comments)} 
                                style={{width:'100%', background: '#E21E1E', border: '#E21E1E'}} 
                            />
                        </div>
                    </div>
                </Drawer>
          }
          {showDeleteConfirmation &&
                <Popup
                    title={"Are you sure to delete admin?"}
                    buttonText="Delete"
                    onButtonClick={()=>deleteAdmin(adminid)}
                    onClose={()=>setShowDeleteConfirmation(false)}
                />
          }
          {loading && <CenterFantasyLoader />}
        </>
    )
}

export const Admins = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { state: {userDetails: {userRole}}} = location;
    const [showStatusUpdate, setShowStatusUpdate] = useState('');
    const [adminDetails, setAdminDetails] = useState({profiles: [], count: {total:0, active:0}});
    const [adminApiDetails, setAdminApiDetails] = useState({profiles: [], count: {total:0, active:0}});
    const [searchValue, setSearchValue] = useState('');
    const [sortValue, setSortValue] = useState('None');
    const [sortOrder, setSortOrder] = useState('None');
    const [sortedLabel, setSortedLabel] = useState('None');
    const [statusFilter, setStatusFilter] = useState('');
    const [statusFilterLabel, setStatusFilterLabel] = useState('');
    const [franchiseFilterValue, setFranchiseFilterValue] = useState('');
    const [franchiseFilterLabel, setFranchiseFilterLabel] = useState('');
    const [createdDateFilterValue, setCreatedDateFilterValue] = useState('');
    const [cityFilterValues, setCityFilterValues] = useState([]);
    const [stateFilterValues, setStateFilterValues] = useState([]);
    const [loading, setLoading] = useState(true);

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

    const franchiseFilters = {
        type: 'singleValue',
        label: 'Franchise',
        currentValue: franchiseFilterValue,
        currentLabel: franchiseFilterLabel,
        options: [...new Set((adminApiDetails.profiles ?? []).map(admin => admin.franchise))].map(fr => ({label:fr, value: fr})),
        onChange: (value) => {
            setFranchiseFilterValue(value)
            setFranchiseFilterLabel(value)
        },
        clearFilter: () => {
            setFranchiseFilterValue('')
            setFranchiseFilterLabel('')
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
        options: [...new Set((adminApiDetails.profiles??[]).map(p => p.city))],
        onChange: setCityFilterValues,
        clearFilterValue: (value) => {
            setCityFilterValues(vals => vals.filter(val => val !== value))
        }
    }

    const stateFilters = {
        type: 'multiValue',
        label: 'State',
        currentValues: stateFilterValues,
        options: [...new Set((adminApiDetails.profiles??[]).map(p => p.state))],
        onChange: setStateFilterValues,
        clearFilterValue: (value) => {
            setStateFilterValues(vals => vals.filter(val => val !== value))
        }
    }

    const fetchAdminDetails = () => {
        setLoading(true)
        fetch(process.env.REACT_APP_USER_API_URL, {
            method: 'GET',
            headers: {
                'x-channel': 'admin',
                'auth-token': localStorage.getItem('token'),   
            }
        })
        .then(resp => {
            if(resp.status==200) {
                resp.json().then( data => {
                    setAdminDetails({...data, profiles: data.profiles.filter(p => p.status !== 'Archived')})
                    setAdminApiDetails({...data, profiles: data.profiles.filter(p => p.status !== 'Archived')})
                    console.log('franchise filters options after mapping', franchiseFilters.options)
                    setLoading(false)
                })
            } else {
                setAdminDetails({profiles:[], count: {total:0, active: 0}})
                setAdminApiDetails({profiles:[], count: {total:0, active: 0}})
                setLoading(false)
            }
        })
        .catch(() => {
            setAdminDetails({profiles:[], count: {total:0, active: 0}})
            setAdminApiDetails({profiles:[], count: {total:0, active: 0}})
            setLoading(false)
        })
    }

    useEffect(fetchAdminDetails, [])

    useEffect(() => {
        if(!loading) {
            console.log('calendar filter value', createdDateFilterValue)
            const profiles = adminApiDetails.profiles
            const nameSorter = (p1, p2) => (sortOrder === 'dsc'?-1:1) * p1.name.toLowerCase().localeCompare(p2.name.toLowerCase())
            const createdDateSorter = (p1, p2) => {
                if(p1.createTime<p2.createTime) return (sortOrder === 'dsc'?-1:1) * -1
                if(p1.createTime===p2.createTime) return (sortOrder === 'dsc'?-1:1) * 0
                return (sortOrder === 'dsc'?-1:1) * 1
            }
            const statusSorter = (p1, p2) => (sortOrder === 'dsc'?-1:1) * p1.status.toLowerCase().localeCompare(p2.status.toLowerCase())
            let filteredProfiles = profiles.filter((admin) => 
                admin.name.toLowerCase().includes(searchValue.toLowerCase()) || admin.userName.toLowerCase().includes(searchValue.toLowerCase()) || admin.phoneNumber.includes(searchValue)
            )
            if(statusFilter !== '')
                filteredProfiles = filteredProfiles.filter(p=> p.status === statusFilter)
            if(franchiseFilterValue !== '')
                filteredProfiles = filteredProfiles.filter(p=>p.franchise === franchiseFilterValue)
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
            else if(sortValue === 'createdDate')
                sortedProfiles = filteredProfiles.sort(createdDateSorter)
            if(sortValue === 'status')
                sortedProfiles = filteredProfiles.sort(statusSorter)
            setAdminDetails({
                profiles: sortedProfiles,
                count: adminApiDetails.count
            })
        }
    }, [adminApiDetails, loading , searchValue, sortValue, sortOrder, statusFilter, franchiseFilterValue, createdDateFilterValue, cityFilterValues, stateFilterValues])

    return (<>{loading?
    <CenterFantasyLoader />
    : <div className="adminsPage">
        <div className="adminsTitleRow">
            <div className="adminsTitle">
                Admins
            </div>
            <div className="adminsStatsButton">
                <div className="adminStats">
                    <div className="adminCount">{adminDetails.count.total}</div>
                    <div className="statLabel">Total admins</div>
                </div>
                <div className="adminStats">
                    <div className="adminCount">{adminDetails.count.active}</div>
                    <div className="statLabel">Active admins</div>
                </div>
                <div className="addAdminButton" style={{display: 'flex',
'justify-content': 'flex-end',
'align-items': 'flex-end'}}>
                    <PrimaryButton label="Add admin" type="primary" onClick={
                        ()=>navigate('/home/admins/add', 
                            {...location, state: {...location.state, editAdminFlag: false, currentAdminDetails: {}}})
                        } />
                </div>
            </div>
        </div>

        <FilterBar 
            onSearchValueChange={setSearchValue} 
            sortOptions={sortOptions} 
            sortedLabel={sortedLabel} 
            clearSort={clearSort}
            filters={[statusFilters, franchiseFilters, cityFilters, stateFilters]}
        />

        <div className="adminsData">
            <div className="adminsDataRow dataTitleRow">
                <Grid container spacing={2}>
                    <Grid item lg={2}>
                        Name
                    </Grid>
                    <Grid item lg={2}>
                        Username
                    </Grid>
                    <Grid item lg={1}>
                        Franchise
                    </Grid>
                    <Grid item lg={2} style={{'white-space':'pre-wrap'}}>
                        Phone number
                    </Grid>
                    <Grid item lg={2}>
                        Location
                    </Grid>
                    <Grid item lg={2} style={{'white-space':'pre-wrap'}}>
                        Staff & Agents
                    </Grid>
                    <Grid item lg={1}>
                        Status
                    </Grid>
                </Grid>
            </div>
            {adminDetails.profiles.map((admin, key, list) => (
                <div className={`adminsDataRow ${key==(list.length-1)?'dataLastRow':''}`} key={key}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item lg={2} style={{'white-space':'pre-wrap'}}>
                            {admin.profile_pic != undefined && admin.profile_pic != "" && <img src={admin.profile_pic} className="miniProfilePic"/>}
                            {(admin.profile_pic == undefined || admin.profile_pic == "") && <ProfileIcon />}
                            {admin.name}
                        </Grid>
                        <Grid item lg={2} style={{'white-space':'pre-wrap'}}>
                            {admin.userName}
                        </Grid>
                        <Grid item lg={1} style={{'white-space':'pre-wrap'}}>
                            {admin.franchise}
                        </Grid>
                        <Grid item lg={2} style={{'white-space':'pre-wrap'}}>
                            {convertToUIMobileNumber(admin.phoneNumber)}
                        </Grid>
                        <Grid item lg={2} style={{'white-space':'pre-wrap'}}>
                            {admin.city}, {admin.state}
                        </Grid>
                        <Grid item lg={2} className="adminStaffDataCount" style={{'white-space':'pre-wrap'}} onClick={
                                ()=>navigate('/home/admins/staff', {...location, state:{...location.state, adminid:admin.userName, adminName:admin.name}})
                            }>
                            {admin['staff_agent']}
                        </Grid>
                        <Grid item lg={1}>
                            <div className="adminStatusCol">
                                <div className={`adminStatusText ${admin.status=='active'?'statusTextActive':'statusTextInactive'}`}>
                                    {admin.status=='active'?'Active':'In-Active'}
                                </div>
                                {admin.comments && <div className="adminStatusComments">
                                    {admin.comments??''}
                                </div>}
                                <MoreOptionsButton adminid={admin.userName} adminName={admin.name} currentAdminDetails={admin} triggerRefresh={()=>{fetchAdminDetails()}} userRole={admin.userRole} displayAlert={(msg) => {
                                    setShowStatusUpdate(msg)
                                    setTimeout(() => setShowStatusUpdate(''), 5000)
                                }} />
                            </div>
                        </Grid>
                    </Grid>
                </div>
            ))}
        </div>
    </div>}
    {showStatusUpdate && 
            <Alert 
                message={showStatusUpdate}
                style={{position:'fixed', left:'24px', bottom:'16px'}} 
                onClick={()=>setShowStatusUpdate('')}
            />
          }
    </>)
}