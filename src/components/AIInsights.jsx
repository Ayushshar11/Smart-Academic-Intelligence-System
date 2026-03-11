import React from 'react';
import { Lightbulb, ArrowUpRight } from 'lucide-react';

const AIInsights = () => {
  const recommendations = [
    "Your attendance in 'Machine Learning' is 72%. Increase it to 75% to avoid the 'At-Risk' flag.",
    "Based on Sem 5 performance, you are likely to score 8.5+ if you maintain current assignment submission rates.",
    "Focus more on 'Database Systems' – your internal marks are 10% lower than your average."
  ];

  return (
    <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl">
      <div className="flex items-center space-x-2 mb-4 text-blue-700">
        <Lightbulb size={20} />
        <h3 className="font-bold">AI Recommendations</h3>
      </div>
      <ul className="space-y-3">
        {recommendations.map((text, i) => (
          <li key={i} className="flex items-start space-x-3 text-sm text-blue-800 bg-white/50 p-3 rounded-lg">
            <ArrowUpRight size={16} className="mt-0.5 text-blue-500 shrink-0" />
            <span>{text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AIInsights;