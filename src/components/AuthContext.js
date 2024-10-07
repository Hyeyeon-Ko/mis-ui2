import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// AuthContext 생성 -> 인증 상태 저장
export const AuthContext = createContext();

// AuthProvider 컴포넌트 -> 인증 상태 제공
export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [auth, setAuth] = useState({
    userId: '',
    hngNm: '',
    role: '',
    isAuthenticated: false,
    sidebarPermissions: [],
    hasStandardDataAuthority: false,
    instCd: '',
    deptCd: '',
    teamCd: '',
    roleNm: '',
    isUserMode: false,
    originalRole: '',
  });

  const [sidebarUpdate, setSidebarUpdate] = useState(false); 

  // 앱 로드 시 세션 스토리지에서 인증 상태와 알림을 불러옴
  useEffect(() => {
    const storedNotifications = JSON.parse(sessionStorage.getItem('notifications')) || [];
    setNotifications(storedNotifications); 

    const storedAuth = {
      userId: sessionStorage.getItem('userId'),
      hngNm: sessionStorage.getItem('hngNm'),
      role: sessionStorage.getItem('role'),
      isAuthenticated: sessionStorage.getItem('isAuthenticated') === 'true',
      sidebarPermissions: JSON.parse(sessionStorage.getItem('sidebarPermissions')) || [],
      hasStandardDataAuthority: sessionStorage.getItem('hasStandardDataAuthority') === 'true',
      instCd: sessionStorage.getItem('instCd') || '',
      deptCd: sessionStorage.getItem('deptCd') || '',
      teamCd: sessionStorage.getItem('teamCd') || '',
      roleNm: sessionStorage.getItem('roleNm') || '',
      isUserMode: sessionStorage.getItem('isUserMode') === 'true',
      originalRole: sessionStorage.getItem('originalRole') || sessionStorage.getItem('role'),
    };

    if (storedAuth.userId && storedAuth.hngNm && storedAuth.role) {
      setAuth(storedAuth);
    }
  }, []);

  // 인증 상태가 변경될 때마다 세션 스토리지에 저장
  useEffect(() => {
    sessionStorage.setItem('userId', auth.userId);
    sessionStorage.setItem('hngNm', auth.hngNm);
    sessionStorage.setItem('role', auth.role);
    sessionStorage.setItem('isAuthenticated', auth.isAuthenticated.toString());
    sessionStorage.setItem('sidebarPermissions', JSON.stringify(auth.sidebarPermissions));
    sessionStorage.setItem('hasStandardDataAuthority', auth.hasStandardDataAuthority.toString());
    sessionStorage.setItem('instCd', auth.instCd);
    sessionStorage.setItem('deptCd', auth.deptCd);
    sessionStorage.setItem('teamCd', auth.teamCd);
    sessionStorage.setItem('roleNm', auth.roleNm);
    sessionStorage.setItem('isUserMode', auth.isUserMode.toString());
    sessionStorage.setItem('originalRole', auth.originalRole);
  }, [auth]);

  const login = (userId, hngNm, role, sidebarPermissions, hasStandardDataAuthority, instCd, deptCd, teamCd, roleNm) => {
    const newAuthState = {
      userId,
      hngNm,
      role,
      isAuthenticated: true,
      sidebarPermissions,
      hasStandardDataAuthority,
      instCd,
      deptCd,
      teamCd,
      roleNm,
      isUserMode: false,
      originalRole: role,
    };
    setAuth(newAuthState);

    navigate('/');
  };

  const logout = () => {
    setAuth({
      userId: '',
      hngNm: '',
      role: '',
      isAuthenticated: false,
      sidebarPermissions: [],
      hasStandardDataAuthority: false,
      instCd: '',
      deptCd: '',
      teamCd: '',
      roleNm: '',
      isUserMode: false,
      originalRole: '',
    });

    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('hngNm');
    sessionStorage.removeItem('role');
    sessionStorage.removeItem('sidebarPermissions');
    sessionStorage.removeItem('hasStandardDataAuthority');
    sessionStorage.removeItem('instCd');
    sessionStorage.removeItem('deptCd');
    sessionStorage.removeItem('teamCd');
    sessionStorage.removeItem('roleNm');
    sessionStorage.removeItem('isUserMode');
    sessionStorage.removeItem('originalRole');

    sessionStorage.clear();
    navigate('/login');
  };

  const toggleMode = () => {
    setAuth((prevAuth) => {
      if (prevAuth.originalRole === 'USER') return prevAuth;
      const newMode = !prevAuth.isUserMode;
      const newRole = newMode ? 'USER' : prevAuth.originalRole;
      navigate(newMode ? '/' : '/std');

      return { ...prevAuth, isUserMode: newMode, role: newRole };
    });
  };

  const refreshSidebar = () => {
    setSidebarUpdate((prev) => !prev);
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout, toggleMode, notifications, setNotifications, refreshSidebar, sidebarUpdate }}>
      {children}
    </AuthContext.Provider>
  );
};
