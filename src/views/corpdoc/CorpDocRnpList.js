import React, { useState, useEffect, useContext, useCallback } from "react";
import { AuthContext } from "../../components/AuthContext";
import Breadcrumb from "../../components/common/Breadcrumb";
import CorpDocApprovalModal from "../../views/corpdoc/CorpDocApprovalModal";
import ConditionFilter from "../../components/common/ConditionFilter";
import SignitureImage from "../../assets/images/signiture.png";
import axios from "axios";
import "../../styles/corpdoc/CorpDocRnpList.css";
import { corpFilterData } from "../../datas/corpDocDatas";
import useDateSet from "../../hooks/apply/useDateSet";
import Pagination from "../../components/common/Pagination";

function CorpDocRnpList() {
  const { auth } = useContext(AuthContext);

  const [applications, setApplications] = useState([]);
  const [filterInputs, setFilterInputs] = useState(corpFilterData);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDocumentDetails, setSelectedDocumentDetails] = useState(null);
  const [clickedRows, setClickedRows] = useState([]);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);

  // const { formattedStartDate: defaultStartDate, formattedEndDate: defaultEndDate } = useDateSet();
  const { formattedStartDate, formattedEndDate } = useDateSet();
  const [totalPages, setTotalPages] = useState("1");
  const [currentPage, setCurrentPage] = useState("1");

  const itemsPerPage = 10;

  useEffect(() => {
    fetchRnpData(currentPage, itemsPerPage);
    // eslint-disable-next-line
  }, [currentPage]);

  const handlePageClick = (event) => {
    const selectedPage = event.selected + 1;
    setCurrentPage(selectedPage);
  };

  // const fetchRnpData = useCallback(async (searchType = '전체', keyword = '', startDate = null, endDate = null, pageIndex = 1, pageSize = itemsPerPage) => {
  const fetchRnpData = useCallback(
    async (pageIndex = 1, pageSize = itemsPerPage, filters = {}) => {
      try {
        // const formattedStartDate = startDate ? startDate.toISOString().split('T')[0] : defaultStartDate;
        // const formattedEndDate = endDate ? endDate.toISOString().split('T')[0] : defaultEndDate;

        const response = await axios.get("/api/corpDoc/rnpList", {
          params: {
            // PostSearchRequestDTO parameters
            // searchType,
            // keyword,
            // startDate: formattedStartDate,
            // endDate: formattedEndDate,
            searchType: filters.searchType,
            keyword: filters.keyword,
            startDate: filters.startDate
              ? filters.startDate
              : formattedStartDate,
            endDate: filters.endDate ? filters.endDate : formattedEndDate,

            // inst parameter
            instCd: auth.instCd,

            // PostPageRequest parameters
            pageIndex,
            pageSize,
          },
        });

        if (response.data) {
          const data = response.data.data;
          const totalPages = data.totalPages || 1;
          const currentPage = data.number + 1;

          const rnpListData = data.content.map((item) => ({
            id: item.draftId,
            date: item.draftDate,
            drafter: item.drafter,
            submission: item.submission,
            purpose: item.purpose,
            corpSeal: item.certCorpseal,
            registry: item.certCoregister,
            usesignet: item.certUsesignet,
            warrant: item.warrant,
            status: "결재진행중",
            signitureImage: SignitureImage,
            approvers: [],
          }));

          setApplications(rnpListData);
          setTotalPages(totalPages);
          setCurrentPage(currentPage);

          const clickedRows =
            JSON.parse(localStorage.getItem("clickedRows")) || [];
          setClickedRows(clickedRows);

          setInitialDataLoaded(true);
        }
      } catch (error) {
        console.error("Error fetching RNP data:", error);
      }
    },
    [auth.instCd, formattedStartDate, formattedEndDate]
  );

  useEffect(() => {
    if (!initialDataLoaded) {
      fetchRnpData();
    }
  }, [fetchRnpData, initialDataLoaded]);

  // const applyFilters = useCallback(() => {
  //   fetchRnpData(filterInputs.searchType, filterInputs.keyword);
  // }, [fetchRnpData, filterInputs]);

  const applyFilters = (filterValues) => {
    const { startDate, endDate, documentType, searchType, keyword } =
      filterValues;

    const params = {
      startDate: startDate ? startDate.toISOString().split("T")[0] : "", // 시작일
      endDate: endDate ? endDate.toISOString().split("T")[0] : "", // 종료일
      documentType: documentType,
      searchType: searchType,
      keyword: keyword, // 검색어
    };

    fetchRnpData(1, itemsPerPage, params);
  };

  const handleReset = () => {
    setFilterInputs({
      searchType: "전체",
      keyword: "",
    });
    fetchRnpData();
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedDocumentDetails(null);
  };

  const handleRowClick = (status, document) => {
    if (status === "결재진행중" || status === "결재완료") {
      if (status === "결재완료") {
        setClickedRows((prevClickedRows) => {
          const newClickedRows = [...prevClickedRows, document.id];
          localStorage.setItem("clickedRows", JSON.stringify(newClickedRows));
          return newClickedRows;
        });
      }
      setSelectedDocumentDetails({
        ...document,
        signitureImage: document.signitureImage || SignitureImage,
      });
      setModalVisible(true);
    }
  };

  return (
    <div className="content">
      <div className="corpDoc-rnp-list">
        <h2>서류 수불 대장</h2>
        <Breadcrumb items={["법인서류 대장", "서류 수불 대장"]} />

        <ConditionFilter
          startDateLabel="수령일자"
          startDate={null}
          setStartDate={() => {}}
          endDate={null}
          setEndDate={() => {}}
          filters={{}}
          setFilters={() => {}}
          onSearch={applyFilters}
          onReset={handleReset}
          showStatusFilters={false}
          showSearchCondition={true}
          showDocumentType={false}
          searchType={filterInputs.searchType}
          setSearchType={(searchType) =>
            setFilterInputs((prev) => ({ ...prev, searchType }))
          }
          keyword={filterInputs.keyword}
          setKeyword={(keyword) =>
            setFilterInputs((prev) => ({ ...prev, keyword }))
          }
          searchOptions={["전체", "신청자", "제출처", "사용목적"]}
          setDocumentType={() => {}}
        />

        <table className="table">
          <thead>
            <tr>
              <th rowSpan="2">수령일자</th>
              <th rowSpan="2">신청자</th>
              <th rowSpan="2">제출처</th>
              <th rowSpan="2">사용목적</th>
              <th colSpan="4">법인서류</th>
              <th rowSpan="2">수령인</th>
            </tr>
            <tr>
              <th>법인인감증명서</th>
              <th>법인등기사항전부증명서</th>
              <th>사용인감계</th>
              <th>위임장</th>
            </tr>
          </thead>
          <tbody>
            {applications.length > 0 ? (
              applications.map((app, index) => (
                <tr key={index}>
                  <td>{app.date.split("T")[0]}</td>
                  <td>{app.drafter}</td>
                  <td>{app.submission}</td>
                  <td>{app.purpose}</td>
                  <td>{app.corpSeal}</td>
                  <td>{app.registry}</td>
                  <td>{app.usesignet}</td>
                  <td>{app.warrant}</td>
                  <td
                    className={`status-${app.status
                      .replace(/\s+/g, "-")
                      .toLowerCase()} clickable ${
                      clickedRows.includes(app.id) ? "confirmed" : ""
                    }`}
                    onClick={() => handleRowClick(app.status, app)}
                  >
                    {app.status}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" style={{ textAlign: "center" }}>
                  조회된 데이터가 없습니다
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <Pagination totalPages={totalPages} onPageChange={handlePageClick} />
      </div>
      {modalVisible && selectedDocumentDetails && (
        <CorpDocApprovalModal
          show={modalVisible}
          onClose={closeModal}
          documentDetails={selectedDocumentDetails}
        />
      )}
    </div>
  );
}

export default CorpDocRnpList;
