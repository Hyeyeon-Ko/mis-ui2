import React from 'react';
import Breadcrumb from '../../components/common/Breadcrumb';
import CustomButton from '../../components/common/CustomButton';
import '../../styles/common/Page.css';
import '../../styles/SealApplyExport.css';
import corporateSeal from '../../assets/images/corporate_seal.png';
import facsimileSeal from '../../assets/images/facsimile_seal.png';
import companySeal from '../../assets/images/company_seal.png';

function SealApplyExport() {
    return (
        <div className="content">
            <div className="seal-export-content">
                <h2>인장신청</h2>
                <Breadcrumb items={['신청하기', '인장신청']} />
                <div className='seal-export-main'>
                    <div className='seal-export-apply-content'>
                        <form className='seal-export-form'>
                            <div className='seal-export-bold-label'>
                                <label>인장 반출 신청서</label>
                            </div>
                            <div className='seal-export-form-group'>
                                <label>제출처</label>
                                <input
                                    type="text"
                                    name="destination"
                                />
                            </div>
                            <div className='seal-export-form-group'>
                                <label>신청부서</label>
                                <input
                                    type="text"
                                    name="department"
                                />
                            </div>
                            <div className='seal-export-form-group'>
                                <label>사용용도</label>
                                <textarea
                                    name="purpose"
                                />
                            </div>
                            <div className='seal-export-form-group'>
                                <label>인장구분</label>
                                <div className="seal-export-options">
                                    <label>
                                        <div className='seal-export-detail-option'>
                                            <div className='seal-export-detail-left'>
                                                <input type="radio" name="seal" value="corporateSeal" />
                                            </div>
                                            <div className='seal-export-detail-right'>
                                                <img src={corporateSeal} alt="Corporate Seal" className="seal-export-image" />
                                                <span>법인인감</span>
                                            </div>
                                        </div>
                                    </label>
                                    <label>
                                        <div className='seal-export-detail-option'>
                                            <div className='seal-export-detail-left'>
                                                <input type="radio" name="seal" value="facsimileSeal" />
                                            </div>
                                            <div className='seal-export-detail-right'>
                                                <img src={facsimileSeal} alt="Facsimile Seal" className="seal-export-image" />
                                                <span>사용인감</span>
                                            </div>
                                        </div>
                                    </label>
                                    <label>
                                        <div className='seal-export-detail-option'>
                                            <div className='seal-export-detail-left'>
                                                <input type="radio" name="seal" value="companySeal" />
                                            </div>
                                            <div className='seal-export-detail-right'>
                                                <img src={companySeal} alt="Company Seal" className="seal-export-image" />
                                                <span>회사인</span>
                                            </div>
                                        </div>
                                    </label>
                                </div>
                            </div>
                            <div className='seal-export-form-group'>
                                <label>반출자명</label>
                                <input
                                    type="text"
                                    name="draftNm"
                                />
                            </div>
                            <div className='seal-export-form-group'>
                                <label>반출일자</label>
                                <input
                                    type="text"
                                    name="exportDate"
                                />
                            </div>
                            <div className='seal-export-form-group'>
                                <label>반납일자</label>
                                <input
                                    type="text"
                                    name="returnDate"
                                />
                            </div>
                            <div className='seal-export-form-group'>
                                <label>참조자료</label>
                                <input
                                    type="file"
                                    name="purposeFile"
                                    className="file-input"
                                />
                            </div>
                            <div className="seal-export-apply-button-container">
                                <CustomButton className="apply-request-button" type="submit">
                                    서류 신청하기
                                </CustomButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SealApplyExport;
