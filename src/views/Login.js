import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../components/common/AuthContext';
import '../styles/Login.css'; 
import logo from '../assets/images/logo.png';

// 로그인 컴포넌트
const Login = () => {

  // 사용자 ID와 비밀번호 상태 관리
  const [userId, setUserId] = useState('');
  const [userPw, setUserPw] = useState('');

  // AuthContext에서 login 함수와 useNavigate 훅 사용
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

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
        console.log('Login response data:', data);
        if (data && data.data) {
          // 로그인 성공 시 사용자 정보를 AuthContext에 저장 -> 메인 페이지로 이동
          login(userId, data.data.hngNm, data.data.role); 
          navigate('/');
        } else {
          console.error('Login response data is null or undefined');
        }
      } else {
        const errorData = await response.json();
        console.error('Login failed:', errorData);
      }
    } catch (error) {
      console.error('Error:', error);
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
