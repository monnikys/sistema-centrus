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
  FileText,
  FolderOpen,
  PlaneTakeoff,
  BarChart3,
  Settings,
  Edit,
  Key,
  Paperclip, // ⬅️ NOVO ÍCONE
} from 'lucide-react'
import { AuthService } from '../authDb'
import './styles/GerenciarUsuarios.css'

// Definição de todas as páginas disponíveis no sistema
const PAGINAS_DISPONIVEIS = [
  {
    id: 'lista_funcionarios',
    nome: 'Lista de Funcionários',
    icone: Users,
    categoria: 'Funcionários',
  },
  {
    id: 'cadastro_funcionarios',
    nome: 'Cadastrar Funcionários',
    icone: UserPlus,
    categoria: 'Funcionários',
  },
  {
    id: 'documentos_funcionarios',
    nome: 'Documentos de Funcionários',
    icone: FileText,
    categoria: 'Funcionários',
  },
  {
    id: 'relatorios',
    nome: 'Relatórios',
    icone: BarChart3,
    categoria: 'Relatórios',
  },
  {
    id: 'documentos_empresa',
    nome: 'Documentos da Empresa',
    icone: FolderOpen,
    categoria: 'Empresa',
  },
  {
    id: 'solicitacao_viagem',
    nome: 'Solicitação de Viagem',
    icone: PlaneTakeoff,
    categoria: 'Viagens',
  },
  // ⬇️ NOVA PERMISSÃO ADICIONADA!
  {
    id: 'anexos_viagem',
    nome: 'Anexos de Viagem',
    icone: Paperclip,
    categoria: 'Viagens',
  },
  // ⬆️ NOVA PERMISSÃO ADICIONADA!
  {
    id: 'gerenciar_usuarios',
    nome: 'Gerenciar Usuários',
    icone: Settings,
    categoria: 'Administração',
  },
]

const GerenciarUsuarios = ({ usuarioAtual }) => {
  // Componente de gerenciamento de usuários
  const [usuarios, setUsuarios] = useState([]) // Lista de usuários
  const [mostrarForm, setMostrarForm] = useState(false) // Controla se o formulário de criação de usuários deve ser exibido
  const [carregando, setCarregando] = useState(true) // Controla se o carregamento de usuários deve ser exibido
  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' }) // Exibe mensagens de erro ou sucesso
  const [modoEdicao, setModoEdicao] = useState(false) // Controla se está em modo de edição
  const [usuarioEditando, setUsuarioEditando] = useState(null) // Armazena o ID do usuário sendo editado

  const [novoUsuario, setNovoUsuario] = useState({
    // Dados do usuário sendo criado ou editado
    nome: '',
    email: '',
    senha: '',
    tipo: 'usuario',
    permissoes: [], // Array de IDs das páginas que o usuário pode acessar
    podeCriarViagens: false,
    podeAprovarViagens: false,
    podeExcluirViagens: false,
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

  const handlePermissaoChange = (paginaId) => {
    // Função para adicionar ou remover permissões
    setNovoUsuario((prev) => {
      const permissoesAtuais = prev.permissoes || [] // Pega as permissões atuais
      const jaTemPermissao = permissoesAtuais.includes(paginaId) // Verifica se já tem a permissão

      if (jaTemPermissao) {
        // Se já tem, remove
        return {
          ...prev,
          permissoes: permissoesAtuais.filter((p) => p !== paginaId),
        }
      } else {
        // Se não tem, adiciona
        return {
          ...prev,
          permissoes: [...permissoesAtuais, paginaId],
        }
      }
    })
  }

  const selecionarTodasPermissoes = () => {
    // Função para selecionar todas as permissões
    const todasPermissoes = PAGINAS_DISPONIVEIS.map((p) => p.id) // Mapeia todos os IDs das páginas
    setNovoUsuario({ ...novoUsuario, permissoes: todasPermissoes }) // Define todas as permissões
  }

  const limparTodasPermissoes = () => {
    // Função para limpar todas as permissões
    setNovoUsuario({ ...novoUsuario, permissoes: [] }) // Define permissões como array vazio
  }

  const handleTipoChange = (tipo) => {
    // Função para alterar o tipo de usuário
    setNovoUsuario({ ...novoUsuario, tipo }) // Define o tipo de usuário

    if (tipo === 'admin') {
      // Se for admin, seleciona todas as permissões automaticamente
      selecionarTodasPermissoes()
    }
  }

  const iniciarEdicao = (usuario) => {
    // Função para iniciar a edição de um usuário
    setModoEdicao(true) // Ativa o modo de edição
    setUsuarioEditando(usuario.id) // Define o ID do usuário sendo editado
    setNovoUsuario({
      // Preenche o formulário com os dados do usuário
      nome: usuario.nome,
      email: usuario.email,
      senha: '', // Senha vazia por padrão (será preenchida apenas se o admin quiser redefinir)
      tipo: usuario.tipo,
      permissoes: usuario.permissoes || [],
      podeCriarViagens: usuario.podeCriarViagens || false,
      podeAprovarViagens: usuario.podeAprovarViagens || false,
      podeExcluirViagens: usuario.podeExcluirViagens || false,
    })
    setMostrarForm(true) // Exibe o formulário
  }

  const cancelarEdicao = () => {
    // Função para cancelar a edição
    setModoEdicao(false) // Desativa o modo de edição
    setUsuarioEditando(null) // Remove o ID do usuário sendo editado
    setNovoUsuario({
      nome: '',
      email: '',
      senha: '',
      tipo: 'usuario',
      permissoes: [],
      podeCriarViagens: false,
      podeAprovarViagens: false,
      podeExcluirViagens: false,
    }) // Limpa o formulário
    setMostrarForm(false) // Esconde o formulário
  }

  const handleSubmit = async (e) => {
    // Função que será executada ao enviar o formulário
    e.preventDefault() // Evita o recarregamento da página ao enviar o formulário

    if (!novoUsuario.nome || !novoUsuario.email) {
      // Verificar se os campos obrigatórios foram preenchidos
      mostrarMensagem('erro', 'Preencha todos os campos obrigatórios') // Exibir mensagem de erro
      return
    }

    // Validação de senha apenas para criação ou se o admin preencheu o campo de senha na edição
    if (!modoEdicao && !novoUsuario.senha) {
      // Se está criando um novo usuário, senha é obrigatória
      mostrarMensagem('erro', 'A senha é obrigatória') // Exibir mensagem de erro
      return
    }

    if (novoUsuario.senha && novoUsuario.senha.length < 6) {
      // Verificar se a senha tem pelo menos 6 caracteres (se foi preenchida)
      mostrarMensagem('erro', 'A senha deve ter no mínimo 6 caracteres') // Exibir mensagem de erro
      return
    }

    if (novoUsuario.tipo !== 'admin' && novoUsuario.permissoes.length === 0) {
      // Verificar se foi selecionada pelo menos uma permissão para usuários não-admin
      mostrarMensagem('erro', 'Selecione pelo menos uma página de acesso') // Exibir mensagem de erro
      return
    }

    let resultado

    if (modoEdicao) {
      // Se está em modo de edição
      const dadosAtualizacao = {
        // Dados a serem atualizados
        nome: novoUsuario.nome,
        email: novoUsuario.email,
        tipo: novoUsuario.tipo,
        permissoes: novoUsuario.permissoes,
        podeCriarViagens: novoUsuario.podeCriarViagens,
        podeAprovarViagens: novoUsuario.podeAprovarViagens,
        podeExcluirViagens: novoUsuario.podeExcluirViagens,
      }

      // Apenas inclui a senha se ela foi preenchida (para redefinir)
      if (novoUsuario.senha) {
        dadosAtualizacao.senha = novoUsuario.senha
      }

      resultado = await AuthService.editarUsuario(
        usuarioEditando,
        dadosAtualizacao
      ) // Chamar a função para editar usuário
    } else {
      // Se está criando um novo usuário
      resultado = await AuthService.criarUsuario(novoUsuario) // Chamar a função para criar um novo usuário
    }

    if (resultado.sucesso) {
      // Se a operação foi bem-sucedida
      mostrarMensagem(
        'sucesso',
        modoEdicao
          ? 'Usuário atualizado com sucesso!'
          : 'Usuário criado com sucesso!'
      ) // Exibir mensagem de sucesso
      setNovoUsuario({
        nome: '',
        email: '',
        senha: '',
        tipo: 'usuario',
        permissoes: [],
        podeCriarViagens: false,
        podeAprovarViagens: false,
        podeExcluirViagens: false,
      }) // Limpar os campos do formulário
      setMostrarForm(false) // Fechar o formulário
      setModoEdicao(false) // Desativar o modo de edição
      setUsuarioEditando(null) // Limpar o ID do usuário sendo editado
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

  const obterNomePagina = (paginaId) => {
    // Função para obter o nome da página pelo ID
    const pagina = PAGINAS_DISPONIVEIS.find((p) => p.id === paginaId) // Busca a página pelo ID
    return pagina ? pagina.nome : paginaId // Retorna o nome da página ou o ID se não encontrar
  }

  // Agrupar páginas por categoria
  const categorias = PAGINAS_DISPONIVEIS.reduce((acc, pagina) => {
    if (!acc[pagina.categoria]) {
      acc[pagina.categoria] = []
    }
    acc[pagina.categoria].push(pagina)
    return acc
  }, {})

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
          onClick={() => {
            // Função para alternar o formulário
            if (mostrarForm && modoEdicao) {
              // Se está mostrando o formulário E está em modo de edição
              cancelarEdicao() // Cancela a edição
            } else {
              setMostrarForm(!mostrarForm) // Alterna a exibição do formulário
            }
          }}
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
          <h3>{modoEdicao ? 'Editar Usuário' : 'Criar Novo Usuário'}</h3>
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
                  onChange={
                    (e) =>
                      setNovoUsuario({ ...novoUsuario, email: e.target.value }) // Atualiza o valor do input
                  }
                  placeholder="email@exemplo.com" // Placeholder do input
                />
              </div>
            </div>
            <div className="form-row">
              {' '}
              {/* Div da linha do formulário */}
              <div className="form-group">
                {' '}
                {/* Div do grupo do formulário */}
                <label>
                  <Lock size={16} />
                  {modoEdicao
                    ? 'Nova Senha (deixe em branco para manter)'
                    : 'Senha (mínimo 6 caracteres)'}
                </label>
                <input
                  type="password"
                  value={novoUsuario.senha}
                  onChange={
                    (e) =>
                      setNovoUsuario({ ...novoUsuario, senha: e.target.value }) // Atualiza o valor do input
                  }
                  placeholder={
                    modoEdicao ? 'Deixe em branco para não alterar' : '••••••••'
                  }
                  minLength="6"
                />
                {modoEdicao && (
                  <small
                    style={{
                      color: '#666',
                      fontSize: '12px',
                      marginTop: '4px',
                      display: 'block',
                    }}
                  >
                    Preencha apenas se desejar redefinir a senha
                  </small>
                )}
              </div>
              <div className="form-group">
                {' '}
                {/* Div do grupo do formulário */}
                <label>
                  <Shield size={16} />
                  Tipo de Usuário
                </label>
                <select
                  value={novoUsuario.tipo}
                  onChange={(e) => handleTipoChange(e.target.value)} // Função para alterar o tipo e atualizar permissões
                >
                  <option value="usuario">Usuário Padrão</option>{' '}
                  {/* Opção de usuário padrão */}
                  <option value="admin">Administrador</option>{' '}
                  {/* Opção de administrador */}
                  <option value="presi">Presi</option> {/* Opção de PRESI */}
                  <option value="diretor">Diretor</option>{' '}
                  {/* Opção de DIRETOR */}
                  <option value="gecon">Gecon</option> {/* Opção de GECON */}
                  <option value="secre">Secre</option> {/* Opção de SECRE */}
                  <option value="conse">Conse</option> {/* Opção de CONSE */}
                </select>
              </div>
            </div>
            {/* SEÇÃO DE PERMISSÕES DE VIAGEM */}
            <div className="form-group">
              {/* Seção de permissões de viagem */}
              <label style={{ marginBottom: '12px', display: 'block' }}>
                <Shield size={18} />
                Permissões de Solicitação de Viagem
              </label>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  padding: '15px',
                  background: '#f8f9fa',
                  borderRadius: '8px',
                  border: '1px solid #e0e0e0',
                }}
              >
                {/* Checkbox: Pode Criar */}
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    padding: '8px 12px',
                    background: novoUsuario.podeCriarViagens
                      ? '#d1ecf1'
                      : 'white',
                    borderRadius: '6px',
                    border: novoUsuario.podeCriarViagens
                      ? '2px solid #17a2b8'
                      : '2px solid #dee2e6',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={novoUsuario.podeCriarViagens}
                    onChange={(e) =>
                      setNovoUsuario({
                        ...novoUsuario,
                        podeCriarViagens: e.target.checked,
                      })
                    }
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <PlaneTakeoff size={16} />
                  <span style={{ fontWeight: 500, fontSize: '14px' }}>
                    Pode Criar Solicitações
                  </span>
                </label>

                {/* Checkbox: Pode Aprovar/Recusar */}
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    padding: '8px 12px',
                    background: novoUsuario.podeAprovarViagens
                      ? '#d4edda'
                      : 'white',
                    borderRadius: '6px',
                    border: novoUsuario.podeAprovarViagens
                      ? '2px solid #28a745'
                      : '2px solid #dee2e6',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={novoUsuario.podeAprovarViagens}
                    onChange={(e) =>
                      setNovoUsuario({
                        ...novoUsuario,
                        podeAprovarViagens: e.target.checked,
                      })
                    }
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <CheckCircle size={16} />
                  <span style={{ fontWeight: 500, fontSize: '14px' }}>
                    Pode Aprovar/Recusar Solicitações
                  </span>
                </label>

                {/* Checkbox: Pode Excluir */}
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    padding: '8px 12px',
                    background: novoUsuario.podeExcluirViagens
                      ? '#f8d7da'
                      : 'white',
                    borderRadius: '6px',
                    border: novoUsuario.podeExcluirViagens
                      ? '2px solid #dc3545'
                      : '2px solid #dee2e6',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={novoUsuario.podeExcluirViagens}
                    onChange={(e) =>
                      setNovoUsuario({
                        ...novoUsuario,
                        podeExcluirViagens: e.target.checked,
                      })
                    }
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <Trash2 size={16} />
                  <span style={{ fontWeight: 500, fontSize: '14px' }}>
                    Pode Excluir Solicitações
                  </span>
                </label>
              </div>
              <small
                style={{
                  display: 'block',
                  marginTop: '8px',
                  color: '#6c757d',
                  fontSize: '12px',
                }}
              >
                Define o que este usuário pode fazer com Solicitações de Viagem
              </small>
            </div>
            {/* FIM DA SEÇÃO DE PERMISSÕES DE VIAGEM */}
            {/* Seção de Permissões */}
            <div className="permissoes-section">
              {' '}
              {/* Seção de permissões */}
              <div className="permissoes-header">
                {' '}
                {/* Cabeçalho das permissões */}
                <label>
                  <Shield size={18} />
                  Permissões de Acesso
                </label>
                <div className="permissoes-actions">
                  {' '}
                  {/* Ações de permissões */}
                  <button
                    type="button"
                    onClick={selecionarTodasPermissoes} // Função para selecionar todas
                    className="btn-selecionar-todos"
                    disabled={novoUsuario.tipo === 'admin'} // Desabilita se for admin
                  >
                    Selecionar Todas
                  </button>
                  <button
                    type="button"
                    onClick={limparTodasPermissoes} // Função para limpar todas
                    className="btn-limpar-todos"
                    disabled={novoUsuario.tipo === 'admin'} // Desabilita se for admin
                  >
                    Limpar Todas
                  </button>
                </div>
              </div>
              {novoUsuario.tipo === 'admin' ? (
                <div className="aviso-admin">
                  {' '}
                  {/* Aviso para admin */}
                  <AlertCircle size={18} />
                  <p>
                    Administradores têm acesso total a todas as funcionalidades
                    do sistema.
                  </p>
                </div>
              ) : (
                <div className="permissoes-grid">
                  {' '}
                  {/* Grid de permissões */}
                  {Object.entries(categorias).map(([categoria, paginas]) => (
                    <div key={categoria} className="categoria-permissoes">
                      {' '}
                      {/* Categoria de permissões */}
                      <h4 className="categoria-titulo">{categoria}</h4>{' '}
                      {/* Título da categoria */}
                      {paginas.map((pagina) => {
                        const Icone = pagina.icone // Pega o ícone da página
                        const isChecked = novoUsuario.permissoes.includes(
                          pagina.id
                        ) // Verifica se a página está selecionada

                        return (
                          <label
                            key={pagina.id}
                            className={`permissao-item ${
                              isChecked ? 'checked' : ''
                            }`}
                          >
                            {' '}
                            {/* Item de permissão */}
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handlePermissaoChange(pagina.id)} // Função para alterar permissão
                            />
                            <Icone size={16} />
                            <span>{pagina.nome}</span> {/* Nome da página */}
                          </label>
                        )
                      })}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="form-actions">
              {' '}
              {/* Div das ações do formulário */}
              <button type="submit" className="btn-salvar">
                {' '}
                {/* Botão de salvar */}
                {modoEdicao ? <Edit size={18} /> : <UserPlus size={18} />}
                {modoEdicao ? 'Atualizar Usuário' : 'Criar Usuário'}
              </button>
            </div>
          </form>
        </div>
      )}
      <div className="lista-usuarios">
        {' '}
        {/* Div da lista de usuários */}
        <div className="usuarios-stats">
          {' '}
          {/* Div das estatísticas de usuários */}
          <div className="stat-card">
            {' '}
            {/* Cartão da estatística de usuários */}
            <Users size={24} />
            <div>
              <span className="stat-numero">{usuarios.length}</span>{' '}
              {/* Número de usuários */}
              <span className="stat-label">Total de Usuários</span>{' '}
              {/* Etiqueta da estatística de usuários */}
            </div>
          </div>
          <div className="stat-card">
            {' '}
            {/* Cartão da estatística de usuários */}
            <Shield size={24} />
            <div>
              <span className="stat-numero">
                {' '}
                {/* Número de administradores */}
                {usuarios.filter((u) => u.tipo === 'admin').length}{' '}
                {/* Filtro de administradores */}
              </span>
              <span className="stat-label">Administradores</span>{' '}
              {/* Etiqueta da estatística de usuários */}
            </div>
          </div>
          <div className="stat-card">
            {' '}
            {/* Cartão da estatística de usuários */}
            <CheckCircle size={24} />
            <div>
              <span className="stat-numero">
                {' '}
                {/* Número de usuários ativos */}
                {usuarios.filter((u) => u.ativo).length}{' '}
                {/* Filtro de usuários ativos */}
              </span>
              <span className="stat-label">Usuários Ativos</span>{' '}
              {/* Etiqueta da estatística de usuários */}
            </div>
          </div>
        </div>
        <div className="tabela-usuarios">
          {' '}
          {/* Div da tabela de usuários */}
          {usuarios.map(
            (
              usuario // Mapeamento dos usuários
            ) => (
              <div key={usuario.id} className="usuario-card">
                {' '}
                {/* Cartão do usuário */}
                <div className="usuario-info">
                  {' '}
                  {/* Div das informações do usuário */}
                  <div className="usuario-avatar">
                    {' '}
                    {/* Div do avatar do usuário */}
                    {usuario.tipo === 'admin' ? ( // Se o usuário é admin
                      <Shield size={24} />
                    ) : (
                      <UserIcon size={24} />
                    )}
                  </div>
                  <div className="usuario-detalhes">
                    {' '}
                    {/* Div das detalhes do usuário */}
                    <div className="usuario-nome-linha">
                      {' '}
                      {/* Div do nome e linha do usuário */}
                      <h4>{usuario.nome}</h4> {/* Nome do usuário */}
                      <span className={`badge badge-${usuario.tipo}`}>
                        {' '}
                        {/* Etiqueta do tipo de usuário */}
                        {usuario.tipo === 'admin'
                          ? 'Administrador'
                          : 'Usuário'}{' '}
                        {/* Se o usuário é admin, mostra "Administrador", senão, mostra "Usuário" */}
                      </span>
                      <span
                        className={`badge badge-${
                          // Etiqueta do status do usuário
                          usuario.ativo ? 'ativo' : 'inativo' // Se o usuário é ativo, mostra "Ativo", senão, mostra "Inativo"
                        }`}
                      >
                        {usuario.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                    <p className="usuario-email">
                      {' '}
                      {/* Parágrafo do email do usuário */}
                      <Mail size={14} />
                      {usuario.email}
                    </p>
                    {/* SEÇÃO DE BADGES DE PERMISSÕES DE VIAGEM */}
                    {(usuario.podeCriarViagens ||
                      usuario.podeAprovarViagens ||
                      usuario.podeExcluirViagens) && (
                      <div
                        style={{
                          display: 'flex',
                          gap: '8px',
                          marginTop: '8px',
                          marginBottom: '8px',
                          flexWrap: 'wrap',
                        }}
                      >
                        {usuario.podeCriarViagens && (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '4px 10px',
                              background: '#d1ecf1',
                              color: '#0c5460',
                              borderRadius: '12px',
                              fontSize: '11px',
                              fontWeight: '600',
                            }}
                          >
                            <PlaneTakeoff size={12} />
                            Criar Viagens
                          </span>
                        )}
                        {usuario.podeAprovarViagens && (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '4px 10px',
                              background: '#d4edda',
                              color: '#155724',
                              borderRadius: '12px',
                              fontSize: '11px',
                              fontWeight: '600',
                            }}
                          >
                            <CheckCircle size={12} />
                            Aprovar/Reprovar Viagens
                          </span>
                        )}
                        {usuario.podeExcluirViagens && (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '4px 10px',
                              background: '#f8d7da',
                              color: '#721c24',
                              borderRadius: '12px',
                              fontSize: '11px',
                              fontWeight: '600',
                            }}
                          >
                            <Trash2 size={12} />
                            Excluir Viagens
                          </span>
                        )}
                      </div>
                    )}
                    {/* FIM DA SEÇÃO DE BADGES */}
                    {/* Mostrar permissões do usuário */}
                    {usuario.tipo !== 'admin' &&
                      usuario.permissoes &&
                      usuario.permissoes.length > 0 && (
                        <div className="usuario-permissoes">
                          {' '}
                          {/* Div das permissões do usuário */}
                          <strong>Acessos:</strong>
                          <div className="permissoes-badges">
                            {' '}
                            {/* Badges das permissões */}
                            {usuario.permissoes
                              .slice(0, 3)
                              .map((permissaoId) => (
                                <span
                                  key={permissaoId}
                                  className="badge-permissao"
                                >
                                  {obterNomePagina(permissaoId)}
                                </span>
                              ))}
                            {usuario.permissoes.length > 3 && (
                              <span className="badge-permissao badge-mais">
                                +{usuario.permissoes.length - 3} mais
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    <div className="usuario-datas">
                      {' '}
                      {/* Div das datas do usuário */}
                      <span>
                        <Calendar size={14} />
                        Criado: {formatarData(usuario.dataCriacao)}{' '}
                        {/* Data de criação do usuário */}
                      </span>
                      <span>
                        <Clock size={14} />
                        Último acesso: {formatarData(usuario.ultimoAcesso)}{' '}
                        {/* Último acesso do usuário */}
                      </span>
                    </div>
                  </div>
                </div>
                {usuario.id !== usuarioAtual.id && ( // Se o usuário atual não é o usuário atual
                  <div className="usuario-acoes">
                    {' '}
                    {/* Div das ações do usuário */}
                    <button
                      className="btn-editar" // Botão de editar
                      onClick={() => iniciarEdicao(usuario)} // Função para iniciar edição
                      title="Editar usuário"
                    >
                      <Edit size={18} />
                      Editar
                    </button>
                    <button
                      className={`btn-status ${
                        // Classe do botão de status
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
            )
          )}
        </div>
      </div>
    </div>
  )
}

export default GerenciarUsuarios;