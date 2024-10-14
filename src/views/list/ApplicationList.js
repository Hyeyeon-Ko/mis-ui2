import React, { useState, useEffect, useCallback, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Breadcrumb from "../../components/common/Breadcrumb";
import ConditionFilter from "../../components/common/ConditionFilter";
import Table from "../../components/common/Table";
import CustomButton from "../../components/common/CustomButton";
import DocConfirmModal from "../doc/DocConfirmModal";
import CenterSelect from "../../components/CenterSelect";
import "../../styles/list/ApplicationsList.css";
import "../../styles/common/Page.css";
import axios from "axios";
import fileDownload from "js-file-download";
import { AuthContext } from "../../components/AuthContext";
import useDateSet from "../../hooks/apply/useDateSet";
import PaginationSub from "../../components/common/PaginationSub";
import Loading from "../../components/common/Loading";
import qs from 'qs';

function ApplicationsList() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const documentTypeFromUrl = queryParams.get("documentType");
  const { auth } = useContext(AuthContext);
  const instCd = auth.instCd;

  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [filterInputs, setFilterInputs] = useState({
    startDate: null,
    endDate: null,
    documentType: documentTypeFromUrl || "",
    searchType: "전체",
    keyword: "",
    applyStatus:"",
  });
  const [filters, setFilters] = useState({
    statusApproved: false,
    statusRejected: false,
    statusOrdered: false,
    statusClosed: false,
    statusReceived: false,
  });
  const [showStatus, setShowStatus] = useState({
    statusApproved: false,
    statusRejected: false,
    statusOrdered: false,
    statusClosed: true,
    statusReceived: false,
  });
  const filterMapping = {    // 어떤 상태필터보여야하는지
    A: ['statusApproved', 'statusRejected', 'statusOrdered'],
    B: ['statusReceived'],
    C: ['statusApproved', 'statusReceived', 'statusRejected'],
    D: ['statusRejected'],
  };
  const [loading, setLoading] = useState(false);
  const [showCheckboxColumn, setShowCheckboxColumn] = useState(false);
  const [selectedApplications, setSelectedApplications] = useState([]);
  const [selectedApplyStatus, setSelectedApplyStatus] = useState(null);
  const [showExcelButton, setShowExcelButton] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState(null);
  const [selectedCenter, setSelectedCenter] = useState("전체");
  const { formattedStartDate, formattedEndDate } = useDateSet();
  const [totalPages, setTotalPages] = useState("1");
  const [currentPage, setCurrentPage] = useState("1");

  const itemsPerPage = 10;

  useEffect(() => {
    fetchApplications(currentPage, itemsPerPage);
    // eslint-disable-next-line
  }, [currentPage]);

  const [centers] = useState([
    "전체",
    "재단본부",
    "광화문",
    "여의도센터",
    "강남센터",
    "수원센터",
    "대구센터",
    "부산센터",
    "광주센터",
    "제주센터",
    "협력사",
  ]);

  const navigate = useNavigate();

  const getBreadcrumbItems = () => {
    switch (documentTypeFromUrl) {
      case "명함신청":
        return ["명함 관리", "전체 신청내역"];
      case "인장신청":
        return ["인장 관리", "전체 신청내역"];
      case "법인서류":
        return ["법인서류 관리", "전체 신청내역"];
      case "문서수발신":
        return ["문서수발신 관리", "전체 신청내역"];
      default:
        return ["신청내역 관리", "전체 신청내역"];
    }
  };

  const convertDocumentType = (type) => {
    switch (type) {
      case "명함신청":
        return "A";
      case "문서수발신":
        return "B";
      case "법인서류":
        return "C";
      case "인장신청":
        return "D";
      default:
        return null;
    }
  };

  const parseDateTime = (dateString) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(date.getDate()).padStart(2, "0")} ${String(
      date.getHours()
    ).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  };

  const getStatusText = (status) => {
    switch (status) {
      case "A":
        return "승인대기";
      case "B":
        return "승인완료";
      case "C":
        return "반려";
      case "D":
        return "발주완료";
      case "E":
        return "처리완료";
      case "F":
        return "신청취소";
      case "G":
        return "발급완료";
      case "X":
        return "상태없음";
      default:
        return status;
    }
  };

  // 0. 신청상태 필터값 세팅
  const getStatusFilter = (documentTypeFromUrl) => {
    const specificFilters = filterMapping[convertDocumentType(documentTypeFromUrl)] || [];
  
    specificFilters.forEach((filter) => {
      showStatus[filter] = true;
    });

    return showStatus;
  }

  // 1-1. 필터값 적용해서 application fetch해오기
  const applyFilters = (filterValues) => {
    // filterValues에서 documentType과 기타 필터 값을 가져옴
    const { startDate, endDate, documentType, searchType, keyword, filters } = filterValues;

    const statusCodeMap = {
      statusApproved: "B",
      statusRejected: "C",
      statusOrdered: "D",
      statusClosed: "E",
      statusReceived: "F",
    };

    // filters 객체에서 true인 항목만 찾아서 코드로 변환
    const applyStatus = Object.keys(filters)
    .filter((key) => filters[key]) // true인 필터만 추출
    .map((key) => statusCodeMap[key]); // 코드로 변환

    const params = {
      startDate: startDate ? startDate.toISOString().split("T")[0] : "", // 시작일
      endDate: endDate ? endDate.toISOString().split("T")[0] : "", // 종료일
      documentType: documentType,
      searchType: searchType,
      keyword: keyword, // 검색어
      applyStatus: applyStatus
    };
    fetchApplications(1, itemsPerPage, params);
  };

  // 1-2. 신청상태로 필터링 완료된 데이터 담기
  const applyStatusFilters = useCallback(
    (data) => {
      const filtered = data.filter((app) => {
        if (filters.statusApproved && app.applyStatus === "승인완료") return true;
        if (filters.statusRejected && app.applyStatus === "반려") return true;
        if (filters.statusOrdered && app.applyStatus === "발주완료") return true;
        if (filters.statusClosed && app.applyStatus === "처리완료") return true;
        if (filters.statusReceived && app.applyStatus === "발급완료") return true;
        return !Object.values(filters).some(Boolean);
      });
      setFilteredApplications(filtered);
    },
    [filters]
  );

  // 1. 데이터 fetch해오기
  const fetchApplications = useCallback(
    async (pageIndex = 1, pageSize = itemsPerPage, filterParams) => {
      setLoading(true);
      try {

        console.log("filterParams: ", filterParams)
        let applyStatusList;
        if(filterParams) {
          applyStatusList = filterParams.applyStatus
        } else {
          applyStatusList = Object.keys(filters)
          .filter((key) => filters[key] === true)  // Get only true filters
          .map((key) => convertDocumentType(key))  // Use convertDocumentType for status mapping
          .filter(Boolean);
        }

        const formattedStart = formatDate(new Date(filterInputs.startDate || formattedStartDate));
        const formattedEnd = formatDate(new Date(filterInputs.endDate || formattedEndDate));

        console.log("applyStatus: ", applyStatusList)
        const response = await axios.get("/api/applyList2", {
          params: {
            userId: auth.userId || "",
            instCd: instCd || "",
            documentType:
              convertDocumentType(filterInputs.documentType) ||
              convertDocumentType(documentTypeFromUrl) ||
              null,
            searchType: filterInputs.searchType,
            keyword: filterInputs.keyword,
            startDate: formattedStart,
            endDate: formattedEnd,
            applyStatus: applyStatusList,
            pageIndex,
            pageSize,
          },
          paramsSerializer: params => {
            // applyStatus 배열을 제대로 직렬화
            return qs.stringify(params, { arrayFormat: "repeat" });
          }
        });

        const {
          bcdMasterResponses,
          docMasterResponses,
          corpDocMasterResponses,
          sealMasterResponses,
        } = response.data.data;

        const combinedData = [
          bcdMasterResponses,
          docMasterResponses,
          corpDocMasterResponses,
          sealMasterResponses,
        ];

        const selectedData = combinedData.find(
          (response) => response && response.totalElements > 0
        );

        if (!selectedData || !selectedData.content.length) {
          setApplications([]);
          setFilteredApplications([]);
          setTotalPages(1);
          setCurrentPage(1);
        } else {
          const totalPages = selectedData.totalPages;
          const currentPage = selectedData.number + 1;
          const content = selectedData.content;
          const filteredData = content.filter(
            (application) => application.applyStatus !== "X"
          );

          const transformedData = filteredData.map((application) => ({
            draftId: application.draftId,
            instCd: application.instCd,
            instNm: application.instNm,
            title: application.title,
            draftDate: application.draftDate
              ? parseDateTime(application.draftDate)
              : "",
            respondDate: application.respondDate
              ? parseDateTime(application.respondDate)
              : "",
            orderDate: application.orderDate
              ? parseDateTime(application.orderDate)
              : "",
            drafter: application.drafter,
            applyStatus: getStatusText(application.applyStatus),
            docType: application.docType,
          }));

          transformedData.sort(
            (a, b) => new Date(b.draftDate) - new Date(a.draftDate)
          );

          setApplications(transformedData);
          setFilteredApplications(transformedData);
          setShowStatus(getStatusFilter(documentTypeFromUrl));
          setTotalPages(totalPages);
          setCurrentPage(currentPage);
          applyStatusFilters(transformedData);
        }
      } catch (error) {
        console.error(
          "Error fetching applications: 데이터를 불러오는 중 오류가 발생했습니다.",
          error
        );
      } finally {
        setLoading(false);
      }
    },
    [
      applyStatusFilters,
      auth.userId,
      documentTypeFromUrl,
      instCd,
      formattedStartDate,
      formattedEndDate,
    ]
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  };
  

  /**
   * 페이지 변경 핸들러
   */
  const handlePageClick = (event) => {
    const selectedPage = event.selected + 1;
    setCurrentPage(selectedPage);
  };

  /**
   * 신청상태 필터 변경 핸들러
   */
  const handleFilterChange = (e) => {
    console.log("e: ",e)
    const { name } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: !prevFilters[name],
    }));
  };

  /**
   * 필터 초기화 핸들러
   */
  const handleReset = () => {
    resetFilters();
    fetchApplications();
  };

  // 2. 필터 초기화!
  const resetFilters = useCallback(() => {
    const defaultStartDate = new Date();
    defaultStartDate.setMonth(defaultStartDate.getMonth() - 1);
    setFilterInputs({
      startDate: defaultStartDate,
      endDate: new Date(),
      documentType: documentTypeFromUrl || "",
      searchType: "전체",
      keyword: "",
    });
    setFilters({
      statusApproved: false,
      statusRejected: false,
      statusOrdered: false,
      statusClosed: false,
      statusReceived: false,
    });
    setSelectedCenter("전체");
    setShowStatus({
      statusApproved: false,
      statusRejected: false,
      statusOrdered: false,
      statusClosed: true,
      statusReceived: false,
    })
  }, [documentTypeFromUrl]);

  useEffect(() => {
    resetFilters();
  }, [documentTypeFromUrl, resetFilters]);

  /**
  * 데이터 선택 핸들러
  */
  const handleSelectAll = (isChecked) => {
    setSelectedApplications(
      isChecked ? filteredApplications.map((app) => app.draftId) : []
    );
  };

  const handleSelect = (isChecked, id) => {
    setSelectedApplications(
      isChecked
        ? [...selectedApplications, id]
        : selectedApplications.filter((appId) => appId !== id)
    );
  };

  /**
  * 센터 선택 핸들러
  */
  useEffect(() => {
    const centerFilteredData =
      selectedCenter === "전체"
        ? applications
        : applications.filter((app) => app.instNm === selectedCenter);

    setFilteredApplications(centerFilteredData);
  }, [selectedCenter, applications]);

  const handleCenterChange = (e) => {
    setSelectedCenter(e.target.value);
  };

  // todo: 이것도 useEffect 중복 없는지 확인!
  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const fetchSealImprintDetail = async (draftId) => {
    try {
      const response = await axios.get(`/api/seal/imprint/${draftId}`);
      return response.data.data;
    } catch (error) {
      console.error("Error fetching seal imprint details:", error);
      alert("날인신청 정보를 불러오는 중 오류가 발생했습니다.");
    }
  };

  const fetchSealExportDetail = async (draftId) => {
    try {
      const response = await axios.get(`/api/seal/export/${draftId}`);
      return response.data.data;
    } catch (error) {
      console.error("Error fetching seal export details:", error);
      alert("반출신청 정보를 불러오는 중 오류가 발생했습니다.");
    }
  };

  // 3. 명함신청 + 처리완료일 때 엑셀버튼 보이기
  useEffect(() => {
    if (documentTypeFromUrl === "명함신청") {
      const isShowExcelButton =
        filters.statusClosed && selectedApplications.length > 0;
      setShowCheckboxColumn(filters.statusClosed);
      setShowExcelButton(isShowExcelButton);
    } else {
      setShowCheckboxColumn(false);
      setShowExcelButton(false);
    }
  }, [filters, selectedApplications, documentTypeFromUrl]);

  const handleExcelDownload = async () => {
    if (selectedApplications.length === 0) {
      alert("엑셀변환 할 명함 신청 목록을 선택하세요.");
      return;
    }

    try {
      const requestData = {
        instCd: auth.instCd,
        selectedApplications,
      };

      const response = await axios.post(
        "/api/bsc/applyList/orderExcel",
        requestData,
        {
          responseType: "blob",
        }
      );

      fileDownload(response.data, "명함 완료내역.xlsx");
    } catch (error) {
      console.error("Error downloading excel: ", error);
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedDocumentId(null);
  };

  // 5. 승인
  const approveDocument = async (documentId) => {
    try {
      await axios.put(`/api/doc/confirm`, null, {
        params: { draftId: documentId },
      });
      alert("승인이 완료되었습니다.");
      closeModal();
      fetchApplications(filterInputs);
    } catch (error) {
      console.error("Error approving document:", error);
      alert("Error approving document.");
    }
  };

  const handleRowClick = async (draftId, docType, applyStatus) => {
    if (docType === "문서수신" || docType === "문서발신") {
      setSelectedDocumentId(draftId);
      setModalVisible(true);
      setSelectedApplyStatus(applyStatus);
    } else if (docType === "명함신청") {
      navigate(
        `/bcd/applyList/${draftId}?readonly=true&applyStatus=${applyStatus}`
      );
    } else if (docType === "법인서류") {
      navigate(
        `/corpDoc/applyList/${draftId}?readonly=true&applyStatus=${applyStatus}`
      );
    } else if (docType === "인장신청(날인)") {
      const sealImprintDetails = await fetchSealImprintDetail(draftId);
      navigate(
        `/seal/imprint/${draftId}?readonly=true&applyStatus=${applyStatus}`,
        { state: { sealImprintDetails, readOnly: true } }
      );
    } else if (docType === "인장신청(반출)") {
      const sealExportDetails = await fetchSealExportDetail(draftId);
      navigate(
        `/seal/export/${draftId}?readonly=true&applyStatus=${applyStatus}`,
        { state: { sealExportDetails, readOnly: true } }
      );
    }
  };

  const columns = [
    ...(showCheckboxColumn && documentTypeFromUrl === "명함신청"
      ? [
          {
            header: (
              <input
                type="checkbox"
                onChange={(e) => handleSelectAll(e.target.checked)}
              />
            ),
            accessor: "select",
            width: "4%",
            Cell: ({ row }) => (
              <input
                type="checkbox"
                checked={selectedApplications.includes(row.draftId)}
                onChange={(e) => handleSelect(e.target.checked, row.draftId)}
              />
            ),
          },
        ]
      : []),
    { header: "문서분류", accessor: "docType", width: "10%" },
    ...(documentTypeFromUrl === "법인서류"
      ? [
          {
            header: (
              <CenterSelect
                centers={centers}
                selectedCenter={selectedCenter}
                onCenterChange={handleCenterChange}
              />
            ),
            accessor: "instNm",
            width: "10%",
          },
        ]
      : [{ header: "센터", accessor: "instNm", width: "10%" }]),
    {
      header: "제목",
      accessor: "title",
      width: "24%",
      Cell: ({ row }) => (
        <span
          className="status-pending clickable"
          onClick={() =>
            handleRowClick(row.draftId, row.docType, row.applyStatus)
          }
        >
          {row.title}
        </span>
      ),
    },
    { header: "신청일시", accessor: "draftDate", width: "13%" },
    { header: "신청자", accessor: "drafter", width: "6%" },
    {
      header:
        documentTypeFromUrl === "문서수발신" ? "승인일시" : "승인/반려일시",
      accessor: "respondDate",
      width: "13%",
    },
    ...(documentTypeFromUrl === "문서수발신" ||
    documentTypeFromUrl === "법인서류" ||
    documentTypeFromUrl === "인장신청"
      ? []
      : [{ header: "발주일시", accessor: "orderDate", width: "14%" }]),
    { header: "문서상태", accessor: "applyStatus", width: "10%" },
  ];

  return (
    <div className="content">
      <div className="all-applications">
        <h2>전체 신청내역</h2>
        <div className="application-header-row">
          <Breadcrumb items={getBreadcrumbItems()} />
          <div className="application-button-container">
            {showExcelButton && documentTypeFromUrl === "명함신청" && (
              <CustomButton
                className="finish-excel-button"
                onClick={handleExcelDownload}
              >
                엑셀변환
              </CustomButton>
            )}
          </div>
        </div>
        <ConditionFilter
          startDate={filterInputs.startDate}  // 신청 시작일자
          setStartDate={(date) =>
            setFilterInputs((prev) => ({ ...prev, startDate: date }))
          }
          endDate={filterInputs.endDate}      // 신청 종료일자
          setEndDate={(date) =>
            setFilterInputs((prev) => ({ ...prev, endDate: date }))
          }
          onSearch={applyFilters}    // 조회
          onReset={handleReset}      // 초기화
          showStatusFilters={true}   // 개별 상태필터 표시여부
          forceShowAllStatusFilters={true}  // 전체 상태필터 표시여부
          filters={filters}          // 상태필터 체크여부
          setFilters={setFilters}
          showStatus={showStatus}
          setShowStatus={setShowStatus}
          onFilterChange={handleFilterChange}
          showSearchCondition={true} // 검색조건 표시여부
          searchOptions={["전체", "제목", "신청자"]}   // 검색유형 종류
          searchType={filterInputs.searchType}        // 선택한 검색유형
          setSearchType={(searchType) =>
            setFilterInputs((prev) => ({ ...prev, searchType }))
          }
          keyword={filterInputs.keyword}        // 검색어
          setKeyword={(keyword) =>
            setFilterInputs((prev) => ({ ...prev, keyword }))
          }
          showDocumentType={false}   // 문서분류 표시여부
          documentType={filterInputs.documentType}  // 문서분류
          setDocumentType={(docType) =>
            setFilterInputs((prev) => ({ ...prev, documentType: docType }))
          } 
        />
        {loading ? (
          <Loading />
        ) : (
          <>
            <Table
              columns={columns}
              data={filteredApplications}
              onSelect={handleSelect}
              selectedItems={selectedApplications}
            />
            <PaginationSub
              totalPages={totalPages}
              onPageChange={handlePageClick}
              currentPage={currentPage}
            />
          </>
        )}
      </div>
      {modalVisible && selectedDocumentId && (
        <DocConfirmModal
          show={modalVisible}
          documentId={selectedDocumentId}
          onClose={closeModal}
          onApprove={approveDocument}
          applyStatus={selectedApplyStatus}
        />
      )}
    </div>
  );
}

export default ApplicationsList;
