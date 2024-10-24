import React, { useEffect, useContext } from 'react';
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
import DetailCorpDocApplication from './views/corpdoc/DetailCorpDocApplication';
import DetailSealImprintApplication from './views/seal/DetailSealImprintApplication';
import DetailSealExportApplication from './views/seal/DetailSealExportApplication';
import DetailTonerApplication from './views/toner/DetailTonerApplication';
import DocInList from './views/doc/DocInList';
import DocOutList from './views/doc/DocOutList';
import SealManagementList from './views/seal/SealManagementList';
import SealRegistrationList from './views/seal/SealRegistrationList';
import SealTotalRegistrationList from './views/seal/SealTotalRegistrationList';
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
import TonerApply from './views/toner/TonerApply';
import TonerList from './views/toner/TonerList';
import TonerPriceList from './views/toner/TonerPriceList';
import TotalTonerList from './views/toner/TotalTonerList';
import TonerPendingList from './views/toner/TonerPendingList';
import TonerOrderList from './views/toner/TonerOrderList';
import { AuthProvider, AuthContext } from './components/AuthContext';

function MainLayout({ children }) {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

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
  const location = useLocation();

  if (!auth.isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if ((auth.role === 'ADMIN' || auth.role === 'MASTER') && location.pathname === '/') {
    return <Navigate to="/std" />;
  }

  return children;
}

function App() {
  useEffect(() => {
    const handleKeyDown = (event) => {

      if (event.key === 'F5') {
        event.preventDefault();
        window.location.reload();
      }

      if ((event.ctrlKey || event.metaKey) && event.key === 'r') {
        event.preventDefault();
        window.location.reload();
      }
    };

    const handleBeforeUnload = (event) => {
      event.returnValue = '';
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={
            <MainLayout>
              <Routes>
                <Route path="/" element={<RequireAuth><Apply /></RequireAuth>} />
                <Route path="/auth" element={<RequireAuth><AuthorityManagement /></RequireAuth>} />
                <Route path="/bcd" element={<RequireAuth><BcdApplyFirst /></RequireAuth>} />
                <Route path="/bcd/own" element={<RequireAuth><BcdApplySecond /></RequireAuth>} />
                <Route path="/bcd/other" element={<RequireAuth><BcdApplySecond /></RequireAuth>} />
                <Route path="/doc" element={<RequireAuth><DocApply /></RequireAuth>} />
                <Route path="/corpDoc" element={<RequireAuth><CorpDocApply /></RequireAuth>} />
                <Route path="/seal" element={<RequireAuth><SealApplyFirst /></RequireAuth>} />
                <Route path="/seal/imprint" element={<RequireAuth><SealApplyImprint /></RequireAuth>} />
                <Route path="/seal/export" element={<RequireAuth><SealApplyExport /></RequireAuth>} />
                <Route path="/seal/managementList" element={<RequireAuth><SealManagementList /></RequireAuth>} />
                <Route path="/seal/registrationList" element={<RequireAuth><SealRegistrationList /></RequireAuth>} />
                <Route path="/seal/sealRegistrationList" element={<RequireAuth><SealTotalRegistrationList /></RequireAuth>} />
                <Route path="/seal/exportList" element={<RequireAuth><SealExportList /></RequireAuth>} />
                <Route path="/corpDoc/rnpList" element={<RequireAuth><CorpDocRnpList /></RequireAuth>} />
                <Route path="/corpDoc/issueList" element={<RequireAuth><CorpDocIssueList /></RequireAuth>} />
                <Route path="/myApplyList" element={<RequireAuth><MyApplyList /></RequireAuth>} />
                <Route path="/myPendingList" element={<RequireAuth><MyPendingList /></RequireAuth>} />
                <Route path="/applyList" element={<RequireAuth><ApplicationsList /></RequireAuth>} />
                <Route path="/pendingList" element={<RequireAuth><PendingApprovalList /></RequireAuth>} />
                <Route path="/doc/receiveList" element={<RequireAuth><DocInList /></RequireAuth>} />
                <Route path="/doc/sendList" element={<RequireAuth><DocOutList /></RequireAuth>} />
                <Route path="/docstorage" element={<RequireAuth><Docstorage /></RequireAuth>} />
                <Route path="/docstorageList" element={<RequireAuth><DocstorageList /></RequireAuth>} />
                <Route path="/totalDocstorageList" element={<RequireAuth><TotalDocstorageList /></RequireAuth>} />
                <Route path="/rentalList" element={<RequireAuth><RentalManage /></RequireAuth>} />
                <Route path="/totalRentalList" element={<RequireAuth><TotalRentalManage /></RequireAuth>} />
                <Route path="/bcd/orderList" element={<RequireAuth><BcdOrder /></RequireAuth>} />
                <Route path="/tonerList" element={<RequireAuth><TonerList /></RequireAuth>} />
                <Route path="/tonerApply" element={<RequireAuth><TonerApply /></RequireAuth>} />
                <Route path="/totalTonerList" element={<RequireAuth><TotalTonerList /></RequireAuth>} />
                <Route path="/toner/priceList" element={<RequireAuth><TonerPriceList /></RequireAuth>} />
                <Route path="/toner/pendingList" element={<RequireAuth><TonerPendingList /></RequireAuth>} />
                <Route path="/toner/orderList" element={<RequireAuth><TonerOrderList /></RequireAuth>} />
                <Route path="/std" element={<RequireAuth><StandardData /></RequireAuth>} />
                <Route path="/bcd/:draftId" element={<RequireAuth><DetailApplication /></RequireAuth>} />
                <Route path="/doc/:draftId" element={<RequireAuth><DetailDocApplication /></RequireAuth>} />
                <Route path="/corpDoc/:draftId" element={<RequireAuth><DetailCorpDocApplication/></RequireAuth>}/>
                <Route path="/seal/imprint/:draftId" element={<RequireAuth><DetailSealImprintApplication /></RequireAuth>} />
                <Route path="/seal/export/:draftId" element={<RequireAuth><DetailSealExportApplication /></RequireAuth>} />
                <Route path="/bcd/applyList/:draftId" element={<RequireAuth><DetailApplication /></RequireAuth>} />
                <Route path="/corpDoc/applyList/:draftId" element={<RequireAuth><DetailCorpDocApplication /></RequireAuth>} />
                <Route path="/toner/applyList/:draftId" element={<RequireAuth><DetailTonerApplication /></RequireAuth>} />
              </Routes>
            </MainLayout>
          } />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
