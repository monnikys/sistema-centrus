import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, CATEGORIAS } from '../db';
import { ArrowLeft, Upload, FileText, Trash2, Eye, Download, Calendar, X } from 'lucide-react';

function GerenciarDocumentos({ funcionario, onVoltar }) {
  const [categoriaAtual, setCategoriaAtual] = useState('ABONO_ASSIDUIDADE');
  const [uploading, setUploading] = useState(false);
  const [mesSelecionado, setMesSelecionado] = useState('todos');
  const [anoSelecionado, setAnoSelecionado] = useState('todos');
  const [mostrarModalUpload, setMostrarModalUpload] = useState(false);
  const [arquivoSelecionado, setArquivoSelecionado] = useState(null);
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  const todosDocumentos = useLiveQuery(
    () => db.documentos
      .where('funcionarioId')
      .equals(funcionario.id)
      .and(doc => doc.categoria === categoriaAtual)
      .toArray(),
    [funcionario.id, categoriaAtual]
  );

  const documentos = todosDocumentos?.filter(doc => {
    if (mesSelecionado !== 'todos' && doc.mes !== parseInt(mesSelecionado)) {
      return false;
    }
    if (anoSelecionado !== 'todos' && doc.ano !== parseInt(anoSelecionado)) {
      return false;
    }
    return true;
  });

  const anosDisponiveis = [...new Set(todosDocumentos?.map(doc => doc.ano) || [])].sort((a, b) => b - a);

  const mesesDisponiveis = [...new Set(
    todosDocumentos
      ?.filter(doc => anoSelecionado === 'todos' || doc.ano === parseInt(anoSelecionado))
      .map(doc => doc.mes) || []
  )].sort((a, b) => a - b);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Por favor, selecione apenas arquivos PDF');
      return;
    }

    setArquivoSelecionado(file);
    setMostrarModalUpload(true);
    e.target.value = '';
  };

  const calcularDias = () => {
    if (!dataInicio || !dataFim) return 0;
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);
    const diffTime = Math.abs(fim - inicio);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const handleConfirmarUpload = async () => {
    if (!arquivoSelecionado) return;

    if (!dataInicio) {
      alert('Por favor, informe a data de início');
      return;
    }

    setUploading(true);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const pdfData = event.target.result;
        const dataAtual = new Date();
        
        await db.documentos.add({
          funcionarioId: funcionario.id,
          categoria: categoriaAtual,
          nomeArquivo: arquivoSelecionado.name,
          dataUpload: dataAtual.toISOString(),
          mes: dataAtual.getMonth() + 1,
          ano: dataAtual.getFullYear(),
          tamanho: arquivoSelecionado.size,
          dados: pdfData,
          dataInicio: dataInicio,
          dataFim: dataFim || null
        });

        alert('Documento enviado com sucesso!');
        setMostrarModalUpload(false);
        setArquivoSelecionado(null);
        setDataInicio('');
        setDataFim('');
        setUploading(false);
      };

      reader.readAsDataURL(arquivoSelecionado);
    } catch (error) {
      alert('Erro ao enviar documento: ' + error.message);
      setUploading(false);
    }
  };

  const handleCancelarUpload = () => {
    setMostrarModalUpload(false);
    setArquivoSelecionado(null);
    setDataInicio('');
    setDataFim('');
  };

  const handleExcluir = async (id) => {
    if (window.confirm('Deseja excluir este documento?')) {
      try {
        await db.documentos.delete(id);
        alert('Documento excluído com sucesso!');
      } catch (error) {
        alert('Erro ao excluir documento: ' + error.message);
      }
    }
  };

  const handleVisualizar = (documento) => {
    const blob = dataURLtoBlob(documento.dados);
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  const handleDownload = (documento) => {
    const blob = dataURLtoBlob(documento.dados);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = documento.nomeArquivo;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const dataURLtoBlob = (dataURL) => {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };

  const formatarData = (dataISO) => {
    return new Date(dataISO).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatarDataSimples = (dataString) => {
    if (!dataString) return '';
    return new Date(dataString + 'T00:00:00').toLocaleDateString('pt-BR');
  };

  const formatarTamanho = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const getNomeMes = (numeroMes) => {
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return meses[numeroMes - 1];
  };

  const calcularDiasDocumento = (doc) => {
    if (!doc.dataInicio || !doc.dataFim) return null;
    const inicio = new Date(doc.dataInicio + 'T00:00:00');
    const fim = new Date(doc.dataFim + 'T00:00:00');
    const diffTime = Math.abs(fim - inicio);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const limparFiltros = () => {
    setMesSelecionado('todos');
    setAnoSelecionado('todos');
  };

  return (
    <div className="documentos-container">
      <div className="documentos-header">
        <button onClick={onVoltar} className="btn-voltar">
          <ArrowLeft size={20} />
          Voltar
        </button>
        <div>
          <h2>Documentos de {funcionario.nome}</h2>
          <p className="subtitulo">{funcionario.cargo} - {funcionario.departamento}</p>
        </div>
      </div>

      <div className="categorias-tabs">
        {Object.entries(CATEGORIAS).map(([key, label]) => (
          <button
            key={key}
            className={`tab ${categoriaAtual === key ? 'active' : ''}`}
            onClick={() => {
              setCategoriaAtual(key);
              limparFiltros();
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="filtros-periodo">
        <div className="filtro-item">
          <Calendar size={18} />
          <select 
            value={anoSelecionado} 
            onChange={(e) => setAnoSelecionado(e.target.value)}
            className="select-filtro"
          >
            <option value="todos">Todos os anos</option>
            {anosDisponiveis.map(ano => (
              <option key={ano} value={ano}>{ano}</option>
            ))}
          </select>
        </div>

        <div className="filtro-item">
          <Calendar size={18} />
          <select 
            value={mesSelecionado} 
            onChange={(e) => setMesSelecionado(e.target.value)}
            className="select-filtro"
          >
            <option value="todos">Todos os meses</option>
            {mesesDisponiveis.map(mes => (
              <option key={mes} value={mes}>{getNomeMes(mes)}</option>
            ))}
          </select>
        </div>

        {(mesSelecionado !== 'todos' || anoSelecionado !== 'todos') && (
          <button onClick={limparFiltros} className="btn-limpar-filtro">
            Limpar filtros
          </button>
        )}
      </div>

      <div className="upload-area">
        <label className="btn-upload">
          <Upload size={20} />
          Enviar PDF
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
        </label>
        
        {documentos && documentos.length > 0 && (
          <span className="contador-docs">
            {documentos.length} documento{documentos.length !== 1 ? 's' : ''} encontrado{documentos.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {mostrarModalUpload && (
        <div className="modal-overlay" onClick={handleCancelarUpload}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Informações do Documento</h3>
              <button onClick={handleCancelarUpload} className="btn-fechar-modal">
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="info-arquivo">
                <FileText size={24} color="#667eea" />
                <div>
                  <p className="nome-arquivo">{arquivoSelecionado?.name}</p>
                  <p className="tamanho-arquivo">{formatarTamanho(arquivoSelecionado?.size)}</p>
                </div>
              </div>

              <div className="form-datas">
                <div className="form-group">
                  <label>Data de Início *</label>
                  <input
                    type="date"
                    value={dataInicio}
                    onChange={(e) => setDataInicio(e.target.value)}
                    className="input-data"
                  />
                </div>

                <div className="form-group">
                  <label>Data de Fim (opcional)</label>
                  <input
                    type="date"
                    value={dataFim}
                    onChange={(e) => setDataFim(e.target.value)}
                    className="input-data"
                    min={dataInicio}
                  />
                </div>
              </div>

              {dataInicio && dataFim && (
                <div className="info-dias">
                  <Calendar size={18} />
                  <span>Período: <strong>{calcularDias()} dia{calcularDias() !== 1 ? 's' : ''}</strong></span>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button onClick={handleCancelarUpload} className="btn-cancelar">
                Cancelar
              </button>
              <button 
                onClick={handleConfirmarUpload} 
                className="btn-confirmar"
                disabled={uploading || !dataInicio}
              >
                {uploading ? 'Enviando...' : 'Confirmar e Enviar'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="documentos-lista">
        {!documentos || documentos.length === 0 ? (
          <div className="sem-documentos">
            <FileText size={48} />
            <p>
              {mesSelecionado !== 'todos' || anoSelecionado !== 'todos' 
                ? 'Nenhum documento encontrado para este período' 
                : 'Nenhum documento nesta categoria'}
            </p>
          </div>
        ) : (
          documentos.map(doc => (
            <div key={doc.id} className="documento-item">
              <div className="documento-info">
                <FileText size={24} />
                <div className="documento-detalhes">
                  <h4>{doc.nomeArquivo}</h4>
                  <p className="documento-meta-info">
                    Enviado em: {formatarData(doc.dataUpload)} • {formatarTamanho(doc.tamanho)}
                    <span className="badge-periodo">{getNomeMes(doc.mes)}/{doc.ano}</span>
                  </p>
                  {doc.dataInicio && (
                    <div className="periodo-documento">
                      <Calendar size={14} />
                      <span>
                        Período: {formatarDataSimples(doc.dataInicio)}
                        {doc.dataFim && ` até ${formatarDataSimples(doc.dataFim)}`}
                        {calcularDiasDocumento(doc) && (
                          <strong className="dias-count"> ({calcularDiasDocumento(doc)} dia{calcularDiasDocumento(doc) !== 1 ? 's' : ''})</strong>
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="documento-acoes">
                <button
                  onClick={() => handleVisualizar(doc)}
                  className="btn-acao btn-visualizar"
                  title="Visualizar"
                >
                  <Eye size={18} />
                </button>
                <button
                  onClick={() => handleDownload(doc)}
                  className="btn-acao btn-download"
                  title="Download"
                >
                  <Download size={18} />
                </button>
                <button
                  onClick={() => handleExcluir(doc.id)}
                  className="btn-acao btn-excluir"
                  title="Excluir"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default GerenciarDocumentos;