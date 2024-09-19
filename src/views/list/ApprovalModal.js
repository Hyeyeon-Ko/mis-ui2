import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import '../../styles/list/ApprovalModal.css';
import CheckImage from '../../assets/images/check.png';

const ApprovalModal = ({ show, onClose, documentDetails = { signitureImage: CheckImage, approvers: [] } }) => {
  useEffect(() => {
  }, []);

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
              <div style={{ width: '60pxpx', height: '60px' }}></div> 
            )}
          </div>
          <div>{approver?.userName || ''} {displayRoleOrPosition || ''}</div>
          <div>{approver?.userId || ''}</div>
        </div>
      </td>
    );
  };

  return (
    <div className="approval-modal-overlay">
      <div className="approval-modal-container">
        <div className="approval-modal-header">
          <h3>승인 진행 상황</h3>
          <button className="doc-confirm-close-button" onClick={onClose}>X</button>
        </div>
        <table>
          <thead>
            <tr>
              <th>신청자 팀장</th>
              <th>총무팀 담당자</th>
              <th>총무팀 팀장</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              {documentDetails.approvers.slice(0, 3).map((approver, index) =>
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
