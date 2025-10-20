import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, CATEGORIAS } from '../db';
import { ArrowLeft, Upload, FileText, Trash2, Eye, Download, Calendar, X } from 'lucide-react';

function GerenciarDocumentos({ funcionario, onVoltar }) {  // Componente que gerencia os documentos do funcionário
  const [categoriaAtual, setCategoriaAtual] = useState('ABONO_ASSIDUIDADE');  // Categoria selecionada
  const [uploading, setUploading] = useState(false);  // Estado de upload em andamento
  const [mesSelecionado, setMesSelecionado] = useState('todos');  // Filtro de mês
  const [anoSelecionado, setAnoSelecionado] = useState('todos');  // Filtro de ano
  const [mostrarModalUpload, setMostrarModalUpload] = useState(false);  // Estado para mostrar o modal de upload
  const [arquivoSelecionado, setArquivoSelecionado] = useState(null);  // Arquivo selecionado para upload
  const [dataInicio, setDataInicio] = useState('');  // Data de início
  const [dataFim, setDataFim] = useState('');  // Data de fim

  const todosDocumentos = useLiveQuery(  // Consulta todos os documentos do funcionário
    () => db.documentos // Consulta documentos
      .where('funcionarioId')  // Filtra pelo ID do funcionário
      .equals(funcionario.id) // Filtra pelo ID do funcionário
      .and(doc => doc.categoria === categoriaAtual) // Filtra pela categoria
      .toArray(), // Retorna um array
    [funcionario.id, categoriaAtual]  // Reexecuta quando o funcionário ou a categoria mudar
  );

  const documentos = todosDocumentos?.filter(doc => {  // Filtra documentos conforme filtros aplicados
    if (mesSelecionado !== 'todos' && doc.mes !== parseInt(mesSelecionado)) { // Filtro por mês
      return false;
    }
    if (anoSelecionado !== 'todos' && doc.ano !== parseInt(anoSelecionado)) { // Filtro por ano
      return false;
    }
    return true;
  });

  const anosDisponiveis = [...new Set(todosDocumentos?.map(doc => doc.ano) || [])].sort((a, b) => b - a);  // Lista de anos disponíveis

  const mesesDisponiveis = [...new Set( // Lista de meses disponíveis
    todosDocumentos // Todos os documentos
      ?.filter(doc => anoSelecionado === 'todos' || doc.ano === parseInt(anoSelecionado)) // Filtro por ano
      .map(doc => doc.mes) || []  // Retorna um array
  )].sort((a, b) => a - b);  // Ordena os meses

  const handleFileSelect = (e) => {  // Função para selecionar um arquivo
    const file = e.target.files[0];  // Obtem o arquivo selecionado
    if (!file) return;  // Se não houver arquivo, retorna

    if (file.type !== 'application/pdf') {  // Valida tipo PDF
      alert('Por favor, selecione apenas arquivos PDF');  // Mensagem de erro
      return;
    }

    setArquivoSelecionado(file);  // Define o arquivo selecionado
    setMostrarModalUpload(true);  // Define o estado para mostrar o modal
    e.target.value = '';  // Limpa o input
  };

  const calcularDias = () => {  // Função para calcular a diferença de dias
    if (!dataInicio || !dataFim) return 0;  // Se nenhuma data for fornecida, retorna 0
    const inicio = new Date(dataInicio);  // Converte as datas para objetos Date
    const fim = new Date(dataFim);  // Converte as datas para objetos Date
    const diffTime = Math.abs(fim - inicio);  // Calcula a diferença de tempo
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;  // Calcula a diferença de dias
    return diffDays;  // Retorna o resultado
  };

  const handleConfirmarUpload = async () => {  // Função para confirmar o upload
    if (!arquivoSelecionado) return;  // Se nenhuma arquivo for selecionado, retorna

    if (!dataInicio) {  // Se nenhuma data de início for fornecida
      alert('Por favor, informe a data de início');  // Mensagem de erro
      return;
    }

    setUploading(true);  // Define o estado de upload em andamento

    try {  // Tenta enviar o documento
      const reader = new FileReader();  // Cria um leitor de arquivos
      reader.onload = async (event) => {  // Quando o arquivo estiver carregado
        const pdfData = event.target.result;  // Obtem os dados do PDF
        const dataAtual = new Date();  // Obtem a data atual
        
        await db.documentos.add({  // Adiciona o documento
          funcionarioId: funcionario.id,  // ID do funcionário
          categoria: categoriaAtual,  // Categoria do documento
          nomeArquivo: arquivoSelecionado.name,  // Nome do arquivo
          dataUpload: dataAtual.toISOString(),  // Data de upload
          mes: dataAtual.getMonth() + 1,  // Mês
          ano: dataAtual.getFullYear(),  // Ano
          tamanho: arquivoSelecionado.size,  // Tamanho
          dados: pdfData,  // Dados do PDF
          dataInicio: dataInicio,  // Data de início
          dataFim: dataFim || null  // Data de fim
        });

        alert('Documento enviado com sucesso!');  // Mensagem de sucesso
        setMostrarModalUpload(false);  // Define o estado para não mostrar o modal
        setArquivoSelecionado(null);  // Limpa o arquivo selecionado
        setDataInicio('');  // Limpa a data de início
        setDataFim('');  // Limpa a data de fim
        setUploading(false);  // Define o estado de upload concluido
      };

      reader.readAsDataURL(arquivoSelecionado);  // Le o arquivo
    } catch (error) {  // Se ocorrer um erro
      alert('Erro ao enviar documento: ' + error.message);  // Exibe mensagem de erro
      setUploading(false);  // Define o estado de upload concluido
    }
  };

  const handleCancelarUpload = () => {  // Função para cancelar o upload
    setMostrarModalUpload(false);  // Define o estado para não mostrar o modal
    setArquivoSelecionado(null);  // Limpa o arquivo selecionado
    setDataInicio('');  // Limpa a data de início
    setDataFim('');   // Limpa a data de fim
  };

  const handleExcluir = async (id) => {  // Função para excluir um documento
    if (window.confirm('Deseja excluir este documento?')) {  // Confirmação
      try {
        await db.documentos.delete(id);  // Exclui do banco
        alert('Documento excluído com sucesso!');   // Mensagem de sucesso
      } catch (error) { 
        alert('Erro ao excluir documento: ' + error.message);  // Mensagem de erro
      }
    }
  };

  const handleVisualizar = (documento) => { // Função para visualizar documento
    const blob = dataURLtoBlob(documento.dados);  // Converte Base64 para Blob // Base64 é uma forma de codificar dados binários em texto.
    const url = URL.createObjectURL(blob);  // Cria URL temporária
    window.open(url, '_blank');  // Abre em nova aba
  };

  const handleDownload = (documento) => {  // Função para download
    const blob = dataURLtoBlob(documento.dados);  // Converte Base64 para Blob
    const url = URL.createObjectURL(blob);  // Cria URL temporária
    const a = document.createElement('a');  // Cria link temporário
    a.href = url; // Define URL
    a.download = documento.nomeArquivo; // Define nome
    document.body.appendChild(a);   // Adiciona ao body
    a.click();    // Baixa
    document.body.removeChild(a);  // Remove
    URL.revokeObjectURL(url); // Revoga URL
  };

  const dataURLtoBlob = (dataURL) => {  // Converte Base64 para Blob
    const arr = dataURL.split(','); // Divide Base64
    const mime = arr[0].match(/:(.*?);/)[1];  // Pega MIME // MIME é um padrão para o formato de arquivos e mensagens de e-mail.
    const bstr = atob(arr[1]);  // Decofica
    let n = bstr.length;  // Tamanho
    const u8arr = new Uint8Array(n);  // Cria array
    while (n--) {  // Preenche
      u8arr[n] = bstr.charCodeAt(n);  // Converte
    }
    return new Blob([u8arr], { type: mime });  // Retorna
  };

  const formatarData = (dataISO) => {  // Formata data em pt-BR
    return new Date(dataISO).toLocaleDateString('pt-BR', {  // Converte para pt-BR
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatarDataSimples = (dataString) => {  // Formata data em pt-BR
    if (!dataString) return ''; // Se dataString for vazia
    return new Date(dataString + 'T00:00:00').toLocaleDateString('pt-BR');  // Converte para pt-BR
  };

  const formatarTamanho = (bytes) => {  // Converte bytes para KB/MB
    if (bytes < 1024) return bytes + ' B';  // Se menor que 1KB
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';  // Se menor que 1MB
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';  // Senão
  };

  const getNomeMes = (numeroMes) => {  // Retorna abreviação do mês
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']; // Abreviações
    return meses[numeroMes - 1];  // Retorna
  };

  const calcularDiasDocumento = (doc) => {  // Calcula dias do documento
    if (!doc.dataInicio || !doc.dataFim) return null; // Se dataInicio ou dataFim for vazia
    const inicio = new Date(doc.dataInicio + 'T00:00:00');  // Converte para pt-BR
    const fim = new Date(doc.dataFim + 'T00:00:00');  // Converte para pt-BR
    const diffTime = Math.abs(fim - inicio);  // Diferença
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;  // Dias
    return diffDays;  // Retorna
  };

  const limparFiltros = () => {  // Limpa todos os filtros
    setMesSelecionado('todos'); // Limpa
    setAnoSelecionado('todos'); // Limpa
  };

  return (
    <div className="documentos-container">  {/* Container */}
      <div className="documentos-header">  {/* Header */}
        <button onClick={onVoltar} className="btn-voltar">  {/* Botão de voltar */}
          <ArrowLeft size={20} />
          Voltar
        </button>
        <div>
          <h2>Documentos de {funcionario.nome}</h2>
          <p className="subtitulo">{funcionario.cargo} - {funcionario.departamento}</p> {/* Subtítulos */}
        </div>
      </div>

      <div className="categorias-tabs">  {/* Tabs de categorias */}
        {Object.entries(CATEGORIAS).map(([key, label]) => ( // Mapeia as categorias
          <button
            key={key} // Chave
            className={`tab ${categoriaAtual === key ? 'active' : ''}`} // Se categoriaAtual for igual a key
            onClick={() => {
              setCategoriaAtual(key); // Define categoriaAtual
              limparFiltros();  // Limpa filtros
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="filtros-periodo">  {/* Filtros de período */}
        <div className="filtro-item">  {/* Item de filtro */}
          <Calendar size={18} />
          <select 
            value={anoSelecionado}  
            onChange={(e) => setAnoSelecionado(e.target.value)} // Função para atualizar o ano selecionado
            className="select-filtro" // Classe do select
          >
            <option value="todos">Todos os anos</option>  {/* Opção */}
            {anosDisponiveis.map(ano => ( // Mapeia os anos
              <option key={ano} value={ano}>{ano}</option>  // Opção
            ))}
          </select>
        </div>

        <div className="filtro-item">  {/* Item de filtro */}
          <Calendar size={18} />
          <select 
            value={mesSelecionado} 
            onChange={(e) => setMesSelecionado(e.target.value)}   // Função para atualizar o mês selecionado
            className="select-filtro" // Classe do select
          >
            <option value="todos">Todos os meses</option>
            {mesesDisponiveis.map(mes => (  // Mapeia os mês
              <option key={mes} value={mes}>{getNomeMes(mes)}</option>  // Opção
            ))}
          </select>
        </div>

        {(mesSelecionado !== 'todos' || anoSelecionado !== 'todos') && (  // Se mês ou ano selecionado for diferente de todos
          <button onClick={limparFiltros} className="btn-limpar-filtro">  {/* Botão de limpar filtros */}
            Limpar filtros
          </button>
        )}
      </div>

      <div className="upload-area">  {/* Area de upload */}
        <label className="btn-upload">  {/* Botão de upload */}
          <Upload size={20} />  
          Enviar PDF
          <input  
            type="file"
            accept="application/pdf"
            onChange={handleFileSelect} 
            style={{ display: 'none' }}
          />
        </label>
        
        {documentos && documentos.length > 0 && (  // Se documentos existirem
          <span className="contador-docs">  {/* Contador de documentos */}
            {documentos.length} documento{documentos.length !== 1 ? 's' : ''} encontrado{documentos.length !== 1 ? 's' : ''} {/* Se documentos.length for diferente de 1 */}
          </span>
        )}
      </div>

      {mostrarModalUpload && (  // Se mostrarModalUpload for verdadeiro
        <div className="modal-overlay" onClick={handleCancelarUpload}>  {/* Função para fechar o modal */}
          <div className="modal-content" onClick={(e) => e.stopPropagation()}> {/* Função para evitar que o modal seja fechado ao clicar fora dele */}
            <div className="modal-header">  {/* Header do modal */}
              <h3>Informações do Documento</h3>
              <button onClick={handleCancelarUpload} className="btn-fechar-modal">  {/* Botão de fechar modal */}
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">  {/* Body do modal */}
              <div className="info-arquivo">  {/* Informações do arquivo */}
                <FileText size={24} color="#667eea" />
                <div>
                  <p className="nome-arquivo">{arquivoSelecionado?.name}</p>  {/* Nome do arquivo */}
                  <p className="tamanho-arquivo">{formatarTamanho(arquivoSelecionado?.size)}</p>  {/* Tamanho do arquivo */}
                </div>
              </div>

              <div className="form-datas">  {/* Formulario de datas */}
                <div className="form-group">  {/* Grupo de campos */}
                  <label>Data de Início *</label>
                  <input
                    type="date"
                    value={dataInicio}
                    onChange={(e) => setDataInicio(e.target.value)}
                    className="input-data"  // Classe do input
                  />
                </div>

                <div className="form-group">  {/* Grupo de campos */}
                  <label>Data de Fim (opcional)</label>
                  <input
                    type="date"
                    value={dataFim}
                    onChange={(e) => setDataFim(e.target.value)}
                    className="input-data"  // Classe do input
                    min={dataInicio}
                  />
                </div>
              </div>

              {dataInicio && dataFim && (  // Se dataInicio e dataFim forem fornecidas
                <div className="info-dias">  {/* Informações de dias */}
                  <Calendar size={18} />
                  <span>Período: <strong>{calcularDias()} dia{calcularDias() !== 1 ? 's' : ''}</strong></span>  {/* Período */}
                </div>
              )}
            </div>

            <div className="modal-footer">  {/* Footer do modal */}
              <button onClick={handleCancelarUpload} className="btn-cancelar">  {/* Botão de cancelar */}
                Cancelar
              </button>
              <button 
                onClick={handleConfirmarUpload}   
                className="btn-confirmar" // Classe do botão
                disabled={uploading || !dataInicio} // Desabilitado enquanto uploading ou dataInicio estiver vazia
              >
                {uploading ? 'Enviando...' : 'Confirmar e Enviar'}    {/* Se uploading for verdadeiro, mostra 'Enviando...', se não, mostra 'Confirmar e Enviar' */}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="documentos-lista">  {/* Lista de documentos */}
        {!documentos || documentos.length === 0 ? ( // Se documentos ou documentos.length for igual a 0
          <div className="sem-documentos">  {/* Sem documentos */}
            <FileText size={48} />
            <p>
              {mesSelecionado !== 'todos' || anoSelecionado !== 'todos'  // Se mesSelecionado ou anoSelecionado for diferente de 'todos'
                ? 'Nenhum documento encontrado para este período'   // Mostra 'Nenhum documento encontrado para este período'
                : 'Nenhum documento nesta categoria'} {/* Se mesSelecionado ou anoSelecionado for 'todos', mostra 'Nenhum documento nesta categoria' */}
            </p>
          </div>
        ) : (
          documentos.map(doc => ( // Mapeia os documentos
            <div key={doc.id} className="documento-item">  {/* Item de documento */}
              <div className="documento-info">  {/* Informações do documento */}
                <FileText size={24} />
                <div className="documento-detalhes">  {/* Detalhes do documento */}
                  <h4>{doc.nomeArquivo}</h4>
                  <p className="documento-meta-info">  {/* Informações meta do documento */}
                    Enviado em: {formatarData(doc.dataUpload)} • {formatarTamanho(doc.tamanho)} {/* Data de envio e tamanho do arquivo */}
                    <span className="badge-periodo">{getNomeMes(doc.mes)}/{doc.ano}</span>  {/* Período do documento */}
                  </p>
                  {doc.dataInicio && (  // Se dataInicio for fornecida
                    <div className="periodo-documento">  {/* Período do documento */}
                      <Calendar size={14} />
                      <span>
                        Período: {formatarDataSimples(doc.dataInicio)}  {/* Data de inicio */}
                        {doc.dataFim && ` até ${formatarDataSimples(doc.dataFim)}`}  {/* Data de fim */}
                        {calcularDiasDocumento(doc) && (  // Se calcularDiasDocumento(doc) for verdadeiro
                          <strong className="dias-count"> ({calcularDiasDocumento(doc)} dia{calcularDiasDocumento(doc) !== 1 ? 's' : ''})</strong>  // Dias
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="documento-acoes">  {/* Ações do documento */}
                <button
                  onClick={() => handleVisualizar(doc)}
                  className="btn-acao btn-visualizar"  // Classe do botão
                  title="Visualizar"
                >
                  <Eye size={18} />
                </button>
                <button
                  onClick={() => handleDownload(doc)}
                  className="btn-acao btn-download"  // Classe do botão
                  title="Download"
                >
                  <Download size={18} />
                </button>
                <button
                  onClick={() => handleExcluir(doc.id)}
                  className="btn-acao btn-excluir"  // Classe do botão
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

export default GerenciarDocumentos;  // Exporta o componente