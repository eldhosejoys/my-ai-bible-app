import React from 'react';
import { useBibleData } from '../../hooks/useBibleData';
import './RefreshDataButton.css'

const RefreshDataButton = () => {
  const { isLoading: isDataLoading, refreshData } = useBibleData();

  return (
    <button onClick={refreshData} disabled={isDataLoading} className="refresh-data-button">
      {isDataLoading ? 'Refreshing...' : 'Refresh Data'}
    </button>
  );
};

export default RefreshDataButton;
