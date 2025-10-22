import React, { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, STATUS_VIAGEM, AEROPORTOS, notificacaoService } from '../db'
import InfoAuditoria from './InfoAuditoria' // 👈 IMPORTAÇÃO DO COMPONENTE DE AUDITORIA
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

function SolicitacaoViagem({ onVoltar, usuarioAtual }) {
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [viajanteId, setViajanteId] = useState('')
  const [origem, setOrigem] = useState('')
  const [destino, setDestino] = useState('')
  const [dataIda, setDataIda] = useState(null)
  const [faixaHorarioIda, setFaixaHorarioIda] = useState([480, 720])
  const [dataVolta, setDataVolta] = useState(null)
  const [faixaHorarioVolta, setFaixaHorarioVolta] = useState([1080, 1200])
  const [justificativa, setJustificativa] = useState('')
  const [observacao, setObservacao] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('todos')

  const [mostrarModalRecusa, setMostrarModalRecusa] = useState(false)
  const [solicitacaoParaRecusar, setSolicitacaoParaRecusar] = useState(null)
  const [motivoRecusa, setMotivoRecusa] = useState('')

  const minDistance = 60

  const funcionarios = useLiveQuery(() => db.funcionarios.toArray(), [])
  const todasSolicitacoes = useLiveQuery(
    () => db.solicitacoesViagem.toArray(),
    []
  )

  const solicitacoesFiltradas =
    todasSolicitacoes
      ?.filter((sol) => {
        if (filtroStatus === 'todos') return true
        return sol.status === filtroStatus
      })
      .sort(
        (a, b) => new Date(b.dataSolicitacao) - new Date(a.dataSolicitacao)
      ) || []

  const limparFormulario = () => {
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

  const minutosParaHorario = (minutos) => {
    const horas = Math.floor(minutos / 60)
    const mins = minutos % 60
    return `${String(horas).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
  }

  const handleChangeHorarioIda = (event, newValue, activeThumb) => {
    if (!Array.isArray(newValue)) return

    if (activeThumb === 0) {
      setFaixaHorarioIda([
        Math.min(newValue[0], faixaHorarioIda[1] - minDistance),
        faixaHorarioIda[1],
      ])
    } else {
      setFaixaHorarioIda([
        faixaHorarioIda[0],
        Math.max(newValue[1], faixaHorarioIda[0] + minDistance),
      ])
    }
  }

  const handleChangeHorarioVolta = (event, newValue, activeThumb) => {
    if (!Array.isArray(newValue)) return

    if (activeThumb === 0) {
      setFaixaHorarioVolta([
        Math.min(newValue[0], faixaHorarioVolta[1] - minDistance),
        faixaHorarioVolta[1],
      ])
    } else {
      setFaixaHorarioVolta([
        faixaHorarioVolta[0],
        Math.max(newValue[1], faixaHorarioVolta[0] + minDistance),
      ])
    }
  }

  const handleSubmit = async (e) => {
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
        // 👤 AUDITORIA: Salvar quem criou
        criadoPorId: usuarioAtual?.id || null,
        criadoPorNome: usuarioAtual?.nome || null,
      })

      console.log('✅ Viagem criada com ID:', viagemId) // DEBUG

      // 🎉 CRIAR NOTIFICAÇÃO AUTOMÁTICA
      const viajante = funcionarios?.find(f => f.id === parseInt(viajanteId))
      if (viajante) {
        await notificacaoService.notificarNovaViagem(
          viagemId,
          viajante.nome,
          destino,
          { id: usuarioAtual?.id, nome: usuarioAtual?.nome }
        )
        console.log('✅ Notificação criada') // DEBUG
      }

      alert('Solicitação de viagem criada com sucesso!')
      limparFormulario()
      setMostrarFormulario(false)
    } catch (error) {
      console.error('❌ Erro ao criar solicitação:', error)
      alert('Erro ao criar solicitação: ' + error.message)
    }
  }

  const handleExcluir = async (id) => {
    if (!usuarioAtual?.podeExcluirViagens) {
      alert('Você não tem permissão para excluir solicitações de viagem!')
      return
    }
    if (window.confirm('Deseja excluir esta solicitação de viagem?')) {
      try {
        await db.solicitacoesViagem.delete(id)
        alert('Solicitação excluída com sucesso!')
      } catch (error) {
        alert('Erro ao excluir solicitação: ' + error.message)
      }
    }
  }

  const handleAlterarStatus = async (id, novoStatus) => {
    if (!usuarioAtual?.podeAprovarViagens) {
      alert(
        'Você não tem permissão para aprovar/recusar solicitações de viagem!'
      )
      return
    }
    if (novoStatus === 'RECUSADA') {
      setSolicitacaoParaRecusar(id)
      setMostrarModalRecusa(true)
      return
    }

    try {
      console.log('🔍 Usuário Atual ao aprovar:', usuarioAtual) // DEBUG

      // 👤 AUDITORIA: Salvar quem aprovou
      const updateData = { status: novoStatus }
      
      if (novoStatus === 'APROVADA') {
        updateData.aprovadoPorId = usuarioAtual?.id || null
        updateData.aprovadoPorNome = usuarioAtual?.nome || null
        updateData.dataAprovacao = new Date().toISOString()
      }
      
      await db.solicitacoesViagem.update(id, updateData)
      console.log('✅ Status atualizado:', updateData) // DEBUG

      // 🎉 CRIAR NOTIFICAÇÃO DE APROVAÇÃO
      if (novoStatus === 'APROVADA') {
        const viagem = await db.solicitacoesViagem.get(id)
        const viajante = funcionarios?.find(f => f.id === viagem.viajanteId)
        if (viajante) {
          await notificacaoService.notificarViagemAprovada(
            id,
            viajante.nome,
            viagem.destino,
            { id: usuarioAtual?.id, nome: usuarioAtual?.nome }
          )
          console.log('✅ Notificação de aprovação criada') // DEBUG
        }
      }

      alert('Status atualizado com sucesso!')
    } catch (error) {
      console.error('❌ Erro ao atualizar status:', error)
      alert('Erro ao atualizar status: ' + error.message)
    }
  }

  const handleConfirmarRecusa = async () => {
    if (!motivoRecusa.trim()) {
      alert('Por favor, informe o motivo da recusa.')
      return
    }

    try {
      console.log('🔍 Usuário Atual ao recusar:', usuarioAtual) // DEBUG

      // 👤 AUDITORIA: Salvar quem recusou
      await db.solicitacoesViagem.update(solicitacaoParaRecusar, {
        status: 'RECUSADA',
        motivoRecusa: motivoRecusa,
        recusadoPorId: usuarioAtual?.id || null,
        recusadoPorNome: usuarioAtual?.nome || null,
        dataRecusa: new Date().toISOString(),
      })

      console.log('✅ Viagem recusada') // DEBUG

      // 🎉 CRIAR NOTIFICAÇÃO DE RECUSA
      const viagem = await db.solicitacoesViagem.get(solicitacaoParaRecusar)
      const viajante = funcionarios?.find(f => f.id === viagem.viajanteId)
      if (viajante) {
        await notificacaoService.notificarViagemRecusada(
          solicitacaoParaRecusar,
          viajante.nome,
          viagem.destino,
          motivoRecusa,
          { id: usuarioAtual?.id, nome: usuarioAtual?.nome }
        )
        console.log('✅ Notificação de recusa criada') // DEBUG
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

  const handleFecharModalRecusa = () => {
    setMostrarModalRecusa(false)
    setSolicitacaoParaRecusar(null)
    setMotivoRecusa('')
  }

  const getNomeFuncionario = (id) => {
    const func = funcionarios?.find((f) => f.id === id)
    return func ? func.nome : 'N/A'
  }

  const getDepartamentoFuncionario = (id) => {
    const func = funcionarios?.find((f) => f.id === id)
    return func ? func.departamento : 'N/A'
  }

  const formatarData = (dataString) => {
    return new Date(dataString + 'T00:00:00').toLocaleDateString('pt-BR')
  }

  const formatarDataHora = (dataISO) => {
    return new Date(dataISO).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatarHorario = (horario) => {
    if (!horario) return 'N/A'
    return horario
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'APROVADA':
        return <CheckCircle size={20} />
      case 'RECUSADA':
        return <XCircle size={20} />
      default:
        return <AlertCircle size={20} />
    }
  }

  const getStatusClass = (status) => {
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
    <div className="solicitacao-viagem-container">
      <div className="documentos-header">
        <button onClick={onVoltar} className="btn-voltar">
          <ArrowLeft size={20} />
          Voltar
        </button>
        <div>
          <h2>Solicitação de Viagem</h2>
          <p className="subtitulo">
            Gerencie as solicitações de viagem dos funcionários
          </p>
        </div>
      </div>

      {/* Modal de Recusa */}
      {mostrarModalRecusa && (
        <div className="modal-overlay" onClick={handleFecharModalRecusa}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Motivo da Recusa</h3>
              <button
                onClick={handleFecharModalRecusa}
                className="btn-fechar-modal"
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
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

            <div className="modal-footer">
              <button
                onClick={handleFecharModalRecusa}
                className="btn-cancelar"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmarRecusa}
                className="btn-confirmar"
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
          <div className="acoes-viagem-header">
            {usuarioAtual?.podeCriarViagens && (
              <button
                onClick={() => setMostrarFormulario(true)}
                className="btn-nova-solicitacao"
              >
                <Plus size={20} />
                Nova Solicitação
              </button>
            )}
            <div className="filtro-status-viagem">
              <label>Filtrar por Status:</label>
              <select
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
                className="select-filtro"
              >
                <option value="todos">Todos</option>
                <option value="PENDENTE">Pendentes</option>
                <option value="APROVADA">Aprovadas</option>
                <option value="RECUSADA">Recusadas</option>
              </select>
            </div>
          </div>

          <div className="lista-solicitacoes">
            {solicitacoesFiltradas.length === 0 ? (
              <div className="sem-documentos">
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
              <div className="solicitacoes-grid">
                {solicitacoesFiltradas.map((sol) => (
                  <div
                    key={sol.id}
                    className={`card-solicitacao ${getStatusClass(
                      sol.status
                    )}`}
                  >
                    <div className="card-header-solicitacao">
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
                        className={`badge-status ${getStatusClass(
                          sol.status
                        )}`}
                      >
                        {getStatusIcon(sol.status)}
                        {STATUS_VIAGEM[sol.status]}
                      </div>
                    </div>
                    <div className="rota-viagem">
                      <div className="local-viagem">
                        <MapPin size={16} />
                        <div>
                          <span className="label-local">Origem</span>
                          <span className="nome-local">
                            {sol.origem}
                          </span>
                        </div>
                      </div>
                      <div className="seta-rota">→</div>
                      <div className="local-viagem">
                        <MapPin size={16} />
                        <div>
                          <span className="label-local">Destino</span>
                          <span className="nome-local">
                            {sol.destino}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="datas-viagem">
                      <div className="data-info">
                        <Calendar size={16} />
                        <div>
                          <span className="label-data">Ida</span>
                          <span className="valor-data">
                            {formatarData(sol.dataIda)}
                          </span>
                          <span className="horario-badge">
                            {formatarHorario(sol.horarioIdaInicio)} -{' '}
                            {formatarHorario(sol.horarioIdaFim)}
                          </span>
                        </div>
                      </div>
                      <div className="data-info">
                        <Calendar size={16} />
                        <div>
                          <span className="label-data">Volta</span>
                          <span className="valor-data">
                            {formatarData(sol.dataVolta)}
                          </span>
                          <span className="horario-badge">
                            {formatarHorario(sol.horarioVoltaInicio)} -{' '}
                            {formatarHorario(sol.horarioVoltaFim)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="justificativa-box">
                      <FileText size={16} />
                      <div>
                        <strong>Justificativa:</strong>
                        <p>{sol.justificativa}</p>
                      </div>
                    </div>
                    {sol.observacao && (
                      <div className="observacao-box">
                        <strong>Observação:</strong>
                        <p>{sol.observacao}</p>
                      </div>
                    )}
                    {sol.status === 'RECUSADA' && sol.motivoRecusa && (
                      <div className="motivo-recusa-box">
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
                    
                    <div className="card-footer-solicitacao">
                      <span className="data-solicitacao">
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
                                className="btn-acao-status btn-aprovar"
                                title="Aprovar"
                              >
                                <CheckCircle size={16} />
                              </button>
                              <button
                                onClick={() =>
                                  handleAlterarStatus(sol.id, 'RECUSADA')
                                }
                                className="btn-acao-status btn-recusar"
                                title="Recusar"
                              >
                                <XCircle size={16} />
                              </button>
                            </>
                          )}
                        {usuarioAtual?.podeExcluirViagens && (
                          <button
                            onClick={() => handleExcluir(sol.id)}
                            className="btn-acao-status btn-excluir-sol"
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
        <div className="formulario-viagem">
          <div className="form-header">
            <h3>Nova Solicitação de Viagem</h3>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>
                <User size={18} />
                Viajante *
              </label>
              <select
                value={viajanteId}
                onChange={(e) => setViajanteId(e.target.value)}
                className="select-filtro"
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

            <div className="form-row">
              <div className="form-group">
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
              <div className="form-group">
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

            <div className="form-row">
              <div className="form-group">
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
              <div className="form-group">
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

            <div className="form-row">
              <div className="form-group">
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
              <div className="form-group">
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

            <div className="form-group">
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

            <div className="form-group">
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

            <div className="form-actions">
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
              <button type="submit" className="btn-confirmar">
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

export default SolicitacaoViagem