import React from 'react';
import './EmotionChart.css';

const EmotionChart = ({ data, title = "Patrones Emocionales" }) => {
  const maxCount = Math.max(...data.map(item => item.count));

  return (
    <div className="emotion-chart">
      <h3>{title}</h3>
      <div className="chart-container">
        {data.map(({ emotion, count }, index) => (
          <div key={emotion} className="emotion-bar">
            <div className="emotion-info">
              <span className="emotion-name">{emotion}</span>
              <span className="emotion-count">{count}</span>
            </div>
            <div className="bar-container">
              <div
                className="bar"
                style={{
                  width: `${(count / maxCount) * 100}%`,
                  animationDelay: `${index * 0.1}s`
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmotionChart;