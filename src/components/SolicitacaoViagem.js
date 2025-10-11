import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, HORARIOS_VIAGEM, STATUS_VIAGEM } from '../db';
import { ArrowLeft, PlaneTakeoff, Plus, Trash2, MapPin, Calendar, Clock, FileText, User, CheckCircle, XCircle, AlertCircle, Briefcase } from 'lucide-react';

function SolicitacaoViagem({ onVoltar }) {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [viajanteId, setViajanteId] = useState('');
  const [origem, setOrigem] = useState('');
  const [destino, setDestino] = useState('');
  const [dataIda, setDataIda] = useState('');
  const [horarioIda, setHorarioIda] = useState('');
  const [dataVolta, setDataVolta] = useState('');
  const [horarioVolta, setHorarioVolta] = useState('');
  const [justificativa, setJustificativa] = useState('');
  const [observacao, setObservacao] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');

  const funcionarios = useLiveQuery(() => db.funcionarios.toArray(), []);
  const todasSolicitacoes = useLiveQuery(() => db.solicitacoesViagem.toArray(), []);

  const solicitacoesFiltradas = todasSolicitacoes?.filter(sol => {
    if (filtroStatus === 'todos') return true;
    return sol.status === filtroStatus;
  }).sort((a, b) => new Date(b.dataSolicitacao) - new Date(a.dataSolicitacao)) || [];

  const limparFormulario = () => {
    setViajanteId('');
    setOrigem('');
    setDestino('');
    setDataIda('');
    setHorarioIda('');
    setDataVolta('');
    setHorarioVolta('');
    setJustificativa('');
    setObservacao('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await db.solicitacoesViagem.add({
        solicitanteId: 1,
        viajanteId: parseInt(viajanteId),
        origem,
        destino,
        dataIda,
        horarioIda,
        dataVolta,
        horarioVolta,
        justificativa,
        observacao,
        status: 'PENDENTE',
        dataSolicitacao: new Date().toISOString()
      });

      alert('Solicitação de viagem criada com sucesso!');
      limparFormulario();
      setMostrarFormulario(false);
    } catch (error) {
      alert('Erro ao criar solicitação: ' + error.message);
    }
  };

  const handleExcluir = async (id) => {
    if (window.confirm('Deseja excluir esta solicitação de viagem?')) {
      try {
        await db.solicitacoesViagem.delete(id);
        alert('Solicitação excluída com sucesso!');
      } catch (error) {
        alert('Erro ao excluir solicitação: ' + error.message);
      }
    }
  };

  const handleAlterarStatus = async (id, novoStatus) => {
    try {
      await db.solicitacoesViagem.update(id, { status: novoStatus });
      alert('Status atualizado com sucesso!');
    } catch (error) {
      alert('Erro ao atualizar status: ' + error.message);
    }
  };

  const getNomeFuncionario = (id) => {
    const func = funcionarios?.find(f => f.id === id);
    return func ? func.nome : 'N/A';
  };

  const getDepartamentoFuncionario = (id) => {
    const func = funcionarios?.find(f => f.id === id);
    return func ? func.departamento : 'N/A';
  };

  const formatarData = (dataString) => {
    return new Date(dataString + 'T00:00:00').toLocaleDateString('pt-BR');
  };

  const formatarDataHora = (dataISO) => {
    return new Date(dataISO).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'APROVADA':
        return <CheckCircle size={20} />;
      case 'RECUSADA':
        return <XCircle size={20} />;
      default:
        return <AlertCircle size={20} />;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'APROVADA':
        return 'status-aprovada';
      case 'RECUSADA':
        return 'status-recusada';
      default:
        return 'status-pendente';
    }
  };

  return (
    <div className="solicitacao-viagem-container">
      <div className="documentos-header">
        <button onClick={onVoltar} className="btn-voltar">
          <ArrowLeft size={20} />
          Voltar
        </button>
        <div>
          <h2>Solicitação de Viagem</h2>
          <p className="subtitulo">Gerencie as solicitações de viagem dos funcionários</p>
        </div>
      </div>

      {!mostrarFormulario ? (
        <>
          <div className="acoes-viagem-header">
            <button onClick={() => setMostrarFormulario(true)} className="btn-nova-solicitacao">
              <Plus size={20} />
              Nova Solicitação
            </button>

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
                    : `Nenhuma solicitação ${STATUS_VIAGEM[filtroStatus].toLowerCase()}`}
                </p>
              </div>
            ) : (
              <div className="solicitacoes-grid">
                {solicitacoesFiltradas.map(sol => (
                  <div key={sol.id} className={`card-solicitacao ${getStatusClass(sol.status)}`}>
                    <div className="card-header-solicitacao">
                      <div className="viajante-info">
                        <User size={20} />
                        <div>
                          <h4>{getNomeFuncionario(sol.viajanteId)}</h4>
                          <p>{getDepartamentoFuncionario(sol.viajanteId)}</p>
                        </div>
                      </div>
                      <div className={`badge-status ${getStatusClass(sol.status)}`}>
                        {getStatusIcon(sol.status)}
                        {STATUS_VIAGEM[sol.status]}
                      </div>
                    </div>

                    <div className="rota-viagem">
                      <div className="local-viagem">
                        <MapPin size={16} />
                        <div>
                          <span className="label-local">Origem</span>
                          <span className="nome-local">{sol.origem}</span>
                        </div>
                      </div>
                      <div className="seta-rota">→</div>
                      <div className="local-viagem">
                        <MapPin size={16} />
                        <div>
                          <span className="label-local">Destino</span>
                          <span className="nome-local">{sol.destino}</span>
                        </div>
                      </div>
                    </div>

                    <div className="datas-viagem">
                      <div className="data-info">
                        <Calendar size={16} />
                        <div>
                          <span className="label-data">Ida</span>
                          <span className="valor-data">{formatarData(sol.dataIda)}</span>
                          <span className="horario-badge">{HORARIOS_VIAGEM[sol.horarioIda]}</span>
                        </div>
                      </div>
                      <div className="data-info">
                        <Calendar size={16} />
                        <div>
                          <span className="label-data">Volta</span>
                          <span className="valor-data">{formatarData(sol.dataVolta)}</span>
                          <span className="horario-badge">{HORARIOS_VIAGEM[sol.horarioVolta]}</span>
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

                    <div className="card-footer-solicitacao">
                      <span className="data-solicitacao">
                        Solicitado em: {formatarDataHora(sol.dataSolicitacao)}
                      </span>
                      <div className="acoes-solicitacao">
                        {sol.status === 'PENDENTE' && (
                          <>
                            <button
                              onClick={() => handleAlterarStatus(sol.id, 'APROVADA')}
                              className="btn-acao-status btn-aprovar"
                              title="Aprovar"
                            >
                              <CheckCircle size={16} />
                            </button>
                            <button
                              onClick={() => handleAlterarStatus(sol.id, 'RECUSADA')}
                              className="btn-acao-status btn-recusar"
                              title="Recusar"
                            >
                              <XCircle size={16} />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleExcluir(sol.id)}
                          className="btn-acao-status btn-excluir-sol"
                          title="Excluir"
                        >
                          <Trash2 size={16} />
                        </button>
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
                {funcionarios?.map(func => (
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
                <input
                  type="text"
                  value={origem}
                  onChange={(e) => setOrigem(e.target.value)}
                  placeholder="Ex: São Paulo - SP"
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  <MapPin size={18} />
                  Destino *
                </label>
                <input
                  type="text"
                  value={destino}
                  onChange={(e) => setDestino(e.target.value)}
                  placeholder="Ex: Rio de Janeiro - RJ"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>
                  <Calendar size={18} />
                  Data de Ida *
                </label>
                <input
                  type="date"
                  value={dataIda}
                  onChange={(e) => setDataIda(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  <Clock size={18} />
                  Horário de Ida *
                </label>
                <select
                  value={horarioIda}
                  onChange={(e) => setHorarioIda(e.target.value)}
                  className="select-filtro"
                  required
                >
                  <option value="">Selecione o horário</option>
                  {Object.entries(HORARIOS_VIAGEM).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>
                  <Calendar size={18} />
                  Data de Volta *
                </label>
                <input
                  type="date"
                  value={dataVolta}
                  onChange={(e) => setDataVolta(e.target.value)}
                  min={dataIda}
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  <Clock size={18} />
                  Horário de Volta *
                </label>
                <select
                  value={horarioVolta}
                  onChange={(e) => setHorarioVolta(e.target.value)}
                  className="select-filtro"
                  required
                >
                  <option value="">Selecione o horário</option>
                  {Object.entries(HORARIOS_VIAGEM).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
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
                placeholder="Informações adicionais..."
                rows="3"
              />
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={() => {
                  setMostrarFormulario(false);
                  limparFormulario();
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
  );
}

export default SolicitacaoViagem;