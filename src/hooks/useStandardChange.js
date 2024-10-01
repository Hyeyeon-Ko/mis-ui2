import { useState } from "react";

const useStandardChange = () => {
  const [selectedDetails, setSelectedDetails] = useState([]);
  const [details, setDetails] = useState([]);

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

    return {selectedDetails,details, setSelectedDetails, setDetails, handleSelectAll, handleDetailSelect

    }
}

export default useStandardChange