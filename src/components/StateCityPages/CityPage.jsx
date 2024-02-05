import React, { useEffect, useState, useRef } from 'react'

import { OverlayOptions } from "../../elements/overlayOptions/OverlayOptions";
import {ReactComponent as MoreOptions} from '../../resources/more_options.svg'
import { Popup } from '../../elements/popup/Popup';

import './CityPage.css'
import { DataTable } from '../../elements/dataTable/DataTable';
import { PrimaryButton } from '../../elements/button/Button';
import { FilterBar } from '../FilterBar/FilterBar';

import { Drawer } from "@mui/material";
import { useNavigate, useLocation } from 'react-router-dom';
import AddCity from './AddCity/AddCity';
import EditCity from './EditCity/EditCity';
import { ErrorAlert } from '../../elements/alert/ErrorAlert';
import { Alert } from '../../elements/alert/Alert';
import { convertToUIDate } from '../../util/dateUtils';

import { CenterFantasyLoader } from '../../elements/fantasyLotoLoader/FantasyLotoLoader';

import { adminRole, superAdminRole } from '../../util/constants';
import { useClickOutHandler } from '../../hooks/useClickOutHandler';

const MoreOptionsButton = ({city, idx, onEditClick, username, reload, setReload}) => {

  const [showOptions, setShowOptions] = useState(false)
  const moreOptionsRef = useRef();
  useClickOutHandler(moreOptionsRef, ()=>setShowOptions(false))
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const [showStatusUpdate, setShowStatusUpdate] = useState('');
  const [errorStatus, setErrorStatus] = useState(false);
  
  const handleDeleteCancel = () => {
    setShowDeleteConfirmation(false)
  }

  const handleDeleteConfirm = () => {
    setErrorStatus(false)
    fetch(process.env.REACT_APP_STATE_CITY_API_HOST + '/cities', {
      method: 'DELETE',
      headers: {
        'x-username': username,
        'auth-token': localStorage.getItem('token'),
      },
      body: JSON.stringify({
          id: city.id
      })
  }).then((resp) => {
      if (resp.status === 200) {
          setShowStatusUpdate("City has been deleted")
          setReload(!reload)
          setTimeout(() => {
              setShowStatusUpdate('')
          }, 5000)
      }
      else {
        setErrorStatus(true)
        resp.json().then(data => {
          if (data?.description.includes("Cannot delete or update a parent row"))
            setShowStatusUpdate("Unable to delete the city, since it is \n already linked with several users")
          else
            setShowStatusUpdate("Unable to delete city")
          
          setTimeout(() => {
              setShowStatusUpdate('')
          }, 2000)
        })
        .catch((e) => setShowStatusUpdate("Unable to delete city"))
      }
  })
  .catch((err) => console.log(err))
  setShowDeleteConfirmation(false)
  }
   
  return (
    <>
      <div className='cityMoreOptions' onClick={() => setShowOptions(!showOptions)} ref={moreOptionsRef}>
        <MoreOptions />
      </div>
      {showOptions && 
      <div className='overlayContainer'>
        <OverlayOptions options={[
          {
              label: 'Edit',
              onClick: () => {
                setShowOptions(false)
                onEditClick(idx, city)
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
          title={"Are you sure you want to delete this City?"}
          buttonText="Delete"
          onButtonClick={()=>handleDeleteConfirm()}
          onClose={()=>handleDeleteCancel(false)}
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
      <div className='cityHistory'>
      {history.map((data, idx) => (
        <p className='history-element' key={idx}>{`${data.username} (${data.role}) @ ${data.timestamp}`}</p>
      ))}
      </div>
    </div>
  )
}

const CityPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const userRole = location.state.userDetails.userRole;
  const showEditDelete = (userRole === adminRole || userRole === superAdminRole);


  const [showAddSection, setShowAddSection] = useState(false)
  const [showEditSection, setShowEditSection] = useState(false)

  const [editCity, setEditCity] = useState(null)

    const [countryFilterValues, setCountryFilterValues] = useState([]);
    const [stateFilterValues, setStateFilterValues] = useState([]);
    const [searchValue, setSearchValue] = useState('')
    const [sortValue, setSortValue] = useState('None');
    const [sortOrder, setSortOrder] = useState('None');
    const [sortedLabel, setSortedLabel] = useState('None')

    const [citiesFinalDetails, setCitiesFinalDetails] = useState({cities: []})

    const [loading, setLoading] = useState(false)
    const [reload, setReload] = useState(false)

    const [showStatusUpdate, setShowStatusUpdate] = useState('')

  const columnConfig = [
    {
      gridColumns: 3,
      name: "City"
    },
    {
      gridColumns: 2,
      name: "State"
    },
    {
      gridColumns: 3,
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

  const [citiesDetails, setCitiesDetails] = useState([])
  const [states, setStates] = useState([])
  

  const countryFilters = {
    type: 'multiValue',
    label: 'Country',
    currentValues: countryFilterValues,
    options: [...new Set(citiesDetails.map(p => p.country))],
    onChange: setCountryFilterValues,
    clearFilterValue: (value) => {
        setCountryFilterValues(vals => vals.filter(val => val !== value))
    }
}

const stateFilters = {
    type: 'multiValue',
    label: 'State',
    currentValues: stateFilterValues,
    options: [...new Set(citiesDetails.map(p => p.state))],
    onChange: setStateFilterValues,
    clearFilterValue: (value) => {
        setStateFilterValues(vals => vals.filter(val => val !== value))
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
    label: 'State (A-Z)',
    onClick: () => {
      setSortValue('state')
      setSortOrder('asc')
      setSortedLabel('State (A-Z)')
    }
  },
  {
    label: 'State (Z-A)',
    onClick: () => {
      setSortOrder('dsc')
      setSortValue('state')
      setSortedLabel('State (Z-A)')
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

const fetchCitiesDetails = () => {
  setLoading(true)
  fetch(process.env.REACT_APP_STATE_CITY_API_HOST +'/cities', {
    method: 'GET',
    headers: {
      'x-username': location.state.userDetails.userName,
      'auth-token': localStorage.getItem('token'),
    }
  } )
  .then(resp => {
    console.log(resp)
    if (resp.status === 200) {
      resp.json().then(data => {

        setCitiesDetails(data.map(item => {
          let timestamps = item.history.map(record => record.timestamp)
          console.log(item.history)
          return ({
          name: item.name,
          state: item.state,
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

const fetchStatesDetails = () => {
  fetch(process.env.REACT_APP_STATE_CITY_API_HOST +'/states', {
    method: 'GET',
    headers: {
      'x-username': location.state.userDetails.userName,
      'auth-token': localStorage.getItem('token'),
    }
  } )
  .then(resp => {
    if (resp.status === 200) {
      resp.json().then(data => {

        setStates(data.map(item => item.name))
      })
    }
    else {
      console.log("in else")
    }
  })
  .catch((error) => {
    console.log(error)
  })
}

  useEffect(fetchCitiesDetails, [reload, location.state.userDetails])
  useEffect(fetchStatesDetails, [reload, location.state.userDetails])

  useEffect(() => {
    if (!loading) {

      const nameSorter = (p1, p2) => (sortOrder === 'dsc'?-1:1) * p1.name.toLowerCase().localeCompare(p2.name.toLowerCase())
      const stateSorter = (p1, p2) => (sortOrder === 'dsc'?-1:1) * p1.state.toLowerCase().localeCompare(p2.state.toLowerCase())
      const countrySorter = (p1, p2) => (sortOrder === 'dsc'?-1:1) * p1.country.toLowerCase().localeCompare(p2.country.toLowerCase())

      let filteredCities = citiesDetails.filter((city) => 
        city.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        city.state.toLowerCase().includes(searchValue.toLowerCase()) ||
        city.country.toLowerCase().includes(searchValue.toLowerCase())
      )

      if(countryFilterValues.length !== 0) {
          filteredCities = filteredCities.filter(p => countryFilterValues.includes(p.country))
      }
      if(stateFilterValues.length !== 0) {
          filteredCities = filteredCities.filter(p => stateFilterValues.includes(p.state))
      }
      
      let sortedCities = filteredCities
      if (sortValue === 'name')
        sortedCities = filteredCities.sort(nameSorter)
      if (sortValue === 'state')
        sortedCities = filteredCities.sort(stateSorter)
      if (sortValue === 'country')
        sortedCities = filteredCities.sort(countrySorter)

      setCitiesFinalDetails({
        cities: sortedCities,
      })
    }
  }, [searchValue, stateFilterValues, countryFilterValues, sortValue, sortOrder, citiesDetails, loading])

  const handleManageStates = () => {
    navigate('/home/states', location);
  }

  const mapToRowContent = (citiesDetails) => citiesDetails.map((city, idx) => {
    let toReturn = [
        ...[city.name, city.state, city.country].map(text => ({text})), 
        {
          Element: UpdatedAtField,
          props: {
            updatedAt: city.updatedAt,
            index: idx,
            history: city.history,
          } 
        },
    ]
    if (showEditDelete) {
      toReturn.push({
        Element: MoreOptionsButton,
        props: {
          city: city,
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

  const handleEditClick = (index, city) => {
    setEditCity(city)
    setShowEditSection(true)
  }

  const clearSort= () => {
    setSortValue('None')
    setSortedLabel('None')
  }


  return (
    <div className='cityPage'>
      <div className='citiesHeader'>
        <div className='citiesTitle'>
          Cities
        </div>
        <div className='citiesRight'>
          <div className='manageStates'>
          <PrimaryButton label="Manage States" type="secondary" onClick={handleManageStates}
          />
          </div>
          {showEditDelete && <div className='addCity'>
          <PrimaryButton label="Add City" type="primary" onClick={
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
        <AddCity onClose={() => setShowAddSection(false)} 
        stateOptions={states} 
        setShowStatusUpdate={setShowStatusUpdate}
        reload={reload} 
        setReload={setReload} />
      </Drawer>}
      {showEditDelete && <Drawer
        anchor="right"
        open={showEditSection}
        onClose={()=>setShowEditSection(false)}
      >
        <EditCity onClose={() => {
          setShowEditSection(false)
          setEditCity(null)
        }} 
          editCity={editCity}
          stateOptions={states}
          reload={reload} 
          setReload={setReload}
          setShowStatusUpdate={setShowStatusUpdate}
        />
      </Drawer>}
      <FilterBar 
          onSearchValueChange={setSearchValue}
          filters={[countryFilters, stateFilters]}
          clearSort={clearSort}
          sortOptions={sortOptions}
          sortedLabel={sortedLabel}
      />
      <div className="citiesData">
        <DataTable 
          spacing={2}
          columnConfig={columnConfig}
          rowContent={mapToRowContent(citiesFinalDetails.cities ?? [])}
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

export default CityPage