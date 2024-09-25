import { getFieldName } from './fieldNameUtils';

export const validateUseDate = (dates) => {
    const regex = /^\d{4}-\d{2}-\d{2}$/;

    return Object.entries(dates).map(([key, date]) => {

        const fieldName = getFieldName(key);
        if (!regex.test(date)) {
            return {
                isValid: false,
                message: `${fieldName} YYYY-MM-DD 형식으로 입력해야 합니다.`
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

    const fieldName = getFieldName(type); 
    if (selectedValues.length === 0) {
        return {
            isValid: false,
            message: '최소 한 개의 ' + fieldName + ' 선택해주세요.'
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

export const requiredInput = (inputValues) => {
    for (const [field, value] of Object.entries(inputValues)) {
        
        const fieldName = getFieldName(field);

        // input, select box 값 선택 안한 경우
        if (typeof value === 'string') {
            if (!value || value.trim() === '') {
                return {
                    isValid: false,
                    message: (field !== 'type') ? `${fieldName} 입력해주세요.` : `${fieldName} 선택해주세요.`
                    }
            }
        } // 첨부파일 업로드 안한 경우
        else if (!value) {
            return {
                isValid: false,
                message: `${fieldName} 업로드 해주세요.`
            }
        }
    }

    return { isValid: true, message: '' };
}


// validation 검사
export const validateForm = (type, inputs, selectedValues, inputDates) => {

    // 1. 필수 입력값 검사
    const requiredInputCheck = requiredInput(inputs);
    if (!requiredInputCheck.isValid) {
        return requiredInputCheck;
    }

    // 2. 날짜 입력형식 검사
    const dateValidationResults = validateUseDate(inputDates);
    const invalidDate = dateValidationResults.find(result => !result.isValid);
    if (invalidDate) {
        return { isValid: false, message: invalidDate.message };
    }

    // 3. 체크박스 선택 및 수량 입력형식 검사
    const missedSelection = requiredSelection(type, selectedValues);
    if (!missedSelection.isValid) {
        return { isValid: false, message: missedSelection.message };
    }

    return { isValid: true, message: '' };
};
