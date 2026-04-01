import React, { useState } from 'react';
import LiveFeed from './components/LiveFeed';
import Analytics from './components/Analytics';
import RInsights from './components/RInsights';
import SparkInsights from './components/SparkInsights';
import Hardware from './components/Hardware';
import './index.css';

function App() {
  const [activeTab, setActiveTab] = useState('live');

  return (
    <div className="shell">
      <header>
        <div className="logo">
          <svg className="logo-hex" viewBox="0 0 28 28" fill="none">
            <polygon points="14,2 24,7.5 24,20.5 14,26 4,20.5 4,7.5" fill="#0d1f2f" stroke="#14b8a6" strokeWidth="1.2"/>
            <polygon points="14,6 21,10 21,18 14,22 7,18 7,10" fill="#0f2d3d" stroke="#3b82f6" strokeWidth=".6"/>
            <circle cx="14" cy="14" r="3" fill="#14b8a6"/>
          </svg>
          <div>
            <div className="logo-text">ADAS<span style={{color:'var(--teal)'}}>OS</span></div>
            <div className="logo-sub">MERN + DevOps</div>
          </div>
        </div>

        <div className="header-mid">
          <button className={`tab ${activeTab === 'live' ? 'active' : ''}`} onClick={() => setActiveTab('live')}>Live Feed</button>
          <button className={`tab ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>BI Analytics</button>
          <button className={`tab ${activeTab === 'r' ? 'active' : ''}`} onClick={() => setActiveTab('r')}>R Insights</button>
          <button className={`tab ${activeTab === 'spark' ? 'active' : ''}`} onClick={() => setActiveTab('spark')}>PySpark ML</button>
          <button className={`tab ${activeTab === 'hardware' ? 'active' : ''}`} onClick={() => setActiveTab('hardware')}>TinyML</button>
        </div>

        <div className="header-right">
          <div className="status-dot"></div>
          <span className="status-label">ONLINE</span>
        </div>
      </header>

      <main id="mainContent" style={activeTab !== 'live' ? { display: 'block', padding: '20px', overflowY: 'auto' } : {}}>
        {activeTab === 'live' && <LiveFeed />}
        {activeTab === 'analytics' && <Analytics />}
        {activeTab === 'r' && <RInsights />}
        {activeTab === 'spark' && <SparkInsights />}
        {activeTab === 'hardware' && <Hardware />}
      </main>
    </div>
  );
}

export default App;