import React, { useEffect, useState, useRef } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Hamburger } from "./TopNavBar/Hamburger/Hambger";
import fantasyLotoLogo from '../../resources/fantasy_loto_logo.png';
import qtLogoImage from '../../resources/Qt_logo_image.png';
import { OverlayItem } from '../../elements/overlayItem/OverlayItem';
import { ProfileSection } from "./ProfileSection/ProfileSection";
import { Info } from "./TopNavBar/Info/Info";
import { Profile } from './TopNavBar/Profile/Profile';
import { Settings } from "./TopNavBar/Settings/Settings";
import './HomePage.css';
import './HomePageTopNavBar.css';
import { Drawer } from "@mui/material";
import { LeftNavBar } from "./LeftNavBar";
import Cookies from 'universal-cookie';
import { Alert } from "../../elements/alert/Alert";
import { ErrorAlert } from "../../elements/alert/ErrorAlert";
import { useClickOutHandler } from "../../hooks/useClickOutHandler";
import { superAdminRole } from "../../util/constants";
import TextInputv2 from "../../elements/textInputv2/TextInputv2";

export const HomePage = () => {
  const logout = () => {
    const cookies = new Cookies();
    cookies.remove('userid')
    cookies.remove('passcode')
    navigate('/#', { replace: true, state: {} })
  }

  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [showProfileOptions, setShowProfileOptions] = useState(false);
  const [showProfileSection, setShowProfileSection] = useState(false);
  const [showSignInAlert, setShowSignInAlert] = useState(false);
  const [showUpdateAlertMsg, setShowUpdateAlertMsg] = useState('');
  const [showErrorAlertMsg, setShowErrorAlertMsg] = useState("");
  const [userDetails, setUserDetails] = useState();
  const profileOptionsRef = useRef();
  const [isHamburgerOpen, setIsHamburgerOpen] = useState(false);

  const editProfileClicked = () => {
    setShowProfileOptions(false)
    setShowProfileSection(true)
  }

  const navigateHome = () => {
    navigate('/home', location)
  }

  const InfoClicked = () => {
    navigate("/home/InfoPage",location);
  };

    useClickOutHandler(profileOptionsRef, ()=>setShowProfileOptions(false))

    const updateLatestUserDetails = () => {
      setLoading(true)
      fetch(process.env.REACT_APP_USER_API_URL+'?'+ new URLSearchParams({
          userid: location.state?.userId
        }), {
        headers: {
          'x-username': location.state?.userId,
          'auth-token': localStorage.getItem('token'),
        }
      })
      .then(resp => resp.json())
      .then((data) => {
        if(data.status === 'inactive') {
          logout()
        } else {
          setLoading(false)
          setUserDetails(data.profiles[0])
          localStorage.setItem('userRole', data?.profiles[0]?.userRole)
          console.log('updated latest user details')
        }
      })
    }

    const showUpdateAlert = (msg) => {
      setShowUpdateAlertMsg(msg)
      setTimeout(() => setShowUpdateAlertMsg(''), 5000)
    }

    const showErrorAlert = (msg) => {
      setShowErrorAlertMsg(msg)
      setTimeout(() => setShowErrorAlertMsg(''), 5000)
    }

  useEffect(updateLatestUserDetails, [])

  useEffect(() => {
    if (sessionStorage.getItem('showSignInAlert')) {
      setShowSignInAlert(true)
      sessionStorage.removeItem('showSignInAlert')
      setTimeout(() => {
        setShowSignInAlert(false)
      }, 4000)
    }
  }, [])

  const toggleHamburger = () => {
    setIsHamburgerOpen((prevIsOpen) => {
      return !prevIsOpen;
    });
  };
  

    const triggerRefresh = (updateAlertMsg) => {
      setShowUpdateAlertMsg(updateAlertMsg)
      setTimeout(() => {
        setShowUpdateAlertMsg('')
      }, 4000)
      updateLatestUserDetails()
    }

    console.log('userDetails;',userDetails)
    if(location.state===undefined || location.state===null || location.state.userId===null || location.state.userId===undefined || location.state.userId==='') {
      console.log('Issue fetching user details from location', location)
      navigate('/#', {replace:true,state:{}})
      return <></>
    }

    const isSuperAdmin = !loading && userDetails?.userRole === superAdminRole

    return (
        <>
          <div className={`topNavBar ${isHamburgerOpen ? 'hamburger-open' : ''}`}>
            <div className="hamburger" onClick={toggleHamburger}>
              <Hamburger />
            </div>
            <div className="appDetails" onClick={navigateHome}>
              <img src={fantasyLotoLogo} className="appLogo"/>
              <div className="appName">FANTASY LOTO</div>
            </div>
            <div className="searchInput">
            <TextInputv2 className="searchUser" label="Search user..." onChange= {() =>{}} />
            </div>
            <div className="rect"></div>
            {!loading && isSuperAdmin 
              && <Settings showUpdateAlert={()=>showUpdateAlert('Settings updated successfully')} showErrorAlert={showErrorAlert} />
            }
            <Info handleInfoClick={InfoClicked} />
            <div ref={profileOptionsRef}>
              <Profile onClick={()=>setShowProfileOptions((showProfile) => !showProfile)} profilePic={userDetails !== undefined && userDetails.profile_pic !== "" ? userDetails.profile_pic : null} 
             name={location.state?.name}
          />
            </div>
          </div>
          {showProfileOptions && 
            <div className="profileOptions">
              <OverlayItem label="Edit profile" onClick={editProfileClicked} />
              <OverlayItem label="Logout" onClick={logout} />
            </div>
          }
          <Drawer
            anchor="right"
            open={showProfileSection}
            onClose={()=>setShowProfileSection(false)}
          >
            <ProfileSection userDetails={userDetails} onClose={()=>setShowProfileSection(false)} triggerRefresh={triggerRefresh} />
          </Drawer>
          {showUpdateAlertMsg && 
            <Alert 
                message={showUpdateAlertMsg}
                style={{position:'absolute', left:'36px', bottom:'65px', 'z-index':'2'}} 
                onClick={()=>setShowUpdateAlertMsg('')}
            />
          }
          {showErrorAlertMsg && 
            <ErrorAlert 
                message={showErrorAlertMsg}
                style={{position:'absolute', left:'36px', bottom:'65px', 'z-index':'2'}} 
                onClick={()=>setShowErrorAlertMsg(false)}
            />
          }
          {!loading && 
              <div className={`mainPage ${isHamburgerOpen ? 'hamburger-open' : ''}`}>
              {/* {isHamburgerOpen && (
                <div className="overlay" onClick={toggleHamburger}></div>
              )} */}
                <div
                  className={`leftNavBar ${
                    isHamburgerOpen ? 'leftNavBar-hidden' : ''
                  }`}
                >
                  <LeftNavBar location={location} userDetails={userDetails} />
                  <div className="qtnav">
          <div className="qtImg"><img src={qtLogoImage} alt="" className="qtLogo" /></div>
          <div className="qtInfo">
            <h2>Developed by</h2>
            <h3>QualyTrust IT Services, India</h3>
        </div>
        </div>
                </div>
                <div className="content">
                  <Outlet />
                </div>
              </div>
          }
          {isHamburgerOpen && 
          <div className="qtDetails">
          <div className="qtImg"><img src={qtLogoImage} alt="" className="qtLogo" /></div>
          <div className="qtInfo">
            <h2>Developed by</h2>
            <h3>QualyTrust IT Services, India</h3>
        </div>
        </div>
}
          {showSignInAlert && 
            <Alert 
                message={`Welcome ${location.state.name}`}
                style={{position:'absolute', left:'36px', bottom:'65px', 'z-index':'2'}} 
                onClick={()=>setShowSignInAlert(false)}
            />
          }
        
        </>
    )
}
