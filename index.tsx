
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// index.tsx 仅作为入口，所有业务逻辑已迁移至 App.tsx 及 components 目录
const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
