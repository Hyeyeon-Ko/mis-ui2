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
        navigate('/std');
      } else {
        navigate('/');
      }
    }
  }, [auth, navigate]);

  useEffect(() => {
    if (userIdRef.current) {
      userIdRef.current.focus();
    }
  }, []); 

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // 1. /api/login 요청을 보내 로그인 시도
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
          const userNm = data.data;

          // 2. /api/login/info 요청을 보내 추가 세션 정보를 받아옴
          const sessionInfoResponse = await fetch(`/api/login/info`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId, userNm }),
          });

          if (sessionInfoResponse.ok) {
            const sessionInfoData = await sessionInfoResponse.json();

            // 3. authority 데이터를 가져오는 기존 기능 유지
            const authorityResponse = await fetch(`/api/auth/standardData`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${data.data.token}`, // 기존 토큰 전송 로직 유지
              },
            });

            if (authorityResponse.ok) {
              const authorityData = await authorityResponse.json();

              // 4. 로그인 후 세션 정보 및 권한 처리
              login(
                userId,
                sessionInfoData.data.userNm,
                sessionInfoData.data.role,
                sessionInfoData.data.sidebarPermissions,
                authorityData.data,  // authorityData 기존 로직 유지
                sessionInfoData.data.instCd,
                sessionInfoData.data.deptCd,
                sessionInfoData.data.deptCode,
                sessionInfoData.data.teamCd,
                sessionInfoData.data.roleNm,
              );

              // 권한에 따라 페이지 이동
              if (sessionInfoData.data.role === 'ADMIN' || sessionInfoData.data.role === 'MASTER') {
                navigate('/std');
              } else {
                navigate('/');
              }

            } else {
              console.error('Failed to verify authority:', authorityResponse);
              alert('권한 확인에 실패했습니다. 다시 시도해주세요.');
            }

          } else {
            console.error('Failed to fetch session info:', sessionInfoResponse);
            alert('세션 정보를 가져오는 데 실패했습니다. 다시 시도해주세요.');
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
