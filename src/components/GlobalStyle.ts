import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Lato:ital,wght@0,300;0,400;0,700;0,900;1,400;1,700&display=swap');

  :root {
    /* 🌙 LUXURY DARK MODE (Pelindo Deep Obsidian Sapphire) */
    --bg-primary: #060913;
    --bg-page-gradient: 
      radial-gradient(circle at 10% 15%, rgba(30, 58, 138, 0.35) 0%, transparent 45%),
      radial-gradient(circle at 90% 10%, rgba(14, 165, 233, 0.25) 0%, transparent 40%),
      radial-gradient(circle at 50% 80%, rgba(99, 102, 241, 0.18) 0%, transparent 50%),
      linear-gradient(160deg, #060913 0%, #0b1120 40%, #080d1a 100%);
    
    --bg-card: rgba(13, 20, 36, 0.75);
    --bg-card-solid: #0d1424;
    --bg-card-hover: rgba(23, 34, 59, 0.85);
    --bg-card-subtle: rgba(255, 255, 255, 0.03);
    
    --text-primary: #f8fafc;
    --text-secondary: #94a3b8;
    --text-muted: #64748b;
    
    --border-color: rgba(255, 255, 255, 0.08);
    --border-hover: rgba(56, 189, 248, 0.45);
    --border-glow: rgba(59, 130, 246, 0.3);
    
    --header-bg: rgba(6, 9, 19, 0.82);
    --card-shadow: 0 16px 36px -8px rgba(0, 0, 0, 0.55), 0 0 1px 1px rgba(255, 255, 255, 0.06);
    --card-shadow-hover: 0 22px 48px -10px rgba(14, 165, 233, 0.2), 0 0 2px 1px rgba(56, 189, 248, 0.3);
    
    --accent-blue: #2563eb;
    --accent-cyan: #06b6d4;
    --accent-amber: #f59e0b;
    --accent-emerald: #10b981;
    --accent-crimson: #ef4444;
    --accent-glow: rgba(37, 99, 235, 0.35);
  }

  /* ☀️ LUXURY LIGHT MODE (Executive Alabaster & Sapphire Marine) */
  [data-theme='light'], body.light-mode {
    --bg-primary: #f8fafc;
    --bg-page-gradient: 
      radial-gradient(circle at 15% 10%, rgba(219, 234, 254, 0.6) 0%, transparent 40%),
      radial-gradient(circle at 85% 15%, rgba(224, 242, 254, 0.5) 0%, transparent 40%),
      linear-gradient(150deg, #f8fafc 0%, #eef2f6 50%, #f1f5f9 100%);
    
    --bg-card: rgba(255, 255, 255, 0.88);
    --bg-card-solid: #ffffff;
    --bg-card-hover: #ffffff;
    --bg-card-subtle: rgba(241, 245, 249, 0.6);
    
    --text-primary: #0f172a;
    --text-secondary: #475569;
    --text-muted: #64748b;
    
    --border-color: rgba(226, 232, 240, 0.9);
    --border-hover: rgba(37, 99, 235, 0.45);
    --border-glow: rgba(37, 99, 235, 0.2);
    
    --header-bg: rgba(255, 255, 255, 0.88);
    --card-shadow: 0 10px 25px -4px rgba(15, 23, 42, 0.06), 0 2px 6px -1px rgba(15, 23, 42, 0.04);
    --card-shadow-hover: 0 20px 35px -8px rgba(37, 99, 235, 0.12), 0 4px 12px -2px rgba(15, 23, 42, 0.06);
    
    --accent-blue: #1d4ed8;
    --accent-cyan: #0284c7;
    --accent-amber: #d97706;
    --accent-emerald: #059669;
    --accent-crimson: #dc2626;
    --accent-glow: rgba(37, 99, 235, 0.18);
  }

  * {
    box-sizing: border-box;
    transition: background-color 0.25s cubic-bezier(0.16, 1, 0.3, 1),
                border-color 0.25s cubic-bezier(0.16, 1, 0.3, 1),
                color 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  }

  html, body {
    margin: 0;
    padding: 0;
    font-family: 'Lato', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: var(--bg-page-gradient);
    background-color: var(--bg-primary);
    background-attachment: fixed;
    color: var(--text-primary);
    min-height: 100vh;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    letter-spacing: -0.01em;
    overflow-x: hidden;
  }

  /* 💎 LUXURY GLASSMORPHISM */
  .glass-card {
    background: var(--bg-card);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid var(--border-color);
    box-shadow: var(--card-shadow);
  }

  .glass-card:hover {
    box-shadow: var(--card-shadow-hover);
  }

  .glass-panel {
    background: var(--bg-card-subtle);
    backdrop-filter: blur(12px);
    border: 1px solid var(--border-color);
  }

  /* 💫 LUXURY KEYFRAME ANIMATIONS */
  @keyframes pulse-ring {
    0% { transform: scale(0.95); opacity: 0.8; }
    50% { transform: scale(1.15); opacity: 0.2; }
    100% { transform: scale(0.95); opacity: 0.8; }
  }

  @keyframes pulse-dot {
    0% { transform: scale(0.9); opacity: 1; }
    50% { transform: scale(1.1); opacity: 0.7; }
    100% { transform: scale(0.9); opacity: 1; }
  }

  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }

  @keyframes float-subtle {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-4px); }
    100% { transform: translateY(0px); }
  }

  .animate-float {
    animation: float-subtle 4s ease-in-out infinite;
  }

  .pulse-active {
    position: relative;
  }

  .pulse-active::after {
    content: '';
    position: absolute;
    inset: -3px;
    border-radius: inherit;
    border: 2px solid currentColor;
    animation: pulse-ring 2.5s infinite;
    pointer-events: none;
  }

  ::selection {
    background: #2563eb;
    color: #ffffff;
  }

  /* Smooth Custom Modern Scrollbars */
  ::-webkit-scrollbar {
    width: 7px;
    height: 7px;
  }
  ::-webkit-scrollbar-track {
    background: transparent;
  }
  ::-webkit-scrollbar-thumb {
    background: rgba(148, 163, 184, 0.28);
    border-radius: 9999px;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: rgba(56, 189, 248, 0.5);
  }

  /* Leaflet Map Modern Overrides */
  .leaflet-popup-content-wrapper {
    background: var(--bg-card-solid, #0f172a) !important;
    color: var(--text-primary, #fff) !important;
    border: 1px solid var(--border-color, rgba(255, 255, 255, 0.15)) !important;
    border-radius: 14px !important;
    box-shadow: 0 16px 32px rgba(0, 0, 0, 0.45) !important;
    backdrop-filter: blur(12px) !important;
  }
  .leaflet-popup-tip {
    background: var(--bg-card-solid, #0f172a) !important;
  }
  .leaflet-container {
    font-family: inherit !important;
  }
`;

export default GlobalStyle;
