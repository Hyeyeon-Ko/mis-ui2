import React, { useEffect, useState, useContext, useCallback } from 'react';
import { AuthContext } from '../../components/AuthContext';
import { validateTonerApply } from '../../hooks/validateTonerApply';
import Breadcrumb from '../../components/common/Breadcrumb';
import Table from '../../components/common/Table';
import CustomButton from '../../components/common/CustomButton';
import ConfirmModal from '../../components/common/ConfirmModal';
import axios from 'axios';
import '../../styles/common/Page.css';
import '../../styles/toner/TonerApply.css';

function TonerApply() {

  // 기본값
  const defaultTonerDetails = {
    mngNm: '',
    tonerNm: '',
    teamNm: '',
    location: '',
    printer: '',
    price: '',
    quantity: '',
    totalPrice: '',
  };

  const { auth } = useContext(AuthContext);
  const [totalAmount, setTotalAmount] = useState(0);
  const [applications, setApplications] = useState([]);
  const [mngNumOptions, setMngNumOptions] = useState([]);
  const [showApplyModal, setShowApplyModal] = useState(false);

  // 금액 포맷팅
  const formatPrice = (price) => {
    return new Intl.NumberFormat().format(price);
  }; 

  // 신청항목 총 금액 계산
  const calculateTotalPrice = useCallback(() => {
    const total = applications.reduce((sum, app) => {
      const price = parseInt(app.totalPrice.replace(/,/g, ''), 10); // Remove commas and convert to number
      return sum + (isNaN(price) ? 0 : price);
    }, 0);
    setTotalAmount(total);
  }, [applications]);

  useEffect(() => {
    calculateTotalPrice();
  }, [calculateTotalPrice]);

  // 0. 관리번호 호출
  const fetchMngNums = useCallback(async () => {
    try {
      const response = await axios.get(`/api/toner/mngNum`, {
        params: { instCd: auth.instCd }
      });
      setMngNumOptions(response.data.data.mngNums);
    } catch (error) {
      console.error('Error fetching management numbers:', error);
    }
  }, [auth.instCd]);

  useEffect(() => {
    fetchMngNums();
  }, [fetchMngNums]);

  // 1-1. 신청항목 취소 핸들러
  const handleCancelClick = (application) => {
    try {
    // 선택된 index에 해당하는 application 삭제
    const updatedApplications = applications.filter(
      (_, appIndex) => appIndex !== (application.index-1)
    );

    // 남은 applications의 index 재설정
    const reIndexedApplications = updatedApplications.map((app, newIndex) => ({
      ...app,
      index: newIndex + 1, // 1부터 다시 세팅
    }));

    setApplications(reIndexedApplications);
    } catch (error) {
      console.error('Error cancelling application:', error);
    }
  };

  // 1-2. 신청 핸들러
  const handleApplyClick = () => {
    setShowApplyModal(true);
  };

  const handleConfirmApply = async () => {
    try {
      const tonerDetailDTOs = applications.map(app => ({
        mngNum: app.mngNm,
        teamNm: app.teamNm,
        location: app.location,
        printNm: app.printer,
        tonerNm: app.tonerNm,
        price: app.price,
        quantity: app.quantity,
        totalPrice: app.totalPrice,
      }));

      const { isValid, message } = validateTonerApply(tonerDetailDTOs);
      if (!isValid) {
          alert(message);
          handleCloseApplyModal(false);
          return;
      }

      const tonerRequestDTO = {
        drafter: auth.userNm,
        drafterId: auth.userId,
        instCd: auth.instCd,
        tonerDetailDTOs,
      };

      await axios.post('/api/toner', tonerRequestDTO);
      setShowApplyModal(false);
      alert('신청이 완료되었습니다.');
      setApplications([])
    } catch (error) {
      console.error('Error applying toner:', error);
    alert('신청 중 오류가 발생했습니다.');
    setShowApplyModal(false);
    }
  };

  const handleCloseApplyModal = () => {
    setShowApplyModal(false);
  };

  // 2. 관리번호로 toner 상세정보 fetch
  const fetchTonerInfo = async (mngNum, index) => {
    try {
      const response = await axios.get(`/api/toner/info`, {
        params: { mngNum }
      });
      const data = response.data.data;
      const tonerPriceList = data.tonerPriceDTOList;

      const defaultToner = tonerPriceList[0]
      const quantity = 1;
      
      const updatedApplication = {
        ...applications[index],
        index: index,
        mngNm: data.mngNum,
        teamNm: data.teamNm,
        location: data.location,
        printer: data.modelNm,
        tonerNm: defaultToner.tonerNm,
        price: defaultToner.price,
        quantity: quantity,
        totalPrice: formatPrice(parseInt(defaultToner.price.replace(/,/g, ''), 10) * quantity),
        tonerPriceDTOList: tonerPriceList,
      };

      const updatedApplications = [...applications];
      updatedApplications[index - 1] = updatedApplication;

      setApplications(updatedApplications);
      
    } catch (error) {
      console.error('Error fetching toner info:', error);
    }
  };

  // 3. 수량 변경 핸들러
  const handleQuantityChange = (e, index) => {
    const newQuantity = parseInt(e.target.value, 10) || '';
    const price = applications[index].price ? applications[index].price.replace(/,/g, '') : '0';
    const newTotalPrice = formatPrice(parseInt(price, 10) * newQuantity);
  
    const updatedApplication = {
      ...applications[index],
      quantity: newQuantity,
      totalPrice: newTotalPrice,
    };
  
    const updatedApplications = [...applications];
    updatedApplications[index] = updatedApplication;
    setApplications(updatedApplications);
  };

  // 4. 토너명 변경 핸들러
  const handleTonerChange = (e, index) => {
    const selectedTonerNm = e.target.value;
    const application = applications[index - 1];
    const selectedToner = application.tonerPriceDTOList.find(toner => toner.tonerNm === selectedTonerNm);

    const updatedApplication = {
      ...applications[index - 1],
      tonerNm: selectedTonerNm,
      price: selectedToner.price,
      totalPrice: formatPrice(parseInt(selectedToner.price.replace(/,/g, ''), 10) * application.quantity),
    };

    const updatedApplications = [...applications];
    updatedApplications[index - 1] = updatedApplication;

    setApplications(updatedApplications);
  };

  // 5. 신청항목 추가 핸들러
  const handleAddItem = () => {
    const lastIndex = applications.length > 0 ? applications[applications.length - 1].index : 0;
    setApplications([...applications, { ...defaultTonerDetails, index: lastIndex + 1 }]);
  };

  const applyColumns = [
    { 
      header: 'No.', 
      accessor: 'index', 
      width: '5%',
    },
    {
      header: '관리번호',
      accessor: 'mngNum',
      width: '14%',
      Cell: ({ row }) => {
        const application = applications[row.index - 1];
        return (
          <select 
            value={application.mngNm? application.mngNm : ""}
            onChange={(e) => fetchTonerInfo(e.target.value, row.index)}>
          <option value="">관리번호 선택</option>
          {mngNumOptions.map(option => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        ) 
      },
    },
    {
      header: '토너명',
      accessor: 'toner',
      width: '14%',
      Cell: ({ row }) => {
        const application = applications[row.index - 1];
        return (
          <select
            value={application.tonerNm}
            onChange={(e) => handleTonerChange(e, row.index)}
          >
            {application.tonerPriceDTOList && application.tonerPriceDTOList.map((toner, idx) => (
              <option key={idx} value={toner.tonerNm}>
                {toner.tonerNm}
              </option>
            ))}
          </select>
        );
      },
    },
    { header: '부서', accessor: 'teamNm', width: '11%'},
    { header: '직무', accessor: 'location', width: '11%'},
    { header: '프린터명', accessor: 'printer', width: '11%'},
    { header: '단가', accessor: 'price', width: '9%'},
    {
      header: '수량',
      accessor: 'quantity',
      width: '5%',
      Cell: ({ row }) => (
        <input
          type="number"
          min="1"
          value={row.quantity || ''}
          onChange={(e) => handleQuantityChange(e, row.index-1)}
        />
      ),
    },
    { header: '금액', accessor: 'totalPrice', width: '11%'},
    {
      header: '',
      accessor: 'cancel',
      width: '3%',
      Cell: ({row }) => (
        <span
          className="toner-cancel-button"
          onClick={() => handleCancelClick(row)}
        >
          ×
        </span>
      ),
    },
  ];

  return (
    <div className="content">
      <div className="toner-apply-content">
        <h2>토너 신청</h2>
        <Breadcrumb items={['신청하기', '토너신청']} />
        <div className='toner-apply-header'>
          <label className='toner-apply-header-label'>신청 항목&gt;&gt;</label>
          <div className="toner-buttons-container">
            <label className='toner-apply-info'>총 건수: {applications.length}</label>
            <label className='toner-apply-info'>총 금액: {formatPrice(totalAmount)}</label>
            <CustomButton className="add-toner-button" onClick={() => handleAddItem()}>
                추 가
            </CustomButton>
            <CustomButton className="apply-request-button" onClick={() => handleApplyClick()}>
                신 청
            </CustomButton>
          </div>  
        </div>
        <Table columns={applyColumns} data={applications} isToner={true} />
      </div>
      {showApplyModal && (
        <ConfirmModal
          message="신청하시겠습니까?"
          onConfirm={handleConfirmApply}
          onCancel={handleCloseApplyModal}
        />
      )}
      </div>
  );
}

export default TonerApply;
