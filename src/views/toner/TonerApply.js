import React, { useEffect, useState, useContext, useCallback, useMemo } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
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
  const { auth } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const { draftId } = useParams(); 

  const type = new URLSearchParams(location.search).get('type'); 
  const [totalAmount, setTotalAmount] = useState(0);
  const [applications, setApplications] = useState([]);
  const [mngNumOptions, setMngNumOptions] = useState([]);
  const [showApplyModal, setShowApplyModal] = useState(false);

  const defaultTonerDetails = useMemo(() => ({
    mngNum: '',
    tonerNm: '',
    teamNm: '',
    location: '',
    printNm: '',
    price: '',
    quantity: 1,
    totalPrice: '',
  }), []);

  // 금액 포맷팅
  const formatPrice = (price) => {
    return new Intl.NumberFormat().format(price);
  };

  // 신청항목 총 금액 계산
  const calculateTotalPrice = useCallback(() => {
    const total = applications.reduce((sum, app) => {
      const price = parseInt(app.totalPrice.replace(/,/g, ''), 10); 
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

  // 1. 신청 내역을 수정 모드에서 불러오기
  useEffect(() => {
    const fetchTonerDetails = async () => {
      try {
        if (type === 'modify' && draftId) {
          const response = await axios.get(`/api/toner/${draftId}`);
          const fetchedApplications = response.data.data.map((application, index) => ({
            ...application,
            index: index + 1,
          }));
  
          for (const application of fetchedApplications) {
            const tonerInfoResponse = await axios.get(`/api/toner/info`, {
              params: { mngNum: application.mngNum },
            });
            const tonerPriceList = tonerInfoResponse.data.data.tonerPriceDTOList;
            application.tonerPriceDTOList = tonerPriceList; 
          }
  
          setApplications(fetchedApplications);
        } else {
          setApplications([{ ...defaultTonerDetails, index: 1 }]);
        }
      } catch (error) {
        console.error('Error fetching toner details:', error);
      }
    };
  
    fetchTonerDetails();
  }, [type, draftId, defaultTonerDetails]);
    
  // 2. 신청항목 취소 핸들러
  const handleCancelClick = (application) => {
    try {
      const updatedApplications = applications.filter(
        (_, appIndex) => appIndex !== (application.index - 1)
      );

      const reIndexedApplications = updatedApplications.map((app, newIndex) => ({
        ...app,
        index: newIndex + 1,
      }));

      setApplications(reIndexedApplications);
    } catch (error) {
      console.error('Error cancelling application:', error);
    }
  };

  // 3. 신청 핸들러
  const handleApplyClick = () => {
    setShowApplyModal(true);
  };

  const handleConfirmApply = async () => {
    try {
      const tonerDetailDTOs = applications.map(app => ({
        itemId: app.itemId || null, 
        mngNum: app.mngNum,
        teamNm: app.teamNm,
        location: app.location,
        printNm: app.printNm,
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

      if (type === 'modify' && draftId) {
        await axios.put(`/api/toner/update/${draftId}`, tonerRequestDTO);
        alert('수정이 완료되었습니다.');
        navigate('/myPendingList');
      } else {
        await axios.post(`/api/toner`, tonerRequestDTO);
        alert('신청이 완료되었습니다.');
        navigate('/myPendingList');
      }

    } catch (error) {
      console.error('Error applying toner:', error);
      alert('신청 중 오류가 발생했습니다.');
      setShowApplyModal(false);
    }
  };

  const handleCloseApplyModal = () => {
    setShowApplyModal(false);
  };

  // 4. 관리번호로 toner 상세정보 fetch
  const fetchTonerInfo = async (mngNum, index) => {
    try {
      const response = await axios.get(`/api/toner/info`, {
        params: { mngNum }
      });
      const data = response.data.data;
      const tonerPriceList = data.tonerPriceDTOList;

      const defaultToner = tonerPriceList[0];
      const price = defaultToner.price || '-';
      const quantity = 1;

      const updatedApplication = {
        ...applications[index],
        index: index,
        mngNum: data.mngNum,
        teamNm: data.teamNm,
        location: data.location,
        printNm: data.modelNm,
        tonerNm: defaultToner.tonerNm,
        price: price,
        quantity: quantity,
        totalPrice: price !== '-' ? formatPrice(parseInt(defaultToner.price.replace(/,/g, ''), 10) * quantity) : '-',
        tonerPriceDTOList: tonerPriceList,
      };

      const updatedApplications = [...applications];
      updatedApplications[index - 1] = updatedApplication;

      setApplications(updatedApplications);

    } catch (error) {
      console.error('Error fetching toner info:', error);
    }
  };

  // 5. 수량 변경 핸들러
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

  // 6. 토너명 변경 핸들러
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

  // 7. 신청항목 추가 핸들러
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
            value={application.mngNum || ''} 
            onChange={(e) => fetchTonerInfo(e.target.value, row.index)}
          >
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
            value={application.tonerNm || ''}
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
    { header: '부서', accessor: 'teamNm', width: '11%' },
    { header: '직무', accessor: 'location', width: '11%' },
    { header: '프린터명', accessor: 'printNm', width: '11%' },
    { header: '단가', accessor: 'price', width: '9%' },
    {
      header: '수량',
      accessor: 'quantity',
      width: '5%',
      Cell: ({ row }) => (
        <input
          type="number"
          min="1"
          value={row.quantity || ''}
          onChange={(e) => handleQuantityChange(e, row.index - 1)}
        />
      ),
    },
    { header: '금액', accessor: 'totalPrice', width: '11%' },
    {
      header: '',
      accessor: 'cancel',
      width: '3%',
      Cell: ({ row }) => (
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
        <h2>{type === 'modify' ? '토너 수정' : '토너 신청'}</h2>
        <Breadcrumb items={['신청하기', type === 'modify' ? '토너수정' : '토너신청']} />
        <div className='toner-apply-header'>
          <label className='toner-apply-header-label'>{type === 'modify' ? '수정 항목' : '신청 항목'}&gt;&gt;</label>
          <div className="toner-buttons-container">
            <label className='toner-apply-info'>총 건수: {applications.length}</label>
            <label className='toner-apply-info'>총 금액: {formatPrice(totalAmount)}</label>
            <CustomButton className="add-toner-button" onClick={() => handleAddItem()}>
              추 가
            </CustomButton>
            <CustomButton className="apply-request-button" onClick={() => handleApplyClick()}>
              {type === 'modify' ? '수 정' : '신 청'}
            </CustomButton>
          </div>
        </div>
        <Table columns={applyColumns} data={applications} isToner={true} />
      </div>
      {showApplyModal && (
        <ConfirmModal
          message={type === 'modify' ? "수정하시겠습니까?" : "신청하시겠습니까?"}
          onConfirm={handleConfirmApply}
          onCancel={handleCloseApplyModal}
        />
      )}
    </div>
  );
}

export default TonerApply;

