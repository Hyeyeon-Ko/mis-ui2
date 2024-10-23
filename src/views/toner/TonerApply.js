import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../components/AuthContext';
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
  const [applications, setApplications] = useState([]);
  const [mngNumOptions, setMngNumOptions] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);

  // 금액 포맷팅
  const formatPrice = (price) => {
    return new Intl.NumberFormat().format(price);
  }; 

  // 0. 관리번호 호출
  const fetchMngNums = async () => {
    try {
      const response = await axios.get(`/api/toner/mngNum`, {
        params: { instCd: auth.instCd }
      });
      setMngNumOptions(response.data.data.mngNums);
    } catch (error) {
      console.error('Error fetching management numbers:', error);
    }
  };

  useEffect(() => {
    fetchMngNums();
  }, [auth.instCd]);

  // 1. 신청항목 취소 핸들러
  const handleCancelClick = (application) => {
    setSelectedApplication(application);
    setShowConfirmModal(true);
  };

  const handleConfirmCancel = async () => {
    try {
    // 선택된 index에 해당하는 application 삭제
    console.log("selected: ", selectedApplication)
    const updatedApplications = applications.filter(
      (_, appIndex) => appIndex !== (selectedApplication.index-1)
    );
    console.log("updated: ", updatedApplications)

    // 남은 applications의 index 재설정
    const reIndexedApplications = updatedApplications.map((app, newIndex) => ({
      ...app,
      index: newIndex + 1, // 1부터 다시 세팅
    }));

    setApplications(reIndexedApplications);
    setShowConfirmModal(false);
    setSelectedApplication(null);
    console.log("canceledApplications: ", applications)

    alert('취소가 완료되었습니다.');
    } catch (error) {
      console.error('Error cancelling application:', error);
      setShowConfirmModal(false);
      setSelectedApplication(null);
    }
  };

  const handleCloseConfirmModal = () => {
    setShowConfirmModal(false);
    setSelectedApplication(null);
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
        const application = applications[row.index - 1]; // Access the current row data
        return (
          <select
            value={application.tonerNm} // Set the default selected tonerNm
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
    { header: '위치', accessor: 'location', width: '11%'},
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
          <div className="buttons-container">
            <CustomButton className="add-toner-button" onClick={() => handleAddItem()}>
                추 가
            </CustomButton>
            <CustomButton className="apply-request-button"> {/**onclick 추가 */}
                신 청
            </CustomButton>
          </div>  
        </div>
        <Table columns={applyColumns} data={applications} isToner={true} />
      </div>
      {showConfirmModal && (
        <ConfirmModal
          message="정말 취소하시겠습니까?"
          onConfirm={handleConfirmCancel}
          onCancel={handleCloseConfirmModal}
          />
        )}
      </div>
  );
}

export default TonerApply;
