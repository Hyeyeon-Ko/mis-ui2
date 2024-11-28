import { useState } from 'react';

export function usePriceChange() {
    const [formattedPrice, setFormattedPrice] = useState('');

    const handlePriceChange = (e) => {
        const inputPrice = e.target.value.replace(/\D+/g, "");
        const numericPrice = parseInt(inputPrice, 10) || 0;
        const formatted = numericPrice.toLocaleString();

        setFormattedPrice(formatted);
    };

    return [formattedPrice, handlePriceChange];
}
