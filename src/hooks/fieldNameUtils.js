export const getFieldName = (key) => {
    switch (key) {
        case 'useDate':
            return '사용일자는';
        case 'expNm':
            return '반출자명을';
        case 'exportDate':
            return '반출일자를';
        case 'returnDate':
            return '반납일자를';
        case 'Seal':
            return '인감을';
        case 'CorpDoc':
            return '법인서류를';
        case 'submission':
            return '제출처를';
        case 'purpose':
            return '사용목적을';
        case 'file':
            return '참조자료를';
        default:
            return key;
    }
};
