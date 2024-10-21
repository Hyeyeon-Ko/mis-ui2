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
