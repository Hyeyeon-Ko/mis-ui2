import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import Breadcrumb from '../../components/common/Breadcrumb';
import Table from '../../components/common/Table';
import Loading from '../../components/common/Loading';
import { AuthContext } from '../../components/AuthContext';
import '../../styles/common/Page.css';
import '../../styles/rental/TotalRentalManage.css';
import useTonerChange from '../../hooks/useTonerChange';

function TotalTonerList() {
    const { selectedRows, setSelectedRows, handleRowSelect } = useTonerChange();
    const { auth } = useContext(AuthContext);
  const [tonerDetails, setTonerDetails] = useState([]);
  const [centerData, setCenterData] = useState([]);
  const [centerTonerResponses, setCenterTonerResponses] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedCenter, setSelectedCenter] = useState('all');
  const [totalCount, setTotalCount] = useState('');

  const fetchTonerData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/toner/totalList`, {
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

  const handleExcelDownload = async () => {
    if (selectedRows.length === 0) {
      alert("엑셀 파일로 내보낼 항목을 선택하세요.");
      return;
    }

    try {
      const response = await axios.post(`/api/toner/excel`, selectedRows, {
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
    { header: '층', accessor: 'floor' },
    { header: '부서', accessor: 'teamNm' },
    { header: '관리자(정)', accessor: 'manager' },
    { header: '관리자(부)', accessor: 'subManager' },
    { header: '위치', accessor: 'location' },
    { header: '제품명', accessor: 'productNm' },
    { header: '모델명', accessor: 'modelNm' },
    { header: 'S/N', accessor: 'sn' },
    { header: '제조사', accessor: 'company' },
    { header: '제조일', accessor: 'manuDate' },
    { header: '토너명', accessor: 'tonerNm' },
    { header: '색상', accessor: 'color' },
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
                      data={tonerDetails}
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
