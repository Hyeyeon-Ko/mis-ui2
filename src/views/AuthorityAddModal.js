import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import '../styles/AuthorityAddModal.css';

/* 권한 추가 모달 */
const AuthorityAddModal = ({ show, onClose, onAdd }) => {
  const [role, setRole] = useState(''); // 권한 역할 상태
  const [userId, setUserId] = useState(''); // 사번 상태
  const [queryResult, setQueryResult] = useState([]); // 조회 결과 상태

  // 모달이 닫힐 때 상태 초기화
  useEffect(() => {
    if (!show) {
      setRole('');
      setUserId('');
      setQueryResult([]);
    }
  }, [show]);

  // 조회 버튼 클릭 핸들러
  const handleQuery = async () => {
    try {
      // 백엔드에 POST 요청을 보내 사용자 이름 조회
      const response = await axios.post('/api/auth', null, { params: { userId: userId } });
      const userName = response.data.data; // 응답 데이터에서 사용자 이름 추출
      const isMaster = role === 'MASTER'; // 권한이 MASTER인지 확인

      // 조회 결과 설정
      const result = [
        {
          id: 1, // 임의의 ID 설정
          role: role,
          name: `${userName}(${userId})`,
          permissions: {
            cardManagement: isMaster,
            assetManagement: isMaster,
          },
        },
      ];
      setQueryResult(result); // 조회 결과 상태 업데이트
    } catch (error) {
      console.error('Error fetching user name:', error); 
    }
  };

  // 체크박스 변경 핸들러
  const handleCheckboxChange = (index, field) => {
    setQueryResult(prevResult =>
      prevResult.map((item, idx) =>
        idx === index
          ? { ...item, permissions: { ...item.permissions, [field]: !item.permissions[field] } }
          : item
      )
    );
  };

  // TODO : 1.  조회 버튼
	//           1-1. 권한이 또는 이름(사번) 값이 들어가있지 않으면 추가 버튼 누를시 오류 
  //                => "권한을 선택하세요" or "사번을 입력하세요"  
  //           1-2. 본인의 사번 조회시 오류 => "본인은 추가할 수 없습니다"
  //        2. 관리 종류가 한개 이상 선택되지 않을 시 오류 
  //           => "권한 관리 종류를 선택하세요"

  //        3. IllegalStateException 발생 시 오류 
  //           => "이미 존재하는 관리자입니다"

  // 추가 버튼 클릭 핸들러
  const handleAdd = async () => {
    try {
      // 백엔드에 POST 요청을 보내 새로운 권한 추가
      await axios.post('/api/auth/admin', null, { params: { userRole: role, userId: userId } });
      onAdd(); // 새로 추가된 권한 정보를 부모 컴포넌트로 전달하여 리스트를 업데이트
      onClose(); 
    } catch (error) {
      console.error('Error adding admin:', error);
    }
  };

  // 모달이 표시되지 않으면 null 반환
  if (!show) return null;

  return (
    <div className="add-modal-overlay">
      <div className="add-modal-container">
        <div className="modal-header">
          <h3>권한 추가</h3>
          <button className="close-button" onClick={onClose}>X</button> {/* 모달 닫기 버튼 */}
        </div>
        <p>권한을 부여할 사람을 선택하세요</p>
        <div className="input-group">
          <select value={role} onChange={(e) => setRole(e.target.value)}> {/* 권한 선택 드롭다운 */}
            <option value="">권한 선택</option>
            <option value="ADMIN">ADMIN</option>
            <option value="MASTER">MASTER</option>
          </select>
          <input
            type="text"
            placeholder="사번을 입력하세요."
            value={userId}
            onChange={(e) => setUserId(e.target.value)} 
          />
          <button className="query-button" onClick={handleQuery}>조회</button> {/* 조회 버튼 */}
        </div>
        {queryResult.length > 0 && (
          <table className="result-table">
            <thead>
              <tr>
                <th className="fixed-width">권한</th>
                <th className="fixed-width">이름(사번)</th>
                <th className="fixed-width">명함관리</th>
                <th className="fixed-width">자산관리</th>
              </tr>
            </thead>
            <tbody>
              {queryResult.map((item, index) => (
                <tr key={item.id}>
                  <td className="fixed-width">{item.role}</td> {/* 권한 역할 */}
                  <td className="fixed-width">{item.name}</td> {/* 이름(사번) */}
                  <td className="fixed-width">
                    <input
                      type="checkbox"
                      checked={item.permissions.cardManagement} // 명함관리 권한 체크박스
                      onChange={() => handleCheckboxChange(index, 'cardManagement')}
                    />
                  </td>
                  <td className="fixed-width">
                    <input
                      type="checkbox"
                      checked={item.permissions.assetManagement} // 자산관리 권한 체크박스
                      onChange={() => handleCheckboxChange(index, 'assetManagement')}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className="add-modal-buttons">
          <button className="add-modal-button confirm" onClick={handleAdd}><span>추가</span></button> {/* 추가 버튼 */}
        </div>
      </div>
    </div>
  );
};

// PropTypes를 사용하여 컴포넌트의 props 유형 정의
AuthorityAddModal.propTypes = {
  show: PropTypes.bool.isRequired, // 모달 표시 여부
  onClose: PropTypes.func.isRequired, // 모달 닫기 핸들러
  onAdd: PropTypes.func.isRequired, // 새로 추가된 항목을 부모 컴포넌트로 전달하는 함수
};

export default AuthorityAddModal;
