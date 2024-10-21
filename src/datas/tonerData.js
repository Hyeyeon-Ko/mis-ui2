export const divisionMap = {
    드럼: 'A',
    번들: 'B',
    유지보수키트: 'C',
    잉크: 'D',
    토너: 'E',
};

export const reverseDivisionMap = Object.fromEntries(
    Object.entries(divisionMap).map(([key, value]) => [value, key])
);

export const addFormData = {
    modelNm: '',
    company: '',
    tonerNm: '',
    division: '',
    price: '',
    specialNote: '',
}

export const formFields = [
    { label: '모델명', name: 'modelNm', type: 'text', isRequired: true },
    { label: '제조사', name: 'company', type: 'text', isRequired: true },
    { label: '토너명', name: 'tonerNm', type: 'text', isRequired: true },
    { label: '구분', name: 'division', type: 'text', isRequired: true },
    { label: '가격', name: 'price', type: 'text', isRequired: true },
    { label: '비고', name: 'specialNote', type: 'text', isRequired: false },
];

export const addTonerFormData = {
    mngNum: '',
    floor: '',
    teamNm: '',
    manager: '',
    subManager: '',
    location: '',
    productNm: '',
    modelNm: '',
    sn: '',
    company: '',
    manuDate: '',
    tonerNm: '',
    price: '',
}

export const tonerFormFields = [
    { label: '관리번호', name: 'mngNum', type: 'text', isRequired: true },
    { label: '층', name: 'floor', type: 'text', isRequired: true },
    { label: '부서', name: 'teamNm', type: 'text', isRequired: true },
    { label: '관리자(정)', name: 'manager', type: 'text', isRequired: true },
    { label: '관리자(부)', name: 'subManager', type: 'text', isRequired: true },
    { label: '위치', name: 'location', type: 'text', isRequired: true },
    { label: '제품명', name: 'productNm', type: 'text', isRequired: true },
    { label: '모델명', name: 'modelNm', type: 'text', isRequired: true },
    { label: 'S/N', name: 'sn', type: 'text', isRequired: true },
    { label: '제조사', name: 'company', type: 'text', isRequired: true },
    { label: '제조일', name: 'manuDate', type: 'text', isRequired: true },
    { label: '토너명', name: 'tonerNm', type: 'text', isRequired: true },
    { label: '가격', name: 'price', type: 'text', isRequired: false },
]