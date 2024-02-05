import { Outlet, useLocation, useNavigate, Link } from "react-router-dom";
import './Dashboard.css'


export const Dashboard = () => {
    const location = useLocation();
    const { state: {userId}} = location;
    return <div className="dashboard"></div>
}