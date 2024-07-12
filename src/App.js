import React from 'react';
import './App.css';
import Header from './components/common/Header';
import Sidebar from './components/common/Sidebar';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import Home from './views/Home';
import Login from './views/Login';
import MyApplications from './views/MyApplications';
import ApplicationsList from './views/ApplicationList';
import BcdOrder from './views/BcdOrder';
import AuthorityManagement from './views/AuthorityManagement';
import BcdApplyFirst from './views/BcdApplyFirst';
import DetailInfo from './views/DetailInfo'; 
import PendingApprovalList from './views/PendingApprovalList';
import { AuthProvider } from './components/common/AuthContext';

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

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/api/login" element={<Login />} />
          <Route path="*" element={
            <MainLayout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/api/myApplyList" element={<MyApplications />} />
                <Route path="/api/applyList" element={<ApplicationsList />} />
                <Route path="/api/bsc/orderList" element={<BcdOrder />} />
                <Route path="/api/auth" element={<AuthorityManagement />} />
                <Route path="/api/bsc" element={<BcdApplyFirst />} /> 
                <Route path="/detailInfo" element={<DetailInfo />} /> 
                <Route path="/api/pendingList" element={<PendingApprovalList />} />
              </Routes>
            </MainLayout>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
