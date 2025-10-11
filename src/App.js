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

function App() {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [telaAtual, setTelaAtual] = useState('lista');
  const [paginaAtual, setPaginaAtual] = useState('funcionarios');
  const [funcionarioSelecionado, setFuncionarioSelecionado] = useState(null);

  const funcionarios = useLiveQuery(() => db.funcionarios.toArray(), []);

  useEffect(() => {
    inicializar();
  }, []);

  const inicializar = async () => {
    try {
      // Inicializar banco de autenticação
      await inicializarAuth();

      // Verificar se já está autenticado
      const estaAuth = await AuthService.estaAutenticado();
      
      if (estaAuth) {
        const usuarioAtual = await AuthService.obterUsuarioAtual();
        setUsuario(usuarioAtual);
      }
    } catch (error) {
      console.error('Erro ao inicializar:', error);
    } finally {
      setCarregando(false);
    }
  };

  const handleLoginSucesso = (usuarioLogado) => {
    setUsuario(usuarioLogado);
  };

  const handleLogout = () => {
    setUsuario(null);
    setPaginaAtual('funcionarios');
    setTelaAtual('lista');
  };

  const handleMudarPagina = (pagina) => {
    setPaginaAtual(pagina);
    setTelaAtual('lista');
    setFuncionarioSelecionado(null);
  };

  const handleNovoFuncionario = () => {
    setFuncionarioSelecionado(null);
    setTelaAtual('cadastro');
  };

  const handleEditarFuncionario = (funcionario) => {
    setFuncionarioSelecionado(funcionario);
    setTelaAtual('cadastro');
  };

  const handleGerenciarDocumentos = (funcionario) => {
    setFuncionarioSelecionado(funcionario);
    setTelaAtual('documentos');
  };

  const handleRelatorio = () => {
    setTelaAtual('relatorio');
  };

  const handleDocumentosEmpresa = () => {
    setTelaAtual('documentosEmpresa');
  };

  const handleSolicitacaoViagem = () => {
    setTelaAtual('solicitacaoViagem');
  };

  const handleVoltar = () => {
    setFuncionarioSelecionado(null);
    setTelaAtual('lista');
  };

  if (carregando) {
    return (
      <div className="carregando-app">
        <div className="spinner-app"></div>
        <p>Carregando sistema...</p>
      </div>
    );
  }

  // Se não estiver autenticado, mostrar tela de login
  if (!usuario) {
    return <Login onLoginSucesso={handleLoginSucesso} />;
  }

  // Sistema autenticado
  return (
    <div className="app">
      <Header 
        usuario={usuario}
        onLogout={handleLogout}
        paginaAtual={paginaAtual}
        onMudarPagina={handleMudarPagina}
      />

      <main className="app-main">
        {paginaAtual === 'funcionarios' && (
          <ProtectedRoute>
            {telaAtual === 'lista' && (
              <ListaFuncionarios
                funcionarios={funcionarios || []}
                onNovoFuncionario={handleNovoFuncionario}
                onEditar={handleEditarFuncionario}
                onGerenciarDocumentos={handleGerenciarDocumentos}
                onRelatorio={handleRelatorio}
                onDocumentosEmpresa={handleDocumentosEmpresa}
                onSolicitacaoViagem={handleSolicitacaoViagem}
              />
            )}

            {telaAtual === 'cadastro' && (
              <CadastroFuncionario
                funcionario={funcionarioSelecionado}
                onVoltar={handleVoltar}
              />
            )}

            {telaAtual === 'documentos' && (
              <GerenciarDocumentos
                funcionario={funcionarioSelecionado}
                onVoltar={handleVoltar}
              />
            )}

            {telaAtual === 'relatorio' && (
              <RelatorioDocumentos
                onVoltar={handleVoltar}
              />
            )}

            {telaAtual === 'documentosEmpresa' && (
              <DocumentosEmpresa
                onVoltar={handleVoltar}
              />
            )}

            {telaAtual === 'solicitacaoViagem' && (
              <SolicitacaoViagem
                onVoltar={handleVoltar}
              />
            )}
          </ProtectedRoute>
        )}

        {paginaAtual === 'usuarios' && (
          <ProtectedRoute requererAdmin={true}>
            <GerenciarUsuarios usuarioAtual={usuario} />
          </ProtectedRoute>
        )}
      </main>
    </div>
  );
}

export default App;