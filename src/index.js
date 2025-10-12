import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root')); // Cria a raiz do aplicativo React
root.render( // Renderiza o componente App dentro do modo estrito do React
  <React.StrictMode> // Modo estrito do React para destacar problemas potenciais
    <App /> // Componente principal do aplicativo
  </React.StrictMode> // Fechamento do modo estrito
);