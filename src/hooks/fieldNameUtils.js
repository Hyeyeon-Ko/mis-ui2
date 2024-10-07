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
        // 문서수발신 신청
        case 'receiver':
            return '수신처를';
        case 'sender':
            return '발신처를';
        case 'title':
            return '제목을';
        // 문서보관항목 추가
        case 'teamNm':
            return "팀명을";
        case 'docId':
            return "문서관리번호를";
        case 'docNm':
            return "문서명을";
        case 'manager':
            return "관리자(정)을";
        case 'subManager':
            return "관리자(부)를";
        case 'storageYear':
            return "보존연한을";
        case 'createDate':
            return "생성일자를";
        case 'disposalDate':
            return "폐기일자를";
        case 'transferDate':
            return "이관일자를";
        // 인장등록
        case 'sealNm':
            return "인영 종류를";
        case 'sealImage':
            return "인영 이미지를";
        case 'useDept':
            return "사용부서를";
        case 'usage':
            return "용도를";
        case 'draftDate':
            return "등록일자를";
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