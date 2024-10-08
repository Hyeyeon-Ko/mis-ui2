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
    { label: '업체명', name: 'companyNm', type: 'text' },
    { label: '제품군', name: 'category', type: 'text' },
    { label: '계약번호', name: 'contractNum', type: 'text' },
    { label: '모델명', name: 'modelNm', type: 'text' },
    { label: '설치일자', name: 'installDate', type: 'text', placeholder: 'YYYY-MM-DD' },
    { label: '만료일자', name: 'expiryDate', type: 'text', placeholder: 'YYYY-MM-DD' },
    { label: '렌탈료', name: 'rentalFee', type: 'text' },
    { label: '위치분류', name: 'location', type: 'text' },
    { label: '설치위치', name: 'installationSite', type: 'text' },
    { label: '특이사항', name: 'specialNote', type: 'text' }
];