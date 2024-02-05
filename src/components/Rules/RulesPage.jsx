import React, { useEffect, useState } from 'react'

import { OverlayOptions } from "../../elements/overlayOptions/OverlayOptions";
import {ReactComponent as MoreOptions} from '../../resources/more_options.svg'
import backArrow from '../../resources/back-arrow.png'

import { Popup } from '../../elements/popup/Popup';

import './RulesPage.css'
import { DataTable } from '../../elements/dataTable/DataTable';
import { PrimaryButton } from '../../elements/button/Button';
import { FilterBar } from '../FilterBar/FilterBar';

import { Drawer } from "@mui/material";
import { useLocation } from 'react-router-dom';

import AddRules from './AddRules/AddRule';
import EditRule from './EditRules/EditRule';
import { convertToUIDate } from '../../util/dateUtils';
import { Alert } from '../../elements/alert/Alert';
import RuleInfo from './RuleInfo/RuleInfo';
import { CenterFantasyLoader } from '../../elements/fantasyLotoLoader/FantasyLotoLoader';

import { superAdminRole, adminRole } from '../../util/constants';

const MoreOptionsButton = ({rule, idx, onEditClick, reload, setReload, username,franchiseId}) => {

  const [showOptions, setShowOptions] = useState(false)
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const [showStatusUpdate, setShowStatusUpdate] = useState('');
  
  const handleDeleteConfirm = () => {
    console.log(" Rule id: " + rule.id)
    fetch(process.env.REACT_APP_STATE_CITY_API_HOST + '/franchiseRules', {
      method: 'DELETE',
      headers: {
        'x-username': username,
        'auth-token': localStorage.getItem('token'),
      },
      body: JSON.stringify({
          id: rule.id,
      })
  }).then((resp) => {
      if (resp.status === 200) {
          setShowStatusUpdate("Rule has been deleted")
          setReload(!reload)
          setTimeout(() => {
              setShowStatusUpdate('')
          }, 5000)
      }
      else {
        console.log("Deleting city failed")
      }
  })
  .catch((err) => console.log(err))
  setShowDeleteConfirmation(false)
  }
  
  return (
    <>
      <div className='ruleMoreOptions' onClick={() => setShowOptions(!showOptions)}>
        <MoreOptions />
      </div>
      {showOptions && 
      <div className='overlayContainer'>
        <OverlayOptions options={[
          {
              label: 'Edit',
              onClick: () => {
                setShowOptions(false)
                onEditClick(idx, rule)
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
          title={"Are you sure you want to delete this Rule?"}
          buttonText="Delete"
          onButtonClick={()=>handleDeleteConfirm()}
          onClose={()=>setShowDeleteConfirmation(false)}
        />
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

const ruleInfoButton = ({rule, idx, onInfoClick}) => {

  return (
    <div className="ruleinfo" onClick={() => onInfoClick(idx, rule)}>
      <img src={backArrow} className='ruleInfoImage' alt='info-button' />
    </div>
  )
}

const AddedByField = ({addedBy, index, history}) => {

  return (
    <div className='addedByParent'> 
      <div className='addedBy'>
        {addedBy}
      </div>
      <div className='ruleHistory'>
      {history.map((data, idx) => (
        <p className='history-element' key={idx}>{`${data.username} (${data.role}) @ ${data.timestamp}`}</p>
      ))}
      </div>
    </div>
  )
}

const RulesPage = () => {
  const location = useLocation();
  const franchiseId = location.state.userDetails?.franchiseId;
  const userRole = location.state.userDetails.userRole;
  const isSuperAdmin = (userRole === superAdminRole)
  const isAdmin = (userRole == adminRole)

  const [showAddSection, setShowAddSection] = useState(false)
  const [showEditSection, setShowEditSection] = useState(false)
  const [showInfoSection, setShowInfoSection] = useState(false)

  const [editIndex, setEditIndex] = useState(null)
  const [editRule, setEditRule] = useState(null)

  const [infoIndex, setInfoIndex] = useState(null)
  const [infoRule, setInfoRule] = useState(null)
  
  const [loading, setLoading] = useState(true)
  const [reload, setReload] = useState(false)

  const [showStatusUpdate, setShowStatusUpdate] = useState('')
  
  const [screenFilterValues, setScreenFilterValues] = useState([]);
  const [updatedFilterValues, setupdatedFilterValues] = useState('');

  const [searchValue, setSearchValue] = useState('');
  const [sortValue, setSortValue] = useState('None');
  const [sortOrder, setSortOrder] = useState('None');
  const [sortedLabel, setSortedLabel] = useState('None');

  const [rulesFinalDetails, setRulesFinalDetails] = useState({rules: []})
  
  const screenFilters = {
    type: 'multiValue',
    label: 'Screen',
    currentValues: screenFilterValues,
    options: ["Game Rules", "Terms & Conditions"],
    onChange: setScreenFilterValues,
    clearFilterValue: (value) => {
        setScreenFilterValues(vals => vals.filter(val => val !== value))
    }
}

const updatedFilters = {
  type: 'date',
  label: 'Updated',
  currentValue: updatedFilterValues,
  onChange: setupdatedFilterValues,
  clearFilter: () => {
    setupdatedFilterValues('')
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
    label: 'Recently Updated (Old-New)',
    onClick: () => {
      setSortValue('updated')
      setSortOrder('asc')
      setSortedLabel('Recently Updated (Old-New)')
    }
  },
  {
    label: 'Recently Updated (New-Old)',
    onClick: () => {
      setSortValue('updated')
      setSortOrder('dsc')
      setSortedLabel('Recently Updated (New-Old)')
    }
  },
]


  let columnConfig = [
    {
      gridColumns: 4,
      name: "Name"
    },
  ]

  if (!isAdmin) {
    columnConfig = [...columnConfig, 
      {
        gridColumns: 3,
        name: "Location"
      },
      {
        gridColumns: 3,
        name: "Admin"
      },
    ]
  }
  else {
    columnConfig = [...columnConfig,
      {
        gridColumns: 4,
        name: "Description"
      },
      {
        gridColumns: 2,
        name: "Display On"
      },
    ]
  }

  columnConfig = [...columnConfig,
    {
      gridColumns: 1,
      name: "Last Updated",
      isReactElement: true
    },
    {
      gridColumns: 1,
      name: "",
      isReactElement: true
    },]

  const [rulesDetails, setRulesDetails] = useState([])

  const fetchRulesDetails = () => {
    setLoading(true)
    let endpoint = '/franchiseRules'
    if (!isSuperAdmin)
      endpoint += '?franchise_id=' + franchiseId
    fetch(process.env.REACT_APP_STATE_CITY_API_HOST + endpoint, {
      method: 'GET',
      headers: {
        'x-username': location.state.userDetails.userName,
        'auth-token': localStorage.getItem('token'),
      }
    })
    .then(resp => {
      if (resp.status === 200) {
        resp.json().then(data => {
          console.log(data)
          setRulesDetails(data.map(item => {
            let timestamps = item.history.map(record => record.timestamp)
            let displayOn = ""
            if (item.screen_display?.game_rules)
              displayOn += "Game Rules"
            if (item.screen_display?.game_rules && item.screen_display?.tc)
              displayOn += ', '
            if (item.screen_display?.tc)
              displayOn += 'Terms & Conditions'

            let sortedHistory = item.history.sort((a,b) => b.timestamp - a.timestamp).map(({username, role, timestamp}) => 
            ({
              username,
              role,
              timestamp: convertToUIDate(new Date(timestamp * 1000).toLocaleString('en-US', {timeZone: 'America/Nassau'}))
            })
            )

            return ({
              id: item.id,
              name: item.name,
              description: item.description,
              admin: sortedHistory[sortedHistory.length - 1].username,
              location: `${item.admin_city}, ${item.admin_state}`,
              displayOn: displayOn,
              screen_display: item.screen_display,
              lastUpdated: convertToUIDate(new Date(Math.max(...timestamps)*1000).toLocaleString('en-US', {timeZone: 'America/Nassau'})),
              lastUpdatedTS: Math.max(...timestamps),
              history: sortedHistory,
            })
          }))
        setLoading(false)
        })
        .catch(e => console.log(e))
      }
      else {
        console.log("Failed to fetch rules details.")
      }
    })
    .catch(e => console.log(e))
  }

  useEffect(fetchRulesDetails, [reload, location.state.userDetails, franchiseId, isSuperAdmin])

  
  useEffect(() => {
    if (!loading) {

      const nameSorter = (p1, p2) => (sortOrder === 'dsc'?-1:1) * p1.name.toLowerCase().localeCompare(p2.name.toLowerCase())
      const updatedSorter = (p1, p2) => (sortOrder === 'dsc'?-1:1) * p1.lastUpdated.localeCompare(p2.lastUpdated)

      let filteredRules = rulesDetails.filter((rule) => 
        rule.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        rule.description.toLowerCase().includes(searchValue.toLowerCase())
      )

      if(screenFilterValues.length !== 0) {
        if (screenFilterValues.length !== 2)
        filteredRules = filteredRules.filter(rule => rule.displayOn.toLowerCase().includes(screenFilterValues[0].toLowerCase()))
      }

      if (updatedFilterValues) {
        let startTs = updatedFilterValues.$d.getTime()/1000
        console.log(startTs)
        console.log(filteredRules)
        console.log(filteredRules[0].lastUpdatedTS)
        filteredRules = filteredRules.filter(rule => (startTs <= rule.lastUpdatedTS && rule.lastUpdatedTS < startTs + 86400))
      }
      
      let sortedRules = filteredRules
      if (sortValue === 'name')
        sortedRules = filteredRules.sort(nameSorter)
      if (sortValue === 'updated')
        sortedRules = filteredRules.sort(updatedSorter)

      setRulesFinalDetails({
        rules: sortedRules,
      })
    }
  }, [searchValue, screenFilterValues, updatedFilterValues, sortValue, sortOrder, rulesDetails, loading])


  const mapToRowContent = (rulesDetails) => rulesDetails.map((rule, idx) => {
    console.log(rule)
    if (!isAdmin) {
      return [
        ...[rule.name, rule.location, rule.admin].map(text => ({text})),
        {
          Element: AddedByField,
          props: {
            addedBy: rule.lastUpdated,
            index: idx,
            history: rule.history,
          } 
        },
        {
          Element: ruleInfoButton,
          props: {
            rule: rule,
            idx: idx,
            onInfoClick: handleInfoClick,
          }
        },
      ]
    }
    else {
    return [
        ...[rule.name, rule.description.length < 50 ? rule.description : rule.description.substring(0, 50) + "...", rule.displayOn].map(text => ({text})), 
        {
          Element: AddedByField,
          props: {
            addedBy: rule.lastUpdated,
            index: idx,
            history: rule.history,
          } 
        },
        {
          Element: MoreOptionsButton,
          props: {
            rule: rule,
            idx: idx,
            franchiseId: franchiseId,
            onEditClick: handleEditClick,
            username: location.state.userDetails.userName,
            reload: reload,
            setReload: setReload,
          }
        }
    ]
  }
  })

  const handleEditClick = (index, rule) => {
    setEditRule(rule)
    setEditIndex(index)
    setShowEditSection(true)
  }

  const handleInfoClick = (index, rule) => {
    setInfoRule(rule)
    setInfoIndex(index)
    setShowInfoSection(true)
  }
  
  const clearSort= () => {
    setSortValue('None')
    setSortedLabel('None')
  }

  return (
    <div className='rulesPage'>
      <div className='rulesHeader'>
        <div className='rulesTitle'>
          Rules
        </div>
        <div className='rulesRight'>
          {isAdmin && <div className='addRule'>
          <PrimaryButton label="Add Rule" type="primary" onClick={
          ()=> setShowAddSection(true)}
          />
          </div>}
        </div>
      </div>
      <Drawer
        anchor="right"
        open={showAddSection}
      >
        <AddRules onClose={() => { 
          setShowAddSection(false)
        }}
        franchiseId={franchiseId}
        reload={reload}
        setReload={setReload}
        setShowStatusUpdate={setShowStatusUpdate}
          />
      </Drawer>
      <Drawer
        anchor="right"
        open={showEditSection}
      >
        <EditRule onClose={() => { 
          setShowEditSection(false)
          setEditRule(null)
        }}
          editRule={editRule}
          franchiseId={franchiseId}
          reload={reload}
          setReload={setReload}
          setShowStatusUpdate={setShowStatusUpdate}
        />
      </Drawer>
      <Drawer
        anchor="right"
        open={showInfoSection}
      >
        <RuleInfo onClose={() => { 
          setShowInfoSection(false)
          setInfoRule(null)
        }}
          infoRule={infoRule}
        />
      </Drawer>
      <FilterBar 
          onSearchValueChange={setSearchValue}
          filters={[screenFilters, updatedFilters]}
          clearSort={clearSort}
          sortOptions={sortOptions}
          sortedLabel={sortedLabel}
      />
      <div className="rulesData">
        <DataTable 
          spacing={2}
          columnConfig={columnConfig}
          rowContent={mapToRowContent(rulesFinalDetails.rules ?? [])}
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

export default RulesPage