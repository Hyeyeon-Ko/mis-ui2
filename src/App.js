import React from 'react';
import './App.css';
import Header from './components/common/Header';
import Sidebar from './components/common/Sidebar';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import Home from './views/Home';
import Login from './views/Login';
import MyApplyList from './views/MyApplyList';
import MyPendingList from './views/MyPendingList';
import ApplicationsList from './views/ApplicationList';
import BcdOrder from './views/BcdOrder';
import AuthorityManagement from './views/AuthorityManagement';
import BcdApplyFirst from './views/BcdApplyFirst';
import BcdApplySecond from './views/BcdApplySecond';
import DetailApplication from './views/DetailApplication';
import PendingApprovalList from './views/PendingApprovalList';
import { AuthProvider } from './components/AuthContext';
import RequireAuth from './components/RequireAuth';
import StandardData from './views/StandardData';

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
                <Route path="/api/myApplyList" element={<RequireAuth><MyApplyList /></RequireAuth>} />
                <Route path="/api/myPendingList" element={<RequireAuth><MyPendingList /></RequireAuth>} />
                <Route path="/api/bcd/:draftId" element={<RequireAuth><DetailApplication /></RequireAuth>} />
                <Route path="/api/applyList" element={<RequireAuth><ApplicationsList /></RequireAuth>} />
                <Route path="/api/bcd/orderList" element={<RequireAuth><BcdOrder /></RequireAuth>} />
                <Route path="/api/auth" element={<RequireAuth><AuthorityManagement /></RequireAuth>} />
                <Route path="/api/bcd" element={<RequireAuth><BcdApplyFirst /></RequireAuth>} />
                <Route path="/api/bcd/own" element={<RequireAuth><BcdApplySecond /></RequireAuth>} />
                <Route path="/api/bcd/other" element={<RequireAuth><BcdApplySecond /></RequireAuth>} />
                <Route path="/api/pendingList" element={<RequireAuth><PendingApprovalList /></RequireAuth>} />
                <Route path="/api/standard" element={<RequireAuth><StandardData /></RequireAuth>} />
                <Route path="/api/bcd/applyList/:draftId" element={<RequireAuth><DetailApplication /></RequireAuth>} />
              </Routes>
            </MainLayout>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
