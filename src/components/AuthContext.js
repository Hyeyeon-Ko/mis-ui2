import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// AuthContext 생성 -> 인증 상태 저장
export const AuthContext = createContext();

// AuthProvider 컴포넌트 -> 인증 상태 제공
export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
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
    isUserMode: false,
    originalRole: '',
  });

  useEffect(() => {
    const userId = sessionStorage.getItem('userId');
    const hngNm = sessionStorage.getItem('hngNm');
    const role = sessionStorage.getItem('role');
    const sidebarPermissions = JSON.parse(sessionStorage.getItem('sidebarPermissions')) || [];
    const hasStandardDataAuthority = sessionStorage.getItem('hasStandardDataAuthority') === 'true';
    const instCd = sessionStorage.getItem('instCd') || '';
    const deptCd = sessionStorage.getItem('deptCd') || ''; 
    const teamCd = sessionStorage.getItem('teamCd') || '';
    const isUserMode = sessionStorage.getItem('isUserMode') === 'true';  
    const originalRole = sessionStorage.getItem('originalRole') || role;
  
    if (userId && hngNm && role) {
      setAuth({
        userId,
        hngNm,
        role,
        isAuthenticated: true,
        sidebarPermissions,
        hasStandardDataAuthority,
        instCd,
        deptCd,
        teamCd,
        isUserMode,
        originalRole,
      });
    }
  }, []);
  
  const login = (userId, hngNm, role, sidebarPermissions, hasStandardDataAuthority, instCd, deptCd, teamCd) => { 
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
      isUserMode: false,
      originalRole: role,
    };
    setAuth(newAuthState);

    console.log('Login state updated:', newAuthState);

    sessionStorage.setItem('userId', userId);
    sessionStorage.setItem('hngNm', hngNm);
    sessionStorage.setItem('role', role);
    sessionStorage.setItem('sidebarPermissions', JSON.stringify(sidebarPermissions));
    sessionStorage.setItem('hasStandardDataAuthority', hasStandardDataAuthority.toString());
    sessionStorage.setItem('instCd', instCd);
    sessionStorage.setItem('deptCd', deptCd); 
    sessionStorage.setItem('teamCd', teamCd);
    sessionStorage.setItem('isUserMode', 'false');
    sessionStorage.setItem('originalRole', role);

    console.log('Session storage updated with login data');
  };

  const logout = () => {
    console.log('Logging out, clearing session and state');

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
    sessionStorage.removeItem('isUserMode');
    sessionStorage.removeItem('originalRole');

    console.log('Session storage cleared');
  };

  const toggleMode = () => {
    setAuth((prevAuth) => {
      if (prevAuth.originalRole === 'USER') return prevAuth;
      const newMode = !prevAuth.isUserMode;
      sessionStorage.setItem('isUserMode', newMode.toString());
      const newRole = newMode ? 'USER' : prevAuth.originalRole;
      navigate(newMode ? '/' : '/api/std');

      console.log('Mode toggled:', { newMode, newRole });

      return { ...prevAuth, isUserMode: newMode, role: newRole };
    });
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout, toggleMode }}>
      {children}
    </AuthContext.Provider>
  );
};
