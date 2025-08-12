
import { useState } from 'react';

export const useFullScreen = () => {
  const [clickCounts, setClickCounts] = useState({
    taskList: 0,
    details: 0,
    description: 0
  });

  const [fullScreenStates, setFullScreenStates] = useState({
    taskList: false,
    details: false,
    description: false
  });

  const handleHeaderClick = (panel: 'taskList' | 'details' | 'description') => {
    const newCount = clickCounts[panel] + 1;
    setClickCounts(prev => ({ ...prev, [panel]: newCount }));
    
    if (newCount >= 5) {
      setFullScreenStates(prev => ({ ...prev, [panel]: true }));
      setClickCounts(prev => ({ ...prev, [panel]: 0 }));
    }
  };

  const exitFullScreen = () => {
    setFullScreenStates({ taskList: false, details: false, description: false });
    setClickCounts({ taskList: 0, details: 0, description: 0 });
  };

  return {
    clickCounts,
    fullScreenStates,
    handleHeaderClick,
    exitFullScreen
  };
};
