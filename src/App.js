import React from 'react';
import './App.css';
import Header from './components/common/Header';
import Sidebar from './components/common/Sidebar';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './views/Home';
import MyApplications from './views/MyApplications';
import ApplicationsList from './views/ApplicationList';
import BcdOrder from './views/BcdOrder';
import AuthorityManagement from './views/AuthorityManagement';
import BcdApplyFirst from './views/BcdApplyFirst';
import DetailInfo from './views/DetailInfo'; 
import PendingApprovalList from './views/PendingApprovalList';

function App() {
  return (
    <Router>
      <div className="app">
        <Sidebar />
        <div className="main-layout">
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/api/bsc/myApplyList" element={<MyApplications />} />
            <Route path="/api/bsc/applyList" element={<ApplicationsList />} />
            <Route path="/api/bsc/orderList" element={<BcdOrder />} />
            <Route path="/api/auth" element={<AuthorityManagement />} />
            <Route path="/api/bsc" element={<BcdApplyFirst />} /> 
            <Route path="/detailInfo" element={<DetailInfo />} /> 
            <Route path="/api/bsc/pendingList" element={<PendingApprovalList />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
