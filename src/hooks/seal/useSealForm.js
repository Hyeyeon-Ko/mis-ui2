import { useState } from 'react';

export const useSealForm = () => {
    const [sealSelections, setSealSelections] = useState({
        corporateSeal: { selected: false, quantity: '' },
        facsimileSeal: { selected: false, quantity: '' },
        companySeal: { selected: false, quantity: '' },
    });

    const handleSealChange = (sealName) => {
        setSealSelections(prevState => ({
            ...prevState,
            [sealName]: {
                ...prevState[sealName],
                selected: !prevState[sealName].selected,
                quantity: ''
            }
        }));
    };

    const handleQuantityChange = (e, sealName) => {
        const value = e.target.value;
        setSealSelections(prevState => ({
            ...prevState,
            [sealName]: {
                ...prevState[sealName],
                quantity: value
            }
        }));
    };

    return {
        sealSelections,
        handleSealChange,
        handleQuantityChange,
    };
};
