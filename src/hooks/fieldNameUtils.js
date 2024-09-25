export const getFieldName = (key) => {
    switch (key) {
        case 'useDate':
            return '사용일자를';
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
            return '첨부파일을';
        case 'docFile':
            return '근거서류를';
        case 'type':
            return '원본/pdf를';
        default:
            return key;
    }
};

// 법인서류 유형
export const getTypeName = (type) => {
    switch (type) {
        case 'original':
            return 'O';
        case 'pdf':
            return 'P';
        case 'both':
            return 'B';
        default:
            return '';
    }
}