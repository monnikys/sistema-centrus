import React, { useState } from 'react'
import { Paperclip } from 'lucide-react'
import AnexosViagem from './components/AnexosViagem'

function ListaViagens() {
  const [viagemSelecionada, setViagemSelecionada] = useState(null)
  const [mostrarAnexos, setMostrarAnexos] = useState(false)

  // Função para abrir modal de anexos
  const abrirAnexos = (viagem) => {
    setViagemSelecionada(viagem)
    setMostrarAnexos(true)
  }

  // Função para fechar modal
  const fecharAnexos = () => {
    setMostrarAnexos(false)
    setViagemSelecionada(null)
  }

  return (
    <div>
      {/* Lista de viagens */}
      {viagens.map((viagem) => (
        <div key={viagem.id} className="viagem-card">
          <div className="viagem-info">
            <h3>{viagem.origem} → {viagem.destino}</h3>
            <p>Viajante: {viagem.viajante}</p>
            <p>Status: {viagem.status}</p>
          </div>

          {/* Botão de Anexos - só aparece se viagem for aprovada */}
          {viagem.status === 'aprovada' && (
            <button
              onClick={() => abrirAnexos(viagem)}
              className="btn-anexos"
              title="Gerenciar Anexos"
            >
              <Paperclip size={18} />
              <span>Anexos</span>
            </button>
          )}
        </div>
      ))}

      {/* Modal de Anexos */}
      {mostrarAnexos && viagemSelecionada && (
        <AnexosViagem
          viagem={viagemSelecionada}
          onFechar={fecharAnexos}
        />
      )}
    </div>
  )
}

export default ListaViagens