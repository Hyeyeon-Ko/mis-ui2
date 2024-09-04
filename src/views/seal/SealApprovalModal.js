import React from 'react';
import '../../styles/seal/SealApprovalModal.css';
import BlankImage from '../../assets/images/blank.png';

const SealApprovalModal = ({ show, onClose, documentDetails = { signitureImage: BlankImage, approvers: [] } }) => {
  if (!show) return null;

  console.log("모달에 전달된 documentDetails:", documentDetails);

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
    <div className="seal-approval-modal-overlay">
      <div className="seal-approval-modal-container">
        <div className="seal-approval-modal-header">
          <h3>결재 상세정보</h3>
          <button className="doc-confirm-close-button" onClick={onClose}>X</button>
        </div>
        <table>
          <thead>
            <tr>
              <th>신청자</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <div className="applicant-info">
                  {/* <div className="applicant-image">
                    <img src={documentDetails.signitureImage || BlankImage} alt="Applicant" />
                  </div> */}
                  <div>
                    <div>{documentDetails.applicantName}</div>
                    <div>{documentDetails.date}</div>
                  </div>
                </div>
              </td>
              {Array.from({ length: 0 }).map((_, index) =>
                renderApproverInfo(documentDetails.approvers[index] || {}, index)
              )}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SealApprovalModal;
