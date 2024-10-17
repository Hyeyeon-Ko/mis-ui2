import React, { useState, useEffect, useContext } from 'react';
import './../styles/common/OrgChartModal.css';
import CustomButton from './../components/common/CustomButton';
import { AuthContext } from './AuthContext';
import axios from 'axios';

const OrgChartModal = ({ show, onClose, onConfirm, renderOrgTree, selectedUsers, setSelectedUsers, teamMembers = [], mode = 'bcd' }) => {
  const [selectedRows, setSelectedRows] = useState([]);
  const { auth } = useContext(AuthContext);

  const docType = mode === 'bcd' ? '명함신청' : '문서수발신';

  useEffect(() => {
    if (show && auth.instCd) {
      axios.get('/api/info/confirm', { params: { instCd: auth.instCd } })
        .then(response => {
          if (response.data && response.data.data) {
            const {
              teamLeaderId,
              teamLeaderNm,
              teamLeaderRoleNm,
              teamLeaderPositionNm,
              teamLeaderDept,
              managerId,
              managerNm,
              managerRoleNm,
              managerPositionNm,
              managerDept
            } = response.data.data[0];

            const teamLeaderSeq = (mode === 'bcd' && auth.teamCd !== 'FDT12' && auth.teamCd !== 'CNT2') ? 3 : 1;

            const teamLeader = {
              userId: teamLeaderId,
              userNm: teamLeaderNm,
              positionNm: teamLeaderPositionNm,
              roleNm: teamLeaderRoleNm,
              department: teamLeaderDept,
              status: '대기',
              docType: docType,
              seq: teamLeaderSeq,
            };

            const manager = {
              userId: managerId,
              userNm: managerNm,
              positionNm: managerPositionNm,
              roleNm: managerRoleNm,
              department: managerDept,
              status: '대기',
              docType: docType,
              seq: 2,
            };

            let approvers = [];

            if (mode === 'bcd') {
              if (auth.teamCd === 'FDT12' || auth.teamCd === 'CNT2') {
                approvers = [teamLeader];
              } else {
                approvers = [manager, teamLeader]; 
              }
            } else if (mode === 'doc') {
              if (auth.teamCd === 'FDT12' || auth.teamCd === 'CNT2') {
                approvers = [teamLeader]; 
              } else {
                approvers = [manager];
              }
            }

            setSelectedUsers(approvers);
          }
        })
        .catch(error => {
          console.error('Error fetching confirm data:', error);
        });
    }
  }, [show, auth.instCd, auth.teamCd, setSelectedUsers, docType, mode]);

  if (!show) return null;

  const handleRowSelect = (userId) => {
    setSelectedRows((prevSelectedRows) =>
      prevSelectedRows.includes(userId)
        ? prevSelectedRows.filter((id) => id !== userId)
        : [...prevSelectedRows, userId]
    );
  };

  const handleSelectMember = (userId) => {
    axios.get(`/api/info/${userId}`)
      .then(response => {
        if (response.data && response.data.data) {
          const { userName, roleNm, positionNm, deptNm } = response.data.data;

          const newUser = {
            userId,
            userNm: userName,
            positionNm,
            roleNm,
            department: deptNm,
            status: '대기',
            docType: docType,
            seq: 1,
          };

          setSelectedUsers(prevSelectedUsers => [
            newUser,
            ...prevSelectedUsers.filter(user => user.seq !== 1),
          ]);
        }
      })
      .catch(error => {
        console.error('Error fetching user data:', error);
      });
  };

  const handleReset = () => {
    setSelectedUsers((prevSelectedUsers) =>
      prevSelectedUsers.filter((user) => mode === 'bcd' ? user.seq === 2 || user.seq === 3 : user.seq === 2)
    );
    setSelectedRows([]);
  };

  const handleConfirmClick = () => {
    const 신청자팀장 = selectedUsers.find(user => user.seq === 1);

    if (!['팀장', '파트장', '본부장'].includes(신청자팀장?.roleNm)) {
      alert('신청자 팀장의 직책은 팀장, 파트장 또는 본부장이어야 합니다.');
      return;
    }

    onConfirm();
  };

  const renderApproverInfo = (user, index) => {
    const displayRoleOrPosition = user?.roleNm === '팀원' ? user?.positionNm : user?.roleNm;

    return (
      <td key={index}>
        <div className="approver-line-info">
          <div>{user?.userNm || ''} {displayRoleOrPosition || ''}</div>
          <div>{user?.userId || ''}</div>
        </div>
      </td>
    );
  };

  const 총무팀_담당자 = auth.teamCd === 'CNT2' ? '경영지원팀 담당자' : '총무팀 담당자';
  const 총무팀_팀장 = auth.teamCd === 'CNT2' ? '경영지원팀 팀장' : '총무팀 팀장';

  const 신청자팀장 = selectedUsers.find(user => user.seq === 1);
  const 총무팀담당자 = selectedUsers.find(user => user.seq === 2);
  const 총무팀팀장 = selectedUsers.find(user => user.seq === 3);

  return (
    <div className="orgChart-modal-overlay">
      <div className="orgChart-modal-content">
        <div className="orgChart-modal-header">
          <h2 className="orgChart-title">결재선 지정</h2>
          <button className="orgChart-close-button" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="orgChart-modal-body">
          <div className="orgChart-left">
          <div className="orgChart-tree">
            {renderOrgTree(auth.instCd === '111' ? 'B100' : '0000')}
          </div>

            <div className="orgChart-team-members">
              <ul>
                {teamMembers.length > 0 ? (
                  teamMembers.map((member) => (
                    <li key={member.userId}>
                      <div className="team-member-info">
                        <span>{member.userNm} {member.roleNm} </span>
                        <span className="role">{member.positionNm} ({member.userId})</span>
                      </div>
                      <div className="team-member-actions">
                        <button onClick={() => handleSelectMember(member.userId)}>선택</button>
                      </div>
                    </li>
                  ))
                ) : (
                  <p></p>
                )}
              </ul>
            </div>
          </div>
          <div className="orgChart-selection">
            <div className="orgChart-selection-header">
              <h3>선택 정보</h3>
              <div className="orgChart-selection-buttons">
                <CustomButton onClick={handleReset} className="white-button">초기화</CustomButton>
              </div>
            </div>
            <table>
              <thead>
                <tr>
                  <th className="col-num">순번</th>
                  <th className="col-name">이름</th>
                  <th className="col-title">직책</th>
                  <th className="col-position">직위</th>
                  <th className="col-status">상태</th>
                  <th className="col-docType">종류</th>
                  <th className="col-department">부서</th>
                </tr>
              </thead>
              <tbody>
                {selectedUsers
                  .filter(user => !(auth.teamCd === 'FDT12' || auth.teamCd === 'CNT2') || user.seq !== 2)
                  .map((user, index) => (
                    <tr
                      key={user.userId}
                      onClick={() => handleRowSelect(user.userId)}
                      className={selectedRows.includes(user.userId) ? 'selected-row' : ''}
                    >
                      <td>{user.seq || index + 1}</td>
                      <td>{user.userNm}</td>
                      <td>{user.roleNm || '팀원'}</td>
                      <td>{user.positionNm || '사원'}</td>
                      <td>{user.status || ''}</td>
                      <td>{user.docType || docType}</td>
                      <td>{user.department || '부서 없음'}</td>
                    </tr>
                  ))}
              </tbody>
            </table>

            {!(auth.teamCd === 'FDT12' || auth.teamCd === 'CNT2') && (
              <div className="selection-container">
                <table>
                  <thead>
                    <tr>
                      {신청자팀장 && <th>신청자 팀장</th>}  
                      <th>{총무팀_담당자}</th>
                      {mode === 'bcd' && <th>{총무팀_팀장}</th>}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      {신청자팀장 && renderApproverInfo(신청자팀장, 0)} 
                      {총무팀담당자 && renderApproverInfo(총무팀담당자, 1)}
                      {mode === 'bcd' && 총무팀팀장 && renderApproverInfo(총무팀팀장, 2)}
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            <div className="selection-guidance-container">
              {(auth.teamCd === 'FDT12' || auth.teamCd === 'CNT2') && (
                <>
                  <p className="selection-guidance-header">※ 참고사항 ※</p>
                  <p className="selection-guidance-body">
                    {auth.teamCd === 'CNT2' ? '경영지원팀' : '총무팀'}의 경우 승인라인을 설정하지 않으셔도 됩니다.
                  </p>
                </>
              )}

              {mode === 'bcd' && auth.teamCd !== 'FDT12' && auth.teamCd !== 'CNT2' && (
                <>
                  <p className="selection-guidance-header">※ 참고사항 ※</p>
                  <p className="selection-guidance-body">
                    명함 신청자(본인) 부서의 팀장님을 선택하세요.
                  </p>
                  <p className="selection-guidance-body">
                    팀장님이 없는 부서의 경우 본부장님 또는 파트장님을 선택하세요.
                  </p>
                  <p className="selection-guidance-body">
                    2, 3번은 {auth.teamCd === 'CNT2' ? '경영지원팀' : '총무팀'} 담당자로 자동 설정되어 있습니다.
                  </p>
                </>
              )}

              {mode === 'doc' && auth.teamCd !== 'FDT12' && auth.teamCd !== 'CNT2' && (
                <>
                  <p className="selection-guidance-header">※ 참고사항 ※</p>
                  <p className="selection-guidance-body">
                    신청자(본인) 부서의 팀장님을 선택하세요.
                  </p>
                  <p className="selection-guidance-body">
                    팀장님이 없는 부서의 경우 본부장님 또는 파트장님을 선택하세요.
                  </p>
                  <p className="selection-guidance-body">
                    2번은 {auth.teamCd === 'CNT2' ? '경영지원팀' : '총무팀'} 담당자로 자동 설정되어 있습니다.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="orgChart-modal-footer">
          <CustomButton onClick={handleConfirmClick} className="approve-button">확인</CustomButton>
          <CustomButton onClick={onClose} className="chart-cancel-button">취소</CustomButton>
        </div>
      </div>
    </div>
  );
};

export default OrgChartModal;
