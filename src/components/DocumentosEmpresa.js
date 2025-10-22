import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, CATEGORIAS_EMPRESA, DOCUMENTOS_EXEMPLO } from '../db';
import { ArrowLeft, Upload, FileText, Trash2, Eye, Download, Calendar, User, Briefcase, Filter, Star } from 'lucide-react'; 

function DocumentosEmpresa({ onVoltar }) {  // Componente para gerenciar documentos da empresa
  const [categoriaAtual, setCategoriaAtual] = useState('INCLUSAO_CONVENIO');  // Categoria selecionada
  const [uploading, setUploading] = useState(false);  // Estado de upload em andamento
  const [funcionarioSelecionado, setFuncionarioSelecionado] = useState('todos');  // Filtro de funcionário
  const [departamentoSelecionado, setDepartamentoSelecionado] = useState('todos');  // Filtro de departamento
  const [mesSelecionado, setMesSelecionado] = useState('todos');  // Filtro de mês
  const [anoSelecionado, setAnoSelecionado] = useState('todos');  // Filtro de ano
  const [funcionarioUpload, setFuncionarioUpload] = useState('');  // Funcionário selecionado para upload

  const todosDocumentosEmpresa = useLiveQuery(  // Consulta todos os documentos da categoria atual
    () => db.documentosEmpresa // Consulta documentos da empresa
      .where('categoriaEmpresa')  // Filtra por categoria
      .equals(categoriaAtual) // Filtra pela categoria atual
      .toArray(), // Retorna um array
    [categoriaAtual]  // Reexecuta quando a categoria mudar
  );

  const funcionarios = useLiveQuery(() => db.funcionarios.toArray(), []);  // Consulta todos os funcionários

  const departamentosDisponiveis = [...new Set(funcionarios?.map(f => f.departamento) || [])].sort();  // Lista de departamentos únicos
  const anosDisponiveis = [...new Set(todosDocumentosEmpresa?.map(doc => doc.ano) || [])].sort((a, b) => b - a);  // Lista de anos disponíveis
  const mesesDisponiveis = [...new Set(todosDocumentosEmpresa?.map(doc => doc.mes) || [])].sort((a, b) => a - b);  // Lista de meses disponíveis

  const documentosFiltrados = todosDocumentosEmpresa?.filter(doc => {  // Filtra documentos conforme filtros aplicados
    if (doc.fixado) return true;  // Sempre mostra documentos fixos
    
    if (funcionarioSelecionado !== 'todos' && doc.funcionarioId !== parseInt(funcionarioSelecionado)) return false;  // Filtro por funcionário
    
    if (departamentoSelecionado !== 'todos') {  // Filtro por departamento
      const func = funcionarios?.find(f => f.id === doc.funcionarioId); // Funcionário do documento
      if (func?.departamento !== departamentoSelecionado) return false; // Se departamento do funcionário diferente do selecionado, retorna falso
    }
    
    if (mesSelecionado !== 'todos' && doc.mes !== parseInt(mesSelecionado)) return false;  // Filtro por mês
    if (anoSelecionado !== 'todos' && doc.ano !== parseInt(anoSelecionado)) return false;  // Filtro por ano
    
    return true;  // Mantém o documento se passar em todos os filtros
  }) || [];

  const documentosNormais = documentosFiltrados.filter(doc => !doc.fixado);  // Apenas documentos que não são fixos

  const handleUpload = async (e) => {  // Função para upload de arquivo
    const file = e.target.files[0];  // Pega o arquivo selecionado
    if (!file) return; // Se não houver arquivo, retorna

    if (file.type !== 'application/pdf') {  // Valida tipo PDF
      alert('Por favor, selecione apenas arquivos PDF'); // Mensagem de erro
      return;
    }

    if (!funcionarioUpload) {  // Valida seleção de funcionário
      alert('Por favor, selecione um funcionário'); // Mensagem de erro
      return;
    }

    setUploading(true);  // Inicia estado de upload

    try {
      const reader = new FileReader();  // Cria leitor de arquivo
      reader.onload = async (event) => {  // Quando arquivo estiver carregado
        const pdfData = event.target.result;  // Captura dados do PDF
        const dataAtual = new Date();  // Data atual
        
        await db.documentosEmpresa.add({  // Adiciona documento no banco
          funcionarioId: parseInt(funcionarioUpload), // ID do funcionário
          categoriaEmpresa: categoriaAtual, // Categoria da empresa
          nomeArquivo: file.name, // Nome do arquivo
          dataUpload: dataAtual.toISOString(), // Data de upload
          mes: dataAtual.getMonth() + 1, // Mês
          ano: dataAtual.getFullYear(), // Ano
          tamanho: file.size, // Tamanho
          dados: pdfData, // Dados do PDF
          fixado: false // Documento não fixo
        });

        alert('Documento enviado com sucesso!');  // Mensagem de sucesso
        e.target.value = '';  // Limpa input
        setFuncionarioUpload('');  // Limpa seleção de funcionário
        setUploading(false);  // Finaliza estado de upload
      };

      reader.readAsDataURL(file);  // Lê arquivo como Base64
    } catch (error) {  // Em caso de erro
      alert('Erro ao enviar documento: ' + error.message); // Mensagem de erro
      setUploading(false); // Finaliza estado de upload
    }
  };

  const handleExcluir = async (id, fixado) => {  // Função para excluir documento
    if (fixado) {  // Documentos fixos não podem ser excluídos
      alert('Documentos de exemplo não podem ser excluídos'); // Mensagem de erro
      return; 
    }

    if (window.confirm('Deseja excluir este documento?')) {  // Confirmação
      try { // Em caso de sucesso
        await db.documentosEmpresa.delete(id);  // Exclui do banco
        alert('Documento excluído com sucesso!'); // Mensagem de sucesso
      } catch (error) { // Em caso de erro
        alert('Erro ao excluir documento: ' + error.message); // Mensagem de erro
      }
    }
  };

  const handleVisualizar = (documento) => {  // Função para visualizar documento
    if (documento.fixado) {  // Documentos fixos não podem ser visualizados
      alert('Este é um documento de exemplo. Faça o download do modelo para visualizar.');
      return;
    }
    const blob = dataURLtoBlob(documento.dados);  // Converte Base64 para Blob
    const url = URL.createObjectURL(blob);  // Cria URL temporária
    window.open(url, '_blank');  // Abre em nova aba
  };

  const handleDownload = (documento) => {  // Função para download
    if (documento.fixado) {  // Download de modelos não disponível
      alert('Funcionalidade de download do modelo estará disponível em breve!');
      return;
    }
    const blob = dataURLtoBlob(documento.dados);  // Converte Base64 para Blob
    const url = URL.createObjectURL(blob); // Cria URL temporária
    const a = document.createElement('a');  // Cria link temporário
    a.href = url; // Define URL
    a.download = documento.nomeArquivo; // Define nome
    document.body.appendChild(a); // Adiciona ao body
    a.click(); // Baixa
    document.body.removeChild(a); // Remove
    URL.revokeObjectURL(url); // Revoga URL
  };

  const dataURLtoBlob = (dataURL) => {  // Converte Base64 para Blob
    const arr = dataURL.split(','); // Divide Base64
    const mime = arr[0].match(/:(.*?);/)[1]; // Pega MIME // O que é MIME? // MIME (Multipurpose Internet Mail Extensions) // MIME é um padrão para o formato de arquivos e mensagens de e-mail.
    const bstr = atob(arr[1]); // Decofica
    let n = bstr.length; // Tamanho
    const u8arr = new Uint8Array(n); // Cria array
    while (n--) { // Preenche
      u8arr[n] = bstr.charCodeAt(n); // Converte
    }
    return new Blob([u8arr], { type: mime }); // Retorna
  };

  const formatarData = (dataISO) => {  // Formata data em pt-BR
    return new Date(dataISO).toLocaleDateString('pt-BR', { // Converte para pt-BR
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatarTamanho = (bytes) => {  // Converte bytes para KB/MB
    if (bytes < 1024) return bytes + ' B'; // Se menor que 1KB
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'; // Se menor que 1MB
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';  // Senão
  };

  const getNomeMes = (numeroMes) => {  // Retorna abreviação do mês
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']; // Abreviações
    return meses[numeroMes - 1]; // Retorna
  };

  const getNomeFuncionario = (funcionarioId) => {  // Retorna nome do funcionário
    const funcionario = funcionarios?.find(f => f.id === funcionarioId); // Encontra
    return funcionario ? funcionario.nome : 'N/A'; // Retorna
  };

  const getDepartamento = (funcionarioId) => {  // Retorna departamento do funcionário
    const funcionario = funcionarios?.find(f => f.id === funcionarioId); // Encontra
    return funcionario ? funcionario.departamento : 'N/A'; // Retorna
  };

  const limparFiltros = () => {  // Limpa todos os filtros
    setFuncionarioSelecionado('todos'); // Limpa
    setDepartamentoSelecionado('todos'); // Limpa
    setMesSelecionado('todos'); // Limpa
    setAnoSelecionado('todos'); // Limpa
  };

  return (
    <div className="documentos-empresa-container">  {/* Container principal */}
      {/* Header com botão de voltar */}
      <div className="documentos-header"> {/* Header */}
        <button onClick={onVoltar} className="btn-voltar"> {/* Botão de voltar */}
          <ArrowLeft size={20} />
          Voltar
        </button>
        <div>
          <h2>Documentos da Empresa</h2>
          <p className="subtitulo">Gerencie documentos corporativos por categoria</p> {/* Subtítulo */}
        </div>
      </div>

      {/* Abas de categorias */}
      <div className="categorias-tabs"> {/* Abas de categorias */}
        {Object.entries(CATEGORIAS_EMPRESA).map(([key, label]) => ( // Mapeia categorias
          <button
            key={key} // Chave
            className={`tab ${categoriaAtual === key ? 'active' : ''}`} // Aba ativa
            onClick={() => { // Função de mudança
              setCategoriaAtual(key);  // Muda categoria
              limparFiltros();  // Limpa filtros ao mudar categoria
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Área de upload de documento */}
      <div className="upload-empresa-area"> {/* Área de upload */}
        <h3>Enviar Novo Documento - {CATEGORIAS_EMPRESA[categoriaAtual]}</h3> {/*Aba ativa*/} 
        <div className="upload-form"> {/* Formulário de upload */}
          <div className="form-group-inline"> {/* Grupo de campos */}
            <label>
              <User size={18} />
              Selecionar Funcionário *
            </label>
            <select 
              value={funcionarioUpload} // Seleção de funcionário
              onChange={(e) => setFuncionarioUpload(e.target.value)} // Função de mudança
              className="select-filtro" // Estilos do select
            >
              <option value="">Escolha um funcionário</option>  {/* Opção vazia */}
              {funcionarios?.map(func => ( // Mapeia funcionários
                <option key={func.id} value={func.id}> {/* Seleção de funcionário */}
                  {func.nome} - {func.departamento} {/* Nome e departamento do funcionário */}
                </option>
              ))}
            </select>
          </div>

          <label className="btn-upload"> {/* Botão de upload */}
            <Upload size={20} />
            {uploading ? 'Enviando...' : 'Selecionar PDF'} {/* Botão de upload */}
            <input
              type="file" // Input de upload
              accept="application/pdf" // Aceita apenas PDF 
              onChange={handleUpload} // Função de upload
              disabled={uploading || !funcionarioUpload} // Desabilita se estiver enviando ou sem selecionar funcionário
              style={{ display: 'none' }} // Oculta input
            />
          </label>
        </div>
      </div>

      {/* Filtros */}
      <div className="filtros-empresa"> {/* Filtros de documentos */}
        <h3>
          <Filter size={18} />
          Filtros
        </h3>
        <div className="filtros-grid"> {/* Grid de filtros */}
          <div className="filtro-item"> {/* Item de filtro */}
            <label>
              <User size={16} />
              Funcionário
            </label>
            <select 
              value={funcionarioSelecionado} // Seleção de funcionário
              onChange={(e) => setFuncionarioSelecionado(e.target.value)} // Muda seleção de funcionário
              className="select-filtro" // Estilos do select
            >
              <option value="todos">Todos os funcionários</option> {/* Opção vazia */}
              {funcionarios?.map(func => ( // Mapeia funcionários
                <option key={func.id} value={func.id}>{func.nome}</option> // Seleção de funcionário
              ))}
            </select>
          </div>

          <div className="filtro-item"> {/* Item de filtro */}
            <label>
              <Briefcase size={16} />
              Departamento
            </label>
            <select 
              value={departamentoSelecionado} // Seleção de departamento 
              onChange={(e) => setDepartamentoSelecionado(e.target.value)} // Muda seleção de departamento
              className="select-filtro" // Estilos do select
            >
              <option value="todos">Todos os departamentos</option> {/* Opção vazia */}
              {departamentosDisponiveis.map(dept => ( // Mapeia departamentos
                <option key={dept} value={dept}>{dept}</option> // Seleção de departamento
              ))}
            </select>
          </div>

          <div className="filtro-item"> {/* Item de filtro */}
            <label>
              <Calendar size={16} />
              Ano
            </label>
            <select 
              value={anoSelecionado} // Seleção de ano
              onChange={(e) => setAnoSelecionado(e.target.value)} // Muda seleção de ano
              className="select-filtro" // Estilos do select
            >
              <option value="todos">Todos os anos</option> {/* Opção vazia */}
              {anosDisponiveis.map(ano => ( // Mapeia anos
                <option key={ano} value={ano}>{ano}</option> // Seleção de ano
              ))}
            </select>
          </div>

          <div className="filtro-item"> {/* Item de filtro */}
            <label>
              <Calendar size={16} />
              Mês
            </label>
            <select 
              value={mesSelecionado} // Seleção de mês
              onChange={(e) => setMesSelecionado(e.target.value)} // Muda seleção de mês
              className="select-filtro" // Estilos do select
            >
              <option value="todos">Todos os meses</option> {/* Opção vazia */}
              {mesesDisponiveis.map(mes => ( // Mapeia mês
                <option key={mes} value={mes}>{getNomeMes(mes)}</option> // Seleção de mês
              ))}
            </select>
          </div>
        </div>

        {(funcionarioSelecionado !== 'todos' || departamentoSelecionado !== 'todos' || // Verifica se algum filtro foi selecionado
          mesSelecionado !== 'todos' || anoSelecionado !== 'todos') && ( // Verifica se algum filtro foi selecionado
          <button onClick={limparFiltros} className="btn-limpar-filtro"> {/* Botão de limpar filtros*/}
            Limpar todos os filtros
          </button>
        )}
      </div>

      {/* Documentos de exemplo */}
      {categoriaAtual === 'INCLUSAO_CONVENIO' && DOCUMENTOS_EXEMPLO.INCLUSAO_CONVENIO.length > 0 && ( // Verifica se a categoria atual é INCLUSAO_CONVENIO e se houver documentos de exemplo
        <div className="documentos-exemplo-section"> {/* Secção de documentos de exemplo */}
          <h3>
            <Star size={20} />
            Modelos e Documentos de Referência
          </h3>
          <div className="documentos-grid"> {/* Grid de documentos de exemplo */}
            {DOCUMENTOS_EXEMPLO.INCLUSAO_CONVENIO.map((exemplo, index) => ( // Mapeia documentos de exemplo
              <div key={`exemplo-${index}`} className="documento-card-empresa documento-exemplo"> {/* Card de exemplo */}
                <div className="documento-header-card"> {/* Header do card */}
                  <FileText size={24} color="#ffc107" />
                  <div className="documento-badges"> {/* Badges do card */}
                    <span className="badge-exemplo">Modelo</span> {/* Badge de exemplo */}
                  </div>
                </div>
                
                <div className="documento-corpo"> {/* Corpo do card */}
                  <h4>{exemplo.nomeArquivo}</h4> {/* Título do card */}
                  <p className="arquivo-descricao">{exemplo.descricao}</p> {/* Descrição do card */}
                </div>

                <div className="documento-acoes"> {/* Ações do card */}
                  <button
                    onClick={() => alert('Funcionalidade de visualização de modelos em desenvolvimento')} // Função para visualizar documento
                    className="btn-acao btn-visualizar" // Botão de visualizar
                    title="Visualizar Modelo" // Título do botão de visualizar
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    onClick={() => alert('Funcionalidade de download de modelos em desenvolvimento')} // Função para download
                    className="btn-acao btn-download" // Botão de download
                    title="Baixar Modelo" // Título do botão de download
                  >
                    <Download size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lista de documentos enviados */}
      <div className="lista-documentos-empresa"> {/* Lista de documentos enviados */}
        <h3>Documentos Enviados ({documentosNormais.length})</h3> {/* Título da lista */}
        
        {documentosNormais.length === 0 ? ( // Verifica se houver documentos
          <div className="sem-documentos"> {/* Sem documentos */}
            <FileText size={48} />
            <p>
              {(funcionarioSelecionado !== 'todos' || departamentoSelecionado !== 'todos' || // Verifica se algum filtro foi selecionado
                mesSelecionado !== 'todos' || anoSelecionado !== 'todos') // Verifica se algum filtro foi selecionado
                ? 'Nenhum documento encontrado com os filtros selecionados'
                : 'Nenhum documento enviado nesta categoria'}
            </p>
          </div>
        ) : (
          <div className="documentos-grid"> {/* Grid de documentos */}
            {documentosNormais.map(doc => ( // Mapeia documentos
              <div key={doc.id} className="documento-card-empresa"> {/* Card de documento */}
                <div className="documento-header-card"> {/* Header do card */}
                  <FileText size={24} color="#667eea" />
                  <div className="documento-badges"> {/* Badges do card */}
                    <span className="badge-mes-ano">{getNomeMes(doc.mes)}/{doc.ano}</span> {/* Mostra o mês e ano */}
                  </div>
                </div>
                
                <div className="documento-corpo"> {/* Corpo do card */}
                  <h4>{getNomeFuncionario(doc.funcionarioId)}</h4> {/* Mostra o nome do funcionário */}
                  <p className="departamento-info"> {/* Informa o departamento do funcionário */}
                    <Briefcase size={14} />
                    {getDepartamento(doc.funcionarioId)} {/* Mostra o departamento do funcionário */}
                  </p>
                  <p className="arquivo-nome">{doc.nomeArquivo}</p> {/* Mostra o nome do arquivo */}
                  <p className="documento-meta"> {/* Mostra a data de upload e o tamanho */}
                    {formatarData(doc.dataUpload)} • {formatarTamanho(doc.tamanho)} {/* Mostra a data de upload e o tamanho */}
                  </p>
                </div>

                <div className="documento-acoes"> {/* Ações do card */}
                  <button
                    onClick={() => handleVisualizar(doc)} // Função para visualizar documento
                    className="btn-acao btn-visualizar" // Botão de visualizar
                    title="Visualizar" // Título do botão de visualizar
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    onClick={() => handleDownload(doc)} // Função para download
                    className="btn-acao btn-download" // Botão de download
                    title="Download" // Título do botão de download
                  >
                    <Download size={16} />
                  </button>
                  <button
                    onClick={() => handleExcluir(doc.id, doc.fixado)} // Função para excluir
                    className="btn-acao btn-excluir" // Botão de excluir 
                    title="Excluir" // Título do botão de excluir
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
