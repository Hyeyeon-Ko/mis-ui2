import { useState } from 'react';

export function usePriceChange() {
    const [formattedPrice, setFormattedPrice] = useState('');

    const handleUsePriceChange = (e) => {
        const inputPrice = e.target.value.replace(/\D+/g, ""); 
        let result = "";

        for (let i = inputPrice.length - 1, count = 1; i >= 0; i--, count++) {
            result = inputPrice[i] + result;
            if (count % 3 === 0 && i !== 0) {
                result = "," + result;
            }
        }

        setFormattedPrice(result);
    };

    return [formattedPrice, setFormattedPrice, handleUsePriceChange];
}
