const reportWebVitals = onPerfEntry => {  // Função para reportar métricas de performance
  if (onPerfEntry && onPerfEntry instanceof Function) { // Verifica se onPerfEntry é uma função
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => { // Importa as funções de web-vitals
      getCLS(onPerfEntry); // Coleta e reporta a métrica CLS // CLS: Cumulative Layout Shift // O que é CLS? // Métrica que mede a estabilidade visual de uma página
      getFID(onPerfEntry);  // Coleta e reporta a métrica FID // FID: First Input Delay // O que é FID? // Métrica que mede a interatividade de uma página
      getFCP(onPerfEntry);  // Coleta e reporta a métrica FCP // FCP: First Contentful Paint // O que é FCP? // Métrica que mede o tempo até o primeiro conteúdo ser renderizado
      getLCP(onPerfEntry);  // Coleta e reporta a métrica LCP // LCP: Largest Contentful Paint // O que é LCP? // Métrica que mede o tempo até o maior conteúdo ser renderizado
      getTTFB(onPerfEntry); // Coleta e reporta a métrica TTFB  // TTFB: Time to First Byte // O que é TTFB? // Métrica que mede o tempo até o primeiro byte ser recebido
    });
  }
};

export default reportWebVitals; // Exporta a função para uso em outros arquivos