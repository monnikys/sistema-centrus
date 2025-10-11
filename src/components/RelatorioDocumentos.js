import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, CATEGORIAS } from '../db';
import { ArrowLeft, Download, FileArchive, Calendar, Filter, CheckSquare, Square, FileText } from 'lucide-react';
import JSZip from 'jszip';

function RelatorioDocumentos({ onVoltar }) {
  const [mesSelecionado, setMesSelecionado] = useState('');
  const [anoSelecionado, setAnoSelecionado] = useState('');
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('todas');
  const [documentosSelecionados, setDocumentosSelecionados] = useState([]);
  const [baixando, setBaixando] = useState(false);

  const todosDocumentos = useLiveQuery(() => db.documentos.toArray(), []);
  const funcionarios = useLiveQuery(() => db.funcionarios.toArray(), []);

  const anosDisponiveis = [...new Set(todosDocumentos?.map(doc => doc.ano) || [])].sort((a, b) => b - a);
  const mesesDisponiveis = [...new Set(todosDocumentos?.map(doc => doc.mes) || [])].sort((a, b) => a - b);

  const documentosFiltrados = todosDocumentos?.filter(doc => {
    if (mesSelecionado && doc.mes !== parseInt(mesSelecionado)) return false;
    if (anoSelecionado && doc.ano !== parseInt(anoSelecionado)) return false;
    if (categoriaSelecionada !== 'todas' && doc.categoria !== categoriaSelecionada) return false;
    return true;
  }) || [];

  const getNomeMes = (numeroMes) => {
    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                   'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    return meses[numeroMes - 1];
  };

  const getNomeFuncionario = (funcionarioId) => {
    const funcionario = funcionarios?.find(f => f.id === funcionarioId);
    return funcionario ? funcionario.nome : 'Funcionário não encontrado';
  };

  const toggleDocumento = (docId) => {
    setDocumentosSelecionados(prev => 
      prev.includes(docId) 
        ? prev.filter(id => id !== docId)
        : [...prev, docId]
    );
  };

  const selecionarTodos = () => {
    if (documentosSelecionados.length === documentosFiltrados.length) {
      setDocumentosSelecionados([]);
    } else {
      setDocumentosSelecionados(documentosFiltrados.map(doc => doc.id));
    }
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

  const formatarNomeArquivo = (doc) => {
    const funcionario = getNomeFuncionario(doc.funcionarioId);
    const categoria = CATEGORIAS[doc.categoria];
    const mes = getNomeMes(doc.mes);
    return `${funcionario}_${categoria}_${mes}_${doc.ano}_${doc.nomeArquivo}`;
  };

  const formatarData = (dataISO) => {
    return new Date(dataISO).toLocaleDateString('pt-BR');
  };

  const gerarCSV = () => {
    if (documentosSelecionados.length === 0) {
      alert('Selecione pelo menos um documento para gerar o relatório');
      return;
    }

    const documentosSelecionadosData = documentosFiltrados.filter(doc => 
      documentosSelecionados.includes(doc.id)
    );

    let csv = 'Funcionário,CPF,Cargo,Departamento,Categoria,Data do Documento,Arquivo\n';

    documentosSelecionadosData.forEach(doc => {
      const func = funcionarios?.find(f => f.id === doc.funcionarioId);
      const linha = [
        func?.nome || 'N/A',
        func?.cpf || 'N/A',
        func?.cargo || 'N/A',
        func?.departamento || 'N/A',
        CATEGORIAS[doc.categoria],
        formatarData(doc.dataUpload),
        doc.nomeArquivo
      ].map(campo => `"${campo}"`).join(',');
      
      csv += linha + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    const nomeArquivo = `Relatorio_Documentos_${mesSelecionado ? getNomeMes(parseInt(mesSelecionado)) : 'TodosMeses'}_${anoSelecionado || 'TodosAnos'}.csv`;
    a.download = nomeArquivo;
    
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    alert(`Relatório CSV gerado com ${documentosSelecionados.length} registro(s)!`);
  };

  const baixarSelecionados = async () => {
    if (documentosSelecionados.length === 0) {
      alert('Selecione pelo menos um documento para baixar');
      return;
    }

    setBaixando(true);

    try {
      if (documentosSelecionados.length === 1) {
        const doc = documentosFiltrados.find(d => d.id === documentosSelecionados[0]);
        const blob = dataURLtoBlob(doc.dados);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = formatarNomeArquivo(doc);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        const zip = new JSZip();
        
        for (const docId of documentosSelecionados) {
          const doc = documentosFiltrados.find(d => d.id === docId);
          const blob = dataURLtoBlob(doc.dados);
          zip.file(formatarNomeArquivo(doc), blob);
        }

        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(zipBlob);
        const a = document.createElement('a');
        a.href = url;
        
        const nomeZip = `Documentos_${mesSelecionado ? getNomeMes(parseInt(mesSelecionado)) : 'TodosMeses'}_${anoSelecionado || 'TodosAnos'}_${categoriaSelecionada !== 'todas' ? CATEGORIAS[categoriaSelecionada] : 'TodasCategorias'}.zip`;
        a.download = nomeZip;
        
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }

      alert(`${documentosSelecionados.length} documento(s) baixado(s) com sucesso!`);
      setDocumentosSelecionados([]);
    } catch (error) {
      alert('Erro ao baixar documentos: ' + error.message);
    } finally {
      setBaixando(false);
    }
  };

  return (
    <div className="relatorio-container">
      <div className="relatorio-header">
        <button onClick={onVoltar} className="btn-voltar">
          <ArrowLeft size={20} />
          Voltar
        </button>
        <div>
          <h2>Download em Massa de Documentos</h2>
          <p className="subtitulo">Baixe documentos de todos os funcionários por período e categoria</p>
        </div>
      </div>

      <div className="filtros-relatorio">
        <div className="filtro-grupo">
          <label>
            <Calendar size={18} />
            Ano
          </label>
          <select 
            value={anoSelecionado} 
            onChange={(e) => setAnoSelecionado(e.target.value)}
            className="select-filtro"
          >
            <option value="">Todos os anos</option>
            {anosDisponiveis.map(ano => (
              <option key={ano} value={ano}>{ano}</option>
            ))}
          </select>
        </div>

        <div className="filtro-grupo">
          <label>
            <Calendar size={18} />
            Mês
          </label>
          <select 
            value={mesSelecionado} 
            onChange={(e) => setMesSelecionado(e.target.value)}
            className="select-filtro"
          >
            <option value="">Todos os meses</option>
            {mesesDisponiveis.map(mes => (
              <option key={mes} value={mes}>{getNomeMes(mes)}</option>
            ))}
          </select>
        </div>

        <div className="filtro-grupo">
          <label>
            <Filter size={18} />
            Categoria
          </label>
          <select 
            value={categoriaSelecionada} 
            onChange={(e) => setCategoriaSelecionada(e.target.value)}
            className="select-filtro"
          >
            <option value="todas">Todas as categorias</option>
            {Object.entries(CATEGORIAS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {documentosFiltrados.length > 0 && (
        <div className="acoes-relatorio">
          <button onClick={selecionarTodos} className="btn-selecionar-todos">
            {documentosSelecionados.length === documentosFiltrados.length ? (
              <>
                <CheckSquare size={18} />
                Desselecionar Todos
              </>
            ) : (
              <>
                <Square size={18} />
                Selecionar Todos
              </>
            )}
          </button>

          <div className="info-selecao">
            {documentosSelecionados.length} de {documentosFiltrados.length} selecionado(s)
          </div>

          <button 
            onClick={gerarCSV} 
            className="btn-exportar-csv"
            disabled={documentosSelecionados.length === 0}
          >
            <FileText size={18} />
            Exportar CSV
          </button>

          <button 
            onClick={baixarSelecionados} 
            className="btn-baixar-massa"
            disabled={documentosSelecionados.length === 0 || baixando}
          >
            {baixando ? (
              'Baixando...'
            ) : (
              <>
                {documentosSelecionados.length > 1 ? <FileArchive size={18} /> : <Download size={18} />}
                Baixar {documentosSelecionados.length > 1 ? 'PDFs (ZIP)' : 'PDF'}
              </>
            )}
          </button>
        </div>
      )}

      <div className="lista-documentos-relatorio">
        {documentosFiltrados.length === 0 ? (
          <div className="sem-resultados">
            <FileArchive size={48} />
            <p>Nenhum documento encontrado com os filtros selecionados</p>
          </div>
        ) : (
          documentosFiltrados.map(doc => (
            <div 
              key={doc.id} 
              className={`documento-relatorio ${documentosSelecionados.includes(doc.id) ? 'selecionado' : ''}`}
              onClick={() => toggleDocumento(doc.id)}
            >
              <div className="checkbox-custom">
                {documentosSelecionados.includes(doc.id) ? (
                  <CheckSquare size={20} />
                ) : (
                  <Square size={20} />
                )}
              </div>
              
              <div className="doc-info-relatorio">
                <h4>{getNomeFuncionario(doc.funcionarioId)}</h4>
                <p>
                  <span className="badge-categoria">{CATEGORIAS[doc.categoria]}</span>
                  <span>{doc.nomeArquivo}</span>
                  <span>{formatarData(doc.dataUpload)}</span>
                  <span className="badge-periodo-rel">{getNomeMes(doc.mes)}/{doc.ano}</span>
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default RelatorioDocumentos;