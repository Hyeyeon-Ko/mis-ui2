export const addFormData = {
    category: '',
    companyNm: '',
    contractNum: '',
    modelNm: '',
    installDate: '',
    expiryDate: '',
    rentalFee: '',
    location: '',
    installationSite: '',
    specialNote: '',
}

export const formFields = [
    { label: '업체명', name: 'companyNm', type: 'text', isRequired: true },
    { label: '제품군', name: 'category', type: 'text', isRequired: true },
    { label: '계약번호', name: 'contractNum', type: 'text', placeholder: '계약번호 없을 시, "계약번호 없음"으로 기재',isRequired: true },
    { label: '모델명', name: 'modelNm', type: 'text', isRequired: true },
    { label: '설치일자', name: 'installDate', type: 'text', placeholder: 'YYYY-MM-DD', isRequired: true },
    { label: '만료일자', name: 'expiryDate', type: 'text', placeholder: 'YYYY-MM-DD', isRequired: true },
    { label: '렌탈료', name: 'rentalFee', type: 'text', isRequired: true },
    { label: '위치분류', name: 'location', type: 'text', placeholder: '사무실 / 병원 / 임원실 / 휴게실 / 화장실', isRequired: true },
    { label: '설치장소', name: 'installationSite', type: 'text', isRequired: true },
    { label: '특이사항', name: 'specialNote', type: 'text', isRequired: false }
];