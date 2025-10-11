import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, CATEGORIAS_EMPRESA, DOCUMENTOS_EXEMPLO } from '../db';
import { ArrowLeft, Upload, FileText, Trash2, Eye, Download, Calendar, User, Briefcase, Filter, Star } from 'lucide-react';

function DocumentosEmpresa({ onVoltar }) {
  const [categoriaAtual, setCategoriaAtual] = useState('INCLUSAO_CONVENIO');
  const [uploading, setUploading] = useState(false);
  const [funcionarioSelecionado, setFuncionarioSelecionado] = useState('todos');
  const [departamentoSelecionado, setDepartamentoSelecionado] = useState('todos');
  const [mesSelecionado, setMesSelecionado] = useState('todos');
  const [anoSelecionado, setAnoSelecionado] = useState('todos');
  const [funcionarioUpload, setFuncionarioUpload] = useState('');

  const todosDocumentosEmpresa = useLiveQuery(
    () => db.documentosEmpresa
      .where('categoriaEmpresa')
      .equals(categoriaAtual)
      .toArray(),
    [categoriaAtual]
  );

  const funcionarios = useLiveQuery(() => db.funcionarios.toArray(), []);

  const departamentosDisponiveis = [...new Set(funcionarios?.map(f => f.departamento) || [])].sort();
  const anosDisponiveis = [...new Set(todosDocumentosEmpresa?.map(doc => doc.ano) || [])].sort((a, b) => b - a);
  const mesesDisponiveis = [...new Set(todosDocumentosEmpresa?.map(doc => doc.mes) || [])].sort((a, b) => a - b);

  const documentosFiltrados = todosDocumentosEmpresa?.filter(doc => {
    if (doc.fixado) return true;
    
    if (funcionarioSelecionado !== 'todos' && doc.funcionarioId !== parseInt(funcionarioSelecionado)) return false;
    
    if (departamentoSelecionado !== 'todos') {
      const func = funcionarios?.find(f => f.id === doc.funcionarioId);
      if (func?.departamento !== departamentoSelecionado) return false;
    }
    
    if (mesSelecionado !== 'todos' && doc.mes !== parseInt(mesSelecionado)) return false;
    if (anoSelecionado !== 'todos' && doc.ano !== parseInt(anoSelecionado)) return false;
    
    return true;
  }) || [];

  const documentosNormais = documentosFiltrados.filter(doc => !doc.fixado);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Por favor, selecione apenas arquivos PDF');
      return;
    }

    if (!funcionarioUpload) {
      alert('Por favor, selecione um funcionário');
      return;
    }

    setUploading(true);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const pdfData = event.target.result;
        const dataAtual = new Date();
        
        await db.documentosEmpresa.add({
          funcionarioId: parseInt(funcionarioUpload),
          categoriaEmpresa: categoriaAtual,
          nomeArquivo: file.name,
          dataUpload: dataAtual.toISOString(),
          mes: dataAtual.getMonth() + 1,
          ano: dataAtual.getFullYear(),
          tamanho: file.size,
          dados: pdfData,
          fixado: false
        });

        alert('Documento enviado com sucesso!');
        e.target.value = '';
        setFuncionarioUpload('');
        setUploading(false);
      };

      reader.readAsDataURL(file);
    } catch (error) {
      alert('Erro ao enviar documento: ' + error.message);
      setUploading(false);
    }
  };

  const handleExcluir = async (id, fixado) => {
    if (fixado) {
      alert('Documentos de exemplo não podem ser excluídos');
      return;
    }

    if (window.confirm('Deseja excluir este documento?')) {
      try {
        await db.documentosEmpresa.delete(id);
        alert('Documento excluído com sucesso!');
      } catch (error) {
        alert('Erro ao excluir documento: ' + error.message);
      }
    }
  };

  const handleVisualizar = (documento) => {
    if (documento.fixado) {
      alert('Este é um documento de exemplo. Faça o download do modelo para visualizar.');
      return;
    }
    const blob = dataURLtoBlob(documento.dados);
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  const handleDownload = (documento) => {
    if (documento.fixado) {
      alert('Funcionalidade de download do modelo estará disponível em breve!');
      return;
    }
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

  const formatarTamanho = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const getNomeMes = (numeroMes) => {
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return meses[numeroMes - 1];
  };

  const getNomeFuncionario = (funcionarioId) => {
    const funcionario = funcionarios?.find(f => f.id === funcionarioId);
    return funcionario ? funcionario.nome : 'N/A';
  };

  const getDepartamento = (funcionarioId) => {
    const funcionario = funcionarios?.find(f => f.id === funcionarioId);
    return funcionario ? funcionario.departamento : 'N/A';
  };

  const limparFiltros = () => {
    setFuncionarioSelecionado('todos');
    setDepartamentoSelecionado('todos');
    setMesSelecionado('todos');
    setAnoSelecionado('todos');
  };

  return (
    <div className="documentos-empresa-container">
      <div className="documentos-header">
        <button onClick={onVoltar} className="btn-voltar">
          <ArrowLeft size={20} />
          Voltar
        </button>
        <div>
          <h2>Documentos da Empresa</h2>
          <p className="subtitulo">Gerencie documentos corporativos por categoria</p>
        </div>
      </div>

      <div className="categorias-tabs">
        {Object.entries(CATEGORIAS_EMPRESA).map(([key, label]) => (
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

      <div className="upload-empresa-area">
        <h3>Enviar Novo Documento - {CATEGORIAS_EMPRESA[categoriaAtual]}</h3>
        <div className="upload-form">
          <div className="form-group-inline">
            <label>
              <User size={18} />
              Selecionar Funcionário *
            </label>
            <select 
              value={funcionarioUpload} 
              onChange={(e) => setFuncionarioUpload(e.target.value)}
              className="select-filtro"
            >
              <option value="">Escolha um funcionário</option>
              {funcionarios?.map(func => (
                <option key={func.id} value={func.id}>
                  {func.nome} - {func.departamento}
                </option>
              ))}
            </select>
          </div>

          <label className="btn-upload">
            <Upload size={20} />
            {uploading ? 'Enviando...' : 'Selecionar PDF'}
            <input
              type="file"
              accept="application/pdf"
              onChange={handleUpload}
              disabled={uploading || !funcionarioUpload}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      </div>

      <div className="filtros-empresa">
        <h3>
          <Filter size={18} />
          Filtros
        </h3>
        <div className="filtros-grid">
          <div className="filtro-item">
            <label>
              <User size={16} />
              Funcionário
            </label>
            <select 
              value={funcionarioSelecionado} 
              onChange={(e) => setFuncionarioSelecionado(e.target.value)}
              className="select-filtro"
            >
              <option value="todos">Todos os funcionários</option>
              {funcionarios?.map(func => (
                <option key={func.id} value={func.id}>{func.nome}</option>
              ))}
            </select>
          </div>

          <div className="filtro-item">
            <label>
              <Briefcase size={16} />
              Departamento
            </label>
            <select 
              value={departamentoSelecionado} 
              onChange={(e) => setDepartamentoSelecionado(e.target.value)}
              className="select-filtro"
            >
              <option value="todos">Todos os departamentos</option>
              {departamentosDisponiveis.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <div className="filtro-item">
            <label>
              <Calendar size={16} />
              Ano
            </label>
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
            <label>
              <Calendar size={16} />
              Mês
            </label>
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
        </div>

        {(funcionarioSelecionado !== 'todos' || departamentoSelecionado !== 'todos' || 
          mesSelecionado !== 'todos' || anoSelecionado !== 'todos') && (
          <button onClick={limparFiltros} className="btn-limpar-filtro">
            Limpar todos os filtros
          </button>
        )}
      </div>

      {categoriaAtual === 'INCLUSAO_CONVENIO' && DOCUMENTOS_EXEMPLO.INCLUSAO_CONVENIO.length > 0 && (
        <div className="documentos-exemplo-section">
          <h3>
            <Star size={20} />
            Modelos e Documentos de Referência
          </h3>
          <div className="documentos-grid">
            {DOCUMENTOS_EXEMPLO.INCLUSAO_CONVENIO.map((exemplo, index) => (
              <div key={`exemplo-${index}`} className="documento-card-empresa documento-exemplo">
                <div className="documento-header-card">
                  <FileText size={24} color="#ffc107" />
                  <div className="documento-badges">
                    <span className="badge-exemplo">Modelo</span>
                  </div>
                </div>
                
                <div className="documento-corpo">
                  <h4>{exemplo.nomeArquivo}</h4>
                  <p className="arquivo-descricao">{exemplo.descricao}</p>
                </div>

                <div className="documento-acoes">
                  <button
                    onClick={() => alert('Funcionalidade de visualização de modelos em desenvolvimento')}
                    className="btn-acao btn-visualizar"
                    title="Visualizar Modelo"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    onClick={() => alert('Funcionalidade de download de modelos em desenvolvimento')}
                    className="btn-acao btn-download"
                    title="Baixar Modelo"
                  >
                    <Download size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="lista-documentos-empresa">
        <h3>Documentos Enviados ({documentosNormais.length})</h3>
        
        {documentosNormais.length === 0 ? (
          <div className="sem-documentos">
            <FileText size={48} />
            <p>
              {(funcionarioSelecionado !== 'todos' || departamentoSelecionado !== 'todos' || 
                mesSelecionado !== 'todos' || anoSelecionado !== 'todos')
                ? 'Nenhum documento encontrado com os filtros selecionados'
                : 'Nenhum documento enviado nesta categoria'}
            </p>
          </div>
        ) : (
          <div className="documentos-grid">
            {documentosNormais.map(doc => (
              <div key={doc.id} className="documento-card-empresa">
                <div className="documento-header-card">
                  <FileText size={24} color="#667eea" />
                  <div className="documento-badges">
                    <span className="badge-mes-ano">{getNomeMes(doc.mes)}/{doc.ano}</span>
                  </div>
                </div>
                
                <div className="documento-corpo">
                  <h4>{getNomeFuncionario(doc.funcionarioId)}</h4>
                  <p className="departamento-info">
                    <Briefcase size={14} />
                    {getDepartamento(doc.funcionarioId)}
                  </p>
                  <p className="arquivo-nome">{doc.nomeArquivo}</p>
                  <p className="documento-meta">
                    {formatarData(doc.dataUpload)} • {formatarTamanho(doc.tamanho)}
                  </p>
                </div>

                <div className="documento-acoes">
                  <button
                    onClick={() => handleVisualizar(doc)}
                    className="btn-acao btn-visualizar"
                    title="Visualizar"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    onClick={() => handleDownload(doc)}
                    className="btn-acao btn-download"
                    title="Download"
                  >
                    <Download size={16} />
                  </button>
                  <button
                    onClick={() => handleExcluir(doc.id, doc.fixado)}
                    className="btn-acao btn-excluir"
                    title="Excluir"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default DocumentosEmpresa;