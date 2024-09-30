import { useState } from "react";
import { bcdInfoData, emailModalData, inputValue } from "../datas/bdcDatas";

const useBdcChange = () => {
  const [formData, setFormData] = useState(inputValue);
  const [emailData, setEmailData] = useState(emailModalData);
  const [userIdInput, setUserIdInput] = useState('');
  const [addressOptions, setAddressOptions] = useState([]);
  const [bcdData, setBcdData] = useState(bcdInfoData);
  const [applications, setApplications] = useState([]);
  const [selectedApplications, setSelectedApplications] = useState([]);
  const [floor, setFloor] = useState('');

  const handleEmailChange = (e) => {
    const { id, value } = e.target;
    setEmailData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  }
  
  const handleDetailChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleDetailCardTypeChange = (e) => {
    setFormData({ ...formData, cardType: e.target.value });
  };

    const handleApplyChange = (e) => {
        const { name, value } = e.target;
        if (['phone1', 'phone2', 'phone3', 'fax1', 'fax2', 'fax3', 'mobile1', 'mobile2', 'mobile3'].includes(name)) {
          if (isNaN(value) || value.length > 4) return;
        }
        if (!formData.userId) {
          alert('사번 조회를 통해 명함 대상자를 선택하세요.');
          return;
        }
        setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
      };  

    const handleCardTypeChange = (e) => {
      if (!formData.userId) {
        alert('사번 조회를 통해 명함 대상자를 선택하세요.');
        return;
      }
      setFormData((prevFormData) => ({ ...prevFormData, cardType: e.target.value }));
    };
    
      const handleUserIdChange = (e) => {
        setUserIdInput(e.target.value);
      };
    
      const handleCenterChange = (e) => {
        if (!formData.userId) {
          alert('사번 조회를 통해 명함 대상자를 선택하세요.');
          return;
        }
        const selectedCenter = e.target.value;
        const selectedInstInfo = bcdData.instInfo.find((inst) => inst.detailNm === selectedCenter);
    
        const options = [];
        if (selectedInstInfo) {
          if (selectedInstInfo.etcItem1) {
            options.push({ address: selectedInstInfo.etcItem1, engAddress: selectedInstInfo.etcItem2 });
          }
          if (selectedInstInfo.etcItem3) {
            options.push({ address: selectedInstInfo.etcItem3, engAddress: selectedInstInfo.etcItem4 });
          }
          if (selectedInstInfo.etcItem5) {
            options.push({ address: selectedInstInfo.etcItem5, engAddress: selectedInstInfo.etcItem6 });
          }
        }
    
        setAddressOptions(options);
        setFormData({
          ...formData,
          center: selectedCenter,
          address: options[0]?.address || '',
          engAddress: options[0]?.engAddress || '',
          department: '',
          team: '',
        });
      };
      
        // 전체 선택/해제 핸들러
        const handleSelectAll = (event) => {
          if (event.target.checked) {
            setSelectedApplications(applications.map((app) => app.id));
          } else {
            setSelectedApplications([]);
          }
        };

          // 개별 선택/해제 핸들러
        const handleSelect = (event, id) => {
          if (event.target.checked) {
            setSelectedApplications([...selectedApplications, id]);
          } else {
            setSelectedApplications(selectedApplications.filter((appId) => appId !== id));
          }
        };

        const handleTeamChange = (e) => {
          const selectedTeam = e.target.value;
          const selectedTeamInfo = bcdData.teamInfo.find((team) => team.detailCd === selectedTeam);
          const teamNm = selectedTeamInfo ? selectedTeamInfo.detailNm : '';
      
          setFormData({ ...formData, team: selectedTeam, teamNm: teamNm });
        };
      
        const handlePositionChange = (e) => {
          const selectedPosition = e.target.value;
          const selectedPositionInfo = bcdData.gradeInfo.find((position) => position.detailCd === selectedPosition);
          const enGradeNm = selectedPositionInfo ? selectedPositionInfo.etcItem2 : '';
          setFormData(() => ({
            ...formData,
            position: selectedPosition,
            gradeNm: selectedPosition === '000' ? formData.addGradeNm : selectedPositionInfo.detailNm,
            enGradeNm: selectedPosition === '000' ? enGradeNm : '',
          }));
        };
      
        const handleDepartmentChange = (e) => {
          setFormData({ ...formData, department: e.target.value, team: '' });
        };

        const handleAddressChange = (e) => {
          const updatedAddress = e.target.value + (floor ? `, ${floor}` : '');
          setFormData({ ...formData, address: updatedAddress });
        };

        const handleFloorChange = (e) => {
          const updatedFloor = e.target.value;
          setFloor(updatedFloor);
      
          const baseAddress = formData.address.split(',')[0];
          const updatedAddress = `${baseAddress}${updatedFloor ? `, ${updatedFloor}` : ''}`;
      
          const originalEngAddress = bcdData.instInfo.find((inst) => inst.detailCd === formData.center)?.etcItem2 || '';
          const updatedEngAddress = updatedFloor ? `${updatedFloor}F, ${originalEngAddress}` : originalEngAddress;
      
          setFormData({ ...formData, address: updatedAddress, engAddress: updatedEngAddress });
        };
      

  return {
    handleEmailChange, handleFloorChange, handleAddressChange, handleDepartmentChange,handleDetailCardTypeChange, handleDetailChange, handleApplyChange, handleCardTypeChange, handleUserIdChange, handleCenterChange, handleSelectAll, handleSelect, handleTeamChange, handlePositionChange,
    emailData, formData, userIdInput, addressOptions, applications, selectedApplications,floor,
    setEmailData, setFormData, setBcdData, setApplications, setSelectedApplications, setFloor
  }
}

export default useBdcChange;