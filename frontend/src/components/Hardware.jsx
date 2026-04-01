import React from 'react';

const Hardware = () => {
  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="card">
        <div className="card-title">Tinkercad circuit — sensor wiring diagram</div>
        <div style={{ background: '#050a10', border: '1px solid var(--border)', borderRadius: '8px', padding: '20px', textAlign: 'center' }}>
          <p style={{ color: 'var(--c0)' }}>Arduino UNO + 4x HC-SR04 Ultrasonic Sensors</p>
          <div style={{ marginTop: '20px', color: 'var(--muted)' }}>
             This layer handles the TinyML quantized TFLite Model (INT8) running on the edge device to capture distances and forward them to the Node Backend.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hardware;