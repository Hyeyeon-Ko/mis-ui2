import React from 'react';
import PropTypes from 'prop-types';
import '../../styles/corpdoc/CorpDocApprovalModal.css';
import BlankImage from '../../assets/images/blank.png';

const CorpDocApprovalModal = ({ show, onClose, documentDetails = { signitureImage: BlankImage, approvers: [] } }) => {
  if (!show) return null;

  // const renderApproverInfo = (approver, index) => (
  //   <td key={index}>
  //     <div className="approver-info">
  //       <div className="approver-image">
  //         <img src={approver?.signitureImage || BlankImage} alt="Approver" />
  //       </div>
  //       <div>{approver?.approvalDate || ''}</div>
  //       <div>{approver?.name || ''}</div>
  //     </div>
  //   </td>
  // );

  return (
    <div className="corpdoc-approval-modal-overlay">
      <div className="corpdoc-approval-modal-container">
        <div className="corpdoc-approval-modal-header">
          <h3>법인서류 결재 상세정보</h3>
          <button className="doc-confirm-close-button" onClick={onClose}>X</button>
        </div>
        <table>
          <thead>
            <tr>
              <th>신청자</th>
              {/* <th>담당자</th>
              <th>부서장</th> */}
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
                    <div>{documentDetails.date}</div>
                    <div>{documentDetails.applicantName}</div>
                  </div>
                </div>
              </td>
              {/* {Array.from({ length: 2 }).map((_, index) =>
                renderApproverInfo(documentDetails.approvers[index], index)
              )} */}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

CorpDocApprovalModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  documentDetails: PropTypes.shape({
    date: PropTypes.string.isRequired,
    applicantName: PropTypes.string.isRequired,
    signitureImage: PropTypes.string,
    approvers: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string,
        approvalDate: PropTypes.string,
        signitureImage: PropTypes.string,
      })
    ),
  }).isRequired,
};

export default CorpDocApprovalModal;
