import './AgentManagement.css'
import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CircularProgress, Grid } from '@mui/material';
import { PrimaryButton } from "../../elements/button/Button";
import { Drawer } from "@mui/material";
import { ReactComponent as CloseButton } from '../../resources/close-button.svg'
import {DataTable} from '../../elements/dataTable/DataTable'
import {ReactComponent as MoreOptions} from '../../resources/more_options.svg'
import { OverlayOptions } from "../../elements/overlayOptions/OverlayOptions";
import { Alert } from '../../elements/alert/Alert';
import { Popup } from "../../elements/popup/Popup";
import { capitalizeFirstLetter, convertToUIMobileNumber } from '../../util/stringUtils';
import {ReactComponent as ProfileIcon} from '../../resources/top nav bar/profile.svg'
import { TextInput } from '../../elements/textInput/TextInput'
import { FilterBar } from "../FilterBar/FilterBar";
import { CenterFantasyLoader } from '../../elements/fantasyLotoLoader/FantasyLotoLoader';
import { superAdminRole } from '../../util/constants';
import { deleteUser } from '../../api/deleteUser';

const Name = ({ agentName, profilePic }) => <>
    {(profilePic == undefined || profilePic == null || profilePic == "") && <ProfileIcon />}
    {(profilePic != undefined && profilePic != null && profilePic != "") && <img class="miniProfilePic"src={profilePic}/>}
    {capitalizeFirstLetter(agentName)}
</>

const MoreOptionsButton = ({agentid, agentName, agentDetails, triggerRefresh, displayAlert}) => {
    const [showOptions, setShowOptions] = useState(false);
    const [showInactiveBar, setShowInactiveBar] = useState(false);
    const [showDeleteConfirmation, setShowDeleteConfirmation]= useState(false);
    const [comments, setComments] = useState();
    const [loading, setLoading] = useState(false);
    const moreOptionsRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();

    const makeAgentInactive = (agentid, newStatus, comments) => {
        console.log('making agent inactive')
        setLoading(true)
        fetch(process.env.REACT_APP_USER_API_URL, {
            method: 'PUT',
            headers: {
                'x-channel':'status',
                'x-role': agentDetails.userRole,
                'auth-token': localStorage.getItem('token'),
            },
            body: JSON.stringify({userName: agentid, status: newStatus, comments})
        })
        .then((resp) => {
            setLoading(false)
            if(resp.status==200) {
                console.log('update status successful')
                setShowInactiveBar(false)
                triggerRefresh()
                displayAlert(`Agent ${agentDetails.status=='active'?'In-activated':'activated'} successfully`)
            } else {
                console.log('update status failed', resp.status)
            }
        })
        .catch((err)=> {
            setLoading(false)
            console.log('status update api error', err)
        })
    }

    const deleteAgent = (agentid) => {

        const onDeleteSuccess = () => {
            setShowDeleteConfirmation(false)
            displayAlert(`Agent deleted successfully`)
            triggerRefresh()
        }

        deleteUser(agentid, agentDetails.userRole, setLoading, onDeleteSuccess)
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
            <div className="agentMoreOptions" onClick={()=>setShowOptions(currentState=>!currentState)}  ref={moreOptionsRef}>
                <MoreOptions />
                {showOptions && 
                    <OverlayOptions options={[
                        {
                            label: 'Edit',
                            onClick: ()=>navigate('/home/agent/add', 
                                {...location, state: {...location.state, editAgentFlag: true, agentDetails}})
                        },
                        {
                            label: agentDetails.status=='active'?'Make In-active':'Make active',
                            onClick: ()=>{
                                setShowOptions(false)
                                setShowInactiveBar(true)
                            }
                        },
                        {
                            label: 'Delete',
                            onClick: ()=>{
                                setShowOptions(false)
                                setShowDeleteConfirmation(true)
                            }
                        }
                    ]} />
                }
                {showInactiveBar && 
                    <Drawer
                        anchor="right"
                        open={showInactiveBar}
                        onClose={()=>setShowInactiveBar(false)}
                    >
                        <div className="makeAgentInactive">
                            <div className="makeAgentInactiveTitleRow">
                                <div className="makeAgentInactiveTitleTexts">
                                    <div className="makeAgentInactiveTitle">{agentDetails.status=='active'?'Make In-active':'Make active'}</div>
                                    <div className="confirmInactiveAgentText">
                                        Are you sure you want to make this agent as {agentDetails.status=='active'?'In-active':'active'}?
                                    </div>
                                </div>
                                <div className='closeInactiveButton' onClick={()=>setShowInactiveBar(false)}><CloseButton /></div>
                            </div>
                            <div>
                                <textarea placeholder="Please state reason" onChange={(e)=>setComments(e.target.value)} style={{width: '352px'}} className="agentInactiveReason" />
                            </div>
                            <div className="makeInactiveButton">
                                <PrimaryButton 
                                    type="teritary" 
                                    label={agentDetails.status=='active'?'Make In-active':'Make active'} 
                                    onClick={()=>makeAgentInactive(agentid, agentDetails.status=='active'?'inactive':'active', comments)} 
                                    style={{width:'100%'}} 
                                />
                            </div>
                        </div>
                    </Drawer>
                }
                {showDeleteConfirmation &&
                    <Popup
                        title={"Are you sure to delete agent?"}
                        buttonText="Delete"
                        onButtonClick={()=>deleteAgent(agentid)}
                        onClose={()=>setShowDeleteConfirmation(false)}
                    />
                }
                {loading && <CenterFantasyLoader />}
            </div>
        </>
    )
}

const Status = ({status, userRole, agentid, agentName, agentDetails, triggerRefresh, displayAlert}) => 
    <div className='agentStatusMoreOptions'>
        <div className='agentStatusCommentsParent'>
            <div className={`agentStatusText ${status=='active'?'agentStatusTextActive':'agentStatusTextInactive'}`}>
                {status=='active'?'Active':'In-Active'}
            </div>
            {agentDetails.comments && <div className="agentStatusComments">
                                        {agentDetails.comments??''}
                                    </div>}
        </div>
        {userRole!=superAdminRole && <MoreOptionsButton agentid={agentid} agentName={agentName} agentDetails={agentDetails} triggerRefresh={triggerRefresh} displayAlert={displayAlert} />}
    </div>

export const AgentManagement = () => {

    const location = useLocation();
    const navigate = useNavigate();
    const { state: {userDetails}} = location;
    const {userRole} = userDetails;
    const [agentDetails, setAgentDetails] = useState({profiles: [], count: {total:0, active: 0}});
    const [agentApiDetails, setAgentApiDetails] = useState({profiles: [], count: {total:0, active: 0}});
    const [searchValue, setSearchValue] = useState('');
    const [sortValue, setSortValue] = useState('None');
    const [sortOrder, setSortOrder] = useState('None');
    const [sortedLabel, setSortedLabel] = useState('None');
    const [statusFilter, setStatusFilter] = useState('');
    const [statusFilterLabel, setStatusFilterLabel] = useState('');
    const [franchiseFilterValue, setFranchiseFilterValue] = useState('');
    const [franchiseFilterLabel, setFranchiseFilterLabel] = useState('');
    const [createdDateFilterValue, setCreatedDateFilterValue] = useState('');
    const [adminNameFilterValues, setAdminNameFilterValues] = useState([]);
    const [cityFilterValues, setCityFilterValues] = useState([]);
    const [stateFilterValues, setStateFilterValues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showStatusUpdate, setShowStatusUpdate] = useState('');

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
        options: [...new Set((agentApiDetails.profiles ?? []).map(admin => admin.franchise))].map(fr => ({label:fr, value: fr})),
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

    const adminNameFilters = {
        type: 'multiValue',
        label: 'Admin name',
        currentValues: adminNameFilterValues,
        options: [...new Set((agentApiDetails.profiles??[]).map(p => p.managerName))],
        onChange: setAdminNameFilterValues,
        clearFilterValue: (value) => {
            setAdminNameFilterValues(vals => vals.filter(val => val !== value))
        }
    }

    const cityFilters = {
        type: 'multiValue',
        label: 'City',
        currentValues: cityFilterValues,
        options: [...new Set((agentApiDetails.profiles??[]).map(p => p.city))],
        onChange: setCityFilterValues,
        clearFilterValue: (value) => {
            setCityFilterValues(vals => vals.filter(val => val !== value))
        }
    }

    const stateFilters = {
        type: 'multiValue',
        label: 'State',
        currentValues: stateFilterValues,
        options: [...new Set((agentApiDetails.profiles??[]).map(p => p.state))],
        onChange: setStateFilterValues,
        clearFilterValue: (value) => {
            setStateFilterValues(vals => vals.filter(val => val !== value))
        }
    }

    const fetchAgentDetails = () => {
        setLoading(true)
        const url = process.env.REACT_APP_USER_API_URL + (userRole == superAdminRole? '':'?'+new URLSearchParams({
            adminid: userDetails.userRole==='admin'?userDetails.userName:userDetails.managerID
        }))
        
        fetch(url, {
            method: 'GET',
            headers: {
                'x-channel': 'agent',
                'auth-token': localStorage.getItem('token'),
            }
        })
        .then(resp => {
            if(resp.status ==200) {
                resp.json().then(data => {
                    setAgentApiDetails({...data, profiles: data.profiles?.filter(p => p.status !== 'Archived')});
                    setAgentDetails({...data, profiles: data.profiles?.filter(p => p.status !== 'Archived')})
                    setLoading(false)
                })
            } else {
                setAgentApiDetails({profiles:[], count: {total: 0, active: 0}})
                setAgentDetails({profiles:[], count: {total: 0, active: 0}})
                setLoading(false)
            }
        })
        .catch(() => {
            setAgentDetails({profiles:[], count: {total: 0, active: 0}})
            setLoading(false)
        })
    }

    const triggerRefresh = () => {
        fetchAgentDetails()
    }

    useEffect(fetchAgentDetails, [userDetails])

    const displayAlert = (msg) => {
        setShowStatusUpdate(msg)
        setTimeout(() => setShowStatusUpdate(''), 5000)
    }

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

    useEffect(() => {
        if(!loading) {
            const profiles = agentApiDetails.profiles ?? []
            const nameSorter = (p1, p2) => (sortOrder === 'dsc'?-1:1) * p1.name.toLowerCase().localeCompare(p2.name.toLowerCase())
            const createdDateSorter = (p1, p2) => {
                if(p1.createTime<p2.createTime) return (sortOrder === 'dsc'?-1:1) * -1
                if(p1.createTime===p2.createTime) return (sortOrder === 'dsc'?-1:1) * 0
                return (sortOrder === 'dsc'?-1:1) * 1
            }
            const statusSorter = (p1, p2) => (sortOrder === 'dsc'?-1:1) * p1.status.toLowerCase().localeCompare(p2.status.toLowerCase())
            let filteredProfiles = profiles.filter((agent) => 
                agent.name.toLowerCase().includes(searchValue.toLowerCase()) || agent.userName.toLowerCase().includes(searchValue.toLowerCase()) || agent.phoneNumber.includes(searchValue)
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
            if(adminNameFilterValues.length !== 0) {
                filteredProfiles = filteredProfiles.filter(p => adminNameFilterValues.includes(p.managerName))
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
            setAgentDetails({
                profiles: sortedProfiles,
                count: agentApiDetails.count
            })
        }
    }, [agentApiDetails, loading, searchValue, sortValue, sortOrder, statusFilter, franchiseFilterValue, createdDateFilterValue, adminNameFilterValues, cityFilterValues, stateFilterValues])

    const allFilters = userRole === superAdminRole? [statusFilters, adminNameFilters, franchiseFilters, cityFilters, stateFilters] : [statusFilters, cityFilters, stateFilters]

    const agentColumnsSuperAdminProfile = [{
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
        gridColumns: 1,
        name: 'Franchise'
    },{
        gridColumns: 2,
        name: 'Location'
    },{
        gridColumns: 1,
        name: 'Admin'
    },{
        gridColumns: 1,
        name: 'Status',
        isReactElement: true
    }]

    const agentColumnsAdminProfile = [{
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
        name: 'Deposit status'
    },{
        gridColumns: 2,
        name: 'Status',
        isReactElement: true
    }]

    const mapToRowContent= (givenAgentDetails, userRole) => givenAgentDetails.map(agent => {
            
        if(userRole === superAdminRole)
            return [
                {
                    Element: Name,
                    props: {agentName: agent.name, profilePic: agent.profile_pic}
                },
                ...[agent.userName, convertToUIMobileNumber(agent.phoneNumber), agent.franchise, agent.city+', '+agent.state, agent.managerID].map(text => ({text})), {
                        Element: Status,
                        props: {status: agent.status, userRole, agentid: agent.userName, agentName: agent.name, agentDetails: agent, triggerRefresh, displayAlert}
                }
            ]
        return [
            {
                Element: Name,
                props: {agentName: agent.name, profilePic: agent.profile_pic}
            },
            ...[agent.userName, convertToUIMobileNumber(agent.phoneNumber), agent.city+', '+agent.state, agent.depositStatus??'Pending'].map(text => ({text})), {
                    Element: Status,
                    props: {status: agent.status, userRole, agentid: agent.userName, agentName: agent.name, agentDetails: agent, triggerRefresh, displayAlert}
            }
        ]
    })

    return (
        <>
            {loading?
    <CenterFantasyLoader />
    :
                <div className="agentPage">
                    <div className="agentTitleRow">
                        <div className="agentTitle">
                            Agents
                        </div>
                        <div className='agentStatsButton'>
                            <div className="agentStats">
                                <div className="agentCount">{agentDetails.count.total}</div>
                                <div className="statLabel">Total agent</div>
                            </div>
                            <div className="agentStats">
                                <div className="agentCount">{agentDetails.count.active}</div>
                                <div className="statLabel">Active agent</div>
                            </div>
                            {userRole!=superAdminRole && 
                                <div className="addAgentButton" style={{display: 'flex',
                                        'justify-content': 'flex-end',
                                        'align-items': 'flex-end'}}>
                                    <PrimaryButton label="Add agent" type="primary" onClick={
                                        ()=>navigate('/home/agent/add', 
                                            {...location, state: {...location.state, editAgentFlag: false, agentDetails: {}, loggedUser: userDetails}})
                                        } />
                                </div>
                            }
                        </div>
                    </div>

                    <FilterBar 
                        onSearchValueChange={setSearchValue} 
                        sortOptions={sortOptions} 
                        sortedLabel={sortedLabel} 
                        clearSort={clearSort}
                        filters={allFilters}
                    />

                    <DataTable
                        spacing={2}
                        columnConfig={userRole===superAdminRole?agentColumnsSuperAdminProfile: agentColumnsAdminProfile}
                        rowContent={mapToRowContent((agentDetails.profiles ?? []), userRole)}
                    />
                </div>
            }
            {showStatusUpdate && 
                    <Alert 
                        message={showStatusUpdate}
                        style={{position:'fixed', left:'24px', bottom:'16px'}} 
                        onClick={()=>setShowStatusUpdate('')}
                    />
                }
        </>
    )
}