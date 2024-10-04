import { useMemo } from 'react';

const useDateSet = () => {
  return useMemo(() => {
    const today = new Date();
    
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(today.getMonth() - 1);
    
    // Format the dates to YYYY-MM-DD
    const formattedToday = today.toISOString().split('T')[0];
    const formattedOneMonthAgo = oneMonthAgo.toISOString().split('T')[0];

    return { formattedStartDate: formattedOneMonthAgo, formattedEndDate: formattedToday };
  }, []);
};

export default useDateSet;
