import React, { useContext } from 'react';
import './App.css';
import './index.css';
import Header from './components/common/Header';
import Sidebar from './components/common/Sidebar';
import { BrowserRouter as Router, Route, Routes, useLocation, Navigate } from 'react-router-dom';
import Apply from './views/Apply';
import Login from './views/Login';
import MyApplyList from './views/list/MyApplyList';
import MyPendingList from './views/list/MyPendingList';
import ApplicationsList from './views/list/ApplicationList';
import PendingApprovalList from './views/list/PendingApprovalList';
import BcdOrder from './views/bcd/BcdOrder';
import AuthorityManagement from './views/authority/AuthorityManagement';
import BcdApplyFirst from './views/bcd/BcdApplyFirst';
import BcdApplySecond from './views/bcd/BcdApplySecond';
import DetailApplication from './views/bcd/DetailApplication';
import DetailDocApplication from './views/doc/DetailDocApplication';
import DocInList from './views/doc/DocInList';
import DocOutList from './views/doc/DocOutList';
import SealManagementList from './views/seal/SealManagementList';
import SealRegistrationList from './views/seal/SealRegistrationList';
import SealExportList from './views/seal/SealExportList';
import CorpDocRnpList from './views/corpdoc/CorpDocRnpList';
import CorpDocIssueList from './views/corpdoc/CorpDocIssueList';
import StandardData from './views/standard/StandardData';
import DocApply from './views/doc/DocApply';
import CorpDocApply from "./views/corpdoc/CorpDocApply";
import SealApplyFirst from "./views/seal/SealApplyFirst";
import SealApplyImprint from "./views/seal/SealApplyImprint";
import SealApplyExport from "./views/seal/SealApplyExport";
import Docstorage from "./views/docstorage/Docstorage";
import DocstorageList from './views/docstorage/DocstorageList';
import TotalDocstorageList from './views/docstorage/TotalDocstorageList';
import RentalManage from './views/rental/RentalManage';
import TotalRentalManage from './views/rental/TotalRentalManage';
import { AuthProvider, AuthContext } from './components/AuthContext';

function MainLayout({ children }) {
  const location = useLocation();
  const isLoginPage = location.pathname === '/api/login';

  return (
    <div className="app">
      {!isLoginPage && <Sidebar />}
      <div className={`main-layout ${isLoginPage ? 'login-layout' : ''}`}>
        {!isLoginPage && <Header />}
        {children}
      </div>
    </div>
  );
}

function RequireAuth({ children }) {
  const { auth } = useContext(AuthContext);

  if (!auth.isAuthenticated) {
    return <Navigate to="/api/login" />;
  }

  if ((auth.role === 'ADMIN' || auth.role === 'MASTER') && window.location.pathname === '/') {
    return <Navigate to="/api/std" />;
  }

  return children;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/api/login" element={<Login />} />
          <Route path="*" element={
            <MainLayout>
              <Routes>
                <Route path="/" element={<RequireAuth><Apply /></RequireAuth>} />
                <Route path="/api/auth" element={<RequireAuth><AuthorityManagement /></RequireAuth>} />
                <Route path="/api/bcd" element={<RequireAuth><BcdApplyFirst /></RequireAuth>} />
                <Route path="/api/bcd/own" element={<RequireAuth><BcdApplySecond /></RequireAuth>} />
                <Route path="/api/bcd/other" element={<RequireAuth><BcdApplySecond /></RequireAuth>} />
                <Route path="/api/doc" element={<RequireAuth><DocApply /></RequireAuth>} />
                <Route path="/api/corpDoc" element={<RequireAuth><CorpDocApply /></RequireAuth>} />
                <Route path="/api/seal" element={<RequireAuth><SealApplyFirst /></RequireAuth>} />
                <Route path="/api/seal/imprint" element={<RequireAuth><SealApplyImprint /></RequireAuth>} />
                <Route path="/api/seal/export" element={<RequireAuth><SealApplyExport /></RequireAuth>} />
                <Route path="/api/seal/managementList" element={<RequireAuth><SealManagementList /></RequireAuth>} />
                <Route path="/api/seal/registrationList" element={<RequireAuth><SealRegistrationList /></RequireAuth>} />
                <Route path="/api/seal/exportList" element={<RequireAuth><SealExportList /></RequireAuth>} />
                <Route path="/api/corpDoc/rnpList" element={<RequireAuth><CorpDocRnpList /></RequireAuth>} />
                <Route path="/api/corpDoc/issueList" element={<RequireAuth><CorpDocIssueList /></RequireAuth>} />
                <Route path="/api/myApplyList" element={<RequireAuth><MyApplyList /></RequireAuth>} />
                <Route path="/api/myPendingList" element={<RequireAuth><MyPendingList /></RequireAuth>} />
                <Route path="/api/applyList" element={<RequireAuth><ApplicationsList /></RequireAuth>} />
                <Route path="/api/pendingList" element={<RequireAuth><PendingApprovalList /></RequireAuth>} />
                <Route path="/api/doc/receiveList" element={<RequireAuth><DocInList /></RequireAuth>} />
                <Route path="/api/doc/sendList" element={<RequireAuth><DocOutList /></RequireAuth>} />
                <Route path="/api/docstorage" element={<RequireAuth><Docstorage /></RequireAuth>} />
                <Route path="/api/docstorageList" element={<RequireAuth><DocstorageList /></RequireAuth>} />
                <Route path="/api/totalDocstorageList" element={<RequireAuth><TotalDocstorageList /></RequireAuth>} />
                <Route path="/api/rentalList" element={<RequireAuth><RentalManage /></RequireAuth>} />
                <Route path="/api/totalRentalList" element={<RequireAuth><TotalRentalManage /></RequireAuth>} />
                <Route path="/api/bcd/orderList" element={<RequireAuth><BcdOrder /></RequireAuth>} />
                <Route path="/api/std" element={<RequireAuth><StandardData /></RequireAuth>} />
                <Route path="/api/bcd/:draftId" element={<RequireAuth><DetailApplication /></RequireAuth>} />
                <Route path="/api/doc/:draftId" element={<RequireAuth><DetailDocApplication /></RequireAuth>} />
                <Route path="/api/bcd/applyList/:draftId" element={<RequireAuth><DetailApplication /></RequireAuth>} />
              </Routes>
            </MainLayout>
          } />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
