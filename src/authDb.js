import Dexie from 'dexie'

// Criar banco de dados de autenticação
export const authDb = new Dexie('SistemaCentrusAuth')

authDb
  .version(2)
  .stores({
    usuarios:
      '++id, email, nome, senha, tipo, ativo, dataCriacao, ultimoAcesso, permissoes, podeCriarViagens, podeAprovarViagens, podeExcluirViagens', // Campos atualizados
    sessoes: 
      '++id, usuarioId, token, dataExpiracao',
    permissoes: 
      '++id, nome',
    usuarioPermissoes:
       '++id, usuarioId, permissaoId',
  })
  .upgrade(async (tx) => {
    // Migração: adicionar campos de permissões de viagem aos usuários existentes
    const usuarios = await tx.table('usuarios').toArray()
    for (const usuario of usuarios) {
      if (!usuario.permissoes) {
        await tx.table('usuarios').update(usuario.id, {
          permissoes: [],
          podeCriarViagens: false, // NOVO: Pode criar solicitações de viagem
          podeAprovarViagens: false, // NOVO: Pode aprovar/recusar solicitações de viagem
          podeExcluirViagens: false, // NOVO: Pode excluir solicitações de viagem
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
    // Construtor para inicializar dados do usuário
    this.id = dados.id // ID do usuário
    this.nome = dados.nome // Nome do usuário
    this.email = dados.email // Email do usuário
    this.senha = dados.senha // Senha (hash)
    this.tipo = dados.tipo || 'usuario' // 'admin' ou 'usuario' // Tipo do usuário
    this.ativo = dados.ativo !== undefined ? dados.ativo : true // Usuário ativo ou inativo
    this.dataCriacao = dados.dataCriacao || new Date().toISOString() // Data de criação
    this.ultimoAcesso = dados.ultimoAcesso || null // Último acesso
    this.permissoes = dados.permissoes || [] // Permissões do usuário
    this.podeCriarViagens = dados.podeCriarViagens || false // NOVO: Pode criar solicitações de viagem
    this.podeAprovarViagens = dados.podeAprovarViagens || false // NOVO: Pode aprovar/recusar solicitações
    this.podeExcluirViagens = dados.podeExcluirViagens || false // NOVO: Pode excluir solicitações
  }
}

// Funções auxiliares de criptografia simples (em produção use bcrypt no backend)
const hashSenha = async (senha) => {
  // Função para hash da senha
  const encoder = new TextEncoder() // Codificador de texto
  const data = encoder.encode(senha) // Codificar senha
  const hashBuffer = await crypto.subtle.digest('SHA-256', data) // Gerar hash SHA-256 // SHA-256 é um algoritmo de hash seguro
  const hashArray = Array.from(new Uint8Array(hashBuffer)) // Converter buffer para array
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('') // Converter para string hexadecimal
}

const verificarSenha = async (senha, hash) => {
  // Verificar se a senha corresponde ao hash
  const senhaHash = await hashSenha(senha) // Gerar hash da senha fornecida
  return senhaHash === hash // Comparar com o hash armazenado // Hash é uma representação criptografada da senha
}

// Gerar token de sessão // Token é uma string única usada para identificar a sessão do usuário
const gerarToken = () => {
  // Gerar token aleatório
  return Array.from(crypto.getRandomValues(new Uint8Array(32))) // Gerar 32 bytes aleatórios
    .map((b) => b.toString(16).padStart(2, '0')) // Converter para string hexadecimal
    .join('') // Unir em uma única string
}

// Inicializar banco com usuário admin padrão
export const inicializarAuth = async () => {
  // Função para inicializar o banco de dados de autenticação
  const usuariosCount = await authDb.usuarios.count() // Contar número de usuários

  if (usuariosCount === 0) {
    // Criar usuário administrador padrão
    const senhaHash = await hashSenha('admin123') // Hash da senha padrão
    await authDb.usuarios.add({
      // Adicionar usuário admin
      nome: 'Administrador', // Nome do usuário
      email: 'admin@centrus.com', // Email do usuário
      senha: senhaHash, // Senha (hash)
      tipo: 'admin', // Tipo do usuário
      ativo: true, // Usuário ativo
      dataCriacao: new Date().toISOString(), // Data de criação
      permissoes: [], // Admin não precisa de permissões específicas
      podeCriarViagens: true, // NOVO: Admin pode criar
      podeAprovarViagens: true, // NOVO: Admin pode aprovar
      podeExcluirViagens: true, // NOVO: Admin pode excluir
    })

    // Criar permissões padrão
    const permissoes = [
      { nome: 'visualizar_funcionarios' }, // Chave para visualizar funcionários
      { nome: 'criar_funcionarios' }, // Chave para criar funcionários
      { nome: 'editar_funcionarios' }, // Chave para editar funcionários
      { nome: 'excluir_funcionarios' }, // Chave para excluir funcionários
      { nome: 'gerenciar_documentos' }, // Chave para gerenciar documentos
      { nome: 'solicitar_viagens' }, // Chave para solicitar viagens
      { nome: 'aprovar_viagens' }, // Chave para aprovar viagens
      { nome: 'gerenciar_usuarios' }, // Chave para gerenciar usuários
    ]

    await authDb.permissoes.bulkAdd(permissoes) // Adicionar permissões ao banco

    console.log('Usuário admin criado: admin@centrus.com / admin123') // Log de criação do usuário admin
  }
}

// Serviço de Autenticação
export const AuthService = {
  // Objeto para gerenciar autenticação
  // Login
  login: async (email, senha) => {
    // Função de login
    try {
      const usuario = await authDb.usuarios.where('email').equals(email).first() // Buscar usuário pelo email

      if (!usuario) {
        // Se usuário não encontrado
        throw new Error('Usuário não encontrado') // Lançar erro de usuário não encontrado
      }

      if (!usuario.ativo) {
        // Se usuário está inativo
        throw new Error('Usuário inativo') // Lançar erro de usuário inativo
      }

      const senhaValida = await verificarSenha(senha, usuario.senha) // Verificar se a senha está correta

      if (!senhaValida) {
        // Se a senha não é válida
        throw new Error('Senha incorreta') // Lançar erro de senha incorreta
      }

      // Atualizar último acesso
      await authDb.usuarios.update(usuario.id, {
        // Atualizar campo de último acesso
        ultimoAcesso: new Date().toISOString(), // Data e hora atual
      })

      // Criar sessão
      const token = gerarToken() // Gerar token de sessão
      const dataExpiracao = new Date() // Data de expiração da sessão
      dataExpiracao.setHours(dataExpiracao.getHours() + 8) // 8 horas

      await authDb.sessoes.add({
        // Adicionar nova sessão ao banco
        usuarioId: usuario.id, // ID do usuário
        token: token, // Token gerado
        dataExpiracao: dataExpiracao.toISOString(), // Data de expiração (ISO 8601) // ISO 8601 é um formato padrão para representar datas e horas
      })

      // Salvar no localStorage
      localStorage.setItem('authToken', token) // Salvar token no localStorage
      localStorage.setItem('usuarioId', usuario.id) // Salvar ID do usuário no localStorage

      return {
        // Retornar dados do usuário e token
        sucesso: true, // Indicar sucesso
        usuario: {
          // Dados do usuário
          id: usuario.id, // ID do usuário
          nome: usuario.nome, // Nome do usuário
          email: usuario.email, // Email do usuário
          tipo: usuario.tipo, // Tipo do usuário
          permissoes: usuario.permissoes || [], // Permissões do usuário
          podeCriarViagens: usuario.podeCriarViagens || false, // NOVO
          podeAprovarViagens: usuario.podeAprovarViagens || false, // NOVO
          podeExcluirViagens: usuario.podeExcluirViagens || false, // NOVO
        },
        token: token, // Token de sessão
      }
    } catch (error) {
      // Capturar erros
      return {
        // Retornar erro
        sucesso: false, // Indicar falha
        erro: error.message, // Mensagem de erro
      }
    }
  },

  // Logout
  logout: async () => {
    // Função de logout
    const token = localStorage.getItem('authToken') // Obter token do localStorage
    if (token) {
      // Se token existe
      await authDb.sessoes.where('token').equals(token).delete() // Remover sessão do banco
    }
    localStorage.removeItem('authToken') // Remover token do localStorage
    localStorage.removeItem('usuarioId') // Remover ID do usuário do localStorage
  },

  // Verificar se está autenticado
  estaAutenticado: async () => {
    // Função para verificar se o usuário está autenticado
    const token = localStorage.getItem('authToken') // Obter token do localStorage
    const usuarioId = localStorage.getItem('usuarioId') // Obter ID do usuário do localStorage

    if (!token || !usuarioId) {
      // Se token ou ID do usuário não existem
      return false // Não está autenticado
    }

    const sessao = await authDb.sessoes.where('token').equals(token).first() // Buscar sessão pelo token

    if (!sessao) {
      // Se sessão não encontrada
      return false // Não está autenticado
    }

    // Verificar se a sessão expirou
    if (new Date(sessao.dataExpiracao) < new Date()) {
      // Se a data de expiração é menor que a data atual
      await authDb.sessoes.delete(sessao.id) // Remover sessão do banco
      localStorage.removeItem('authToken') // Remover token do localStorage
      localStorage.removeItem('usuarioId') // Remover ID do usuário do localStorage
      return false // Não está autenticado
    }

    return true // Está autenticado
  },

  // Obter usuário atual
  obterUsuarioAtual: async () => {
    // Função para obter dados do usuário atual
    const usuarioId = parseInt(localStorage.getItem('usuarioId')) // Obter ID do usuário do localStorage
    if (!usuarioId) return null // Se ID do usuário não existe, retornar null

    const usuario = await authDb.usuarios.get(usuarioId) // Buscar usuário pelo ID
    if (!usuario) return null // Se usuário não encontrado, retornar null

    return {
      // Retornar dados do usuário (sem a senha)
      id: usuario.id, // ID do usuário
      nome: usuario.nome, // Nome do usuário
      email: usuario.email, // Email do usuário
      tipo: usuario.tipo, // Tipo do usuário
      permissoes: usuario.permissoes || [], // Permissões do usuário
      podeCriarViagens: usuario.podeCriarViagens || false, // NOVO
      podeAprovarViagens: usuario.podeAprovarViagens || false, // NOVO
      podeExcluirViagens: usuario.podeExcluirViagens || false, // NOVO
    }
  },

  // Criar novo usuário (apenas admin)
  criarUsuario: async (dados) => {
    // Função para criar novo usuário
    try {
      // Verificar se o usuário atual é admin
      const usuarioAtual = await AuthService.obterUsuarioAtual() // Obter dados do usuário atual

      if (!usuarioAtual || usuarioAtual.tipo !== 'admin') {
        // Se não é admin
        throw new Error('Apenas administradores podem criar usuários') // Lançar erro de permissão
      }

      const usuarioExiste = await authDb.usuarios
        .where('email')
        .equals(dados.email)
        .first() // Verificar se o email já está cadastrado
      if (usuarioExiste) {
        // Se email já existe
        throw new Error('Email já cadastrado') // Lançar erro de email duplicado
      }

      const senhaHash = await hashSenha(dados.senha) // Hash da senha fornecida

      // Criar novo usuário
      const novoUsuario = {
        // Objeto com dados do novo usuário
        nome: dados.nome, // Nome do usuário
        email: dados.email, // Email do usuário
        senha: senhaHash, // Senha (hash)
        tipo: dados.tipo || 'usuario', // 'admin' ou 'usuario' // Tipo do usuário
        ativo: true, // Usuário ativo por padrão
        dataCriacao: new Date().toISOString(), // Data de criação
        permissoes: Array.isArray(dados.permissoes) ? dados.permissoes : [], // Garantir que permissoes seja um array
        podeCriarViagens: dados.podeCriarViagens || false, // NOVO
        podeAprovarViagens: dados.podeAprovarViagens || false, // NOVO
        podeExcluirViagens: dados.podeExcluirViagens || false, // NOVO
      }

      const id = await authDb.usuarios.add(novoUsuario) // Adicionar novo usuário ao banco

      console.log('Usuário criado com permissões:', novoUsuario.permissoes) // Debug

      return {
        // Retornar sucesso e dados do novo usuário
        sucesso: true, // Indicar sucesso
        usuario: { id, ...novoUsuario, senha: undefined }, // Retornar dados do usuário sem a senha
      }
    } catch (error) {
      // Capturar erros
      console.error('Erro ao criar usuário:', error) // Debug
      return {
        // Retornar erro
        sucesso: false, // Indicar falha
        erro: error.message, // Mensagem de erro
      }
    }
  },

  // Listar usuários (apenas admin)
  listarUsuarios: async () => {
    // Função para listar todos os usuários
    const usuarioAtual = await AuthService.obterUsuarioAtual() // Obter dados do usuário atual

    if (!usuarioAtual || usuarioAtual.tipo !== 'admin') {
      // Se não é admin
      throw new Error('Apenas administradores podem listar usuários') // Lançar erro de permissão
    }

    const usuarios = await authDb.usuarios.toArray() // Buscar todos os usuários

    return usuarios.map((u) => {
      const usuarioFormatado = {
        // Retornar dados sem a senha
        id: u.id, // ID do usuário
        nome: u.nome, // Nome do usuário
        email: u.email, // Email do usuário
        tipo: u.tipo, // Tipo do usuário
        ativo: u.ativo, // Status ativo/inativo
        dataCriacao: u.dataCriacao, // Data de criação
        ultimoAcesso: u.ultimoAcesso, // Último acesso
        permissoes: Array.isArray(u.permissoes) ? u.permissoes : [], // Garantir que permissoes seja um array
        podeCriarViagens: u.podeCriarViagens || false, // NOVO
        podeAprovarViagens: u.podeAprovarViagens || false, // NOVO
        podeExcluirViagens: u.podeExcluirViagens || false, // NOVO
      }

      console.log(
        'Usuário carregado:',
        usuarioFormatado.nome,
        'Permissões:',
        usuarioFormatado.permissoes
      ) // Debug

      return usuarioFormatado
    })
  },

  // Alterar status do usuário
  alterarStatusUsuario: async (usuarioId, ativo) => {
    // Função para ativar/desativar usuário
    const usuarioAtual = await AuthService.obterUsuarioAtual() // Obter dados do usuário atual

    if (!usuarioAtual || usuarioAtual.tipo !== 'admin') {
      // Se não é admin
      throw new Error('Apenas administradores podem alterar status') // Lançar erro de permissão
    }

    await authDb.usuarios.update(usuarioId, { ativo }) // Atualizar campo 'ativo' do usuário
    return { sucesso: true } // Retornar sucesso
  },

  // Excluir usuário
  excluirUsuario: async (usuarioId) => {
    // Função para excluir usuário
    const usuarioAtual = await AuthService.obterUsuarioAtual() // Obter dados do usuário atual

    if (!usuarioAtual || usuarioAtual.tipo !== 'admin') {
      // Se não é admin
      throw new Error('Apenas administradores podem excluir usuários') // Lançar erro de permissão
    }

    if (usuarioId === usuarioAtual.id) {
      // Prevenir auto-exclusão
      throw new Error('Você não pode excluir sua própria conta') // Lançar erro de auto-exclusão
    }

    await authDb.usuarios.delete(usuarioId) // Excluir usuário do banco
    return { sucesso: true } // Retornar sucesso
  },

  // Editar usuário (apenas admin)
  editarUsuario: async (usuarioId, dadosAtualizacao) => {
    try {
      // Verificar se o usuário atual é admin
      const usuarioAtual = await AuthService.obterUsuarioAtual() // Obter dados do usuário atual

      if (!usuarioAtual || usuarioAtual.tipo !== 'admin') {
        // Se não é admin
        throw new Error('Apenas administradores podem editar usuários') // Lançar erro de permissão
      }

      // Buscar o usuário pelo ID
      const usuario = await authDb.usuarios.get(usuarioId) // Buscar usuário no banco

      if (!usuario) {
        // Se o usuário não existir
        throw new Error('Usuário não encontrado') // Lançar erro
      }

      // Preparar os dados atualizados
      const dadosAtualizados = {
        nome: dadosAtualizacao.nome, // Atualizar nome
        email: dadosAtualizacao.email, // Atualizar email
        tipo: dadosAtualizacao.tipo, // Atualizar tipo
        permissoes: dadosAtualizacao.permissoes, // Atualizar permissões
        podeCriarViagens: dadosAtualizacao.podeCriarViagens || false, // NOVO
        podeAprovarViagens: dadosAtualizacao.podeAprovarViagens || false, // NOVO
        podeExcluirViagens: dadosAtualizacao.podeExcluirViagens || false, // NOVO
      }

      // Se uma nova senha foi fornecida, atualiza a senha
      if (dadosAtualizacao.senha && dadosAtualizacao.senha.trim() !== '') {
        dadosAtualizados.senha = await hashSenha(dadosAtualizacao.senha) // Hash da nova senha
      }

      // Atualizar o usuário no banco de dados
      await authDb.usuarios.update(usuarioId, dadosAtualizados) // Atualizar dados do usuário

      return { sucesso: true } // Retornar sucesso
    } catch (error) {
      // Capturar erros
      console.error('Erro ao editar usuário:', error) // Log de erro
      return { sucesso: false, erro: error.message } // Retornar erro
    }
  },

  // Verificar permissão
  temPermissao: async (nomePermissao) => {
    // Função para verificar se o usuário tem uma permissão específica
    const usuarioAtual = await AuthService.obterUsuarioAtual() // Obter dados do usuário atual

    if (!usuarioAtual) {
      // Se não está autenticado
      return false // Não tem permissão
    }

    // Admin tem todas as permissões
    if (usuarioAtual.tipo === 'admin') {
      // Se é admin
      return true // Tem todas as permissões
    }

    // Verificar permissões específicas do usuário
    const permissao = await authDb.permissoes
      .where('nome')
      .equals(nomePermissao)
      .first() // Buscar permissão pelo nome
    if (!permissao) return false // Se permissão não existe, retornar false

    // Verificar se o usuário possui a permissão

    const usuarioPermissao = await authDb.usuarioPermissoes // Buscar relação usuário-permissão
      .where('[usuarioId+permissaoId]') //  Índice composto
      .equals([usuarioAtual.id, permissao.id]) // Verificar se o usuário possui a permissão
      .first() // Obter a primeira correspondência

    return !!usuarioPermissao // Retornar true se possui a permissão, false caso contrário
  },
}

export { hashSenha, verificarSenha } // Exportar funções de hash e verificação de senha
