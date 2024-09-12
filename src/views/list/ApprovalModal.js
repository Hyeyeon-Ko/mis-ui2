import React from 'react';
import PropTypes from 'prop-types';
import '../../styles/list/ApprovalModal.css';
import BlankImage from '../../assets/images/blank.png';

const ApprovalModal = ({ show, onClose, documentDetails = { signitureImage: BlankImage, approvers: [] } }) => {
  if (!show) return null;

  const renderApproverInfo = (approver, index) => (
    <td key={index}>
      <div className="approver-info">
        <div className="approver-image">
          <img src={approver?.signitureImage || BlankImage} alt="Approver" />
        </div>
        <div>{approver?.approvalDate || ''}</div>
        <div>{approver?.name || ''}</div>
      </div>
    </td>
  );

  return (
    <div className="approval-modal-overlay">
      <div className="approval-modal-container">
        <div className="approval-modal-header">
          <h3>결재 진행 상황</h3>
          <button className="doc-confirm-close-button" onClick={onClose}>X</button>
        </div>
        <table>
          <thead>
            <tr>
              <th>신청자</th>
              <th>담당자</th>
              <th>부서장</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <div className="applicant-info">
                  <div className="applicant-image">
                    <img src={documentDetails.signitureImage || BlankImage} alt="Applicant" />
                  </div>
                  <div>
                    <div>임시 신청일자</div>
                    <div>임시 신청자명</div>
                  </div>
                </div>
              </td>
              {Array.from({ length: 2 }).map((_, index) =>
                renderApproverInfo(documentDetails.approvers[index], index)
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
    date: PropTypes.string,
    applicantName: PropTypes.string,
    signitureImage: PropTypes.string,
    approvers: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string,
        approvalDate: PropTypes.string,
        signitureImage: PropTypes.string,
      })
    ),
  }),
};

export default ApprovalModal;
