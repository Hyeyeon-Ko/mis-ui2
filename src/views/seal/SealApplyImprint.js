import React from 'react';
import Breadcrumb from '../../components/common/Breadcrumb';
import CustomButton from '../../components/common/CustomButton';
import '../../styles/common/Page.css';
import '../../styles/seal/SealApplyImprint.css';
import corporateSeal from '../../assets/images/corporate_seal.png';
import facsimileSeal from '../../assets/images/facsimile_seal.png';
import companySeal from '../../assets/images/company_seal.png';

function SealApplyImprint() {
    return (
        <div className="content">
            <div className="seal-imprint-content">
                <h2>인장신청</h2>
                <Breadcrumb items={['신청하기', '인장신청']} />
                <div className='seal-imprint-main'>
                    <div className='seal-imprint-apply-content'>
                        <form className='seal-imprint-form'>
                            <div className='seal-imprint-bold-label'>
                                <label>인장 날인 신청서</label>
                            </div>
                            <div className='seal-imprint-form-group'>
                                <label>제출처</label>
                                <input
                                    type="text"
                                    name="destination"
                                />
                            </div>
                            <div className='seal-imprint-form-group'>
                                <label>사용일자</label>
                                <input
                                    type="text"
                                    name="useDate"
                                />
                            </div>
                            <div className='seal-imprint-form-group'>
                                <label>사용목적</label>
                                <textarea
                                    name="purpose"
                                />
                            </div>
                            <div className='seal-imprint-form-group'>
                                <label>인장구분</label>
                                <div className="seal-imprint-options">
                                    <label>
                                        <div className='seal-imprint-detail-option'>
                                            <div className='seal-imprint-detail-left'>
                                                <input type="radio" name="seal" value="corporateSeal" />
                                            </div>
                                            <div className='seal-imprint-detail-right'>
                                                <img src={corporateSeal} alt="Corporate Seal" className="seal-imprint-image" />
                                                <span>법인인감</span>
                                            </div>
                                        </div>
                                    </label>
                                    <label>
                                        <div className='seal-imprint-detail-option'>
                                            <div className='seal-imprint-detail-left'>
                                                <input type="radio" name="seal" value="facsimileSeal" />
                                            </div>
                                            <div className='seal-imprint-detail-right'>
                                                <img src={facsimileSeal} alt="Facsimile Seal" className="seal-imprint-image" />
                                                <span>사용인감</span>
                                            </div>
                                        </div>
                                    </label>
                                    <label>
                                        <div className='seal-imprint-detail-option'>
                                            <div className='seal-imprint-detail-left'>
                                                <input type="radio" name="seal" value="companySeal" />
                                            </div>
                                            <div className='seal-imprint-detail-right'>
                                                <img src={companySeal} alt="Company Seal" className="seal-imprint-image" />
                                                <span>회사인</span>
                                            </div>
                                        </div>
                                    </label>
                                </div>
                            </div>
                            <div className='seal-imprint-form-group'>
                                <label>날인부수</label>
                                <select name="quantity">
                                    <option value="">선택하세요</option>
                                    <option value="1">1부</option>
                                    <option value="2">2부</option>
                                    <option value="3">3부</option>
                                    <option value="4">4부</option>
                                    <option value="5">5부</option>
                                </select>
                            </div>
                            <div className='seal-imprint-form-group'>
                                <label>특이사항</label>
                                <textarea
                                    name="notes"
                                />
                            </div>
                            <div className="seal-imprint-apply-button-container">
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

export default SealApplyImprint;
