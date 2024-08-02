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
    hasStandardDataAuthority: false,
    instCd: '',
    isUserMode: false, // 유저 모드 상태 추가
  });

  // 컴포넌트 마운트 시 세션 저장소에서 인증 상태를 로드
  useEffect(() => {
    const userId = sessionStorage.getItem('userId');
    const hngNm = sessionStorage.getItem('hngNm');
    const role = sessionStorage.getItem('role');
    const sidebarPermissions = JSON.parse(sessionStorage.getItem('sidebarPermissions')) || [];
    const hasStandardDataAuthority = sessionStorage.getItem('hasStandardDataAuthority') === 'true';
    const instCd = sessionStorage.getItem('instCd') || '';
    const isUserMode = sessionStorage.getItem('isUserMode') === 'true'; // 유저 모드 상태 로드

    if (userId && hngNm && role) {
      setAuth({
        userId,
        hngNm,
        role,
        isAuthenticated: true,
        sidebarPermissions,
        hasStandardDataAuthority,
        instCd,
        isUserMode,
      });
    }
  }, []);

  // 로그인 함수
  const login = (userId, hngNm, role, sidebarPermissions, hasStandardDataAuthority, instCd) => {
    setAuth({
      userId,
      hngNm,
      role,
      isAuthenticated: true,
      sidebarPermissions,
      hasStandardDataAuthority,
      instCd,
      isUserMode: false, // 로그인 시 기본적으로 관리자 모드
    });
    sessionStorage.setItem('userId', userId);
    sessionStorage.setItem('hngNm', hngNm);
    sessionStorage.setItem('role', role);
    sessionStorage.setItem('sidebarPermissions', JSON.stringify(sidebarPermissions));
    sessionStorage.setItem('hasStandardDataAuthority', hasStandardDataAuthority.toString());
    sessionStorage.setItem('instCd', instCd);
    sessionStorage.setItem('isUserMode', 'false'); // 초기값 저장
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
      instCd: '',
      isUserMode: false, // 초기화
    });
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('hngNm');
    sessionStorage.removeItem('role');
    sessionStorage.removeItem('sidebarPermissions');
    sessionStorage.removeItem('hasStandardDataAuthority');
    sessionStorage.removeItem('instCd');
    sessionStorage.removeItem('isUserMode');
  };

  // 모드 전환 함수
  const toggleMode = () => {
    setAuth((prevAuth) => {
      const newMode = !prevAuth.isUserMode;
      sessionStorage.setItem('isUserMode', newMode.toString());
      return { ...prevAuth, isUserMode: newMode, role: newMode ? 'USER' : prevAuth.role === 'USER' ? 'ADMIN' : prevAuth.role }; // 역할 변경
    });
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout, toggleMode }}>
      {children}
    </AuthContext.Provider>
  );
};
