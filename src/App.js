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
import { AuthProvider } from './components/AuthContext';
import RequireAuth from './components/RequireAuth';

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
                <Route path="/" element={
                  <RequireAuth>
                    <Home />
                  </RequireAuth>
                } />
                <Route path="/api/myApplyList" element={
                  <RequireAuth>
                    <MyApplications />
                  </RequireAuth>
                } />
                <Route path="/api/applyList" element={
                  <RequireAuth>
                    <ApplicationsList />
                  </RequireAuth>
                } />
                <Route path="/api/bsc/orderList" element={
                  <RequireAuth>
                    <BcdOrder />
                  </RequireAuth>
                } />
                <Route path="/api/auth" element={
                  <RequireAuth>
                    <AuthorityManagement />
                  </RequireAuth>
                } />
                <Route path="/api/bsc" element={
                  <RequireAuth>
                    <BcdApplyFirst />
                  </RequireAuth>
                } />
                <Route path="/detailInfo" element={
                  <RequireAuth>
                    <DetailInfo />
                  </RequireAuth>
                } />
                <Route path="/api/pendingList" element={
                  <RequireAuth>
                    <PendingApprovalList />
                  </RequireAuth>
                } />
              </Routes>
            </MainLayout>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
