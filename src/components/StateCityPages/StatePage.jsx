import React, { useEffect, useState, useRef } from 'react'

import { OverlayOptions } from "../../elements/overlayOptions/OverlayOptions";
import {ReactComponent as MoreOptions} from '../../resources/more_options.svg'
import { Popup } from '../../elements/popup/Popup';

import './StatePage.css'
import {ReactComponent as BackArrow} from '../../resources/back_arrow.svg'

import { DataTable } from '../../elements/dataTable/DataTable';
import { PrimaryButton } from '../../elements/button/Button';
import { FilterBar } from '../FilterBar/FilterBar';

import { Drawer } from "@mui/material";
import { useNavigate, useLocation } from 'react-router-dom';
import AddState from './AddState/AddState';
import EditState from './EditState/EditState';
import { convertToUIDate } from '../../util/dateUtils';
import { Alert } from '../../elements/alert/Alert';
import { ErrorAlert } from '../../elements/alert/ErrorAlert';

import { CenterFantasyLoader } from '../../elements/fantasyLotoLoader/FantasyLotoLoader';

import { superAdminRole, adminRole } from '../../util/constants';
import { useClickOutHandler } from '../../hooks/useClickOutHandler';


const MoreOptionsButton = ({state, idx, onEditClick, reload, setReload, username}) => {
  const [showOptions, setShowOptions] = useState(false)
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const [showStatusUpdate, setShowStatusUpdate] = useState('');
  const moreOptionsRef = useRef();
  useClickOutHandler(moreOptionsRef, ()=>setShowOptions(false))
  const [errorStatus, setErrorStatus] = useState(false)

  
  const handleDeleteConfirm = () => {
    setErrorStatus(false)
    fetch(process.env.REACT_APP_STATE_CITY_API_HOST + '/states', {
      method: 'DELETE',
      headers: {
        'x-username': username,
        'auth-token': localStorage.getItem('token'),
      },
      body: JSON.stringify({
          id: state.id
      })
  }).then((resp) => {
      if (resp.status == 200) {
          setShowStatusUpdate("State has been deleted")
          setReload(!reload)
          setTimeout(() => {
              setShowStatusUpdate('')
          }, 5000)
      }
      else {
        setErrorStatus(true)
        resp.json().then(data => {
          if (data?.description.includes("Cannot delete or update a parent row"))
            setShowStatusUpdate("Unable to delete the state, since it is \n already linked with several cities")
          else
            setShowStatusUpdate("Unable to delete state")
          
          setTimeout(() => {
              setShowStatusUpdate('')
          }, 2000)
        })
        .catch((e) => setShowStatusUpdate("Unable to delete state"))
      }
  })
  .catch((err) => console.log(err))
  setShowDeleteConfirmation(false)
  }
  
  return (
    <>
      <div className='stateMoreOptions' onClick={() => setShowOptions(!showOptions)} ref={moreOptionsRef}>
        <MoreOptions />
      </div>
      {showOptions && 
      <div className='overlayContainer'>
        <OverlayOptions options={[
          {
              label: 'Edit',
              onClick: () => {
                setShowOptions(false)
                onEditClick(idx, state)
              }
          },
          {
              label: 'Delete',
              onClick: () => {
                setShowDeleteConfirmation(true)
                setShowOptions(false)
              }
          }
        ]} />
      </div>
      }
      {showDeleteConfirmation &&
        <Popup
          title={"Are you sure you want to delete this State?"}
          buttonText="Delete"
          onButtonClick={()=>handleDeleteConfirm()}
          onClose={()=>setShowDeleteConfirmation(false)}
        />
        }
        
        {(showStatusUpdate!='' && errorStatus) && 
        <ErrorAlert 
        message={showStatusUpdate}
        style={{position:'fixed', left:'24px', bottom:'16px'}} 
        onClick={()=>setShowStatusUpdate('')}
      />
        }
        {(showStatusUpdate!='' && !errorStatus) && 
        <Alert 
        message={showStatusUpdate}
        style={{position:'fixed', left:'24px', bottom:'16px'}} 
        onClick={()=>setShowStatusUpdate('')}
      />
      }
    </>
  )
}

const UpdatedAtField = ({updatedAt, index, history}) => {

  return (
    <div className='addedByParent'> 
      <div className='addedBy'>
        {updatedAt}
      </div>
      <div className='stateHistory'>
      {history.map((data, idx) => (
        <p className='history-element' key={idx}>{`${data.username} (${data.role}) @ ${data.timestamp}`}</p>
      ))}
      </div>
    </div>
  )
}

const StatePage = () => {

  const [showAddSection, setShowAddSection] = useState(false)
  const [showEditSection, setShowEditSection] = useState(false)

  const [editIndex, setEditIndex] = useState(null)
  const [editState, setEditState] = useState(null)

  const navigate = useNavigate()
  const location = useLocation()
  const userRole = location.state.userDetails.userRole;
  const showEditDelete = (userRole == adminRole || userRole == superAdminRole);

  const [loading, setLoading] = useState(false)
  const [reload, setReload] = useState(false)


  const [countryFilterValues, setCountryFilterValues] = useState([]);
  const [searchValue, setSearchValue] = useState('')
  const [sortValue, setSortValue] = useState('None');
  const [sortOrder, setSortOrder] = useState('None');
  const [sortedLabel, setSortedLabel] = useState('None')

  const [statesFinalDetails, setStatesFinalDetails] = useState({states: []})

  const [showStatusUpdate, setShowStatusUpdate] = useState('')


  const columnConfig = [
    {
      gridColumns: 4,
      name: "State"
    },
    {
      gridColumns: 4,
      name: "Country"
    },
    {
      gridColumns: 3,
      name: "Updated At",
      isReactElement: true
    },
  ]

  if (showEditDelete) {
    columnConfig.push(
      {
        gridColumns: 1,
        name: "",
        isReactElement: true
      },)
  }

  const [statesDetails, setStatesDetails] = useState([])

  const countryFilters = {
    type: 'multiValue',
    label: 'Country',
    currentValues: countryFilterValues,
    options: [...new Set(statesDetails.map(p => p.country))],
    onChange: setCountryFilterValues,
    clearFilterValue: (value) => {
        setCountryFilterValues(vals => vals.filter(val => val !== value))
    }
}

const sortOptions = [
  {
    label: 'Name (A-Z)',
    onClick: () => {
      setSortValue('name')
      setSortOrder('asc')
      setSortedLabel('Name (A-Z)')
    }
  },
  {
    label: 'Name (Z-A)',
    onClick: () => {
      setSortOrder('dsc')
      setSortValue('name')
      setSortedLabel('Name (Z-A)')
    }
  },
  {
    label: 'Country (A-Z)',
    onClick: () => {
      setSortValue('country')
      setSortOrder('asc')
      setSortedLabel('Country (A-Z)')
    }
  },
  {
    label: 'Country (Z-A)',
    onClick: () => {
      setSortOrder('dsc')
      setSortValue('country')
      setSortedLabel('Country (Z-A)')
    }
  },
]

const fetchStatesDetails = () => {
  setLoading(true)
  fetch(process.env.REACT_APP_STATE_CITY_API_HOST +'/states', {
    method: 'GET',
    headers: {
      'x-username': location.state.userDetails.userName,
      'auth-token': localStorage.getItem('token'),
    }
  } )
  .then(resp => {
    if (resp.status == 200) {
      resp.json().then(data => {
        setStatesDetails(data.map(item => {
          let timestamps = item.history.map(record => record.timestamp)
          console.log(item.history)
          return ({
          name: item.name,
          country: item.country,
          id: item.id,
          history: item.history.sort((a,b) => b.timestamp-a.timestamp).map(({username, role, timestamp}) =>
            ({
              username,
              role,
              timestamp: convertToUIDate(new Date(timestamp * 1000).toLocaleString('en-US', {timeZone: 'America/Nassau'}))
            })
          ),
          updatedAt: convertToUIDate(new Date(Math.max(...timestamps)*1000).toLocaleString('en-US', {timeZone: 'America/Nassau'}))
        })}))
      })
      setLoading(false)
    }
    else {
      console.log("in else")
    }
  })
  .catch((error) => {
    console.log(error)
  })
}

useEffect(fetchStatesDetails, [reload])

  useEffect(() => {
    if (!loading) {

      const nameSorter = (p1, p2) => (sortOrder === 'dsc'?-1:1) * p1.name.toLowerCase().localeCompare(p2.name.toLowerCase())
      const countrySorter = (p1, p2) => (sortOrder === 'dsc'?-1:1) * p1.country.toLowerCase().localeCompare(p2.country.toLowerCase())

      let filteredStates = statesDetails.filter((state) => 
        state.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        state.country.toLowerCase().includes(searchValue.toLowerCase())
      )

      if(countryFilterValues.length !== 0) {
        filteredStates = filteredStates.filter(p => countryFilterValues.includes(p.country))
      }
      
      let sortedStates = filteredStates
      if (sortValue === 'name')
        sortedStates = filteredStates.sort(nameSorter)
      if (sortValue === 'country')
      sortedStates = filteredStates.sort(countrySorter)

      setStatesFinalDetails({
        states: sortedStates,
      })
    }
  }, [searchValue, countryFilterValues, sortValue, sortOrder, statesDetails, loading])

  const mapToRowContent = (statesDetails) => statesDetails.map((state, idx) => {
    let toReturn = [
        ...[state.name, state.country].map(text => ({text})), 
        {
          Element: UpdatedAtField,
          props: {
            updatedAt: state.updatedAt,
            index: idx,
            history: state.history,
          } 
        },
    ]
    if (showEditDelete) {
      toReturn.push({
          Element: MoreOptionsButton,
          props: {
            state: state,
            idx: idx,
            onEditClick: handleEditClick,
            username: location.state.userDetails.userName,
            reload: reload,
            setReload: setReload
          }
        })
    }
    return toReturn;
  })

  const handleEditClick = (index, state) => {
    setEditIndex(index)
    setEditState(state)
    setShowEditSection(true)
  }

  const clearSort= () => {
    setSortValue('None')
    setSortedLabel('None')
  }


  return (
    <div className='statePage'>
      <div className='statesHeader'>
        <div className='statesTitle'>
          <div className="statesBackButton clickable"
          onClick={() => navigate('/home/cities', location)}>
            <BackArrow />
          </div>
          States
        </div>
        <div className='statesRight'>
          <div className='manageStates'>
        </div>
          {showEditDelete && <div className='addState'>
          <PrimaryButton label="Add State" type="primary" onClick={
          ()=> setShowAddSection(true)}
          />
          </div>}
        </div>
      </div>
      {showEditDelete && <Drawer
        anchor="right"
        open={showAddSection}
        onClose={()=>setShowAddSection(false)}
      >
        <AddState onClose={() => setShowAddSection(false)} 
          reload={reload}
          setReload={setReload}
          setShowStatusUpdate={setShowStatusUpdate}
        />
      </Drawer>}
      {showEditDelete && <Drawer
        anchor="right"
        open={showEditSection}
        onClose={()=>setShowEditSection(false)}
      >
        <EditState onClose={() => {
          setShowEditSection(false)
          setEditState(null)
          setEditIndex(null)
        }} 
          editState={editState}
          editIndex={editIndex}
          reload={reload}
          setReload={setReload}
          setShowStatusUpdate={setShowStatusUpdate}
        />
      </Drawer>}
      <FilterBar 
          onSearchValueChange={setSearchValue}
          filters={[countryFilters]}
          clearSort={clearSort}
          sortOptions={sortOptions}
          sortedLabel={sortedLabel}
      />
      <div className="StatesData">
        <DataTable 
          spacing={2}
          columnConfig={columnConfig}
          rowContent={mapToRowContent(statesFinalDetails.states)}
        />
      </div>

      {loading && <CenterFantasyLoader />}

      {showStatusUpdate && 
        <Alert 
          message={showStatusUpdate}
          style={{position:'fixed', left:'24px', bottom:'16px'}} 
          onClick={()=>setShowStatusUpdate('')}
        />
        }
    </div>
  )
}

export default StatePage