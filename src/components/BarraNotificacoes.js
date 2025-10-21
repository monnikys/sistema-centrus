// components/BarraNotificacoes.js
// Barra simples no topo apenas com o botão de notificações
import React from 'react'
import Notificacoes from './Notificacoes'

function BarraNotificacoes() {
  return (
    <div className="barra-notificacoes-topo">
      <div className="barra-notificacoes-content">
        {/* Espaço vazio à esquerda */}
        <div></div>
        
        {/* Notificações à direita */}
        <Notificacoes />
      </div>
    </div>
  )
}

export default BarraNotificacoes