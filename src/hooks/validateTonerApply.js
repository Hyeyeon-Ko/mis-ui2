export const validateTonerApply = (tonerDetailDTOs) => {

    // 1. 빈 객체 신청항목 검사
    const hasEmptyMngNum = tonerDetailDTOs.some(dto => !dto.mngNum);
    if (hasEmptyMngNum) {
        return { isValid: false, message: '관리번호가 선택되지 않은 항목이 있습니다.' };
    }

    // 2. 토너 중복 신청 검사(관리번호와 토너명이 중복되는 데이터 체크)
    const seen = new Set();
    const hasDuplicates = tonerDetailDTOs.some(dto => {
        const key = `${dto.mngNum}-${dto.tonerNm}`;
        if (seen.has(key)) {
        return true;
        }
        seen.add(key);
        return false;
    });

    if (hasDuplicates) {
        return { isValid: false, message: '동일한 관리번호와 토너명으로 중복된 신청 항목이 있습니다.' };
    }


    return { isValid: true, message: '' };
};