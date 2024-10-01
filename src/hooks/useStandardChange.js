import { useState } from "react";

const useStandardChange = () => {
  const [selectedDetails, setSelectedDetails] = useState([]);
  const [details, setDetails] = useState([]);
  const [items, setItems] = useState([]);

    const handleSelectAll = () => {
        if (selectedDetails.length === details.length) {
            setSelectedDetails([]);
        } else {
            setSelectedDetails(details.map(detail => detail.detailCd));
        }
    };

    
  const handleDetailSelect = (detailCd) => {
    setSelectedDetails((prevSelectedDetails) => {
      if (prevSelectedDetails.includes(detailCd)) {
        return prevSelectedDetails.filter((code) => code !== detailCd);
      } else {
        return [...prevSelectedDetails, detailCd];
      }
    });
  };

  const handleItemChange = (index, value) => {
    const newItems = [...items];
    newItems[index].value = value;
    setItems(newItems);
  };

  const handleAddItem = () => {
    if (items.length < 10) {
      setItems([...items, { value: '' }]);
    } else {
      alert('해당 기준자료 항목은 최대 10개까지 추가할 수 있습니다.');
    }
  };

    return {items, selectedDetails,details, setItems, setSelectedDetails, setDetails, handleItemChange, handleAddItem, handleSelectAll, handleDetailSelect, handleItemChange, handleAddItem

    }
}

export default useStandardChange