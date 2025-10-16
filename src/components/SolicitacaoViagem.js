import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, STATUS_VIAGEM } from '../db';
import { AEROPORTOS } from '../db';
import { ArrowLeft, PlaneTakeoff, Plus, Trash2, MapPin, Calendar, Clock, FileText, User, CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';


// Configurar dayjs para português
dayjs.locale('pt-br');

function SolicitacaoViagem({ onVoltar }) { // Propriedade para voltar ao menu principal
  const [mostrarFormulario, setMostrarFormulario] = useState(false); // Estado para controlar a visibilidade do formulário
  const [viajanteId, setViajanteId] = useState(''); // ID do viajante
  const [origem, setOrigem] = useState(''); // Origem
  const [destino, setDestino] = useState(''); // Destino
  const [dataIda, setDataIda] = useState(null); // Data de ida
  const [faixaHorarioIda, setFaixaHorarioIda] = useState([480, 720]); // 08:00 às 12:00 em minutos
  const [dataVolta, setDataVolta] = useState(null); // Data de volta
  const [faixaHorarioVolta, setFaixaHorarioVolta] = useState([1080, 1200]); // 18:00 às 20:00 em minutos
  const [justificativa, setJustificativa] = useState(''); // Justificativa
  const [observacao, setObservacao] = useState(''); // Observação
  const [filtroStatus, setFiltroStatus] = useState('todos'); // Filtro de status
  
  // Estados para o modal de recusa
  const [mostrarModalRecusa, setMostrarModalRecusa] = useState(false); // Controla a visibilidade do modal
  const [solicitacaoParaRecusar, setSolicitacaoParaRecusar] = useState(null); // ID da solicitação a ser recusada
  const [motivoRecusa, setMotivoRecusa] = useState(''); // Motivo da recusa

  const minDistance = 60; // Distância mínima de 2 horas (120 minutos)

  const funcionarios = useLiveQuery(() => db.funcionarios.toArray(), []); // Consulta todos os funcionários
  const todasSolicitacoes = useLiveQuery(() => db.solicitacoesViagem.toArray(), []); // Consulta todas as solicitações

  const solicitacoesFiltradas = todasSolicitacoes?.filter(sol => { // Filtra as solicitações conforme filtros aplicados
    if (filtroStatus === 'todos') return true; // Sempre mostra todas as solicitações
    return sol.status === filtroStatus; // Mostra apenas as solicitações com o status selecionado
  }).sort((a, b) => new Date(b.dataSolicitacao) - new Date(a.dataSolicitacao)) || []; // Ordena as solicitações por data de solicitação (decrescente)

  const limparFormulario = () => { // Função para limpar o formulário
    setViajanteId('');
    setOrigem('');
    setDestino('');
    setDataIda(null);
    setFaixaHorarioIda([480, 720]);
    setDataVolta(null);
    setFaixaHorarioVolta([1080, 1200]);
    setJustificativa('');
    setObservacao('');
  };

  // Função para converter minutos em horário HH:mm
  const minutosParaHorario = (minutos) => { 
    const horas = Math.floor(minutos / 60); // Dividir por 60 para obter as horas
    const mins = minutos % 60; // Obter os minutos
    return `${String(horas).padStart(2, '0')}:${String(mins).padStart(2, '0')}`; // Retornar o horário formatado
  };

  // Função para lidar com mudança de horário de ida com distância mínima
  const handleChangeHorarioIda = (event, newValue, activeThumb) => { 
    if (!Array.isArray(newValue)) { // Verificar se newValue é um array
      return;
    }

    if (activeThumb === 0) { // Verificar se o thumb ativo é o primeiro
      setFaixaHorarioIda([Math.min(newValue[0], faixaHorarioIda[1] - minDistance), faixaHorarioIda[1]]); // Atualizar faixaHorarioIda
    } else { // Se o thumb ativo é o segundo
      setFaixaHorarioIda([faixaHorarioIda[0], Math.max(newValue[1], faixaHorarioIda[0] + minDistance)]); // Atualizar faixaHorarioIda
    }
  };

  // Função para lidar com mudança de horário de volta com distância mínima
  const handleChangeHorarioVolta = (event, newValue, activeThumb) => { // Função para lidar com mudança de horário de volta
    if (!Array.isArray(newValue)) { // Verificar se newValue é um array
      return;
    }

    if (activeThumb === 0) { // Verificar se o thumb ativo é o primeiro
      setFaixaHorarioVolta([Math.min(newValue[0], faixaHorarioVolta[1] - minDistance), faixaHorarioVolta[1]]); // Atualizar faixaHorarioVolta
    } else { // Se o thumb ativo é o segundo  
      setFaixaHorarioVolta([faixaHorarioVolta[0], Math.max(newValue[1], faixaHorarioVolta[0] + minDistance)]); // Atualizar faixaHorarioVolta
    }
  };

  const handleSubmit = async (e) => { // Função para lidar com envio do formulário
    e.preventDefault(); // Evitar o comportamento padrão do formulário
    try { // Tenta criar a solicitação
      await db.solicitacoesViagem.add({// Cria a solicitação
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
        dataSolicitacao: new Date().toISOString()
      });

      alert('Solicitação de viagem criada com sucesso!');
      limparFormulario();
      setMostrarFormulario(false);
    } catch (error) { // Caso ocorra algum erro
      alert('Erro ao criar solicitação: ' + error.message);
    }
  };

  const handleExcluir = async (id) => { // Função para lidar com exclusão de solicitações
    if (window.confirm('Deseja excluir esta solicitação de viagem?')) {
      try {
        await db.solicitacoesViagem.delete(id); // Exclui a solicitação
        alert('Solicitação excluída com sucesso!');
      } catch (error) { // Caso ocorra algum erro
        alert('Erro ao excluir solicitação: ' + error.message);
      }
    }
  };

  const handleAlterarStatus = async (id, novoStatus) => { // Função para lidar com alteração de status
    if (novoStatus === 'RECUSADA') { // Se o novo status for RECUSADA
      setSolicitacaoParaRecusar(id); // Define a solicitação a ser recusada
      setMostrarModalRecusa(true); // Abre o modal de recusa
      return; // Retorna para não executar o resto da função
    }

    try { // Tenta atualizar o status
      await db.solicitacoesViagem.update(id, { status: novoStatus }); // Atualiza o status
      alert('Status atualizado com sucesso!');
    } catch (error) { // Caso ocorra algum erro
      alert('Erro ao atualizar status: ' + error.message);
    }
  };

  const handleConfirmarRecusa = async () => { // Função para confirmar a recusa
    if (!motivoRecusa.trim()) { // Se o motivo estiver vazio
      alert('Por favor, informe o motivo da recusa.');
      return;
    }

    try {
      await db.solicitacoesViagem.update(solicitacaoParaRecusar, { 
        status: 'RECUSADA',
        motivoRecusa: motivoRecusa
      }); // Atualiza o status e adiciona o motivo da recusa
      
      alert('Solicitação recusada com sucesso!');
      setMostrarModalRecusa(false); // Fecha o modal
      setSolicitacaoParaRecusar(null); // Limpa a solicitação
      setMotivoRecusa(''); // Limpa o motivo
    } catch (error) {
      alert('Erro ao recusar solicitação: ' + error.message);
    }
  };

  const handleFecharModalRecusa = () => { // Função para fechar o modal de recusa
    setMostrarModalRecusa(false);
    setSolicitacaoParaRecusar(null);
    setMotivoRecusa('');
  };

  const getNomeFuncionario = (id) => { // Função para obter o nome do funcionário
    const func = funcionarios?.find(f => f.id === id); // Encontra
    return func ? func.nome : 'N/A'; // Retorna
  };

  const getDepartamentoFuncionario = (id) => { // Função para obter o departamento do funcionário
    const func = funcionarios?.find(f => f.id === id); // Encontra
    return func ? func.departamento : 'N/A'; // Retorna
  };

  const formatarData = (dataString) => { // Função para formatar data
    return new Date(dataString + 'T00:00:00').toLocaleDateString('pt-BR'); // Converte para pt-BR
  };

  const formatarDataHora = (dataISO) => { // Função para formatar data e hora
    return new Date(dataISO).toLocaleDateString('pt-BR', { // Converte para pt-BR
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatarHorario = (horario) => { // Função para formatar horário
    if (!horario) return 'N/A'; // Se horário estiver vazio, retorna "N/A"
    return horario;
  };

  const getStatusIcon = (status) => { // Função para obter o icone do status
    switch (status) {
      case 'APROVADA':
        return <CheckCircle size={20} />;
      case 'RECUSADA':
        return <XCircle size={20} />;
      default:
        return <AlertCircle size={20} />;
    }
  };

  const getStatusClass = (status) => { // Função para obter a classe do status
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
    <div className="solicitacao-viagem-container"> {/* Container principal */}
      <div className="documentos-header"> {/* Header */}
        <button onClick={onVoltar} className="btn-voltar">
          <ArrowLeft size={20} />
          Voltar
        </button>
        <div>
          <h2>Solicitação de Viagem</h2>
          <p className="subtitulo">Gerencie as solicitações de viagem dos funcionários</p>
        </div>
      </div>

      {/* Modal de Recusa */}
      {mostrarModalRecusa && (
        <div className="modal-overlay" onClick={handleFecharModalRecusa}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Motivo da Recusa</h3>
              <button onClick={handleFecharModalRecusa} className="btn-fechar-modal">
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
                    resize: 'vertical'
                  }}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button onClick={handleFecharModalRecusa} className="btn-cancelar">
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

      {!mostrarFormulario ? ( // Se não estiver mostrando o formulário
        <>
          <div className="acoes-viagem-header"> {/* Header de ações */}
            <button onClick={() => setMostrarFormulario(true)} className="btn-nova-solicitacao">
              <Plus size={20} />
              Nova Solicitação
            </button>

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
              <div className="sem-documentos"> {/* Caso nenhuma solicitação seja encontrada */}
                <PlaneTakeoff size={48} />
                <p>
                  {filtroStatus === 'todos' 
                    ? 'Nenhuma solicitação de viagem cadastrada'
                    : `Nenhuma solicitação ${STATUS_VIAGEM[filtroStatus].toLowerCase()}`}
                </p>
              </div>
            ) : (
              <div className="solicitacoes-grid"> {/* Grid de solicitações */}
                {solicitacoesFiltradas.map(sol => ( //  Mapeia as solicitações
                  <div key={sol.id} className={`card-solicitacao ${getStatusClass(sol.status)}`}> {/* Card de solicitação */}
                    <div className="card-header-solicitacao"> {/* Header do card */}
                      <div className="viajante-info">   {/* Informações do viajante */}
                        <User size={20} />
                        <div>
                          <h4>{getNomeFuncionario(sol.viajanteId)}</h4> {/* Nome do viajante */}
                          <p>{getDepartamentoFuncionario(sol.viajanteId)}</p> {/* Departamento do viajante */}
                        </div>
                      </div>
                      <div className={`badge-status ${getStatusClass(sol.status)}`}> {/* Badge de status */}
                        {getStatusIcon(sol.status)}
                        {STATUS_VIAGEM[sol.status]}
                      </div>
                    </div>

                    <div className="rota-viagem"> {/* Rota da solicitação */}
                      <div className="local-viagem"> {/* Local de partida e chegada */}
                        <MapPin size={16} />
                        <div>
                          <span className="label-local">Origem</span> {/* Label "Origem" */}
                          <span className="nome-local">{sol.origem}</span> {/* Nome do local de partida */}
                        </div>
                      </div>
                      <div className="seta-rota">→</div> {/* Seta de rota */}
                      <div className="local-viagem"> {/* Local de chegada */}
                        <MapPin size={16} />
                        <div>
                          <span className="label-local">Destino</span> {/* Label "Destino" */}
                          <span className="nome-local">{sol.destino}</span> {/* Nome do local de chegada */}
                        </div>
                      </div>
                    </div>

                    <div className="datas-viagem"> {/* Datas da solicitação */}
                      <div className="data-info"> {/* Informações de data e horário */}
                        <Calendar size={16} />
                        <div>
                          <span className="label-data">Ida</span> {/* Label "Ida" */}
                          <span className="valor-data">{formatarData(sol.dataIda)}</span> {/* Data de ida */}
                          <span className="horario-badge">{/* Horário de ida */}
                              {formatarHorario(sol.horarioIdaInicio)} - {formatarHorario(sol.horarioIdaFim)}
                          </span>
                        </div>
                      </div>
                      <div className="data-info"> {/* Informações de data e horário */}
                        <Calendar size={16} />
                        <div>
                          <span className="label-data">Volta</span> {/* Label "Volta" */}
                          <span className="valor-data">{formatarData(sol.dataVolta)}</span> {/* Data de volta */}
                          <span className="horario-badge"> {/* Horário de volta */}
                            {formatarHorario(sol.horarioVoltaInicio)} - {formatarHorario(sol.horarioVoltaFim)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="justificativa-box"> {/* Box de justificativa */}
                      <FileText size={16} />
                      <div>
                        <strong>Justificativa:</strong>
                        <p>{sol.justificativa}</p> {/* Justificativa da solicitação */}
                      </div>
                    </div>

                    {sol.observacao && (
                      <div className="observacao-box"> {/* Box de observação */}
                        <strong>Observação:</strong>
                        <p>{sol.observacao}</p> {/* Observação da solicitação */}
                      </div>
                    )}

                    {/* Motivo da Recusa */}
                    {sol.status === 'RECUSADA' && sol.motivoRecusa && (
                      <div className="motivo-recusa-box"> {/* Box de motivo de recusa */}
                        <XCircle size={16} />
                        <div>
                          <strong>Motivo da Recusa:</strong>
                          <p>{sol.motivoRecusa}</p> {/* Motivo da recusa */}
                        </div>
                      </div>
                    )}

                    <div className="card-footer-solicitacao"> {/* Footer do card */}
                      <span className="data-solicitacao"> {/* Data de solicitação */}
                        Solicitado em: {formatarDataHora(sol.dataSolicitacao)} {/* Data e horário de solicitação */}
                      </span>
                      <div className="acoes-solicitacao"> {/* Ações da solicitação */}
                        {sol.status === 'PENDENTE' && ( // Se o status da solicitação for "PENDENTE"
                          <>
                            <button
                              onClick={() => handleAlterarStatus(sol.id, 'APROVADA')}
                              className="btn-acao-status btn-aprovar" //* Botão aprovar */
                              title="Aprovar"
                            >
                              <CheckCircle size={16} />
                            </button>
                            <button
                              onClick={() => handleAlterarStatus(sol.id, 'RECUSADA')}
                              className="btn-acao-status btn-recusar" //* Botão recusar */
                              title="Recusar"
                            >
                              <XCircle size={16} />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleExcluir(sol.id)}
                          className="btn-acao-status btn-excluir-sol" //* Botão excluir */
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
        <div className="formulario-viagem"> {/* Formulário de solicitação de viagem */}
          <div className="form-header"> {/* Header do formulário */}
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
                className="select-filtro" //* Estilo do select */
                required
              >
                <option value="">Selecione o funcionário viajante</option>
                {funcionarios?.map(func => ( // Mapeia os funcionários e cria as opções do select
                  <option key={func.id} value={func.id}> {/* Valor do option */}
                    {func.nome} - {func.departamento} {/* Nome e departamento do funcionário */}
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
                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
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
                <div style={{ // Estilo do container do horário
                  padding: '25px 20px', 
                  backgroundColor: '#fff', 
                  borderRadius: '8px',
                  border: '1px solid #ced4da'
                }}>
                  <div style={{ // Estilo do horário
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '25px'
                  }}>
                    <div style={{ textAlign: 'center', flex: 1 }}> {/* Estilo do início do horário */}
                      <div style={{ fontSize: '0.7rem', color: '#6c757d', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Início</div> {/* Label do início do horário */}
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#667eea' }}> {/* Estilo do valor do início do horário */}
                        {minutosParaHorario(faixaHorarioIda[0])}
                      </div>
                    </div>
                    <div style={{ fontSize: '1.2rem', color: '#adb5bd', padding: '0 20px' }}>→</div> {/* Ícone de seta */}
                    <div style={{ textAlign: 'center', flex: 1 }}> {/* Estilo do fim do horário */}
                      <div style={{ fontSize: '0.7rem', color: '#6c757d', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Fim</div> {/* Label do fim do horário */}
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#667eea' }}> {/* Estilo do valor do fim do horário */}
                        {minutosParaHorario(faixaHorarioIda[1])}
                      </div>
                    </div>
                  </div>
                  <Box sx={{ px: 1 }}> {/* Box do slider */}
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
                        { value: 1440, label: '23:59' }
                      ]}
                      sx={{ // Estilo do slider
                        color: '#667eea',
                        '& .MuiSlider-thumb': { // Estilo do thumb
                          width: 18,
                          height: 18,
                          backgroundColor: '#fff',
                          border: '2px solid currentColor',
                          '&:hover, &.Mui-focusVisible': {
                            boxShadow: '0 0 0 8px rgba(102, 126, 234, 0.16)',
                          },
                        },
                        '& .MuiSlider-track': { // Estilo do trilho
                          height: 4,
                        },
                        '& .MuiSlider-rail': { // Estilo do trilho do slider
                          height: 4,
                          opacity: 0.2,
                          backgroundColor: '#dee2e6',
                        },
                        '& .MuiSlider-markLabel': { // Estilo das marcas do slider
                          fontSize: '0.7rem',
                          color: '#adb5bd',
                        },
                      }}
                    />
                  </Box> {/* Fim do box do slider */}
                  <div style={{ // Estilo da distância mínima
                    marginTop: '15px',
                    fontSize: '0.75rem',
                    color: '#adb5bd',
                    textAlign: 'center'
                  }}>
                    Distância mínima: 2 horas
                  </div>
                </div>
              </div>
            </div>

            <div className="form-row"> {/* Linha do formulário */}
              <div className="form-group"> {/* Campo para selecionar a data de volta */}
                <label>
                  <Calendar size={18} />
                  Data de Volta *
                </label>
                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
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

              <div className="form-group"> {/* Campo para selecionar o horário de volta */}
                <label>
                  <Clock size={18} />
                  Horário de Volta *
                </label>
                <div style={{ // Estilo do box do horário de volta
                  padding: '25px 20px', 
                  backgroundColor: '#fff', 
                  borderRadius: '8px',
                  border: '1px solid #ced4da'
                }}>
                  <div style={{ // Estilo do horário de volta
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '25px'
                  }}>
                    <div style={{ textAlign: 'center', flex: 1 }}> {/* Estilo do início do horário de volta */}
                      <div style={{ fontSize: '0.7rem', color: '#6c757d', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Início</div> {/* Label do início do horário de volta */}
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#667eea' }}> {/* Estilo do valor do início do horário de volta */}
                        {minutosParaHorario(faixaHorarioVolta[0])}
                      </div>
                    </div>
                    <div style={{ fontSize: '1.2rem', color: '#adb5bd', padding: '0 20px' }}>→</div> {/* Ícone de seta */}
                    <div style={{ textAlign: 'center', flex: 1 }}> {/* Estilo do fim do horário de volta */}
                      <div style={{ fontSize: '0.7rem', color: '#6c757d', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Fim</div>  {/* Label do fim do horário de volta */}
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#667eea' }}>  {/* Estilo do valor do fim do horário de volta */}
                        {minutosParaHorario(faixaHorarioVolta[1])}
                      </div>
                    </div>
                  </div>
                  <Box sx={{ px: 1 }}> {/* Box do slider do horário de volta */}
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
                        { value: 1440, label: '24:00' }
                      ]}
                      sx={{ // Estilo do slider do horário de volta
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
                        '& .MuiSlider-track': { // Estilo do trilho do slider
                          height: 4,
                        },
                        '& .MuiSlider-rail': { // Estilo do trilho do slider
                          height: 4,
                          opacity: 0.2,
                          backgroundColor: '#dee2e6',
                        },
                        '& .MuiSlider-markLabel': { // Estilo das marcas do slider
                          fontSize: '0.7rem',
                          color: '#adb5bd',
                        },
                      }}
                    />
                  </Box>
                  <div style={{ // Estilo da distância mínima do horário de volta
                    marginTop: '15px',
                    fontSize: '0.75rem',
                    color: '#adb5bd',
                    textAlign: 'center'
                  }}>
                    Distância mínima: 2 horas
                  </div>
                </div>
              </div>
            </div>

            <div className="form-group"> {/* Campo de justificativa */}
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

            <div className="form-group"> {/* Campo de observação */}
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

            <div className="form-actions"> {/* Botoes de confirmar e cancelar */}
              <button
                type="button"
                onClick={() => {
                  setMostrarFormulario(false);
                  limparFormulario();
                }}
                className="btn-cancelar" // Botão de cancelar
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

export default SolicitacaoViagem; // Exporta o componente