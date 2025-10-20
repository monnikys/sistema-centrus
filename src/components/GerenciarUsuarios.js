// src/components/GerenciarUsuarios.js
import React, { useState, useEffect } from 'react'
import {
  Users,
  UserPlus,
  Shield,
  User as UserIcon,
  Mail,
  Lock,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  Clock,
} from 'lucide-react'
import { AuthService } from '../authDb'
import './styles/GerenciarUsuarios.css'

const GerenciarUsuarios = ({ usuarioAtual }) => {
  // Componente de gerenciamento de usuários
  const [usuarios, setUsuarios] = useState([]) // Lista de usuários
  const [mostrarForm, setMostrarForm] = useState(false) // Controla se o formulário de criação de usuários deve ser exibido
  const [carregando, setCarregando] = useState(true) // Controla se o carregamento de usuários deve ser exibido
  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' }) // Exibe mensagens de erro ou sucesso

  const [novoUsuario, setNovoUsuario] = useState({
    // Dados do usuário sendo criado
    nome: '',
    email: '',
    senha: '',
    tipo: 'usuario',
  })

  useEffect(() => {
    // Carregar usuários ao montar o componente
    carregarUsuarios() // Função para carregar usuários
  }, [])

  const carregarUsuarios = async () => {
    // Função para carregar usuários
    try {
      const lista = await AuthService.listarUsuarios() // Buscar usuários
      setUsuarios(lista) // Atualizar estado dos usuários
    } catch (error) {
      // Capturar erros
      mostrarMensagem('erro', 'Erro ao carregar usuários') // Exibir mensagem de erro
    } finally {
      setCarregando(false) // Indicar que o carregamento terminou
    }
  }

  const mostrarMensagem = (tipo, texto) => {
    // Função para exibir mensagens temporárias de erro ou sucesso
    setMensagem({ tipo, texto }) // Define o tipo e o texto da mensagem
    setTimeout(() => setMensagem({ tipo: '', texto: '' }), 4000) // Após 4 segundos, limpa a mensagem automaticamente
  }

  const handleSubmit = async (e) => {
    // Função que será executada ao enviar o formulário
    e.preventDefault() // Evita o recarregamento da página ao enviar o formulário

    if (!novoUsuario.nome || !novoUsuario.email || !novoUsuario.senha) {
      // Verificar se todos os campos foram preenchidos
      mostrarMensagem('erro', 'Preencha todos os campos') // Exibir mensagem de erro
      return
    }

    if (novoUsuario.senha.length < 6) {
      // Verificar se a senha tem pelo menos 6 caracteres
      mostrarMensagem('erro', 'A senha deve ter no mínimo 6 caracteres') // Exibir mensagem de erro
      return
    }

    const resultado = await AuthService.criarUsuario(novoUsuario) // Chamar a função para criar um novo usuário

    if (resultado.sucesso) {
      // Se o usuário foi criado com sucesso
      mostrarMensagem('sucesso', 'Usuário criado com sucesso!') // Exibir mensagem de sucesso
      setNovoUsuario({ nome: '', email: '', senha: '', tipo: 'usuario' }) // Limpar os campos do formulário
      setMostrarForm(false) // Fechar o formulário
      carregarUsuarios() // Recarregar a lista de usuários
    } else {
      mostrarMensagem('erro', resultado.erro) // Exibir mensagem de erro
    }
  }

  const alterarStatus = async (usuarioId, ativo) => {
    // Função para ativar/desativar usuários
    try {
      await AuthService.alterarStatusUsuario(usuarioId, !ativo) // Chamar a função para ativar/desativar usuários
      mostrarMensagem(
        'sucesso',
        `Usuário ${!ativo ? 'ativado' : 'desativado'} com sucesso`
      ) // Exibir mensagem de sucesso
      carregarUsuarios() // Recarregar a lista de usuários
    } catch (error) {
      // Capturar erros
      mostrarMensagem('erro', error.message) // Exibir mensagem de erro
    }
  }

  const excluirUsuario = async (usuarioId, nomeUsuario) => {
    // Função para excluir usuários
    if (
      !window.confirm(`Deseja realmente excluir o usuário "${nomeUsuario}"?`)
    ) {
      // Perguntar ao usuário se realmente deseja excluir
      return
    }

    try {
      // Tenta excluir o usuário
      await AuthService.excluirUsuario(usuarioId) // Chamar a função para excluir usuários
      mostrarMensagem('sucesso', 'Usuário excluído com sucesso') // Exibir mensagem de sucesso
      carregarUsuarios() // Recarregar a lista de usuários
    } catch (error) {
      mostrarMensagem('erro', error.message) // Exibir mensagem de erro
    }
  }

  const formatarData = (dataISO) => {
    // Função para formatar data
    if (!dataISO) return 'Nunca' // Se a data estiver vazia, retorna "Nunca"
    const data = new Date(dataISO) // Cria um objeto Date com a data ISO / ISO é uma data universal formatada como YYYY-MM-DD
    return data.toLocaleString('pt-BR', {
      // Converte para pt-BR
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (carregando) {
    // Se estiver carregando
    return (
      <div className="gerenciar-usuarios">
        {' '}
        {/* Div principal */}
        <div className="header-usuarios">
          {' '}
          {/* Div do cabeçalho */}
          <div className="titulo-secao">
            {' '}
            {/* Div do título da seção */}
            <Users size={28} />
            <h2>Gerenciar Usuários</h2>
          </div>
          <button
            className="btn-adicionar" // Botão de adicionar usuário
            onClick={() => setMostrarForm(!mostrarForm)} // Função para alternar o formulário
          >
            <UserPlus size={18} />
            {mostrarForm ? 'Cancelar' : 'Novo Usuário'}{' '}
            {/* Se mostrarForm for verdadeiro, mostra "Cancelar", se não, mostra "Novo Usuário" */}
          </button>
        </div>
        <div className="carregando">Carregando usuários...</div>{' '}
        {/* Div de carregamento */}
      </div>
    )
  }

  return (
    <div className="gerenciar-usuarios">
      {' '}
      {/* Div principal */}
      <div className="header-usuarios">
        {' '}
        {/* Div do cabeçalho */}
        <div className="titulo-secao">
          {' '}
          {/* Div do título da seção */}
          <Users size={28} />
          <h2>Gerenciar Usuários</h2>
        </div>
        <button
          className="btn-adicionar" // Botão de adicionar usuário
          onClick={() => setMostrarForm(!mostrarForm)} // Função para alternar o formulário
        >
          <UserPlus size={18} />
          {mostrarForm ? 'Cancelar' : 'Novo Usuário'}{' '}
          {/* Se mostrarForm for verdadeiro, mostra "Cancelar", se não, mostra "Novo Usuário" */}
        </button>
      </div>
      {mensagem.texto && ( // Se mensagem.texto for verdadeiro
        <div className={`mensagem mensagem-${mensagem.tipo}`}>
          {' '}
          {/* Div da mensagem */}
          {mensagem.tipo === 'sucesso' ? ( // Se mensagem.tipo for "sucesso"
            <CheckCircle size={18} />
          ) : (
            <AlertCircle size={18} />
          )}
          <span>{mensagem.texto}</span> {/* Mostra o texto da mensagem */}
        </div>
      )}
      {mostrarForm && ( // Se mostrarForm for verdadeiro
        <div className="form-usuario-card">
          {' '}
          {/* Div do formulário do usuário */}
          <h3>Criar Novo Usuário</h3>
          <form onSubmit={handleSubmit} className="form-usuario">
            {' '}
            {/* Formulário do usuário */}
            <div className="form-row">
              {' '}
              {/* Div da linha do formulário */}
              <div className="form-group">
                {' '}
                {/* Div do grupo do formulário */}
                <label>
                  <UserIcon size={16} />
                  Nome Completo
                </label>
                <input
                  type="text"
                  value={novoUsuario.nome} // Valor do input
                  onChange={
                    (
                      e // Função para atualizar o valor do input
                    ) =>
                      setNovoUsuario({ ...novoUsuario, nome: e.target.value }) // Atualiza o valor do input
                  }
                  placeholder="Nome do usuário" // Placeholder do input
                />
              </div>
              <div className="form-group">
                {' '}
                {/* Div do grupo do formulário */}
                <label>
                  <Mail size={16} />
                  Email
                </label>
                <input
                  type="email"
                  value={novoUsuario.email}
                  onChange={(e) =>
                    setNovoUsuario({ ...novoUsuario, email: e.target.value }) // Atualiza o valor do input
                  }
                  placeholder="email@exemplo.com" // Placeholder do input
                />
              </div>
            </div>
            <div className="form-row"> {/* Div da linha do formulário */}
              <div className="form-group"> {/* Div do grupo do formulário */}
                <label>
                  <Lock size={16} />
                  Senha (mínimo 6 caracteres)
                </label>
                <input
                  type="password"
                  value={novoUsuario.senha}
                  onChange={(e) =>
                    setNovoUsuario({ ...novoUsuario, senha: e.target.value }) // Atualiza o valor do input
                  }
                  placeholder="••••••••"
                  minLength="6"
                />
              </div>

              <div className="form-group"> {/* Div do grupo do formulário */}
                <label>
                  <Shield size={16} />
                  Tipo de Usuário
                </label>
                <select
                  value={novoUsuario.tipo}
                  onChange={(e) =>
                    setNovoUsuario({ ...novoUsuario, tipo: e.target.value }) // Atualiza o valor do input
                  }
                >
                  <option value="usuario">Usuário Padrão</option> {/* Opção de usuário padrão */}
                  <option value="admin">Administrador</option> {/* Opção de administrador */}
                  <option value="presi">Presi</option> {/* Opção de PRESI */}
                  <option value="diretor">Diretor</option> {/* Opção de DIRETOR */}
                  <option value="gecon">Gecon</option> {/* Opção de GECON */}
                  <option value="presi">Secre</option> {/* Opção de SECRE */}
                  <option value="diretor">Conse</option> {/* Opção de CONSE */}
                </select>
              </div>
            </div>
            <div className="form-actions"> {/* Div das ações do formulário */}
              <button type="submit" className="btn-salvar"> {/* Botão de salvar */}
                <UserPlus size={18} />
                Criar Usuário
              </button>
            </div>
          </form>
        </div>
      )}
      <div className="lista-usuarios"> {/* Div da lista de usuários */}
        <div className="usuarios-stats"> {/* Div das estatísticas de usuários */}
          <div className="stat-card"> {/* Cartão da estatística de usuários */}
            <Users size={24} />
            <div>
              <span className="stat-numero">{usuarios.length}</span> {/* Número de usuários */}
              <span className="stat-label">Total de Usuários</span> {/* Etiqueta da estatística de usuários */}
            </div>
          </div>
          <div className="stat-card"> {/* Cartão da estatística de usuários */}
            <Shield size={24} />
            <div>
              <span className="stat-numero"> {/* Número de administradores */}
                {usuarios.filter((u) => u.tipo === 'admin').length} {/* Filtro de administradores */}
              </span>
              <span className="stat-label">Administradores</span> {/* Etiqueta da estatística de usuários */}
            </div>
          </div>
          <div className="stat-card"> {/* Cartão da estatística de usuários */}
            <CheckCircle size={24} />
            <div>
              <span className="stat-numero"> {/* Número de usuários ativos */}
                {usuarios.filter((u) => u.ativo).length} {/* Filtro de usuários ativos */}
              </span>
              <span className="stat-label">Usuários Ativos</span> {/* Etiqueta da estatística de usuários */}
            </div>
          </div>
        </div>

        <div className="tabela-usuarios"> {/* Div da tabela de usuários */}
          {usuarios.map((usuario) => ( // Mapeamento dos usuários
            <div key={usuario.id} className="usuario-card"> {/* Cartão do usuário */}
              <div className="usuario-info"> {/* Div das informações do usuário */}
                <div className="usuario-avatar"> {/* Div do avatar do usuário */}
                  {usuario.tipo === 'admin' ? ( // Se o usuário é admin
                    <Shield size={24} />
                  ) : (
                    <UserIcon size={24} />
                  )}
                </div>
                <div className="usuario-detalhes"> {/* Div das detalhes do usuário */}
                  <div className="usuario-nome-linha"> {/* Div do nome e linha do usuário */}
                    <h4>{usuario.nome}</h4> {/* Nome do usuário */}
                    <span className={`badge badge-${usuario.tipo}`}> {/* Etiqueta do tipo de usuário */}
                      {usuario.tipo === 'admin' ? 'Administrador' : 'Usuário'} {/* Se o usuário é admin, mostra "Administrador", senão, mostra "Usuário" */}
                    </span>
                    <span
                      className={`badge badge-${  // Etiqueta do status do usuário
                        usuario.ativo ? 'ativo' : 'inativo' // Se o usuário é ativo, mostra "Ativo", senão, mostra "Inativo"
                      }`}
                    >
                      {usuario.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  <p className="usuario-email"> {/* Parágrafo do email do usuário */}
                    <Mail size={14} />
                    {usuario.email} 
                  </p>
                  <div className="usuario-datas"> {/* Div das datas do usuário */}
                    <span>
                      <Calendar size={14} />
                      Criado: {formatarData(usuario.dataCriacao)} {/* Data de criação do usuário */}
                    </span>
                    <span>
                      <Clock size={14} />
                      Último acesso: {formatarData(usuario.ultimoAcesso)} {/* Último acesso do usuário */}
                    </span>
                  </div>
                </div>
              </div>

              {usuario.id !== usuarioAtual.id && ( // Se o usuário atual não é o usuário atual
                <div className="usuario-acoes"> {/* Div das ações do usuário */}
                  <button
                    className={`btn-status ${ // Classe do botão de status
                      usuario.ativo ? 'btn-desativar' : 'btn-ativar' // Se o usuário é ativo, mostra "btn-desativar", senão, mostra "btn-ativar"
                    }`}
                    onClick={() => alterarStatus(usuario.id, usuario.ativo)} 
                    title={
                      usuario.ativo ? 'Desativar usuário' : 'Ativar usuário' // Se o usuário é ativo, mostra "Desativar usuário", senão, mostra "Ativar usuário"
                    }
                  >
                    {usuario.ativo ? ( // Se o usuário é ativo
                      <XCircle size={18} />
                    ) : (
                      <CheckCircle size={18} />
                    )}
                    {usuario.ativo ? 'Desativar' : 'Ativar'}
                  </button>
                  <button
                    className="btn-excluir" // Classe do botão de exclusão
                    onClick={() => excluirUsuario(usuario.id, usuario.nome)} // Função de exclusão
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
  )
}

export default GerenciarUsuarios  // Exporta o componente
