import { useNavigate } from "react-router-dom";

import { ReactComponent as AdminsIcon } from '../../resources/left nav bar/admins.svg';
import { ReactComponent as AgentsIcon } from '../../resources/left nav bar/agents.svg';
import { ReactComponent as BalanceIcon } from '../../resources/left nav bar/balance.svg';
import { ReactComponent as BetLimitIcon } from '../../resources/left nav bar/betLimit.svg';
import { ReactComponent as BetTypeIcon } from '../../resources/left nav bar/betType.svg';
import { ReactComponent as DepositsIcon } from '../../resources/left nav bar/deposits.svg';
import { ReactComponent as PayoutsIcon } from '../../resources/left nav bar/payouts.svg';
import { ReactComponent as GamesIcon } from '../../resources/left nav bar/games.svg';
import { ReactComponent as LotteryLimitIcon } from '../../resources/left nav bar/lotteryLimit.svg';
import { ReactComponent as ManualWinResultsIcon } from '../../resources/left nav bar/manualWinResults.svg';
import { ReactComponent as DashboardIcon } from '../../resources/left nav bar/pie_chart_outline-dashboard.svg';
import { ReactComponent as ReportsIcon } from '../../resources/left nav bar/resports.svg';
import { ReactComponent as RulesIcon } from '../../resources/left nav bar/rules.svg';
import { ReactComponent as StaffIcon } from '../../resources/left nav bar/staff.svg';
import { ReactComponent as StateCityIcon } from '../../resources/left nav bar/state-city.svg';
import { ReactComponent as ReceiptsIcon } from '../../resources/left nav bar/receipts.svg';
import { ReactComponent as WinningRatioIcon } from '../../resources/left nav bar/winningRatio.svg';
import { LeftNavBarItem } from './LeftNavBarItem/LeftNavBarItem'
import { adminRole, superAdminRole } from "../../util/constants";
import qtLogoImage from '../../resources/Qt_logo_image.png';

export const LeftNavBar = ({ location, userDetails }) => {
    let {userRole, screens} = userDetails;
    const isSuperAdmin = userRole === superAdminRole;
    
    const isAdmin = userRole === adminRole;
    if(isSuperAdmin) {
        screens = {
            betLimit:true,
            betType:true,
            agent:true,
            balance:true,
            deposit:false,
            game:true,
            lottery:true,
            payout:false,
            reports:true,
            staff_cashier:true,
        }
    }
    const {
        betLimit,
        betType,
        agent, agents,
        balance,
        deposit,
        game,
        lottery, lotteryLimit,
        payout,
        reports,
        staff_cashier
    } = screens
    const navigate = useNavigate();
    return (
        <>
            <LeftNavBarItem Vector={DashboardIcon} label={'Dashboard'} onClick={() => {navigate("/home/dashboard", {state: {...location.state, userDetails}})}} />
            {isSuperAdmin && <LeftNavBarItem Vector={AdminsIcon} label={'Admins'} onClick={() => navigate("/home/admins", {state: {...location.state, userDetails}})} />}
            {(isSuperAdmin || staff_cashier) && <LeftNavBarItem Vector={StaffIcon} label={'Staff'} onClick={() => navigate("/home/staff", {state: {...location.state, userDetails}})} />}
            {(isSuperAdmin || agent || agents) && <LeftNavBarItem Vector={AgentsIcon} label={'Agents'} onClick={() => navigate("/home/agent", {state: {...location.state, userDetails}})} />}
            {(isSuperAdmin || balance) && <LeftNavBarItem Vector={BalanceIcon} label={'Balance'} onClick={() => navigate("/home/dashboard", {state: {...location.state, userDetails}})} />}
            {(isSuperAdmin || game) && <LeftNavBarItem Vector={GamesIcon} label={'Games'} onClick={() => navigate("/home/games", {state: {...location.state, userDetails}})} />}
            {(isSuperAdmin || lottery || lotteryLimit) && <LeftNavBarItem Vector={LotteryLimitIcon} label={'Lottery limit'} onClick={() => navigate("/home/lotteryLimit", {state: {...location.state, userDetails}})} />}
            {(isSuperAdmin || betLimit) && <LeftNavBarItem Vector={BetLimitIcon} label={'Bet number limit'} onClick={() => navigate("/home/betNumberLimit", {state: {...location.state, userDetails}})} />}
            {(isSuperAdmin || betType) && <LeftNavBarItem Vector={BetTypeIcon} label={'Bet type & Win ratio'} onClick={() => navigate("/home/winratio", {state: {...location.state, userDetails}})} />}
            {(deposit) && <LeftNavBarItem Vector={DepositsIcon} label={'Agent Deposits'} onClick={() => navigate("/home/dashboard", {state: {...location.state, userDetails}})} />}
            {(payout) && <LeftNavBarItem Vector={PayoutsIcon} label={'Payouts'} onClick={() => navigate("/home/dashboard", {state: {...location.state, userDetails}})} />}
            {isSuperAdmin && <LeftNavBarItem Vector={ManualWinResultsIcon} label={'Manual win results'} onClick={() => navigate("/home/manualwinresults", {state: {...location.state, userDetails}})} />}
            {<LeftNavBarItem Vector={RulesIcon} label={'Rules'} onClick={() => navigate("/home/rules", {state: {...location.state, userDetails}})} />}
            { isAdmin && <LeftNavBarItem Vector={ReceiptsIcon} label={'Customise Receipts'} onClick={() => navigate("/home/customiseReceipts", {state: {...location.state, userDetails}})}/>}
            {(isSuperAdmin || reports) && <LeftNavBarItem Vector={ReportsIcon} label={'Reports'} onClick={() => navigate("/home/reports", {state: {...location.state, userDetails}})} />}
            {<LeftNavBarItem Vector={StateCityIcon} label={'State/City'} onClick={() => navigate("/home/cities", {state: {...location.state, userDetails}})} />}
           
        </>
    )
}