import { useState } from 'react';

export function useDateChange() {
    const [formattedDate, setFormattedDate] = useState('');

    const handleUseDateChange = (e) => {
        const inputDate = e.target.value.replace(/\D+/g, "");
        let result = "";

        for (let i = 0; i < inputDate.length && i < 8; i++) {
            if (i === 4 || i === 6) result += "-";
            result += inputDate[i];
        }

        setFormattedDate(result);
    };

    return [formattedDate, handleUseDateChange];
}
