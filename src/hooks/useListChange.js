import { useState } from "react";
import { filterData } from "../datas/listDatas";

const useListChange = () => {
    const [selectedApplications, setSelectedApplications] = useState([]);
    const [filteredApplications, setFilteredApplications] = useState([]); 
    const [filters, setFilters] = useState(filterData);


    const handleSelect = (isChecked, id) => {
        setSelectedApplications(isChecked
            ? [...selectedApplications, id]
            : selectedApplications.filter(appId => appId !== id)
        );
    };
    const handleSelectAll = (isChecked) => {
        setSelectedApplications(isChecked ? filteredApplications.map(app => app.draftId) : []);
    };

    const handleFilterChange = (e) => {
        const { name } = e.target;
        setFilters((prevFilters) => ({
          ...prevFilters,
          [name]: !prevFilters[name],
        }));
      };
    return {filters, filteredApplications, selectedApplications, setFilters, setFilteredApplications, setSelectedApplications, handleSelect, handleSelectAll, handleFilterChange}
}

export default useListChange