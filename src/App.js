
import './App.css';
import { SignInPage } from './components/SignInPage/SignInPage'
import { ForgotPassword } from './components/ForgotPassword/ForgotPassword'
import { HomePage } from './components/HomePage/HomePage';
import { Dashboard } from './components/Dashboard/Dashboard'
import { Admins } from './components/Admins/Admins'
import { GameManagement } from './components/GameManagement/GameManagement'
import { GameLogs } from './components/GameManagement/GameLogs/GameLogs'
import { AddAdmin } from './components/Admins/AddAdmin/AddAdmin';
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { AdminStaff } from './components/Admins/AdminStaff/AdminStaff';
import { StaffManagement } from './components/StaffManagement/StaffManagement';
import { AddStaff } from './components/StaffManagement/AddStaff/AddStaff';
import { AgentManagement } from './components/AgentManagement/AgentManagement';
import { AddAgent } from './components/AgentManagement/AddAgent/AddAgent';
import { BalanceManagement } from './components/Balances/BalanceManagement';
import StatePage from './components/StateCityPages/StatePage';
import CityPage from './components/StateCityPages/CityPage';
import RulesPage from './components/Rules/RulesPage';
import ManualWinResults from './components/ManualWinResults/ManualWinResults';
import LogsPage from './components/ManualWinResults/Logs/LogsPage';
import ReportsPage from './components/Reports/ReportsPage';
import WinNumberResults from './components/WinNumberResults/WinNumberResults';
import {CustReceipt} from './components/CustomiseReceipts/CustomiseReceipts';
import { WinRatio } from './components/WinRatio/WinRatio';
import { WinRatioLogs } from './components/WinRatio/WinRatioLogs/WinRatioLogs';
import { BetNumberLimit } from './components/BetNumberLimit/BetNumberLimit';
import { LotteryLimit } from './components/LotteryLimit/LotteryLimit';
import { BetNumberLimitLogs } from './components/BetNumberLimit/BetNumberLimitLogs/BetNumberLimitLogs';
import { LotteryLimitLogs } from './components/LotteryLimit/LotteryLimitLogs/LotteryLimitLogs';
import {AdminTransactions} from './components/Balances/AdminTransactions/AdminTransactions'
import { AgentBalances } from './components/Balances/AgentBalances/AgentBalances';
import { AgentTransactions } from './components/Balances/AgentTransactions/AgentTransactions';
import InfoPage from './components/InfoPage/InfoPage';

function App() {
    return (
        <HashRouter>
          <Routes>
              <Route path="/" element={<SignInPage />} />
              <Route path="/forgotPassword" element={<ForgotPassword />} />
              <Route path="/home" element={<HomePage />}>
                  <Route index element={<Dashboard />} />
                  <Route path="/home/dashboard" element={<Dashboard />} />
                  <Route path="/home/Admins" element={<Admins />} />
                  <Route path="/home/Admins/add" element={<AddAdmin />} />
                  <Route path="/home/admins/staff" element={<AdminStaff />} />
                  <Route path="/home/staff" element={<StaffManagement />} />
                  <Route path="/home/staff/add" element={<AddStaff />} />
                  <Route path="/home/agent" element={<AgentManagement />} />
                  <Route path="/home/agent/add" element={<AddAgent />} />
                  <Route path="/home/games" element={<GameManagement />} />
                  <Route path="/home/games/logs" element={<GameLogs />} />
                  <Route path="/home/manualwinresults" element={<ManualWinResults />} />
                  <Route path='/home/manualwinresults/logs' element={<LogsPage />} />
                  <Route path="/home/rules" element={<RulesPage />} />
                  <Route path="/home/customiseReceipts" element={<CustReceipt />} />
                  <Route path="/home/reports" element={<ReportsPage />} />
                  <Route path="/home/winnumbers" element={<WinNumberResults />} />
                  <Route path="/home/states" element={<StatePage />} />
                  <Route path="/home/cities" element={<CityPage />} />
                  <Route path="/home/winratio" element={<WinRatio />} />
                  <Route path="/home/winratio/logs" element={<WinRatioLogs />} />
                  <Route path="/home/betNumberLimit" element={<BetNumberLimit />} />
                  <Route path="/home/betNumberLimit/logs" element={<BetNumberLimitLogs />} />
                  <Route path="/home/lotteryLimit" element={<LotteryLimit />} />
                  <Route path="/home/lotteryLimit/logs" element={<LotteryLimitLogs />} />
                  <Route path="/home/balance" element={<BalanceManagement />} />
                  <Route path="/home/balance/adminTransactions" element={<AdminTransactions/>}/>
                  <Route path="/home/balance/agentBalances" element={<AgentBalances/>}/>
                  <Route path="/home/balance/agentTransactions" element={<AgentTransactions/>}/>
                  <Route path="/home/InfoPage" element={<InfoPage />} />
              </Route>
              <Route path="*" element={<Navigate to='/#' />} />
          </Routes>
        </HashRouter>
      );
}
export default App