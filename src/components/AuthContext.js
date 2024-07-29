import React, { createContext, useState, useEffect } from 'react';

/* 인증 상태 관리 */
// AuthContext 생성 -> 인증 상태 저장
export const AuthContext = createContext();

// AuthProvider 컴포넌트 -> 인증 상태 제공
export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    userId: '',
    hngNm: '',
    role: '',
    isAuthenticated: false,
    sidebarPermissions: [],
    hasStandardDataAuthority: false, // 추가된 상태 변수
  });

  // 컴포넌트 마운트 시 세션 저장소에서 인증 상태를 로드
  useEffect(() => {
    const userId = sessionStorage.getItem('userId');
    const hngNm = sessionStorage.getItem('hngNm');
    const role = sessionStorage.getItem('role');
    const sidebarPermissions = JSON.parse(sessionStorage.getItem('sidebarPermissions')) || [];
    const hasStandardDataAuthority = sessionStorage.getItem('hasStandardDataAuthority') === 'true';

    if (userId && hngNm && role) {
      setAuth({
        userId,
        hngNm,
        role,
        isAuthenticated: true,
        sidebarPermissions,
        hasStandardDataAuthority,
      });
    }
  }, []);

  // 로그인 함수
  const login = (userId, hngNm, role, sidebarPermissions, hasStandardDataAuthority) => {
    setAuth({
      userId,
      hngNm,
      role,
      isAuthenticated: true,
      sidebarPermissions,
      hasStandardDataAuthority,
    });
    sessionStorage.setItem('userId', userId);
    sessionStorage.setItem('hngNm', hngNm);
    sessionStorage.setItem('role', role);
    sessionStorage.setItem('sidebarPermissions', JSON.stringify(sidebarPermissions));
    sessionStorage.setItem('hasStandardDataAuthority', hasStandardDataAuthority.toString());
  };

  // 로그아웃 함수
  const logout = () => {
    setAuth({
      userId: '',
      hngNm: '',
      role: '',
      isAuthenticated: false,
      sidebarPermissions: [],
      hasStandardDataAuthority: false,
    });
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('hngNm');
    sessionStorage.removeItem('role');
    sessionStorage.removeItem('sidebarPermissions');
    sessionStorage.removeItem('hasStandardDataAuthority');
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
