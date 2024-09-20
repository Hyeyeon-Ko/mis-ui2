import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import '../../styles/list/ApprovalModal.css';
import CheckImage from '../../assets/images/check.png';

const ApprovalModal = ({ show, onClose, documentDetails = { signitureImage: CheckImage, approvers: [], docType: '' } }) => {
  useEffect(() => {}, []);

  if (!show) return null;

  const renderApproverInfo = (approver, index) => {
    const displayRoleOrPosition = approver?.roleNm === '팀원' ? approver?.positionNm : approver?.roleNm;

    return (
      <td key={index}>
        <div className="approver-info">
          <div className="check-image">
            {approver?.currentApproverIndex > index ? (
              <img src={approver?.signitureImage || CheckImage} alt="Approver" />
            ) : (
              <div style={{ width: '60px', height: '60px' }}></div>
            )}
          </div>
          <div>{approver?.userName || ''} {displayRoleOrPosition || ''}</div>
          <div>{approver?.userId || ''}</div>
        </div>
      </td>
    );
  };

  // 문서 타입에 따른 열 정의
  const getColumnsByDocType = () => {
    switch (documentDetails.docType) {
      case '명함신청':
        return ['신청자 팀장', '총무팀 담당자', '총무팀 팀장'];
      case '문서수신':
        return ['총무팀 담당자'];
      case '문서발신':
        return ['신청자 팀장', '총무팀 담당자'];
      default:
        return [];
    }
  };

  const columns = getColumnsByDocType();
  const approversToShow = columns.length;
  const modalWidth = approversToShow * 170 + 60; // 각 열 너비에 맞게 모달의 너비를 계산

  return (
    <div className="approval-modal-overlay">
      <div className="approval-modal-container" style={{ width: `${modalWidth}px` }}>
        <div className="approval-modal-header">
          <h3>승인 진행 상황</h3>
          <button className="doc-confirm-close-button" onClick={onClose}>X</button>
        </div>
        <table>
          <thead>
            <tr>
              {columns.map((column, index) => (
                <th key={index}>{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {documentDetails.approvers.slice(0, approversToShow).map((approver, index) =>
                renderApproverInfo(approver, index)
              )}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

ApprovalModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  documentDetails: PropTypes.shape({
    docType: PropTypes.string,
    signitureImage: PropTypes.string,
    approvers: PropTypes.arrayOf(
      PropTypes.shape({
        userId: PropTypes.string,
        userName: PropTypes.string,
        roleNm: PropTypes.string,
        positionNm: PropTypes.string,
        signitureImage: PropTypes.string,
        currentApproverIndex: PropTypes.number,
      })
    ),
  }),
};

export default ApprovalModal;
