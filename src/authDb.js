import Dexie from 'dexie'

// Criar banco de dados de autenticação
export const authDb = new Dexie('SistemaCentrusAuth')

// Versão 2 - Adicionar suporte a permissões de viagens
authDb
  .version(2)
  .stores({
    usuarios:
      '++id, email, nome, senha, tipo, ativo, dataCriacao, ultimoAcesso, permissoes, podeCriarViagens, podeAprovarViagens, podeExcluirViagens',
    sessoes: '++id, usuarioId, token, dataExpiracao',
    permissoes: '++id, nome',
    usuarioPermissoes: '++id, usuarioId, permissaoId',
  })
  .upgrade(async (tx) => {
    // Migração: adicionar campos de permissões de viagem aos usuários existentes
    const usuarios = await tx.table('usuarios').toArray()
    for (const usuario of usuarios) {
      if (!usuario.permissoes) {
        await tx.table('usuarios').update(usuario.id, {
          permissoes: [],
          podeCriarViagens: false,
          podeAprovarViagens: false,
          podeExcluirViagens: false,
        })
      }
    }
    console.log(
      'Migração concluída: campos de permissões de viagem adicionados aos usuários'
    )
  })

// Classe para gerenciar usuários
class Usuario {
  constructor(dados) {
    this.id = dados.id
    this.nome = dados.nome
    this.email = dados.email
    this.senha = dados.senha
    this.tipo = dados.tipo || 'usuario'
    this.ativo = dados.ativo !== undefined ? dados.ativo : true
    this.dataCriacao = dados.dataCriacao || new Date().toISOString()
    this.ultimoAcesso = dados.ultimoAcesso || null
    this.permissoes = dados.permissoes || []
    this.podeCriarViagens = dados.podeCriarViagens || false
    this.podeAprovarViagens = dados.podeAprovarViagens || false
    this.podeExcluirViagens = dados.podeExcluirViagens || false
  }
}

// Funções auxiliares de criptografia
const hashSenha = async (senha) => {
  const encoder = new TextEncoder()
  const data = encoder.encode(senha)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

const verificarSenha = async (senha, hash) => {
  const senhaHash = await hashSenha(senha)
  return senhaHash === hash
}

// Gerar token de sessão
const gerarToken = () => {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

// Inicializar banco com usuário admin padrão
export const inicializarAuth = async () => {
  const usuariosCount = await authDb.usuarios.count()

  if (usuariosCount === 0) {
    // Criar usuário administrador padrão
    const senhaHash = await hashSenha('admin123')
    await authDb.usuarios.add({
      nome: 'Administrador',
      email: 'admin@centrus.com',
      senha: senhaHash,
      tipo: 'admin',
      ativo: true,
      dataCriacao: new Date().toISOString(),
      permissoes: [],
      podeCriarViagens: true,
      podeAprovarViagens: true,
      podeExcluirViagens: true,
    })

    // Criar permissões padrão
    const permissoes = [
      { nome: 'cadastro_funcionarios' },
      { nome: 'documentos_funcionarios' },
      { nome: 'solicitar_viagens' },
      { nome: 'aprovar_viagens' },
      { nome: 'gerenciar_usuarios' },
      { nome: 'anexos_viagem' }, // ⬅️ PERMISSÃO DE ANEXOS
    ]

    await authDb.permissoes.bulkAdd(permissoes)

    console.log('Usuário admin criado: admin@centrus.com / admin123')
  }
}

// ==================== PERMISSÕES DISPONÍVEIS ====================
// Array com todas as permissões do sistema e suas descrições
export const permissoesDisponiveis = [
  {
    id: 'cadastro_funcionarios',
    nome: 'Cadastro de Funcionários',
    descricao: 'Criar, editar e excluir funcionários',
    categoria: 'funcionarios',
  },
  {
    id: 'documentos_funcionarios',
    nome: 'Documentos de Funcionários',
    descricao: 'Gerenciar documentos dos funcionários',
    categoria: 'funcionarios',
  },
  {
    id: 'solicitar_viagens',
    nome: 'Solicitação de Viagem',
    descricao: 'Criar e gerenciar solicitações de viagem',
    categoria: 'viagens',
  },
  {
    id: 'aprovar_viagens',
    nome: 'Aprovação de Viagem',
    descricao: 'Aprovar ou rejeitar solicitações de viagem',
    categoria: 'viagens',
  },
  {
    id: 'anexos_viagem',
    nome: 'Anexos de Viagem',
    descricao: 'Anexar e gerenciar arquivos em viagens aprovadas',
    categoria: 'viagens', // ⬅️ NOVA PERMISSÃO!
  },
  {
    id: 'gerenciar_usuarios',
    nome: 'Gerenciar Usuários',
    descricao: 'Criar, editar e excluir usuários do sistema',
    categoria: 'admin',
  },
]

// Serviço de Autenticação
export const AuthService = {
  // Login
  login: async (email, senha) => {
    try {
      const usuario = await authDb.usuarios.where('email').equals(email).first()

      if (!usuario) {
        throw new Error('Usuário não encontrado')
      }

      if (!usuario.ativo) {
        throw new Error('Usuário inativo')
      }

      const senhaValida = await verificarSenha(senha, usuario.senha)

      if (!senhaValida) {
        throw new Error('Senha incorreta')
      }

      // Atualizar último acesso
      await authDb.usuarios.update(usuario.id, {
        ultimoAcesso: new Date().toISOString(),
      })

      // Criar sessão
      const token = gerarToken()
      const dataExpiracao = new Date()
      dataExpiracao.setHours(dataExpiracao.getHours() + 8) // 8 horas

      await authDb.sessoes.add({
        usuarioId: usuario.id,
        token: token,
        dataExpiracao: dataExpiracao.toISOString(),
      })

      // Salvar no localStorage
      localStorage.setItem('authToken', token)
      localStorage.setItem('usuarioId', usuario.id)

      return {
        sucesso: true,
        usuario: {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          tipo: usuario.tipo,
          permissoes: usuario.permissoes || [],
          podeCriarViagens: usuario.podeCriarViagens || false,
          podeAprovarViagens: usuario.podeAprovarViagens || false,
          podeExcluirViagens: usuario.podeExcluirViagens || false,
        },
        token: token,
      }
    } catch (error) {
      console.error('Erro no login:', error)
      return {
        sucesso: false,
        erro: error.message,
      }
    }
  },

  // Logout
  logout: async () => {
    const token = localStorage.getItem('authToken')
    if (token) {
      const sessao = await authDb.sessoes.where('token').equals(token).first()
      if (sessao) {
        await authDb.sessoes.delete(sessao.id)
      }
    }
    localStorage.removeItem('authToken')
    localStorage.removeItem('usuarioId')
  },

  // Verificar se está autenticado
  estaAutenticado: async () => {
    const token = localStorage.getItem('authToken')
    if (!token) return false

    const sessao = await authDb.sessoes.where('token').equals(token).first()

    if (!sessao) {
      return false
    }

    // Verificar se a sessão expirou
    if (new Date(sessao.dataExpiracao) < new Date()) {
      await authDb.sessoes.delete(sessao.id)
      localStorage.removeItem('authToken')
      localStorage.removeItem('usuarioId')
      return false
    }

    return true
  },

  // Obter usuário atual
  obterUsuarioAtual: async () => {
    const usuarioId = parseInt(localStorage.getItem('usuarioId'))
    if (!usuarioId) return null

    const usuario = await authDb.usuarios.get(usuarioId)
    if (!usuario) return null

    return {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      tipo: usuario.tipo,
      permissoes: usuario.permissoes || [],
      podeCriarViagens: usuario.podeCriarViagens || false,
      podeAprovarViagens: usuario.podeAprovarViagens || false,
      podeExcluirViagens: usuario.podeExcluirViagens || false,
    }
  },

  // Criar novo usuário (apenas admin)
  criarUsuario: async (dados) => {
    try {
      // Verificar se o usuário atual é admin
      const usuarioAtual = await AuthService.obterUsuarioAtual()

      if (!usuarioAtual || usuarioAtual.tipo !== 'admin') {
        throw new Error('Apenas administradores podem criar usuários')
      }

      const usuarioExiste = await authDb.usuarios
        .where('email')
        .equals(dados.email)
        .first()
      if (usuarioExiste) {
        throw new Error('Email já cadastrado')
      }

      const senhaHash = await hashSenha(dados.senha)

      // Criar novo usuário
      const novoUsuario = {
        nome: dados.nome,
        email: dados.email,
        senha: senhaHash,
        tipo: dados.tipo || 'usuario',
        ativo: true,
        dataCriacao: new Date().toISOString(),
        permissoes: Array.isArray(dados.permissoes) ? dados.permissoes : [],
        podeCriarViagens: dados.podeCriarViagens || false,
        podeAprovarViagens: dados.podeAprovarViagens || false,
        podeExcluirViagens: dados.podeExcluirViagens || false,
      }

      const id = await authDb.usuarios.add(novoUsuario)

      console.log('Usuário criado com permissões:', novoUsuario.permissoes)

      return {
        sucesso: true,
        usuario: { id, ...novoUsuario, senha: undefined },
      }
    } catch (error) {
      console.error('Erro ao criar usuário:', error)
      return {
        sucesso: false,
        erro: error.message,
      }
    }
  },

  // ========== ✅ FUNÇÃO EDITARUSUARIO ADICIONADA! ==========
  /**
   * Editar um usuário existente (apenas admin)
   * Esta é a função que estava faltando!
   */
  editarUsuario: async (usuarioId, dadosAtualizacao) => {
    try {
      console.log('🔄 Editando usuário:', usuarioId, dadosAtualizacao)

      // Verificar se o usuário atual é admin
      const usuarioAtual = await AuthService.obterUsuarioAtual()
      if (!usuarioAtual || usuarioAtual.tipo !== 'admin') {
        throw new Error('Apenas administradores podem editar usuários')
      }

      // Buscar o usuário que será editado
      const usuario = await authDb.usuarios.get(usuarioId)
      
      if (!usuario) {
        return { 
          sucesso: false, 
          erro: 'Usuário não encontrado' 
        }
      }

      // Verificar se o email está sendo alterado e se já existe
      if (dadosAtualizacao.email && dadosAtualizacao.email !== usuario.email) {
        const emailExiste = await authDb.usuarios
          .where('email')
          .equalsIgnoreCase(dadosAtualizacao.email)
          .first()
        
        if (emailExiste && emailExiste.id !== usuarioId) {
          return { 
            sucesso: false, 
            erro: 'Este email já está em uso por outro usuário' 
          }
        }
      }

      // Preparar dados para atualização
      const dadosParaAtualizar = {
        nome: dadosAtualizacao.nome || usuario.nome,
        email: dadosAtualizacao.email || usuario.email,
        tipo: dadosAtualizacao.tipo || usuario.tipo,
        permissoes: Array.isArray(dadosAtualizacao.permissoes) 
          ? dadosAtualizacao.permissoes 
          : usuario.permissoes || [],
        podeCriarViagens: dadosAtualizacao.podeCriarViagens ?? usuario.podeCriarViagens ?? false,
        podeAprovarViagens: dadosAtualizacao.podeAprovarViagens ?? usuario.podeAprovarViagens ?? false,
        podeExcluirViagens: dadosAtualizacao.podeExcluirViagens ?? usuario.podeExcluirViagens ?? false,
      }

      // Se a senha foi fornecida, criptografar e atualizar
      if (dadosAtualizacao.senha && dadosAtualizacao.senha.trim() !== '') {
        dadosParaAtualizar.senha = await hashSenha(dadosAtualizacao.senha)
        console.log('🔐 Senha atualizada')
      }

      // Atualizar o usuário no banco
      await authDb.usuarios.update(usuarioId, dadosParaAtualizar)

      console.log('✅ Usuário atualizado com sucesso')
      
      return { 
        sucesso: true, 
        usuario: { id: usuarioId, ...dadosParaAtualizar, senha: undefined } 
      }
    } catch (error) {
      console.error('❌ Erro ao editar usuário:', error)
      return { 
        sucesso: false, 
        erro: 'Erro ao atualizar usuário: ' + error.message 
      }
    }
  },
  // ========== FIM DA FUNÇÃO EDITARUSUARIO ==========

  // Registrar novo usuário (auto-registro)
  registrar: async (dados) => {
    try {
      const usuarioExiste = await authDb.usuarios
        .where('email')
        .equals(dados.email)
        .first()
      if (usuarioExiste) {
        throw new Error('Email já cadastrado')
      }

      const senhaHash = await hashSenha(dados.senha)

      const novoUsuario = {
        nome: dados.nome,
        email: dados.email,
        senha: senhaHash,
        tipo: dados.tipo || 'usuario',
        ativo: true,
        dataCriacao: new Date().toISOString(),
        permissoes: Array.isArray(dados.permissoes) ? dados.permissoes : [],
        podeCriarViagens: dados.podeCriarViagens || false,
        podeAprovarViagens: dados.podeAprovarViagens || false,
        podeExcluirViagens: dados.podeExcluirViagens || false,
      }

      const id = await authDb.usuarios.add(novoUsuario)

      return {
        sucesso: true,
        usuario: { id, ...novoUsuario, senha: undefined },
      }
    } catch (error) {
      return {
        sucesso: false,
        erro: error.message,
      }
    }
  },

  // Listar todos os usuários (apenas admin)
  listarUsuarios: async () => {
    const usuarioAtual = await AuthService.obterUsuarioAtual()

    if (!usuarioAtual || usuarioAtual.tipo !== 'admin') {
      throw new Error('Apenas administradores podem listar usuários')
    }

    const usuarios = await authDb.usuarios.toArray()
    return usuarios.map((u) => ({
      id: u.id,
      nome: u.nome,
      email: u.email,
      tipo: u.tipo,
      ativo: u.ativo,
      dataCriacao: u.dataCriacao,
      ultimoAcesso: u.ultimoAcesso,
      permissoes: u.permissoes || [],
      podeCriarViagens: u.podeCriarViagens || false,
      podeAprovarViagens: u.podeAprovarViagens || false,
      podeExcluirViagens: u.podeExcluirViagens || false,
    }))
  },

  // Atualizar usuário (apenas admin) - MANTIDO PARA COMPATIBILIDADE
  atualizarUsuario: async (id, dados) => {
    const usuarioAtual = await AuthService.obterUsuarioAtual()

    if (!usuarioAtual || usuarioAtual.tipo !== 'admin') {
      throw new Error('Apenas administradores podem atualizar usuários')
    }

    const dadosAtualizacao = {
      nome: dados.nome,
      email: dados.email,
      tipo: dados.tipo,
      ativo: dados.ativo,
      permissoes: Array.isArray(dados.permissoes) ? dados.permissoes : [],
      podeCriarViagens: dados.podeCriarViagens || false,
      podeAprovarViagens: dados.podeAprovarViagens || false,
      podeExcluirViagens: dados.podeExcluirViagens || false,
    }

    // Se senha foi fornecida, atualizar
    if (dados.senha && dados.senha.trim() !== '') {
      dadosAtualizacao.senha = await hashSenha(dados.senha)
    }

    await authDb.usuarios.update(id, dadosAtualizacao)

    return {
      sucesso: true,
      mensagem: 'Usuário atualizado com sucesso',
    }
  },

  // Alterar status do usuário (ativar/desativar)
  alterarStatusUsuario: async (usuarioId, novoStatus) => {
    const usuarioAtual = await AuthService.obterUsuarioAtual()

    if (!usuarioAtual || usuarioAtual.tipo !== 'admin') {
      throw new Error('Apenas administradores podem alterar status de usuários')
    }

    if (usuarioAtual.id === usuarioId) {
      throw new Error('Você não pode desativar sua própria conta')
    }

    await authDb.usuarios.update(usuarioId, { ativo: novoStatus })

    return {
      sucesso: true,
      mensagem: `Usuário ${novoStatus ? 'ativado' : 'desativado'} com sucesso`,
    }
  },

  // Excluir usuário (apenas admin)
  excluirUsuario: async (id) => {
    const usuarioAtual = await AuthService.obterUsuarioAtual()

    if (!usuarioAtual || usuarioAtual.tipo !== 'admin') {
      throw new Error('Apenas administradores podem excluir usuários')
    }

    if (usuarioAtual.id === id) {
      throw new Error('Você não pode excluir sua própria conta')
    }

    await authDb.usuarios.delete(id)

    return {
      sucesso: true,
      mensagem: 'Usuário excluído com sucesso',
    }
  },

  // Verificar permissão
  temPermissao: async (permissaoId) => {
    const usuario = await AuthService.obterUsuarioAtual()
    if (!usuario) return false
    if (usuario.tipo === 'admin') return true
    return (usuario.permissoes || []).includes(permissaoId)
  },
}

export default AuthService