// src/App.js
import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './db';
import Login from './components/Login';
import Header from './components/Header';
import CadastroFuncionario from './components/CadastroFuncionario';
import ListaFuncionarios from './components/ListaFuncionarios';
import GerenciarDocumentos from './components/GerenciarDocumentos';
import RelatorioDocumentos from './components/RelatorioDocumentos';
import DocumentosEmpresa from './components/DocumentosEmpresa';
import SolicitacaoViagem from './components/SolicitacaoViagem';
import GerenciarUsuarios from './components/GerenciarUsuarios';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthService, inicializarAuth } from './authDb';
import './App.css';

function App() { // Componente principal do aplicativo
  const [usuario, setUsuario] = useState(null); // Estado para armazenar o usuário autenticado
  const [carregando, setCarregando] = useState(true); // Estado para indicar se o sistema está carregando
  const [telaAtual, setTelaAtual] = useState('lista'); // Estado para controlar a tela atual (lista, cadastro, documentos, etc.)
  const [paginaAtual, setPaginaAtual] = useState('funcionarios'); // Estado para controlar a página atual (funcionarios, usuarios)
  const [funcionarioSelecionado, setFuncionarioSelecionado] = useState(null); // Estado para armazenar o funcionário selecionado para edição ou gerenciamento de documentos

  const funcionarios = useLiveQuery(() => db.funcionarios.toArray(), []); // Hook para buscar funcionários do banco de dados

  useEffect(() => { // Efeito para inicializar o sistema na montagem do componente
    inicializar(); // Chamar função de inicialização
  }, []); // Executar apenas uma vez na montagem

  const inicializar = async () => { // Função
    try { // Tentar inicializar o sistema
      // Inicializar banco de autenticação
      await inicializarAuth(); // Chamar função de inicialização do AuthService

      // Verificar se já está autenticado
      const estaAuth = await AuthService.estaAutenticado();
      
      if (estaAuth) { // Se está autenticado
        const usuarioAtual = await AuthService.obterUsuarioAtual(); // Obter dados do usuário atual
        setUsuario(usuarioAtual); // Atualizar estado do usuário
      }
    } catch (error) { // Capturar erros
      console.error('Erro ao inicializar:', error); // Logar erro no console
    } finally { // Sempre executar
      setCarregando(false); // Indicar que o carregamento terminou
    }
  };

  const handleLoginSucesso = (usuarioLogado) => { // Função chamada ao fazer login com sucesso
    setUsuario(usuarioLogado); // Atualizar estado do usuário
  };

  const handleLogout = () => { // Função para fazer logout
    setUsuario(null); // Limpar estado do usuário
    setPaginaAtual('funcionarios'); // Voltar para a página de funcionários
    setTelaAtual('lista'); // Voltar para a tela de lista
  };

  const handleMudarPagina = (pagina) => { // Função para mudar a página atual
    setPaginaAtual(pagina); // Atualizar estado da página
    setTelaAtual('lista'); // Voltar para a tela de lista
    setFuncionarioSelecionado(null); // Limpar funcionário selecionado
  };

  const handleNovoFuncionario = () => { // Função para iniciar o cadastro de um novo funcionário
    setFuncionarioSelecionado(null); // Limpar funcionário selecionado
    setTelaAtual('cadastro'); // Mudar para a tela de cadastro
  };

  const handleEditarFuncionario = (funcionario) => { // Função para editar um funcionário existente
    setFuncionarioSelecionado(funcionario); // Definir funcionário selecionado
    setTelaAtual('cadastro'); // Mudar para a tela de cadastro
  };

  const handleGerenciarDocumentos = (funcionario) => { // Função para gerenciar documentos de um funcionário
    setFuncionarioSelecionado(funcionario); // Definir funcionário selecionado
    setTelaAtual('documentos'); // Mudar para a tela de gerenciamento de documentos
  };

  const handleRelatorio = () => { // Função para ver o relatório de documentos
    setTelaAtual('relatorio'); // Mudar para a tela de relatório
  };

  const handleDocumentosEmpresa = () => { // Função para ver documentos da empresa
    setTelaAtual('documentosEmpresa'); // Mudar para a tela de documentos da empresa
  };

  const handleSolicitacaoViagem = () => { // Função para ver solicitações de viagem
    setTelaAtual('solicitacaoViagem'); // Mudar para a tela de solicitações de viagem
  };

  const handleVoltar = () => { // Função para voltar para a lista de funcionários
    setFuncionarioSelecionado(null); // Limpar funcionário selecionado
    setTelaAtual('lista'); // Mudar para a tela de lista
  };

  if (carregando) { // Se o sistema está carregando, mostrar tela de carregamento
    return ( // Retornar JSX de carregamento
      <div className="carregando-app">
        <div className="spinner-app"></div>
        <p>Carregando sistema...</p>
      </div>
    ); // Fim do retorno JSX
  }

  // Se não estiver autenticado, mostrar tela de login
  if (!usuario) {
    return <Login onLoginSucesso={handleLoginSucesso} />; // Renderiza o componente de Login
  }

  // Sistema autenticado
  return ( // Retornar JSX do sistema autenticado
    <div className="app">
      <Header 
        usuario={usuario}
        onLogout={handleLogout}
        paginaAtual={paginaAtual}
        onMudarPagina={handleMudarPagina}
      />

      <main className="app-main"> /* Área principal do aplicativo */
        {paginaAtual === 'funcionarios' && ( // Se a página atual é de funcionários
          <ProtectedRoute> // Rota protegida para usuários autenticados
            {telaAtual === 'lista' && ( // Se a tela atual é a lista de funcionários
              <ListaFuncionarios // Renderiza a lista de funcionários
                funcionarios={funcionarios || []} // Passa a lista de funcionários (ou array vazio se nulo)
                onNovoFuncionario={handleNovoFuncionario} // Função para novo funcionário
                onEditar={handleEditarFuncionario} // Função para editar funcionário
                onGerenciarDocumentos={handleGerenciarDocumentos} // Função para gerenciar documentos
                onRelatorio={handleRelatorio} // Função para ver relatório
                onDocumentosEmpresa={handleDocumentosEmpresa} // Função para ver documentos da empresa
                onSolicitacaoViagem={handleSolicitacaoViagem} // Função para ver solicitações de viagem
              />
            )}

            {telaAtual === 'cadastro' && ( // Se a tela atual é de cadastro/edição de funcionário
              <CadastroFuncionario
                funcionario={funcionarioSelecionado} // Passa o funcionário selecionado (ou null para novo)
                onVoltar={handleVoltar} // Função para voltar para a lista
              />
            )}

            {telaAtual === 'documentos' && (  // Se a tela atual é de gerenciamento de documentos
              <GerenciarDocumentos
                funcionario={funcionarioSelecionado}  // Passa o funcionário selecionado
                onVoltar={handleVoltar} // Função para voltar para a lista
              />
            )}

            {telaAtual === 'relatorio' && ( // Se a tela atual é de relatório de documentos
              <RelatorioDocumentos
                onVoltar={handleVoltar} // Função para voltar para a lista
              />
            )}

            {telaAtual === 'documentosEmpresa' && ( // Se a tela atual é de documentos da empresa
              <DocumentosEmpresa
                onVoltar={handleVoltar}   // Função para voltar para a lista
              />
            )}

            {telaAtual === 'solicitacaoViagem' && ( // Se a tela atual é de solicitações de viagem
              <SolicitacaoViagem
                onVoltar={handleVoltar}  // Função para voltar para a lista
              />
            )}
          </ProtectedRoute>
        )}

        {paginaAtual === 'usuarios' && (  // Se a página atual é de usuários (admin)
          <ProtectedRoute requererAdmin={true}> // Rota protegida que requer permissão de admin
            <GerenciarUsuarios usuarioAtual={usuario} />  // Renderiza o componente de gerenciamento de usuários
          </ProtectedRoute> 
        )}
      </main>
    </div>
  );
}

export default App;   // Exporta o componente App