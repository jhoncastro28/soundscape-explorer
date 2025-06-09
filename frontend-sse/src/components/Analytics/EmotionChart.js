import React, { useEffect, useRef } from 'react';
import './EmotionChart.css';

const EmotionChart = ({ data = [], title = "Patrones Emocionales", loading = false }) => {
  const chartRef = useRef(null);
  
  useEffect(() => {
    if (data.length > 0 && chartRef.current) {
      // Agregar clase para activar animaciones después del montaje
      const timer = setTimeout(() => {
        chartRef.current.classList.add('chart-loaded');
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [data]);

  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const getEmotionIcon = (emotion) => {
    const iconMap = {
      // Emociones positivas
      'feliz': '😊',
      'alegre': '😄',
      'emocionado': '🤩',
      'tranquilo': '😌',
      'relajado': '😴',
      'esperanzado': '🤗',
      'agradecido': '🙏',
      'satisfecho': '😋',
      'confiado': '😎',
      'orgulloso': '🥰',
      
      // Emociones neutras
      'curioso': '🤔',
      'concentrado': '🧐',
      'pensativo': '💭',
      'sorprendido': '😮',
      'confundido': '😕',
      
      // Emociones negativas
      'triste': '😢',
      'enojado': '😠',
      'frustrado': '😤',
      'preocupado': '😟',
      'ansioso': '😰',
      'cansado': '😪',
      'aburrido': '🥱',
      'nostálgico': '🥺',
      'melancólico': '😔',
      
      // Default
      'default': '💭'
    };
    
    return iconMap[emotion.toLowerCase()] || iconMap['default'];
  };

  if (loading) {
    return (
      <div className="emotion-chart loading">
        <h3>{title}</h3>
        <div className="chart-container">
          <div className="no-data">Cargando datos emocionales...</div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="emotion-chart">
        <h3>{title}</h3>
        <div className="chart-container">
          <div className="no-data">
            No hay datos de emociones disponibles
          </div>
        </div>
      </div>
    );
  }

  const maxCount = Math.max(...data.map(item => item.count));
  const totalCount = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="emotion-chart" ref={chartRef}>
      <h3>{title}</h3>
      <div className="chart-container">
        {data.map(({ emotion, count }, index) => {
          const percentage = ((count / maxCount) * 100).toFixed(1);
          const sharePercentage = ((count / totalCount) * 100).toFixed(1);
          
          return (
            <div 
              key={emotion} 
              className="emotion-bar"
              title={`${emotion}: ${count} apariciones (${sharePercentage}% del total)`}
            >
              <div className="emotion-info">
                <span className="emotion-name">
                  <span className="emotion-icon">{getEmotionIcon(emotion)}</span>
                  {emotion}
                  <span className="emotion-percentage">({sharePercentage}%)</span>
                </span>
                <span className="emotion-count">
                  {formatNumber(count)}
                </span>
              </div>
              <div className="bar-container">
                <div
                  className="bar"
                  style={{
                    '--final-width': `${percentage}%`,
                    animationDelay: `${index * 0.15}s`
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
      
      {data.length > 0 && (
        <div className="chart-summary">
          <p className="summary-text">
            <strong>{data.length}</strong> emociones diferentes con un total de{' '}
            <strong>{formatNumber(totalCount)}</strong> registros.
            La emoción más común es <strong>{data[0]?.emotion}</strong>.
          </p>
        </div>
      )}
    </div>
  );
};

export default EmotionChart;