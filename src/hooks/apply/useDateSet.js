import { useMemo } from 'react';

const useDateSet = () => {
  return useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const oneMonthAgo = new Date(today);
    oneMonthAgo.setMonth(today.getMonth() - 1);

    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const formattedToday = formatDate(today);
    const formattedOneMonthAgo = formatDate(oneMonthAgo);

    return { formattedStartDate: formattedOneMonthAgo, formattedEndDate: formattedToday };
  }, []);
};

export default useDateSet;
