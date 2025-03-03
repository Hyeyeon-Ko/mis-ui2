import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// AuthContext 생성 -> 인증 상태 저장
export const AuthContext = createContext();

// AuthProvider 컴포넌트 -> 인증 상태 제공
export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [sidebarUpdate, setSidebarUpdate] = useState(false); 
  const [auth, setAuth] = useState({
    userId: '',
    userNm: '',
    role: '',
    isAuthenticated: false,
    sidebarPermissions: [],
    hasStandardDataAuthority: false,
    instCd: '',
    deptCd: '',
    deptCode: '',
    teamCd: '',
    roleNm: '',
    isUserMode: false,
    originalRole: '',
  });

  // 앱 로드 시 세션 스토리지에서 인증 상태와 알림을 불러옴
  useEffect(() => {
    const storedAuth = {
      userId: sessionStorage.getItem('userId'),
      userNm: sessionStorage.getItem('userNm'),
      role: sessionStorage.getItem('role'),
      isAuthenticated: sessionStorage.getItem('isAuthenticated') === 'true',
      sidebarPermissions: JSON.parse(sessionStorage.getItem('sidebarPermissions')) || [],
      hasStandardDataAuthority: sessionStorage.getItem('hasStandardDataAuthority') === 'true',
      instCd: sessionStorage.getItem('instCd') || '',
      deptCd: sessionStorage.getItem('deptCd') || '',
      deptCode: sessionStorage.getItem('deptCode') || '',
      teamCd: sessionStorage.getItem('teamCd') || '',
      roleNm: sessionStorage.getItem('roleNm') || '',
      isUserMode: sessionStorage.getItem('isUserMode') === 'true',
      originalRole: sessionStorage.getItem('originalRole') || sessionStorage.getItem('role'),
    };
    if (storedAuth.userId && storedAuth.userNm && storedAuth.role) {
      setAuth(storedAuth);
    }
  }, []);
  
  // 인증 상태가 변경될 때마다 세션 스토리지에 저장
  useEffect(() => {
    sessionStorage.setItem('userId', auth.userId);
    sessionStorage.setItem('userNm', auth.userNm);
    sessionStorage.setItem('role', auth.role);
    sessionStorage.setItem('isAuthenticated', auth.isAuthenticated.toString());
    sessionStorage.setItem('sidebarPermissions', JSON.stringify(auth.sidebarPermissions));
    sessionStorage.setItem('hasStandardDataAuthority', auth.hasStandardDataAuthority.toString());
    sessionStorage.setItem('instCd', auth.instCd);
    sessionStorage.setItem('deptCd', auth.deptCd);
    sessionStorage.setItem('deptCode', auth.deptCode);
    sessionStorage.setItem('teamCd', auth.teamCd);
    sessionStorage.setItem('roleNm', auth.roleNm);
    sessionStorage.setItem('isUserMode', auth.isUserMode.toString());
    sessionStorage.setItem('originalRole', auth.originalRole);
  }, [auth]);

  const login = useCallback((userId, userNm, role, sidebarPermissions, hasStandardDataAuthority, instCd, deptCd, deptCode, teamCd, roleNm) => {
    const newAuthState = {
      userId,
      userNm,
      role,
      isAuthenticated: true,
      sidebarPermissions,
      hasStandardDataAuthority,
      instCd,
      deptCd,
      deptCode,
      teamCd,
      roleNm,
      isUserMode: false,
      originalRole: role,
    };
    setAuth(newAuthState);
    navigate('/');
  }, [navigate]);

  const logout = useCallback(() => {
    setAuth({
      userId: '',
      userNm: '',
      role: '',
      isAuthenticated: false,
      sidebarPermissions: [],
      hasStandardDataAuthority: false,
      instCd: '',
      deptCd: '',
      deptCode: '',
      teamCd: '',
      roleNm: '',
      isUserMode: false,
      originalRole: '',
    });

    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('userNm');
    sessionStorage.removeItem('role');
    sessionStorage.removeItem('sidebarPermissions');
    sessionStorage.removeItem('hasStandardDataAuthority');
    sessionStorage.removeItem('instCd');
    sessionStorage.removeItem('deptCd');
    sessionStorage.removeItem('deptCode');
    sessionStorage.removeItem('teamCd');
    sessionStorage.removeItem('roleNm');
    sessionStorage.removeItem('isUserMode');
    sessionStorage.removeItem('originalRole');

    sessionStorage.clear();
    navigate('/login');
  }, [navigate]);

  const toggleMode = useCallback(() => {
    setAuth((prevAuth) => {
      if (prevAuth.originalRole === 'USER') return prevAuth;
      const newMode = !prevAuth.isUserMode;
      const newRole = newMode ? 'USER' : prevAuth.originalRole;
      navigate(newMode ? '/' : '/std');
      return { ...prevAuth, isUserMode: newMode, role: newRole };
    });
  }, [navigate]);

  const refreshSidebar = () => {
    setSidebarUpdate((prev) => !prev);
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout, toggleMode, notifications, setNotifications, refreshSidebar, sidebarUpdate }}>
      {children}
    </AuthContext.Provider>
  );
};
