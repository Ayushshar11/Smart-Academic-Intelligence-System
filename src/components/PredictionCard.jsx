import React from 'react';
import { TrendingUp, AlertTriangle } from 'lucide-react';

const PredictionCard = ({ type, score, status }) => {
  const isHighRisk = status === 'High';

  return (
    <div className={`p-6 rounded-2xl border-l-4 shadow-sm bg-white ${isHighRisk ? 'border-red-500' : 'border-green-500'}`}>
      <div className="flex justify-between items-center">
        <h3 className="text-gray-500 font-medium">{type}</h3>
        {isHighRisk ? <AlertTriangle className="text-red-500" /> : <TrendingUp className="text-green-500" />}
      </div>
      <div className="mt-4">
        <span className="text-3xl font-bold">{score}</span>
        <p className={`mt-2 text-sm font-semibold ${isHighRisk ? 'text-red-600' : 'text-green-600'}`}>
          Risk Level: {status}
        </p>
      </div>
    </div>
  );
};

export default PredictionCard;