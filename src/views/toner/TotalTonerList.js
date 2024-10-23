import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import axios from 'axios';
import Breadcrumb from '../../components/common/Breadcrumb';
import Table from '../../components/common/Table';
import Loading from '../../components/common/Loading';
import CustomSelect from '../../components/CustomSelect';
import { AuthContext } from '../../components/AuthContext';
import '../../styles/common/Page.css';
import '../../styles/rental/TotalRentalManage.css';
import useTonerChange from '../../hooks/useTonerChange';

function TotalTonerList() {
  const { selectedRows, setSelectedRows, handleRowSelect } = useTonerChange();
  const { auth } = useContext(AuthContext);
  const [tonerDetails, setTonerDetails] = useState([]);
  const [centerData, setCenterData] = useState([]);
  const [filteredTonerDetails, setFilteredTonerDetails] = useState([]);
  const [centerTonerResponses, setCenterTonerResponses] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedCenter, setSelectedCenter] = useState('all');
  const [totalCount, setTotalCount] = useState('');
  const [selectedFloor, setSelectedFloor] = useState('전체');
  const [selectedTeamNm, setSelectedTeamNm] = useState('전체');
  const [selectedLocation, setSelectedLocation] = useState('전체');
  const [selectedProductNm, setSelectedProductNm] = useState('전체');
  const [selectedModelNm, setSelectedModelNm] = useState('전체');
  const [selectedCompany, setSelectedCompany] = useState('전체');
  const [selectedTonerNm, setSelectedTonerNm] = useState('전체');

  const dragStartIndex = useRef(null);
  const dragEndIndex = useRef(null);
  const dragMode = useRef('select');

  const fetchTonerData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/toner/manage/total`, {
        params: { instCd: auth.instCd },
      });

      const { centerResponses, centerTonerResponses } = response.data.data;

      const nationwideCenter = { detailNm: '선택', detailCd: 'all' };
      const sortedCenterData = [nationwideCenter, ...centerResponses];

      setCenterData(sortedCenterData);
      setCenterTonerResponses(centerTonerResponses[0]);
      setTonerDetails([]);
      setSelectedRows([]);
      setTotalCount(0);
    } catch (error) {
      console.error('토너 정보를 불러오는데 실패했습니다.', error);
    } finally {
      setLoading(false);
    }
  }, [auth.instCd, setSelectedRows]);

  useEffect(() => {
    fetchTonerData();
  }, [fetchTonerData]);

  useEffect(() => {
    let filteredData = tonerDetails;
  
    if (selectedFloor !== '전체') {
      filteredData = filteredData.filter(item => item.floor === selectedFloor);
    }
    if (selectedTeamNm !== '전체') {
      filteredData = filteredData.filter(item => item.teamNm === selectedTeamNm);
    }
    if (selectedLocation !== '전체') {
      filteredData = filteredData.filter(item => item.location === selectedLocation);
    }
    if (selectedProductNm !== '전체') {
      filteredData = filteredData.filter(item => item.productNm === selectedProductNm);
    }
    if (selectedModelNm !== '전체') {
      filteredData = filteredData.filter(item => item.modelNm === selectedModelNm);
    }
    if (selectedCompany !== '전체') {
      filteredData = filteredData.filter(item => item.company === selectedCompany);
    }
    if (selectedTonerNm !== '전체') {
      filteredData = filteredData.filter(item => item.tonerNm === selectedTonerNm);
    }
  
    setFilteredTonerDetails(filteredData);
  }, [ selectedFloor, selectedTeamNm, selectedLocation, selectedProductNm, selectedModelNm, selectedCompany, selectedTonerNm, tonerDetails ]);  

  const floorOptions = getUniqueOptions(tonerDetails, 'floor');
  const teamOptions = getUniqueOptions(tonerDetails, 'teamNm');
  const locationOptions = getUniqueOptions(tonerDetails, 'location');
  const productOptions = getUniqueOptions(tonerDetails, 'productNm');
  const modelOptions = getUniqueOptions(tonerDetails, 'modelNm');
  const companyOptions = getUniqueOptions(tonerDetails, 'company');
  const tonerOptions = getUniqueOptions(tonerDetails, 'tonerNm');

  const handleCenterChange = (e) => {
    const detailCd = e.target.value;
    setSelectedCenter(detailCd);
    setSelectedRows([]);

    if (detailCd === 'all') {
      setTonerDetails([]);
      setTotalCount(0);
      return;
    }

    const centerMapping = {
      "100": centerTonerResponses.foundationResponses,
      "111": centerTonerResponses.bonwonResponses,
      "112": centerTonerResponses.yeouidoResponses,
      "113": centerTonerResponses.gangnamResponses,
      "119": centerTonerResponses.gwanghwamunResponses,
      "211": centerTonerResponses.suwonResponses,
      "611": centerTonerResponses.daeguResponses,
      "612": centerTonerResponses.busanResponses,
      "711": centerTonerResponses.gwangjuResponses,
      "811": centerTonerResponses.jejuResponses,
    };

    const selectedDetails = centerMapping[detailCd] || [];
    setTonerDetails(selectedDetails);
    setTotalCount(selectedDetails.length); 
  };

  const handleRowClick = (row) => {
    const isChecked = !selectedRows.includes(row.mngNum);
    if (isChecked) {
      setSelectedRows(prevSelectedRows => [...prevSelectedRows, row.mngNum]);
    } else {
      setSelectedRows(prevSelectedRows => prevSelectedRows.filter(id => id !== row.mngNum));
    }
  };

  const handleMouseDown = (index) => {
    dragStartIndex.current = index;
    const mngNum = tonerDetails[index].mngNum;
    if (selectedRows.includes(mngNum)) {
      dragMode.current = 'deselect';
    } else {
      dragMode.current = 'select';
    }
  };

  const handleMouseOver = (index) => {
    if (dragStartIndex.current !== null) {
      dragEndIndex.current = index;
      const start = Math.min(dragStartIndex.current, dragEndIndex.current);
      const end = Math.max(dragStartIndex.current, dragEndIndex.current);

      let newSelectedRows = [...selectedRows];

      for (let i = start; i <= end; i++) {
        const mngNum = tonerDetails[i].mngNum;
        if (dragMode.current === 'select' && !newSelectedRows.includes(mngNum)) {
          newSelectedRows.push(mngNum);
        } else if (dragMode.current === 'deselect' && newSelectedRows.includes(mngNum)) {
          newSelectedRows = newSelectedRows.filter(id => id !== mngNum);
        }
      }

      setSelectedRows(newSelectedRows);
    }
  };

  const handleMouseUp = () => {
    dragStartIndex.current = null;
    dragEndIndex.current = null;
  };

  const handleExcelDownload = async () => {
    if (selectedRows.length === 0) {
      alert("엑셀 파일로 내보낼 항목을 선택하세요.");
      return;
    }

    try {
      const response = await axios.post(`/api/toner/manage/excel`, selectedRows, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', '토너 관리표.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("엑셀 다운로드 실패:", error);
    }
  };

  const detailColumns = [
    {
      header: (
        <input
          type="checkbox"
          onChange={(e) => {
            const isChecked = e.target.checked;
            setSelectedRows(isChecked ? tonerDetails.map(d => d.mngNum) : []);
          }}
        />
      ),
      accessor: 'select',
      width: '5%',
      Cell: ({ row }) => {
        const mngNum = row?.mngNum || row?.original?.mngNum;
        return (
          <input
            type="checkbox"
            name="detailSelect"
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => handleRowSelect(e, row)}
            checked={mngNum && selectedRows.includes(mngNum)}
          />
        );
      },
    },
    { header: '관리번호', accessor: 'mngNum' },
    { 
      header: (
        <CustomSelect
          label="층"
          options={floorOptions}
          selectedValue={selectedFloor}
          onChangeHandler={(e) => setSelectedFloor(e.target.value)} 
        />
      ), 
      accessor: 'floor' 
    },    
    { 
      header: (
        <CustomSelect
          label="부서"
          options={teamOptions}
          selectedValue={selectedTeamNm}
          onChangeHandler={(e) => setSelectedTeamNm(e.target.value)} 
        />
      ), 
      accessor: 'teamNm' 
    },    
    { header: '관리자(정)', accessor: 'manager' },
    { header: '관리자(부)', accessor: 'subManager' },
    { 
      header: (
        <CustomSelect
          label="위치"
          options={locationOptions}
          selectedValue={selectedLocation}
          onChangeHandler={(e) => setSelectedLocation(e.target.value)} 
        />
      ), 
      accessor: 'location' 
    },    
    { 
      header: (
        <CustomSelect
          label="제품명"
          options={productOptions}
          selectedValue={selectedProductNm}
          onChangeHandler={(e) => setSelectedProductNm(e.target.value)} 
        />
      ), 
      accessor: 'productNm' 
    },    
    { 
      header: (
        <CustomSelect
          label="모델명"
          options={modelOptions}
          selectedValue={selectedModelNm}
          onChangeHandler={(e) => setSelectedModelNm(e.target.value)} 
        />
      ), 
      accessor: 'modelNm' 
    },    
    { header: 'S/N', accessor: 'sn' },
    { 
      header: (
        <CustomSelect
          label="제조사"
          options={companyOptions}
          selectedValue={selectedCompany}
          onChangeHandler={(e) => setSelectedCompany(e.target.value)} 
        />
      ), 
      accessor: 'company' 
    },    
    { header: '제조일', accessor: 'manuDate' },
    { 
      header: (
        <CustomSelect
          label="토너명"
          options={tonerOptions}
          selectedValue={selectedTonerNm}
          onChangeHandler={(e) => setSelectedTonerNm(e.target.value)} 
        />
      ), 
      accessor: 'tonerNm' 
    },    
    { header: '가격', accessor: 'price' },
  ];

  return (
    <div className='content'>
      <div className='totalRentalManage-content'>
        <div className="totalRentalManage-content-inner">
          <h2>전국 토너 관리표</h2>
          <Breadcrumb items={['토너 관리', '전국 토너 관리표']} />
          <div className="totalRentalManage-category-section">
            <div className="totalRentalManage-category">
              <label htmlFor="center" className="totalRentalManage-category-label">센 터&gt;&gt;</label>
              <select
                id="center"
                className="totalRentalManage-category-dropdown"
                value={selectedCenter}
                onChange={handleCenterChange}
              >
                {centerData.map(center => (
                  <option key={center.detailCd} value={center.detailCd}>
                    {center.detailNm}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {loading ? (
            <Loading />
          ) : (
            <>
              <div className="totalRentalManage-tables-section">
                <div className="totalRentalManage-details-content">
                  <div className="totalRentalManage-header-buttons">
                    <label className='totalRentalManage-detail-content-label'>토너 정보&gt;&gt;</label>
                    <div className="totalRentalManage-detail-buttons">
                        {selectedCenter !== 'all' && totalCount !== 0 && (
                            <div className="last-updated">
                                총 건수: {totalCount}
                            </div>
                        )}
                        <button
                        className="totalRentalManage-excel-button"
                        onClick={handleExcelDownload}
                        >
                        엑 셀
                        </button>
                    </div>
                  </div>
                  <div className="totalRentalManage-details-table">
                    <Table
                      columns={detailColumns}
                      data={filteredTonerDetails}
                      onRowClick={handleRowClick}
                      onRowMouseDown={handleMouseDown}
                      onRowMouseOver={handleMouseOver}
                      onRowMouseUp={handleMouseUp}
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default TotalTonerList;

const getUniqueOptions = (data, key) => {
  const uniqueValues = [...new Set(data.map(item => item[key]))].sort((a, b) => a.localeCompare(b));
  return [{ label: '전체', value: '전체' }, ...uniqueValues.map(value => ({ label: value, value }))];
};
