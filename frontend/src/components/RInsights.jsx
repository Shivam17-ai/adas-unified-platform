import React from 'react';

const RInsights = () => {
  return (
    <div style={{ maxWidth: '820px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="card">
        <div className="card-title">R Workspace Analysis</div>
        <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: '1.7', marginBottom: '12px' }}>
          The R analysis workspace contained regression models predicting steering angle from sensor features, clustering of driving events, and raw angle distributions.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
          <div className="kpi info"><div className="kpi-label">Output file</div><div className="kpi-val" style={{fontSize:'14px'}}>ADAS_Action_Labels.csv</div></div>
          <div className="kpi safe"><div className="kpi-label">Variable</div><div className="kpi-val" style={{fontSize:'14px'}}>raw_angle</div></div>
          <div className="kpi warn"><div className="kpi-label">R seed</div><div className="kpi-val" style={{fontSize:'14px'}}>.Random.seed</div></div>
        </div>
      </div>
    </div>
  );
};

export default RInsights;