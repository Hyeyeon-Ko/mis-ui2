import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../components/AuthContext';
import '../styles/Login.css'; 
import logo from '../assets/images/logo.png';

const Login = () => {
  const [userId, setUserId] = useState('');
  const [userPw, setUserPw] = useState('');
  const userIdRef = useRef(null); 

  const { auth, login } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (auth.isAuthenticated) {
      if (auth.role === 'ADMIN' || auth.role === 'MASTER') {
        navigate('/api/std');
      } else {
        navigate('/');
      }
    }
  }, [auth, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      console.log('Attempting login with:', { userId, userPw });

      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, userPw }),
      });

      if (response.ok) {
        const data = await response.json();

        if (data && data.data) {
          const authorityResponse = await fetch(`/api/auth/standardData`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${data.data.token}`
            },
          });

          if (authorityResponse.ok) {
            const authorityData = await authorityResponse.json();

            login(
              userId, 
              data.data.hngNm, 
              data.data.role, 
              data.data.sidebarPermissions, 
              authorityData.data, 
              data.data.instCd, 
              data.data.deptCd,
              data.data.teamCd,
              data.data.roleNm,
            );

            if (data.data.role === 'ADMIN' || data.data.role === 'MASTER') {
              navigate('/api/std');
            } else {
              navigate('/');
            }

          } else {
            console.error('Failed to verify authority:', authorityResponse);
            alert('권한 확인에 실패했습니다. 다시 시도해주세요.');
          }
          
        } else {
          alert('로그인 정보가 올바르지 않습니다.');
          setUserId('');
          setUserPw('');
          userIdRef.current.focus(); 
        }
      } else {
        console.error('Login failed:', response);
        alert('로그인에 실패했습니다. 다시 시도해주세요.');
        setUserId('');
        setUserPw('');
        userIdRef.current.focus(); 
      }
    } catch (error) {
      console.error('Server error:', error);
      alert('서버에 문제가 발생했습니다. 나중에 다시 시도해주세요.');
      setUserId('');
      setUserPw('');
      userIdRef.current.focus(); 
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <img src={logo} alt="KMI Logo" className="login-logo" />
        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="사번을 입력해주세요"
            className="login-input"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            ref={userIdRef} 
          />
          <input
            type="password"
            placeholder="비밀번호를 입력해주세요"
            className="login-input"
            value={userPw}
            onChange={(e) => setUserPw(e.target.value)}
          />
          <button type="submit" className="login-button">로그인</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
