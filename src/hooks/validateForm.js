// 날짜 입력 형식 validation
export const validateUseDate = (dates) => {
    const regex = /^\d{4}-\d{2}-\d{2}$/;

    return Object.entries(dates).map(([key, date]) => {

        // key에 따라 적절한 fieldName 설정
        let fieldName;
        if (key === 'useDate') {
            fieldName = '사용일자';
        } else if (key === 'exportDate') {
            fieldName = '반출일자';
        } else if (key === 'returnDate') {
            fieldName = '반납일자';
        } else {
            fieldName = key;
        }

        if (!regex.test(date)) {
            return {
                isValid: false,
                message: `${fieldName}는 YYYY-MM-DD 형식으로 입력해야 합니다.`
            };
        }
    
        const [year, month, day] = date.split('-').map(Number);
        const inputDate = new Date(year, month - 1, day);
        const isValidDate = inputDate && (inputDate.getFullYear() === year) && (inputDate.getMonth() + 1 === month) && (inputDate.getDate() === day);
        
        return {date: key, isValid: isValidDate};
    });
};

export const requiredSelection = (type, selected) => {
    const selectedValues = Object.values(selected).filter(value => value.selected);

    // type에 따라 적절한 fieldName 설정
    let fieldName;
    if (type === 'Seal') {
        fieldName = '인감';
    } else if (type === 'CorpDoc') {
        fieldName = '법인서류';
    } else {
        fieldName = type;
    }

    if (selectedValues.length === 0) {
        return {
            isValid: false,
            message: '최소 하나의 ' + fieldName + '을 선택해주세요.'
        };
    }
    
    const missingQuantity = selectedValues.find(selected => selected.quantity === '');
    if (missingQuantity) {
        return {
            isValid: false,
            message: '선택한 ' + fieldName + '의 수량을 입력해주세요.'
        };
    }

    return { isValid: true, message: '' };
}


export const validateForm = (type, selectedValues, inputDates) => {
    
    const dateValidationResults = validateUseDate(inputDates);
    const invalidDate = dateValidationResults.find(result => !result.isValid);
    if (invalidDate) {
        return { isValid: false, message: invalidDate.message };
    }

    const missedSelection = requiredSelection(type, selectedValues);
    if (!missedSelection.isValid) {
        return { isValid: false, message: missedSelection.message };
    }

    return { isValid: true, message: '' };
};
