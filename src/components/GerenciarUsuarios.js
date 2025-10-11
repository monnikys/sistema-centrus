// src/components/GerenciarUsuarios.js
import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, Shield, User as UserIcon, 
  Mail, Lock, Trash2, CheckCircle, XCircle, 
  AlertCircle, Calendar, Clock 
} from 'lucide-react';
import { AuthService } from '../authDb';
import './styles/GerenciarUsuarios.css'; 

const GerenciarUsuarios = ({ usuarioAtual }) => {
  const [usuarios, setUsuarios] = useState([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });

  const [novoUsuario, setNovoUsuario] = useState({
    nome: '',
    email: '',
    senha: '',
    tipo: 'usuario'
  });

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const carregarUsuarios = async () => {
    try {
      const lista = await AuthService.listarUsuarios();
      setUsuarios(lista);
    } catch (error) {
      mostrarMensagem('erro', 'Erro ao carregar usuários');
    } finally {
      setCarregando(false);
    }
  };

  const mostrarMensagem = (tipo, texto) => {
    setMensagem({ tipo, texto });
    setTimeout(() => setMensagem({ tipo: '', texto: '' }), 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!novoUsuario.nome || !novoUsuario.email || !novoUsuario.senha) {
      mostrarMensagem('erro', 'Preencha todos os campos');
      return;
    }

    if (novoUsuario.senha.length < 6) {
      mostrarMensagem('erro', 'A senha deve ter no mínimo 6 caracteres');
      return;
    }

    const resultado = await AuthService.criarUsuario(novoUsuario);

    if (resultado.sucesso) {
      mostrarMensagem('sucesso', 'Usuário criado com sucesso!');
      setNovoUsuario({ nome: '', email: '', senha: '', tipo: 'usuario' });
      setMostrarForm(false);
      carregarUsuarios();
    } else {
      mostrarMensagem('erro', resultado.erro);
    }
  };

  const alterarStatus = async (usuarioId, ativo) => {
    try {
      await AuthService.alterarStatusUsuario(usuarioId, !ativo);
      mostrarMensagem('sucesso', `Usuário ${!ativo ? 'ativado' : 'desativado'} com sucesso`);
      carregarUsuarios();
    } catch (error) {
      mostrarMensagem('erro', error.message);
    }
  };

  const excluirUsuario = async (usuarioId, nomeUsuario) => {
    if (!window.confirm(`Deseja realmente excluir o usuário "${nomeUsuario}"?`)) {
      return;
    }

    try {
      await AuthService.excluirUsuario(usuarioId);
      mostrarMensagem('sucesso', 'Usuário excluído com sucesso');
      carregarUsuarios();
    } catch (error) {
      mostrarMensagem('erro', error.message);
    }
  };

  const formatarData = (dataISO) => {
    if (!dataISO) return 'Nunca';
    const data = new Date(dataISO);
    return data.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (carregando) {
    return (
      <div className="gerenciar-usuarios">
        <div className="carregando">Carregando usuários...</div>
      </div>
    );
  }

  return (
    <div className="gerenciar-usuarios">
      <div className="header-usuarios">
        <div className="titulo-secao">
          <Users size={28} />
          <h2>Gerenciar Usuários</h2>
        </div>
        <button 
          className="btn-adicionar"
          onClick={() => setMostrarForm(!mostrarForm)}
        >
          <UserPlus size={18} />
          {mostrarForm ? 'Cancelar' : 'Novo Usuário'}
        </button>
      </div>

      {mensagem.texto && (
        <div className={`mensagem mensagem-${mensagem.tipo}`}>
          {mensagem.tipo === 'sucesso' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{mensagem.texto}</span>
        </div>
      )}

      {mostrarForm && (
        <div className="form-usuario-card">
          <h3>Criar Novo Usuário</h3>
          <form onSubmit={handleSubmit} className="form-usuario">
            <div className="form-row">
              <div className="form-group">
                <label>
                  <UserIcon size={16} />
                  Nome Completo
                </label>
                <input
                  type="text"
                  value={novoUsuario.nome}
                  onChange={(e) => setNovoUsuario({...novoUsuario, nome: e.target.value})}
                  placeholder="Nome do usuário"
                />
              </div>

              <div className="form-group">
                <label>
                  <Mail size={16} />
                  Email
                </label>
                <input
                  type="email"
                  value={novoUsuario.email}
                  onChange={(e) => setNovoUsuario({...novoUsuario, email: e.target.value})}
                  placeholder="email@exemplo.com"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>
                  <Lock size={16} />
                  Senha (mínimo 6 caracteres)
                </label>
                <input
                  type="password"
                  value={novoUsuario.senha}
                  onChange={(e) => setNovoUsuario({...novoUsuario, senha: e.target.value})}
                  placeholder="••••••••"
                  minLength="6"
                />
              </div>

              <div className="form-group">
                <label>
                  <Shield size={16} />
                  Tipo de Usuário
                </label>
                <select
                  value={novoUsuario.tipo}
                  onChange={(e) => setNovoUsuario({...novoUsuario, tipo: e.target.value})}
                >
                  <option value="usuario">Usuário Padrão</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-salvar">
                <UserPlus size={18} />
                Criar Usuário
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="lista-usuarios">
        <div className="usuarios-stats">
          <div className="stat-card">
            <Users size={24} />
            <div>
              <span className="stat-numero">{usuarios.length}</span>
              <span className="stat-label">Total de Usuários</span>
            </div>
          </div>
          <div className="stat-card">
            <Shield size={24} />
            <div>
              <span className="stat-numero">{usuarios.filter(u => u.tipo === 'admin').length}</span>
              <span className="stat-label">Administradores</span>
            </div>
          </div>
          <div className="stat-card">
            <CheckCircle size={24} />
            <div>
              <span className="stat-numero">{usuarios.filter(u => u.ativo).length}</span>
              <span className="stat-label">Usuários Ativos</span>
            </div>
          </div>
        </div>

        <div className="tabela-usuarios">
          {usuarios.map((usuario) => (
            <div key={usuario.id} className="usuario-card">
              <div className="usuario-info">
                <div className="usuario-avatar">
                  {usuario.tipo === 'admin' ? <Shield size={24} /> : <UserIcon size={24} />}
                </div>
                <div className="usuario-detalhes">
                  <div className="usuario-nome-linha">
                    <h4>{usuario.nome}</h4>
                    <span className={`badge badge-${usuario.tipo}`}>
                      {usuario.tipo === 'admin' ? 'Administrador' : 'Usuário'}
                    </span>
                    <span className={`badge badge-${usuario.ativo ? 'ativo' : 'inativo'}`}>
                      {usuario.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  <p className="usuario-email">
                    <Mail size={14} />
                    {usuario.email}
                  </p>
                  <div className="usuario-datas">
                    <span>
                      <Calendar size={14} />
                      Criado: {formatarData(usuario.dataCriacao)}
                    </span>
                    <span>
                      <Clock size={14} />
                      Último acesso: {formatarData(usuario.ultimoAcesso)}
                    </span>
                  </div>
                </div>
              </div>

              {usuario.id !== usuarioAtual.id && (
                <div className="usuario-acoes">
                  <button
                    className={`btn-status ${usuario.ativo ? 'btn-desativar' : 'btn-ativar'}`}
                    onClick={() => alterarStatus(usuario.id, usuario.ativo)}
                    title={usuario.ativo ? 'Desativar usuário' : 'Ativar usuário'}
                  >
                    {usuario.ativo ? <XCircle size={18} /> : <CheckCircle size={18} />}
                    {usuario.ativo ? 'Desativar' : 'Ativar'}
                  </button>
                  <button
                    className="btn-excluir"
                    onClick={() => excluirUsuario(usuario.id, usuario.nome)}
                    title="Excluir usuário"
                  >
                    <Trash2 size={18} />
                    Excluir
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GerenciarUsuarios;