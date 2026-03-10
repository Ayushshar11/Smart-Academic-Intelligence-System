import React from 'react';
import PredictionCard from './components/PredictionCard';

const App = () => {
  return (
    <div>
      <PredictionCard type="Academic Performance" score="85%" status="Medium" />
      <PredictionCard type="Attendance" score="90%" status="Low" />
      <PredictionCard type="Engagement" score="75%" status="High" />
      
    </div>
  );
}

export default App;
