import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../components/AuthContext';
import '../styles/Login.css'; 
import logo from '../assets/images/logo.png';

/*로그인 페이지*/
const Login = () => {
  // 사용자 ID와 비밀번호 상태 관리
  const [userId, setUserId] = useState('');
  const [userPw, setUserPw] = useState('');

  // AuthContext에서 login 함수와 useNavigate 훅 사용
  const { auth, login } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (auth.isAuthenticated) {
      navigate('/');
    }

    const handlePopState = (event) => {
      if (auth.isAuthenticated) {
        navigate(1);
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [auth, navigate]);

  // 로그인 처리 함수
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // 로그인 API 호출
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
          // 기준자료 관리 권한 확인
          const authorityResponse = await fetch('/api/auth/standardData', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              // 필요시, 인증 토큰 추가
              'Authorization': `Bearer ${data.data.token}`
            },
          });

          if (authorityResponse.ok) {
            const authorityData = await authorityResponse.json();

            // 로그인 성공 시 사용자 정보를 AuthContext에 저장 -> 메인 페이지로 이동
            login(userId, data.data.hngNm, data.data.role, data.data.sidebarPermissions, authorityData.data);
            navigate('/');
          } else {
            console.log('Failed to check authority:', authorityResponse);
            alert('권한 확인에 실패했습니다. 다시 시도해주세요.');
          }
        } else {
          alert('로그인 정보가 올바르지 않습니다.');
          setUserId('');
          setUserPw('');
        }
      } else {
        alert('로그인에 실패했습니다. 다시 시도해주세요.');
        setUserId('');
        setUserPw('');
      }
    } catch (error) {
      console.error('Server error:', error);
      alert('서버에 문제가 발생했습니다. 나중에 다시 시도해주세요.');
      setUserId('');
      setUserPw('');
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
