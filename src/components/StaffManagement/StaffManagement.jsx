import './StaffManagement.css';
import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { PrimaryButton } from "../../elements/button/Button";
import { Drawer } from "@mui/material";
import { ReactComponent as CloseButton } from '../../resources/close-button.svg';
import { DataTable } from '../../elements/dataTable/DataTable';
import { ReactComponent as MoreOptions } from '../../resources/more_options.svg';
import { OverlayOptions } from "../../elements/overlayOptions/OverlayOptions";
import { Alert } from '../../elements/alert/Alert';
import { Popup } from "../../elements/popup/Popup";
import { capitalizeFirstLetter, convertToUIMobileNumber } from '../../util/stringUtils';
import { ReactComponent as ProfileIcon } from '../../resources/top nav bar/profile.svg';
import { FilterBar } from "../FilterBar/FilterBar";
import { CenterFantasyLoader } from '../../elements/fantasyLotoLoader/FantasyLotoLoader';
import { superAdminRole } from '../../util/constants';
import { deleteUser } from '../../api/deleteUser';

const Name = ({ staffName, profilePic }) => <>
    {(profilePic == undefined || profilePic == null || profilePic == "") && <ProfileIcon />}
    {(profilePic != undefined && profilePic != null && profilePic != "") && <img class="miniProfilePic"src={profilePic}/>}
    {capitalizeFirstLetter(staffName)}
</>

const MoreOptionsButton = ({staffid, staffName, staffDetails, triggerRefresh, displayAlert}) => {
    const [showOptions, setShowOptions] = useState(false);
    const [showInactiveBar, setShowInactiveBar] = useState(false);
    const [showStatusUpdate, setShowStatusUpdate] = useState('');
    const [showDeleteConfirmation, setShowDeleteConfirmation]= useState(false);
    const [comments, setComments] = useState();
    const [loading, setLoading] = useState(false)
    const moreOptionsRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();

    const makeStaffInactive = (staffid, newStatus, comments) => {
        console.log('making staff inactive')
        setLoading(true)
        fetch(process.env.REACT_APP_USER_API_URL, {
            method: 'PUT',
            headers: {
                'x-channel':'status',
                'x-role': staffDetails.userRole,
                'auth-token': localStorage.getItem('token'),
            },
            body: JSON.stringify({userName: staffid, status: newStatus, comments})
        })
        .then((resp) => {
            if(resp.status==200) {
                console.log('update status successful')
                setShowInactiveBar(false)
                displayAlert(`Staff ${staffDetails.status=='active'?'In-activated':'activated'} successfully`)
                triggerRefresh()
            } else {
                console.log('update status failed', resp.status)
            }
            setLoading(false)
        })
        .catch((err)=> {
            setLoading(false)
            console.log('status update api error', err)
        })
    }

    const deleteStaff = (staffid) => {

        const onDeleteSuccess = () => {
            setShowDeleteConfirmation(false)
            displayAlert(`Staff deleted successfully`)
            triggerRefresh()
        }

        deleteUser(staffid, staffDetails.userRole, setLoading, onDeleteSuccess)
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
            <div className="staffMoreOptions" onClick={()=>setShowOptions(currentState=>!currentState)} ref={moreOptionsRef}>
                <MoreOptions />
                {showOptions && 
                    <OverlayOptions options={[
                        {
                            label: 'Edit',
                            onClick: ()=>navigate('/home/staff/add', 
                                {...location, state: {...location.state, editStaffFlag: true, staffDetails}})
                        },
                        {
                            label: staffDetails.status=='active'?'Make In-active':'Make active',
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
                        <div className="makeStaffInactive">
                            <div className="makeStaffInactiveTitleRow">
                                <div className="makeStaffInactiveTitleTexts">
                                    <div className="makeStaffInactiveTitle">{staffDetails.status=='active'?'Make In-active':'Make active'}</div>
                                    <div className="confirmInactiveStaffText">
                                        Are you sure you want to make this staff as {staffDetails.status=='active'?'In-active':'active'}?
                                    </div>
                                </div>
                                <div className='closeInactiveButton' onClick={()=>setShowInactiveBar(false)}><CloseButton /></div>
                            </div>
                            <div>
                                <textarea placeholder="Please state reason" onChange={(e)=>setComments(e.target.value)} style={{width: '352px'}} className="staffInactiveReason" />
                            </div>
                            <div className="makeInactiveButton">
                                <PrimaryButton 
                                    type="teritary" 
                                    label={staffDetails.status=='active'?'Make In-active':'Make active'} 
                                    onClick={()=>makeStaffInactive(staffid, staffDetails.status=='active'?'inactive':'active', comments)} 
                                    style={{width:'100%'}} 
                                />
                            </div>
                        </div>
                    </Drawer>
                }
                {showDeleteConfirmation &&
                    <Popup
                        title={"Are you sure to delete staff?"}
                        buttonText="Delete"
                        onButtonClick={()=>deleteStaff(staffid)}
                        onClose={()=>setShowDeleteConfirmation(false)}
                    />
                }
                {loading && <CenterFantasyLoader />}
            </div>
        </>
    )
}

const Status = ({status, userRole, staffid, staffName, staffDetails, triggerRefresh, displayAlert}) => 
    <div className='staffStatusMoreOptions'>
        <div className='staffStatusCommentsParent'>
            <div className={`staffStatusText ${status=='active'?'staffStatusTextActive':'staffStatusTextInactive'}`}>
                {status=='active'?'Active':'In-Active'}
            </div>
            {staffDetails.comments && <div className="staffStatusComments">
                                        {staffDetails.comments??''}
                                    </div>}
        </div>
        {userRole!=superAdminRole && <MoreOptionsButton staffid={staffid} staffName={staffName} staffDetails={staffDetails} triggerRefresh={triggerRefresh} displayAlert={displayAlert} />}
    </div>

export const StaffManagement = () => {

    const location = useLocation();
    const navigate = useNavigate();
    const { state: {userDetails}} = location;
    const {userRole} = userDetails;
    const [staffDetails, setStaffDetails] = useState({profiles: [], count: {total: 0, active: 0}});
    const [staffApiDetails, setStaffApiDetails] = useState({profiles: [], count: {total: 0, active: 0}});
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
        options: [...new Set((staffApiDetails.profiles ?? []).map(admin => admin.franchise))].map(fr => ({label:fr, value: fr})),
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
        options: [...new Set((staffApiDetails.profiles??[]).map(p => p.managerName))],
        onChange: setAdminNameFilterValues,
        clearFilterValue: (value) => {
            setAdminNameFilterValues(vals => vals.filter(val => val !== value))
        }
    }

    const cityFilters = {
        type: 'multiValue',
        label: 'City',
        currentValues: cityFilterValues,
        options: [...new Set((staffApiDetails.profiles??[]).map(p => p.city))],
        onChange: setCityFilterValues,
        clearFilterValue: (value) => {
            setCityFilterValues(vals => vals.filter(val => val !== value))
        }
    }

    const stateFilters = {
        type: 'multiValue',
        label: 'State',
        currentValues: stateFilterValues,
        options: [...new Set((staffApiDetails.profiles??[]).map(p => p.state))],
        onChange: setStateFilterValues,
        clearFilterValue: (value) => {
            setStateFilterValues(vals => vals.filter(val => val !== value))
        }
    }

    const fetchStaffDetails = () => {
        const url = process.env.REACT_APP_USER_API_URL + (userRole == superAdminRole? '':'?'+new URLSearchParams({
            adminid: userDetails.userName
        }))
        setLoading(true)
        fetch(url, {
            method: 'GET',
            headers: {
                'x-channel': 'staff',
                'auth-token': localStorage.getItem('token'),
            }
        })
        .then(resp => {
            if(resp.status ==200) {
                resp.json().then(data => {
                    setStaffApiDetails({...data, profiles: data.profiles?.filter(p => p.status !== 'Archived')})
                    setStaffDetails({...data, profiles: data.profiles?.filter(p => p.status !== 'Archived')})
                    setLoading(false)
                })
            } else {
                setStaffApiDetails({profiles:[], count: {total: 0, active: 0}})
                setStaffDetails({profiles:[], count: {total: 0, active: 0}})
                setLoading(false)
            }
        })
        .catch(() => {
            setStaffApiDetails({profiles:[], count: {total: 0, active: 0}})
            setStaffDetails({profiles:[], count: {total: 0, active: 0}})
            setLoading(false)
        })
    }

    const triggerRefresh = () => {
        fetchStaffDetails()
    }

    useEffect(fetchStaffDetails, [userDetails])

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
        if(!loading) {
            const profiles = staffApiDetails.profiles
            const nameSorter = (p1, p2) => (sortOrder === 'dsc'?-1:1) * p1.name.toLowerCase().localeCompare(p2.name.toLowerCase())
            const roleSorter = (p1, p2) => (sortOrder === 'dsc'?-1:1) * p1.userRole.toLowerCase().localeCompare(p2.userRole.toLowerCase())
            const createdDateSorter = (p1, p2) => {
                if(p1.createTime<p2.createTime) return (sortOrder === 'dsc'?-1:1) * -1
                if(p1.createTime===p2.createTime) return (sortOrder === 'dsc'?-1:1) * 0
                return (sortOrder === 'dsc'?-1:1) * 1
            }
            const statusSorter = (p1, p2) => (sortOrder === 'dsc'?-1:1) * p1.status.toLowerCase().localeCompare(p2.status.toLowerCase())
            let filteredProfiles = (profiles ?? []).filter((staff) => 
                staff.name.toLowerCase().includes(searchValue.toLowerCase()) || staff.userName.toLowerCase().includes(searchValue.toLowerCase()) || staff.phoneNumber.includes(searchValue)
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
    }, [staffApiDetails, loading, searchValue, sortValue, sortOrder, statusFilter, franchiseFilterValue, createdDateFilterValue, adminNameFilterValues, cityFilterValues, stateFilterValues])

    const allFilters = userRole === superAdminRole? [statusFilters, adminNameFilters, franchiseFilters, cityFilters, stateFilters] : [statusFilters, cityFilters, stateFilters]

    const staffColumnsSuperAdminProfile = [{
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
        name: 'Role'
    },{
        gridColumns: 1,
        name: 'Status',
        isReactElement: true
    }]

    const staffColumnsAdminProfile = [{
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
        name: 'User Role'
    },{
        gridColumns: 2,
        name: 'Status',
        isReactElement: true
    }]

    const mapToRowContent= (givenStaffDetails, userRole) => givenStaffDetails.map(staff => {
            
        if(userRole === superAdminRole)
            return [
                {
                    Element: Name,
                    props: {staffName: staff.name, profilePic: staff.profile_pic}
                },
                ...[staff.userName, convertToUIMobileNumber(staff.phoneNumber),staff.franchise, staff.city+', '+staff.state, staff.managerID, capitalizeFirstLetter(staff.userRole)].map(text => ({text})), {
                        Element: Status,
                        props: {status: staff.status, userRole, staffid: staff.userName, staffName: staff.name, staffDetails: staff, triggerRefresh, displayAlert}
                }
            ]
        return [
            {
                Element: Name,
                props: {staffName: staff.name, profilePic: staff.profile_pic}
            },
            ...[staff.userName, convertToUIMobileNumber(staff.phoneNumber), staff.city+', '+staff.state, capitalizeFirstLetter(staff.userRole)].map(text => ({text})), {
                    Element: Status,
                    props: {status: staff.status, userRole, staffid: staff.userName, staffName: staff.name, staffDetails: staff, triggerRefresh, displayAlert}
            }
        ]
    })


    return (
        <>
            {loading?
    <CenterFantasyLoader />
    : 
                <div className="staffPage">
                    <div className="staffTitleRow">
                        <div className="staffTitle">
                            Staff
                        </div>
                        <div className='staffStatsButton'>
                            <div className="staffStats">
                                <div className="staffCount">{staffDetails.count.total}</div>
                                <div className="statLabel">Total staff</div>
                            </div>
                            <div className="staffStats">
                                <div className="staffCount">{staffDetails.count.active}</div>
                                <div className="statLabel">Active staff</div>
                            </div>
                            {userRole!=superAdminRole && 
                                <div className="addStaffButton" style={{display: 'flex',
                                        'justify-content': 'flex-end',
                                        'align-items': 'flex-end'}}>
                                    <PrimaryButton label="Add staff" type="primary" onClick={
                                        ()=>navigate('/home/staff/add', 
                                            {...location, state: {...location.state, editStaffFlag: false, staffDetails: {}}})
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
                        columnConfig={userRole===superAdminRole?staffColumnsSuperAdminProfile: staffColumnsAdminProfile}
                        rowContent={mapToRowContent(staffDetails.profiles ?? [], userRole)}
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