import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const LiveFeed = () => {
  // Default starting frame state matching the dashboard
  const [frameData, setFrameData] = useState({
    FL: 250, FR: 250, BL: 250, BR: 250,
    Danger: 0, Safety_Pct: 100, Rel_Speed: 0, Aggression_Score: 0, 
    Front_Avg: 250, TTC_Seconds: 0, Steering_Angle: 0, 
    Status_Label: 'CRUISING', Acceleration: 0
  });

  const [isRecording, setIsRecording] = useState(false);
  const recordingInterval = useRef(null);

  const startSimulation = async () => {
    try {
      await axios.post('http://localhost:5000/api/adas/session/start');
      setIsRecording(true);
      
      recordingInterval.current = setInterval(async () => {
        // Simulating data changing over time
        const newFL = Math.max(10, Math.floor(Math.random() * 300));
        const newFR = Math.max(10, Math.floor(Math.random() * 300));
        const newDanger = Math.random() > 0.8 ? 4 : Math.random() > 0.5 ? 3 : 0;
        const newStatus = newDanger === 4 ? 'COLLISION WARNING' : newDanger === 3 ? 'HARD TURN' : 'CRUISING';
        
        const simFrame = {
            FL: newFL, FR: newFR,
            BL: Math.max(10, Math.floor(Math.random() * 300)), 
            BR: Math.max(10, Math.floor(Math.random() * 300)),
            Front_Avg: (newFL + newFR) / 2,
            Min_Dist: Math.min(newFL, newFR), 
            Rel_Speed: (Math.random() * 10).toFixed(1),
            Safety_Pct: newDanger === 4 ? 16.5 : newDanger === 3 ? 27.7 : 98.6, 
            Aggression_Score: newDanger > 0 ? (Math.random() * 20).toFixed(1) : 0,
            Steering_Angle: Math.floor(Math.random() * 90) - 45,
            Status_Label: newStatus,
            Acceleration: (Math.random() * 2 - 1).toFixed(2)
        };
        setFrameData(simFrame);
        await axios.post('http://localhost:5000/api/adas/session/record', simFrame);
      }, 1000);
    } catch (err) { console.error("Start error", err); }
  };

  const stopSimulation = async () => {
    setIsRecording(false);
    clearInterval(recordingInterval.current);
    alert("Simulation Stopped. Running R Feature Engineering Pipeline...");
    try {
      await axios.post('http://localhost:5000/api/adas/session/stop');
      alert("R Feature Engineering Complete! Switch to the BI Analytics Tab.");
    } catch (err) { console.error("Stop error", err); }
  };

  // Helper to determine color based on Danger level
  const getDangerColor = (level) => {
    if (level >= 4) return 'var(--c4)'; // Critical (Red)
    if (level === 3) return 'var(--c2)'; // Warning (Yellow)
    if (level >= 1) return 'var(--c1)'; // Caution (Light Green)
    return 'var(--c0)'; // Safe (Green)
  };

  const dangerColor = getDangerColor(frameData.Danger);

  return (
    <div style={{ display: 'contents' }}>
      {/* ================= LEFT PANEL (Sensors) ================= */}
      <div className="panel" style={{ width: '320px', minWidth: '320px' }}>
        <div className="panel-label">Sensor Array</div>
        
        {/* Danger Level */}
        <div className="card">
          <div className="card-title">Danger Level</div>
          <div className="danger-display">
            <div className="danger-ring" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', border: `8px solid ${dangerColor}`, borderRadius: '50%', width: '100px', height: '100px' }}>
              <div className="danger-ring-val" style={{ textAlign: 'center' }}>
                <span className="danger-num" style={{ color: dangerColor, fontSize: '36px' }}>{frameData.Danger}</span>
              </div>
            </div>
            <div style={{ fontSize: '11px', marginTop: '10px', fontWeight: 'bold', padding: '6px 16px', borderRadius: '20px', border: `1px solid ${dangerColor}`, color: dangerColor, letterSpacing: '1px' }}>
              {frameData.Status_Label}
            </div>
          </div>
        </div>

        {/* Distance Readings Bar Chart */}
        <div className="card">
          <div className="card-title">Distance Readings (CM)</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
            {['FL', 'FR', 'BL', 'BR'].map(sensor => (
              <div key={sensor} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px' }}>
                <span style={{ width: '20px', color: 'var(--muted)' }}>{sensor}</span>
                <div style={{ flex: 1, height: '12px', background: 'var(--bg)', borderRadius: '6px', overflow: 'hidden' }}>
                  <div style={{ width: `${(frameData[sensor] / 400) * 100}%`, height: '100%', background: 'var(--c0)', transition: 'width 0.3s ease' }}></div>
                </div>
                <span style={{ width: '30px', textAlign: 'right', fontFamily: 'var(--mono)' }}>{Math.floor(frameData[sensor])}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Steering Angle */}
        <div className="card">
          <div className="card-title">Steering Angle</div>
          <div style={{ position: 'relative', height: '80px', display: 'flex', justifyContent: 'center', alignItems: 'flex-end', paddingBottom: '10px' }}>
            {/* SVG Half Circle */}
            <svg width="140" height="70" viewBox="0 0 140 70">
              <path d="M 10 70 A 60 60 0 0 1 130 70" fill="none" stroke="var(--border2)" strokeWidth="4" strokeDasharray="4 4" />
              <line x1="70" y1="70" x2="70" y2="20" stroke="var(--scan)" strokeWidth="2" style={{ transformOrigin: '70px 70px', transform: `rotate(${frameData.Steering_Angle}deg)`, transition: 'transform 0.3s ease' }} />
              <circle cx="70" cy="70" r="6" fill="var(--scan)" />
            </svg>
            <div style={{ position: 'absolute', bottom: '-5px', fontSize: '14px', fontFamily: 'var(--mono)', color: 'var(--text)' }}>
              {frameData.Steering_Angle}°
            </div>
          </div>
        </div>
      </div>

      {/* ================= CENTER PANEL (Radar & KPIs) ================= */}
      <div className="center">
        {/* Top KPIs */}
        <div className="center-top">
          <div className="kpi" style={{ borderTop: `2px solid ${dangerColor}` }}>
            <div className="kpi-label">Safety</div>
            <div className="kpi-val" style={{ color: dangerColor }}>{frameData.Safety_Pct}%</div>
            <div className="kpi-sub">session avg</div>
          </div>
          <div className="kpi info" style={{ borderTop: '2px solid var(--scan)' }}>
            <div className="kpi-label">Rel. Speed</div>
            <div className="kpi-val">{frameData.Rel_Speed}</div>
            <div className="kpi-sub">cm/s (relative to object)</div>
          </div>
          <div className="kpi warn" style={{ borderTop: '2px solid var(--c2)' }}>
            <div className="kpi-label">Aggression</div>
            <div className="kpi-val">{frameData.Aggression_Score}</div>
            <div className="kpi-sub">score</div>
          </div>
          <div className="kpi danger" style={{ borderTop: '2px solid var(--blue)' }}>
            <div className="kpi-label">Front Avg</div>
            <div className="kpi-val">{Math.floor(frameData.Front_Avg)}</div>
            <div className="kpi-sub">FL + FR mean (cm)</div>
          </div>
        </div>

        {/* Central Radar Visualization */}
        <div className="radar-area" style={{ background: 'radial-gradient(circle at center, rgba(0, 212, 255, 0.05) 0%, transparent 60%)' }}>
          <div style={{ position: 'relative', width: '300px', height: '300px' }}>
             {/* Radar Rings */}
             <div style={{ position: 'absolute', inset: 0, border: '1px dashed var(--border2)', borderRadius: '50%' }}></div>
             <div style={{ position: 'absolute', inset: '50px', border: '1px dashed var(--border2)', borderRadius: '50%' }}></div>
             <div style={{ position: 'absolute', inset: '100px', border: '1px dashed var(--border2)', borderRadius: '50%' }}></div>
             
             {/* Crosshairs */}
             <div style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', width: '1px', background: 'var(--border2)' }}></div>
             <div style={{ position: 'absolute', top: '50%', right: 0, left: 0, height: '1px', background: 'var(--border2)' }}></div>

             {/* Dynamic Distance Lines (Simulating radar returns) */}
             <div style={{ position: 'absolute', top: '50%', left: '50%', width: `${frameData.FR / 2}px`, height: '2px', background: 'var(--c4)', transformOrigin: '0 0', transform: 'rotate(-45deg)' }}></div>
             <div style={{ position: 'absolute', top: '50%', left: '50%', width: `${frameData.FL / 2}px`, height: '2px', background: 'var(--c0)', transformOrigin: '0 0', transform: 'rotate(-135deg)' }}></div>
             
             {/* The Car SVG Icon */}
             <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 10 }}>
               <svg width="40" height="60" viewBox="0 0 40 60">
                 <rect x="5" y="5" width="30" height="50" rx="8" fill="var(--scan)" opacity="0.8" />
                 <rect x="8" y="15" width="24" height="12" rx="2" fill="#000" />
                 <rect x="8" y="35" width="24" height="15" rx="2" fill="#000" />
               </svg>
             </div>
          </div>
        </div>

        {/* Bottom Playback Controls */}
        <div style={{ padding: '16px', borderTop: '1px solid var(--border)', background: 'var(--bg2)', display: 'flex', alignItems: 'center', gap: '20px' }}>
          {isRecording ? (
             <button onClick={stopSimulation} style={{ background: 'var(--c4)', color: 'white', padding: '8px 20px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>■ STOP</button>
          ) : (
             <button onClick={startSimulation} style={{ background: 'var(--c0)', color: 'black', padding: '8px 20px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>▶ START</button>
          )}
          
          <button style={{ background: 'transparent', color: 'var(--muted)', border: '1px solid var(--border2)', padding: '7px 15px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }}>↺ RESET</button>
          
          {/* Mock Timeline bar */}
          <div style={{ flex: 1, height: '6px', background: 'var(--bg)', borderRadius: '3px', position: 'relative' }}>
             <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: isRecording ? '40%' : '0%', background: 'var(--scan)', borderRadius: '3px', transition: 'width 1s linear' }}></div>
          </div>
          <div style={{ fontSize: '11px', fontFamily: 'var(--mono)', color: 'var(--muted)' }}>Frame: 45 / 3000</div>
        </div>
      </div>
      
      {/* ================= RIGHT PANEL (Threats & Events) ================= */}
      <div className="panel" style={{ width: '280px', minWidth: '280px' }}>
         <div className="panel-label">Threat Map</div>
         
         {/* Zone Proximity Grid */}
         <div className="card">
           <div className="card-title">Zone Proximity</div>
           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', padding: '15px 0', textAlign: 'center', borderRadius: '6px' }}>
                <div style={{ color: 'var(--muted)', fontSize: '10px', marginBottom: '5px' }}>FL</div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: '20px', color: 'var(--text)' }}>{Math.floor(frameData.FL)}</div>
              </div>
              <div style={{ background: frameData.FR < 100 ? 'rgba(239,68,68,0.1)' : 'var(--bg)', border: `1px solid ${frameData.FR < 100 ? 'var(--c4)' : 'var(--border)'}`, padding: '15px 0', textAlign: 'center', borderRadius: '6px' }}>
                <div style={{ color: 'var(--muted)', fontSize: '10px', marginBottom: '5px' }}>FR</div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: '20px', color: frameData.FR < 100 ? 'var(--c4)' : 'var(--text)' }}>{Math.floor(frameData.FR)}</div>
              </div>
              <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', padding: '15px 0', textAlign: 'center', borderRadius: '6px' }}>
                <div style={{ color: 'var(--muted)', fontSize: '10px', marginBottom: '5px' }}>BL</div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: '20px', color: 'var(--text)' }}>{Math.floor(frameData.BL)}</div>
              </div>
              <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', padding: '15px 0', textAlign: 'center', borderRadius: '6px' }}>
                <div style={{ color: 'var(--muted)', fontSize: '10px', marginBottom: '5px' }}>BR</div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: '20px', color: 'var(--text)' }}>{Math.floor(frameData.BR)}</div>
              </div>
           </div>
         </div>

         <div className="panel-label" style={{ marginTop: '10px' }}>Alerts</div>
         
         {/* Event Log */}
         <div className="card" style={{ flex: 1 }}>
           <div className="card-title">Event Log</div>
           <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--mono)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {frameData.Danger > 0 && (
                 <div style={{ padding: '6px', background: `rgba(234, 179, 8, 0.1)`, borderLeft: `3px solid var(--c2)`, color: 'var(--text)' }}>
                    [SYS] {frameData.Status_Label} Detected
                 </div>
              )}
              <div style={{ padding: '6px', borderLeft: '3px solid var(--dim)' }}>
                 [SYS] Telemetry stream active...
              </div>
           </div>
         </div>

         {/* Accel Sparkline */}
         <div className="card">
           <div className="card-title">Accel Sparkline</div>
           <div style={{ height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <svg width="100%" height="40">
               <polyline points="0,20 20,25 40,15 60,35 80,10 100,20" fill="none" stroke="var(--scan)" strokeWidth="2" />
             </svg>
           </div>
         </div>
      </div>
    </div>
  );
};

export default LiveFeed; 