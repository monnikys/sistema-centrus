import React, { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, STATUS_VIAGEM, AEROPORTOS, notificacaoService } from '../db'
import InfoAuditoria from './InfoAuditoria'
import {
  ArrowLeft,
  PlaneTakeoff,
  Plus,
  Trash2,
  MapPin,
  Calendar,
  Clock,
  FileText,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  X,
} from 'lucide-react'
import Box from '@mui/material/Box'
import Slider from '@mui/material/Slider'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'
import 'dayjs/locale/pt-br'

dayjs.locale('pt-br')

function SolicitacaoViagem({ onVoltar, usuarioAtual }) { // Função para voltar para a tela de solicitações de viagem
  const [mostrarFormulario, setMostrarFormulario] = useState(false) // Estado para indicar se o formulário de solicitação de viagem deve ser mostrado
  const [viajanteId, setViajanteId] = useState('') // Estado para armazenar o ID do viajante
  const [origem, setOrigem] = useState('')  // Estado para armazenar a origem
  const [destino, setDestino] = useState('')  // Estado para armazenar o destino
  const [dataIda, setDataIda] = useState(null)  // Estado para armazenar a data de ida
  const [faixaHorarioIda, setFaixaHorarioIda] = useState([480, 720])  // Estado para armazenar a faixa horária de ida
  const [dataVolta, setDataVolta] = useState(null)  // Estado para armazenar a data de volta
  const [faixaHorarioVolta, setFaixaHorarioVolta] = useState([1080, 1200])  // Estado para armazenar a faixa horária de volta
  const [justificativa, setJustificativa] = useState('')  // Estado para armazenar a justificativa
  const [observacao, setObservacao] = useState('')  // Estado para armazenar a observação
  const [filtroStatus, setFiltroStatus] = useState('todos')  // Estado para armazenar o filtro de status

  const [mostrarModalRecusa, setMostrarModalRecusa] = useState(false)  // Estado para indicar se o modal de recusa deve ser mostrado
  const [solicitacaoParaRecusar, setSolicitacaoParaRecusar] = useState(null)  // Estado para armazenar a solicitação a ser recusada
  const [motivoRecusa, setMotivoRecusa] = useState('')  // Estado para armazenar o motivo da recusa

  const minDistance = 60  // Distância mínima entre os pontos do slider

  const funcionarios = useLiveQuery(() => db.funcionarios.toArray(), [])  // Consulta todos os funcionários
  const todasSolicitacoes = useLiveQuery( // Consulta todas as solicitações de viagem
    () => db.solicitacoesViagem.toArray(),
    []
  )

  const solicitacoesFiltradas = // Filtra as solicitações de viagem pelo status
    todasSolicitacoes
      ?.filter((sol) => { // Filtra as solicitações de viagem
        if (filtroStatus === 'todos') return true // Mostra todas as solicitações
        return sol.status === filtroStatus  // Mostra apenas as solicitações com o status selecionado
      })
      .sort(
        (a, b) => new Date(b.dataSolicitacao) - new Date(a.dataSolicitacao) // Ordena as solicitações por data de solicitação
      ) || []

  const limparFormulario = () => { // Limpa o formulário de solicitação de viagem
    setViajanteId('') 
    setOrigem('')
    setDestino('')
    setDataIda(null)
    setFaixaHorarioIda([480, 720])
    setDataVolta(null)
    setFaixaHorarioVolta([1080, 1200])
    setJustificativa('')
    setObservacao('')
  }

  const minutosParaHorario = (minutos) => { // Converte minutos em horário
    const horas = Math.floor(minutos / 60)  // Horas
    const mins = minutos % 60 // Minutos
    return `${String(horas).padStart(2, '0')}:${String(mins).padStart(2, '0')}` // Retorna a string formatada
  }

  const handleChangeHorarioIda = (event, newValue, activeThumb) => {  // Função para alterar a faixa horária de ida
    if (!Array.isArray(newValue)) return // Verifica se newValue é um array

    if (activeThumb === 0) { // Verifica se o thumb ativo é o primeiro
      setFaixaHorarioIda([ // Define a faixa horária de ida
        Math.min(newValue[0], faixaHorarioIda[1] - minDistance), // Define o primeiro ponto da faixa horária de ida
        faixaHorarioIda[1],
      ])
    } else { // Verifica se o thumb ativo é o segundo
      setFaixaHorarioIda([ // Define a faixa horária de ida
        faixaHorarioIda[0],
        Math.max(newValue[1], faixaHorarioIda[0] + minDistance), // Define o segundo ponto da faixa horária de ida
      ])
    }
  }

  const handleChangeHorarioVolta = (event, newValue, activeThumb) => { // Função para alterar a faixa horária de volta
    if (!Array.isArray(newValue)) return // Verifica se newValue é um array

    if (activeThumb === 0) { // Verifica se o thumb ativo é o primeiro
      setFaixaHorarioVolta([  // Define a faixa horária de volta
        Math.min(newValue[0], faixaHorarioVolta[1] - minDistance), // Define o primeiro ponto da faixa horária de volta
        faixaHorarioVolta[1],
      ])
    } else {  // Verifica se o thumb ativo é o segundo
      setFaixaHorarioVolta([  // Define a faixa horária de volta
        faixaHorarioVolta[0],
        Math.max(newValue[1], faixaHorarioVolta[0] + minDistance),  // Define o segundo ponto da faixa horária de volta
      ])
    }
  }

  const handleSubmit = async (e) => { // Função para criar uma nova solicitação de viagem
    e.preventDefault()
    try {
      console.log('🔍 Usuário Atual ao criar:', usuarioAtual) // DEBUG

      // Criar a solicitação de viagem COM USUÁRIO RESPONSÁVEL
      const viagemId = await db.solicitacoesViagem.add({
        solicitanteId: 1,
        viajanteId: parseInt(viajanteId),
        origem,
        destino,
        dataIda: dataIda.format('YYYY-MM-DD'),
        horarioIdaInicio: minutosParaHorario(faixaHorarioIda[0]),
        horarioIdaFim: minutosParaHorario(faixaHorarioIda[1]),
        dataVolta: dataVolta.format('YYYY-MM-DD'),
        horarioVoltaInicio: minutosParaHorario(faixaHorarioVolta[0]),
        horarioVoltaFim: minutosParaHorario(faixaHorarioVolta[1]),
        justificativa,
        observacao,
        status: 'PENDENTE',
        dataSolicitacao: new Date().toISOString(),
        criadoPorId: usuarioAtual?.id || null,
        criadoPorNome: usuarioAtual?.nome || null,
      })

      console.log('✅ Viagem criada com ID:', viagemId)

      // 🎉 CRIAR NOTIFICAÇÃO AUTOMÁTICA
      const viajante = funcionarios?.find(f => f.id === parseInt(viajanteId)) // Encontra o viajante pelo ID
      if (viajante) { // Verifica se o viajante foi encontrado
        await notificacaoService.notificarNovaViagem( // Cria a notificação de nova solicitação de viagem
          viagemId,
          viajante.nome,
          destino,
          { id: usuarioAtual?.id, nome: usuarioAtual?.nome } // Usuário que criou a solicitação
        )
        console.log('✅ Notificação criada')
      }

      alert('Solicitação de viagem criada com sucesso!')
      limparFormulario()
      setMostrarFormulario(false)
    } catch (error) {
      console.error('❌ Erro ao criar solicitação:', error)
      alert('Erro ao criar solicitação: ' + error.message)
    }
  }

  const handleExcluir = async (id) => { // Função para excluir uma solicitação de viagem
    if (!usuarioAtual?.podeExcluirViagens) { // Verifica se o usuário atual tem permissão para excluir
      alert('Você não tem permissão para excluir solicitações de viagem!')
      return
    }
    if (window.confirm('Deseja excluir esta solicitação de viagem?')) { // Confirmação
      try { // Tenta excluir
        await db.solicitacoesViagem.delete(id)
        alert('Solicitação excluída com sucesso!')
      } catch (error) {
        alert('Erro ao excluir solicitação: ' + error.message)
      }
    }
  }

  const handleAlterarStatus = async (id, novoStatus) => { // Função para alterar o status de uma solicitação de viagem
    if (!usuarioAtual?.podeAprovarViagens) { // Verifica se o usuário atual tem permissão para aprovar
      alert(
        'Você não tem permissão para aprovar/recusar solicitações de viagem!'
      )
      return
    }
    if (novoStatus === 'RECUSADA') { // Verifica se o novo status é RECUSADA
      setSolicitacaoParaRecusar(id)
      setMostrarModalRecusa(true)
      return
    }

    try {
      console.log('🔍 Usuário Atual ao aprovar:', usuarioAtual) 

      // 👤 AUDITORIA: Salvar quem aprovou
      const updateData = { status: novoStatus } // Define o novo status
      
      if (novoStatus === 'APROVADA') { // Verifica se o novo status é APROVADA
        updateData.aprovadoPorId = usuarioAtual?.id || null // Define quem aprovou
        updateData.aprovadoPorNome = usuarioAtual?.nome || null 
        updateData.dataAprovacao = new Date().toISOString() // Define a data de aprovação
      }
      
      await db.solicitacoesViagem.update(id, updateData) // Atualiza o status
      console.log('✅ Status atualizado:', updateData)

      // 🎉 CRIAR NOTIFICAÇÃO DE APROVAÇÃO
      if (novoStatus === 'APROVADA') { // Verifica se o novo status é APROVADA
        const viagem = await db.solicitacoesViagem.get(id)  // Busca a solicitação
        const viajante = funcionarios?.find(f => f.id === viagem.viajanteId)  // Busca o viajante
        if (viajante) { // Verifica se o viajante foi encontrado
          await notificacaoService.notificarViagemAprovada( // Cria a notificação
            id,
            viajante.nome,
            viagem.destino,
            { id: usuarioAtual?.id, nome: usuarioAtual?.nome }
          )
          console.log('✅ Notificação de aprovação criada') 
        }
      }

      alert('Status atualizado com sucesso!')
    } catch (error) {
      console.error('❌ Erro ao atualizar status:', error)
      alert('Erro ao atualizar status: ' + error.message)
    }
  }

  const handleConfirmarRecusa = async () => { // Função para confirmar a recusa de uma solicitação de viagem
    if (!motivoRecusa.trim()) { // Verifica se o motivo da recusa foi informado
      alert('Por favor, informe o motivo da recusa.')
      return
    }

    try { 
      console.log('🔍 Usuário Atual ao recusar:', usuarioAtual)

      // 👤 AUDITORIA: Salvar quem recusou
      await db.solicitacoesViagem.update(solicitacaoParaRecusar, { // Atualiza o status
        status: 'RECUSADA',
        motivoRecusa: motivoRecusa,
        recusadoPorId: usuarioAtual?.id || null,
        recusadoPorNome: usuarioAtual?.nome || null,
        dataRecusa: new Date().toISOString(),
      })

      console.log('✅ Viagem recusada')

      // 🎉 CRIAR NOTIFICAÇÃO DE RECUSA
      const viagem = await db.solicitacoesViagem.get(solicitacaoParaRecusar) // Busca a solicitação
      const viajante = funcionarios?.find(f => f.id === viagem.viajanteId) // Busca o viajante
      if (viajante) { // Verifica se o viajante foi encontrado
        await notificacaoService.notificarViagemRecusada( // Cria a notificação
          solicitacaoParaRecusar,
          viajante.nome,
          viagem.destino,
          motivoRecusa,
          { id: usuarioAtual?.id, nome: usuarioAtual?.nome }
        )
        console.log('✅ Notificação de recusa criada')
      }

      alert('Solicitação recusada com sucesso!')
      setMostrarModalRecusa(false)
      setSolicitacaoParaRecusar(null)
      setMotivoRecusa('')
    } catch (error) {
      console.error('❌ Erro ao recusar solicitação:', error)
      alert('Erro ao recusar solicitação: ' + error.message)
    }
  }

  const handleFecharModalRecusa = () => { // Função para fechar o modal de recusa
    setMostrarModalRecusa(false)
    setSolicitacaoParaRecusar(null)
    setMotivoRecusa('')
  }

  const getNomeFuncionario = (id) => {  // Retorna nome do funcionário
    const func = funcionarios?.find((f) => f.id === id) // Encontra
    return func ? func.nome : 'N/A' // Retorna
  }

  const getDepartamentoFuncionario = (id) => {  // Retorna departamento do funcionário
    const func = funcionarios?.find((f) => f.id === id) // Encontra
    return func ? func.departamento : 'N/A' // Retorna
  }

  const formatarData = (dataString) => {  // Formata data em pt-BR
    return new Date(dataString + 'T00:00:00').toLocaleDateString('pt-BR')  // Converte para pt-BR
  }

  const formatarDataHora = (dataISO) => {  // Formata data em pt-BR
    return new Date(dataISO).toLocaleDateString('pt-BR', {  // Converte para pt-BR
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatarHorario = (horario) => {  // Formata horário
    if (!horario) return 'N/A'  // Retorna N/A
    return horario
  }

  const getStatusIcon = (status) => {   // Retorna Ícone conforme status
    switch (status) {
      case 'APROVADA':
        return <CheckCircle size={20} />
      case 'RECUSADA':
        return <XCircle size={20} />
      default:
        return <AlertCircle size={20} />
    }
  }

  const getStatusClass = (status) => {   // Retorna classe conforme status
    switch (status) {
      case 'APROVADA':
        return 'status-aprovada'
      case 'RECUSADA':
        return 'status-recusada'
      default:
        return 'status-pendente'
    }
  }

  // DEBUG: Ver o usuário atual
  console.log('🔍 DEBUG - Usuário Atual Recebido:', usuarioAtual)

  return (
    <div className="solicitacao-viagem-container"> {/* Container principal */}
      <div className="documentos-header"> {/* Header */}
        <button onClick={onVoltar} className="btn-voltar"> {/* Botão de voltar */}
          <ArrowLeft size={20} />
          Voltar
        </button>
        <div>
          <h2>Solicitação de Viagem</h2>
          <p className="subtitulo"> {/* Subtítulo */}
            Gerencie as solicitações de viagem dos funcionários
          </p>
        </div>
      </div>

      {/* Modal de Recusa */}
      {mostrarModalRecusa && (
        <div className="modal-overlay" onClick={handleFecharModalRecusa}> {/* Overlay */}
          <div className="modal-content" onClick={(e) => e.stopPropagation()}> {/* Contéudo do modal */}
            <div className="modal-header">  {/* Cabecalho do modal */}
              <h3>Motivo da Recusa</h3>
              <button
                onClick={handleFecharModalRecusa}
                className="btn-fechar-modal" // Botão de fechar
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body"> {/* Corpo do modal */}
              <div className="form-group"> {/* Campo de motivo de recusa */}
                <label>
                  <FileText size={18} />
                  Por que esta solicitação está sendo recusada? *
                </label>
                <textarea
                  value={motivoRecusa}
                  onChange={(e) => setMotivoRecusa(e.target.value)}
                  placeholder="Ex: Orçamento insuficiente, viagem não justificada, data incompatível..."
                  rows="4"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ced4da',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                  }}
                />
              </div>
            </div>

            <div className="modal-footer"> {/* Rodapé do modal */}
              <button
                onClick={handleFecharModalRecusa}
                className="btn-cancelar" // Botão de cancelar
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmarRecusa}
                className="btn-confirmar" // Botão de confirmar
                style={{ background: '#dc3545' }}
              >
                <XCircle size={18} />
                Confirmar Recusa
              </button>
            </div>
          </div>
        </div>
      )}

      {!mostrarFormulario ? (
        <>
          <div className="acoes-viagem-header"> {/* Header de ações */}
            {usuarioAtual?.podeCriarViagens && (
              <button
                onClick={() => setMostrarFormulario(true)}
                className="btn-nova-solicitacao" // Botão de nova solicitação
              >
                <Plus size={20} />
                Nova Solicitação
              </button>
            )}
            <div className="filtro-status-viagem"> {/* Filtro de status */}
              <label>Filtrar por Status:</label>
              <select
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
                className="select-filtro" // Estilos do select
              >
                <option value="todos">Todos</option>
                <option value="PENDENTE">Pendentes</option>
                <option value="APROVADA">Aprovadas</option>
                <option value="RECUSADA">Recusadas</option>
              </select>
            </div>
          </div>

          <div className="lista-solicitacoes"> {/* Lista de solicitações */}
            {solicitacoesFiltradas.length === 0 ? (
              <div className="sem-documentos"> {/* Sem solicitações */}
                <PlaneTakeoff size={48} />
                <p>
                  {filtroStatus === 'todos'
                    ? 'Nenhuma solicitação de viagem cadastrada'
                    : `Nenhuma solicitação ${STATUS_VIAGEM[
                        filtroStatus
                      ].toLowerCase()}`}
                </p>
              </div>
            ) : (
              <div className="solicitacoes-grid"> {/* Grid de solicitações */}
                {solicitacoesFiltradas.map((sol) => (
                  <div
                    key={sol.id}
                    className={`card-solicitacao ${getStatusClass( // Classe conforme status
                      sol.status
                    )}`}
                  >
                    <div className="card-header-solicitacao"> {/* Cabecalho do card de solicitação */}
                      <div className="viajante-info">
                        <User size={20} />
                        <div>
                          <h4>{getNomeFuncionario(sol.viajanteId)}</h4>
                          <p>
                            {getDepartamentoFuncionario(sol.viajanteId)}
                          </p>
                        </div>
                      </div>
                      <div
                        className={`badge-status ${getStatusClass( // Classe conforme status
                          sol.status
                        )}`}
                      >
                        {getStatusIcon(sol.status)}
                        {STATUS_VIAGEM[sol.status]}
                      </div>
                    </div>
                    <div className="rota-viagem"> {/* Rota da solicitação */}
                      <div className="local-viagem"> {/* Local de partida */}
                        <MapPin size={16} />
                        <div>
                          <span className="label-local">Origem</span> {/* Label "Origem" */}
                          <span className="nome-local"> {/* Nome do local de partida */}
                            {sol.origem}
                          </span>
                        </div>
                      </div>
                      <div className="seta-rota">→</div> {/* Seta de rota */}
                      <div className="local-viagem"> {/* Local de chegada */}
                        <MapPin size={16} />
                        <div>
                          <span className="label-local">Destino</span> {/* Label "Destino" */}
                          <span className="nome-local"> {/* Nome do local de chegada */}
                            {sol.destino}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="datas-viagem">  {/* Datas da solicitação */}
                      <div className="data-info"> {/* Data de ida e volta */}
                        <Calendar size={16} />
                        <div>
                          <span className="label-data">Ida</span> {/* Label "Ida" */}
                          <span className="valor-data"> {/* Valor da data de ida */}
                            {formatarData(sol.dataIda)}
                          </span>
                          <span className="horario-badge"> {/* Horário de ida e volta */}
                            {formatarHorario(sol.horarioIdaInicio)} -{' '}
                            {formatarHorario(sol.horarioIdaFim)}
                          </span>
                        </div>
                      </div>
                      <div className="data-info"> {/* Data de volta */}
                        <Calendar size={16} />
                        <div>
                          <span className="label-data">Volta</span> {/* Label "Volta" */}
                          <span className="valor-data"> {/* Valor da data de volta */}
                            {formatarData(sol.dataVolta)}
                          </span>
                          <span className="horario-badge"> {/* Horário de ida e volta */}
                            {formatarHorario(sol.horarioVoltaInicio)} -{' '}
                            {formatarHorario(sol.horarioVoltaFim)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="justificativa-box"> {/* Justificação da solicitação */}
                      <FileText size={16} />
                      <div>
                        <strong>Justificativa:</strong>
                        <p>{sol.justificativa}</p>
                      </div>
                    </div>
                    {sol.observacao && (
                      <div className="observacao-box"> {/* Observação da solicitação */}
                        <strong>Observação:</strong>
                        <p>{sol.observacao}</p>
                      </div>
                    )}
                    {sol.status === 'RECUSADA' && sol.motivoRecusa && (
                      <div className="motivo-recusa-box"> {/* Motivo de recusa da solicitação */}
                        <XCircle size={16} />
                        <div>
                          <strong>Motivo da Recusa:</strong>
                          <p>{sol.motivoRecusa}</p>
                        </div>
                      </div>
                    )}
                    
                    {/* 👤 COMPONENTE DE AUDITORIA - VERSÃO COMPLETA */}
                    <InfoAuditoria
                      criadoPorNome={sol.criadoPorNome}
                      dataCriacao={sol.dataSolicitacao}
                      aprovadoPorNome={sol.aprovadoPorNome}
                      dataAprovacao={sol.dataAprovacao}
                      recusadoPorNome={sol.recusadoPorNome}
                      dataRecusa={sol.dataRecusa}
                      compacto={false}
                    />
                    
                    <div className="card-footer-solicitacao"> {/* Rodapé da solicitação */}
                      <span className="data-solicitacao"> {/* Data de solicitação */}
                        Solicitado em: {formatarDataHora(
                          sol.dataSolicitacao
                        )}
                      </span>
                      <div className="acoes-solicitacao">
                        {usuarioAtual?.podeAprovarViagens &&
                          sol.status === 'PENDENTE' && (
                            <>
                              <button
                                onClick={() =>
                                  handleAlterarStatus(sol.id, 'APROVADA')
                                }
                                className="btn-acao-status btn-aprovar" // Botão de aprovação
                                title="Aprovar"
                              >
                                <CheckCircle size={16} />
                              </button>
                              <button
                                onClick={() =>
                                  handleAlterarStatus(sol.id, 'RECUSADA')
                                }
                                className="btn-acao-status btn-recusar" // Botão de recusa
                                title="Recusar"
                              >
                                <XCircle size={16} />
                              </button>
                            </>
                          )}
                        {usuarioAtual?.podeExcluirViagens && (
                          <button
                            onClick={() => handleExcluir(sol.id)}
                            className="btn-acao-status btn-excluir-sol" // Botão de exclusão
                            title="Excluir"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="formulario-viagem"> {/* Formulário de solicitação de viagem */}
          <div className="form-header"> {/* Cabecalho do formulário */}
            <h3>Nova Solicitação de Viagem</h3>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-group"> {/* Campo para selecionar o funcionário viajante */}
              <label>
                <User size={18} />
                Viajante *
              </label>
              <select
                value={viajanteId}
                onChange={(e) => setViajanteId(e.target.value)}
                className="select-filtro" // Estilo do select
                required
              >
                <option value="">Selecione o funcionário viajante</option>
                {funcionarios?.map((func) => (
                  <option key={func.id} value={func.id}>
                    {func.nome} - {func.departamento}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-row"> {/* Linha de campos */}
              <div className="form-group"> {/* Campo para selecionar a origem */}
                <label>
                  <MapPin size={18} />
                  Origem *
                </label>
                <select
                  value={origem}
                  onChange={(e) => setOrigem(e.target.value)}
                  required
                >
                  <option value="">Selecione um aeroporto</option>
                  {AEROPORTOS.map((aeroporto, index) => (
                    <option key={index} value={aeroporto.iata}>
                      {aeroporto.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group"> {/* Campo para selecionar o destino */}
                <label>
                  <MapPin size={18} />
                  Destino *
                </label>
                <select
                  value={destino}
                  onChange={(e) => setDestino(e.target.value)}
                  required
                >
                  <option value="">Selecione um aeroporto</option>
                  {AEROPORTOS.map((aeroporto, index) => (
                    <option key={index} value={aeroporto.iata}>
                      {aeroporto.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row"> {/* Linha de campos */}
              <div className="form-group"> {/* Campo para selecionar a data de ida */}
                <label>
                  <Calendar size={18} />
                  Data de Ida *
                </label>
                <LocalizationProvider
                  dateAdapter={AdapterDayjs}
                  adapterLocale="pt-br"
                >
                  <DatePicker
                    value={dataIda}
                    onChange={(newValue) => setDataIda(newValue)}
                    format="DD/MM/YYYY"
                    slotProps={{
                      textField: {
                        required: true,
                        fullWidth: true,
                        sx: {
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '6px',
                            '& fieldset': {
                              borderColor: '#ced4da',
                            },
                            '&:hover fieldset': {
                              borderColor: '#667eea',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#667eea',
                            },
                          },
                        },
                      },
                    }}
                  />
                </LocalizationProvider>
              </div>
              <div className="form-group"> {/* Campo para selecionar o horário de ida */}
                <label>
                  <Clock size={18} />
                  Horário de Ida *
                </label>
                <div
                  style={{
                    padding: '25px 20px',
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                    border: '1px solid #ced4da',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '25px',
                    }}
                  >
                    <div style={{ textAlign: 'center', flex: 1 }}>
                      <div
                        style={{
                          fontSize: '0.7rem',
                          color: '#6c757d',
                          marginBottom: '5px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                        }}
                      >
                        Início
                      </div>
                      <div
                        style={{
                          fontSize: '1.5rem',
                          fontWeight: 'bold',
                          color: '#667eea',
                        }}
                      >
                        {minutosParaHorario(faixaHorarioIda[0])}
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: '1.2rem',
                        color: '#adb5bd',
                        padding: '0 20px',
                      }}
                    >
                      →
                    </div>
                    <div style={{ textAlign: 'center', flex: 1 }}>
                      <div
                        style={{
                          fontSize: '0.7rem',
                          color: '#6c757d',
                          marginBottom: '5px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                        }}
                      >
                        Fim
                      </div>
                      <div
                        style={{
                          fontSize: '1.5rem',
                          fontWeight: 'bold',
                          color: '#667eea',
                        }}
                      >
                        {minutosParaHorario(faixaHorarioIda[1])}
                      </div>
                    </div>
                  </div>
                  <Box sx={{ px: 1 }}>
                    <Slider
                      getAriaLabel={() => 'Faixa de horário de ida'}
                      value={faixaHorarioIda}
                      onChange={handleChangeHorarioIda}
                      valueLabelDisplay="auto"
                      valueLabelFormat={(value) => minutosParaHorario(value)}
                      getAriaValueText={(value) => minutosParaHorario(value)}
                      min={0}
                      max={1440}
                      step={15}
                      disableSwap
                      marks={[
                        { value: 0, label: '00:00' },
                        { value: 360, label: '06:00' },
                        { value: 720, label: '12:00' },
                        { value: 1080, label: '18:00' },
                        { value: 1440, label: '23:59' },
                      ]}
                      sx={{
                        color: '#667eea',
                        '& .MuiSlider-thumb': {
                          width: 18,
                          height: 18,
                          backgroundColor: '#fff',
                          border: '2px solid currentColor',
                          '&:hover, &.Mui-focusVisible': {
                            boxShadow: '0 0 0 8px rgba(102, 126, 234, 0.16)',
                          },
                        },
                        '& .MuiSlider-track': {
                          height: 4,
                        },
                        '& .MuiSlider-rail': {
                          height: 4,
                          opacity: 0.2,
                          backgroundColor: '#dee2e6',
                        },
                        '& .MuiSlider-markLabel': {
                          fontSize: '0.7rem',
                          color: '#adb5bd',
                        },
                      }}
                    />
                  </Box>
                  <div
                    style={{
                      marginTop: '15px',
                      fontSize: '0.75rem',
                      color: '#adb5bd',
                      textAlign: 'center',
                    }}
                  >
                    Distância mínima: 2 horas
                  </div>
                </div>
              </div>
            </div>

            <div className="form-row">  {/* Campo para selecionar a data de volta e o horário de volta */}
              <div className="form-group">  {/* Campo para selecionar a data de volta */}
                <label>
                  <Calendar size={18} />
                  Data de Volta *
                </label>
                <LocalizationProvider
                  dateAdapter={AdapterDayjs}
                  adapterLocale="pt-br"
                >
                  <DatePicker
                    value={dataVolta}
                    onChange={(newValue) => setDataVolta(newValue)}
                    format="DD/MM/YYYY"
                    minDate={dataIda}
                    disabled={!dataIda}
                    slotProps={{
                      textField: {
                        required: true,
                        fullWidth: true,
                        sx: {
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '6px',
                            '& fieldset': {
                              borderColor: '#ced4da',
                            },
                            '&:hover fieldset': {
                              borderColor: '#667eea',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#667eea',
                            },
                          },
                        },
                      },
                    }}
                  />
                </LocalizationProvider>
              </div>
              <div className="form-group">  {/* Campo para selecionar o horário de volta */}
                <label>
                  <Clock size={18} />
                  Horário de Volta *
                </label>
                <div
                  style={{
                    padding: '25px 20px',
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                    border: '1px solid #ced4da',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '25px',
                    }}
                  >
                    <div style={{ textAlign: 'center', flex: 1 }}>
                      <div
                        style={{
                          fontSize: '0.7rem',
                          color: '#6c757d',
                          marginBottom: '5px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                        }}
                      >
                        Início
                      </div>
                      <div
                        style={{
                          fontSize: '1.5rem',
                          fontWeight: 'bold',
                          color: '#667eea',
                        }}
                      >
                        {minutosParaHorario(faixaHorarioVolta[0])}
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: '1.2rem',
                        color: '#adb5bd',
                        padding: '0 20px',
                      }}
                    >
                      →
                    </div>
                    <div style={{ textAlign: 'center', flex: 1 }}>
                      <div
                        style={{
                          fontSize: '0.7rem',
                          color: '#6c757d',
                          marginBottom: '5px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                        }}
                      >
                        Fim
                      </div>
                      <div
                        style={{
                          fontSize: '1.5rem',
                          fontWeight: 'bold',
                          color: '#667eea',
                        }}
                      >
                        {minutosParaHorario(faixaHorarioVolta[1])}
                      </div>
                    </div>
                  </div>
                  <Box sx={{ px: 1 }}>
                    <Slider
                      getAriaLabel={() => 'Faixa de horário de volta'}
                      value={faixaHorarioVolta}
                      onChange={handleChangeHorarioVolta}
                      valueLabelDisplay="auto"
                      valueLabelFormat={(value) => minutosParaHorario(value)}
                      getAriaValueText={(value) => minutosParaHorario(value)}
                      min={0}
                      max={1440}
                      step={15}
                      disableSwap
                      marks={[
                        { value: 0, label: '00:00' },
                        { value: 360, label: '06:00' },
                        { value: 720, label: '12:00' },
                        { value: 1080, label: '18:00' },
                        { value: 1440, label: '24:00' },
                      ]}
                      sx={{
                        color: '#667eea',
                        '& .MuiSlider-thumb': {
                          width: 18,
                          height: 18,
                          backgroundColor: '#fff',
                          border: '2px solid currentColor',
                          '&:hover, &.Mui-focusVisible': {
                            boxShadow: '0 0 0 8px rgba(102, 126, 234, 0.16)',
                          },
                        },
                        '& .MuiSlider-track': {
                          height: 4,
                        },
                        '& .MuiSlider-rail': {
                          height: 4,
                          opacity: 0.2,
                          backgroundColor: '#dee2e6',
                        },
                        '& .MuiSlider-markLabel': {
                          fontSize: '0.7rem',
                          color: '#adb5bd',
                        },
                      }}
                    />
                  </Box>
                  <div
                    style={{
                      marginTop: '15px',
                      fontSize: '0.75rem',
                      color: '#adb5bd',
                      textAlign: 'center',
                    }}
                  >
                    Distância mínima: 2 horas
                  </div>
                </div>
              </div>
            </div>

            <div className="form-group">  {/* Campo para selecionar o motivo da viagem */}
              <label>
                <FileText size={18} />
                Justificativa *
              </label>
              <textarea
                value={justificativa}
                onChange={(e) => setJustificativa(e.target.value)}
                placeholder="Descreva o motivo da viagem..."
                rows="4"
                required
              />
            </div>

            <div className="form-group">  {/* Campo para adicionar uma observação */}
              <label>
                <FileText size={18} />
                Observação (opcional)
              </label>
              <textarea
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
                placeholder="Ex: Assento, companhia aérea, número do voo ou outras informações relevantes."
                rows="3"
              />
            </div>

            <div className="form-actions">  {/* Botoes de confirmar e cancelar */}
              <button
                type="button"
                onClick={() => {
                  setMostrarFormulario(false)
                  limparFormulario()
                }}
                className="btn-cancelar"
              >
                Cancelar
              </button>
              <button type="submit" className="btn-confirmar"> {/* Botão para criar a solicitação de viagem */}
                <PlaneTakeoff size={18} />
                Criar Solicitação
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

export default SolicitacaoViagem;