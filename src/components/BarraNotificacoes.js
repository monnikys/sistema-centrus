import React from 'react'
import Notificacoes from './Notificacoes'

function BarraNotificacoes() { // Componente BarraNotificacoes
  return (
    <div className="barra-notificacoes-topo"> {/* Barra fixa no topo */}
      <div className="barra-notificacoes-content"> {/* Contéudo da barra */}
        {/* Espaço vazio à esquerda */}
        <div></div>
        
        {/* Notificações à direita */}
        <Notificacoes /> {/* Componente de notificações */}
      </div>
    </div>
  )
}

export default BarraNotificacoes;