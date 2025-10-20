// src/authDb.js
import Dexie from 'dexie'

// Criar banco de dados de autenticaÃ§Ã£o
export const authDb = new Dexie('SistemaCentrusAuth')

// VersÃ£o 2 - Adicionar suporte a permissÃµes nos usuÃ¡rios
authDb
  .version(2)
  .stores({
    usuarios: '++id, email, nome, senha, tipo, ativo, dataCriacao', // MantÃ©m o mesmo schema
    sessoes: '++id, usuarioId, token, dataExpiracao',
    permissoes: '++id, nome',
    usuarioPermissoes: '++id, usuarioId, permissaoId',
  })
  .upgrade(async (tx) => {
    // MigraÃ§Ã£o: adicionar campo permissoes aos usuÃ¡rios existentes
    const usuarios = await tx.table('usuarios').toArray()
    for (const usuario of usuarios) {
      if (!usuario.permissoes) {
        await tx.table('usuarios').update(usuario.id, { permissoes: [] })
      }
    }
    console.log(
      'Migraçãoo concluí­da: campo permissoes adicionado aos usuÃ¡rios'
    )
  })

// Classe para gerenciar usuÃ¡rios
class Usuario {
  constructor(dados) {
    // Construtor para inicializar dados do usuÃ¡rio
    this.id = dados.id // ID do usuÃ¡rio
    this.nome = dados.nome // Nome do usuÃ¡rio
    this.email = dados.email // Email do usuÃ¡rio
    this.senha = dados.senha // Senha (hash)
    this.tipo = dados.tipo || 'usuario' // 'admin' ou 'usuario' // Tipo do usuÃ¡rio
    this.ativo = dados.ativo !== undefined ? dados.ativo : true // UsuÃ¡rio ativo ou inativo
    this.dataCriacao = dados.dataCriacao || new Date().toISOString() // Data de criaÃ§Ã£o
    this.ultimoAcesso = dados.ultimoAcesso || null // Ãšltimo acesso
    this.permissoes = dados.permissoes || [] // PermissÃµes do usuÃ¡rio
  }
}

// FunÃ§Ãµes auxiliares de criptografia simples (em produÃ§Ã£o use bcrypt no backend)
const hashSenha = async (senha) => {
  // FunÃ§Ã£o para hash da senha
  const encoder = new TextEncoder() // Codificador de texto
  const data = encoder.encode(senha) // Codificar senha
  const hashBuffer = await crypto.subtle.digest('SHA-256', data) // Gerar hash SHA-256 // SHA-256 Ã© um algoritmo de hash seguro
  const hashArray = Array.from(new Uint8Array(hashBuffer)) // Converter buffer para array
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('') // Converter para string hexadecimal
}

const verificarSenha = async (senha, hash) => {
  // Verificar se a senha corresponde ao hash
  const senhaHash = await hashSenha(senha) // Gerar hash da senha fornecida
  return senhaHash === hash // Comparar com o hash armazenado // Hash Ã© uma representaÃ§Ã£o criptografada da senha
}

// Gerar token de sessÃ£o // Token Ã© uma string Ãºnica usada para identificar a sessÃ£o do usuÃ¡rio
const gerarToken = () => {
  // Gerar token aleatÃ³rio
  return Array.from(crypto.getRandomValues(new Uint8Array(32))) // Gerar 32 bytes aleatÃ³rios
    .map((b) => b.toString(16).padStart(2, '0')) // Converter para string hexadecimal
    .join('') // Unir em uma Ãºnica string
}

// Inicializar banco com usuÃ¡rio admin padrÃ£o
export const inicializarAuth = async () => {
  // FunÃ§Ã£o para inicializar o banco de dados de autenticaÃ§Ã£o
  const usuariosCount = await authDb.usuarios.count() // Contar nÃºmero de usuÃ¡rios

  if (usuariosCount === 0) {
    // Criar usuÃ¡rio administrador padrÃ£o
    const senhaHash = await hashSenha('admin123') // Hash da senha padrÃ£o
    await authDb.usuarios.add({
      // Adicionar usuÃ¡rio admin
      nome: 'Administrador', // Nome do usuÃ¡rio
      email: 'admin@centrus.com', // Email do usuÃ¡rio
      senha: senhaHash, // Senha (hash)
      tipo: 'admin', // Tipo do usuÃ¡rio
      ativo: true, // UsuÃ¡rio ativo
      dataCriacao: new Date().toISOString(), // Data de criaÃ§Ã£o
      permissoes: [], // Admin nÃ£o precisa de permissÃµes especÃ­ficas
    })

    // Criar permissÃµes padrÃ£o
    const permissoes = [
      { nome: 'visualizar_funcionarios' }, // Chave para visualizar funcionÃ¡rios
      { nome: 'criar_funcionarios' }, // Chave para criar funcionÃ¡rios
      { nome: 'editar_funcionarios' }, // Chave para editar funcionÃ¡rios
      { nome: 'excluir_funcionarios' }, // Chave para excluir funcionÃ¡rios
      { nome: 'gerenciar_documentos' }, // Chave para gerenciar documentos
      { nome: 'solicitar_viagens' }, // Chave para solicitar viagens
      { nome: 'aprovar_viagens' }, // Chave para aprovar viagens
      { nome: 'gerenciar_usuarios' }, // Chave para gerenciar usuÃ¡rios
    ]

    await authDb.permissoes.bulkAdd(permissoes) // Adicionar permissÃµes ao banco

    console.log('UsuÃ¡rio admin criado: admin@centrus.com / admin123') // Log de criaÃ§Ã£o do usuÃ¡rio admin
  }
}

// ServiÃ§o de AutenticaÃ§Ã£o
export const AuthService = {
  // Objeto para gerenciar autenticaÃ§Ã£o
  // Login
  login: async (email, senha) => {
    // FunÃ§Ã£o de login
    try {
      const usuario = await authDb.usuarios.where('email').equals(email).first() // Buscar usuÃ¡rio pelo email

      if (!usuario) {
        // Se usuÃ¡rio nÃ£o encontrado
        throw new Error('UsuÃ¡rio nÃ£o encontrado') // LanÃ§ar erro de usuÃ¡rio nÃ£o encontrado
      }

      if (!usuario.ativo) {
        // Se usuÃ¡rio estÃ¡ inativo
        throw new Error('UsuÃ¡rio inativo') // LanÃ§ar erro de usuÃ¡rio inativo
      }

      const senhaValida = await verificarSenha(senha, usuario.senha) // Verificar se a senha estÃ¡ correta

      if (!senhaValida) {
        // Se a senha nÃ£o Ã© vÃ¡lida
        throw new Error('Senha incorreta') // LanÃ§ar erro de senha incorreta
      }

      // Atualizar Ãºltimo acesso
      await authDb.usuarios.update(usuario.id, {
        // Atualizar campo de Ãºltimo acesso
        ultimoAcesso: new Date().toISOString(), // Data e hora atual
      })

      // Criar sessÃ£o
      const token = gerarToken() // Gerar token de sessÃ£o
      const dataExpiracao = new Date() // Data de expiraÃ§Ã£o da sessÃ£o
      dataExpiracao.setHours(dataExpiracao.getHours() + 8) // 8 horas

      await authDb.sessoes.add({
        // Adicionar nova sessÃ£o ao banco
        usuarioId: usuario.id, // ID do usuÃ¡rio
        token: token, // Token gerado
        dataExpiracao: dataExpiracao.toISOString(), // Data de expiraÃ§Ã£o (ISO 8601) // ISO 8601 Ã© um formato padrÃ£o para representar datas e horas
      })

      // Salvar no localStorage
      localStorage.setItem('authToken', token) // Salvar token no localStorage
      localStorage.setItem('usuarioId', usuario.id) // Salvar ID do usuÃ¡rio no localStorage

      return {
        // Retornar dados do usuÃ¡rio e token
        sucesso: true, // Indicar sucesso
        usuario: {
          // Dados do usuÃ¡rio
          id: usuario.id, // ID do usuÃ¡rio
          nome: usuario.nome, // Nome do usuÃ¡rio
          email: usuario.email, // Email do usuÃ¡rio
          tipo: usuario.tipo, // Tipo do usuÃ¡rio
        },
        token: token, // Token de sessÃ£o
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
    // FunÃ§Ã£o de logout
    const token = localStorage.getItem('authToken') // Obter token do localStorage
    if (token) {
      // Se token existe
      await authDb.sessoes.where('token').equals(token).delete() // Remover sessÃ£o do banco
    }
    localStorage.removeItem('authToken') // Remover token do localStorage
    localStorage.removeItem('usuarioId') // Remover ID do usuÃ¡rio do localStorage
  },

  // Verificar se estÃ¡ autenticado
  estaAutenticado: async () => {
    // FunÃ§Ã£o para verificar se o usuÃ¡rio estÃ¡ autenticado
    const token = localStorage.getItem('authToken') // Obter token do localStorage
    const usuarioId = localStorage.getItem('usuarioId') // Obter ID do usuÃ¡rio do localStorage

    if (!token || !usuarioId) {
      // Se token ou ID do usuÃ¡rio nÃ£o existem
      return false // NÃ£o estÃ¡ autenticado
    }

    const sessao = await authDb.sessoes.where('token').equals(token).first() // Buscar sessÃ£o pelo token

    if (!sessao) {
      // Se sessÃ£o nÃ£o encontrada
      return false // NÃ£o estÃ¡ autenticado
    }

    // Verificar se a sessÃ£o expirou
    if (new Date(sessao.dataExpiracao) < new Date()) {
      // Se a data de expiraÃ§Ã£o Ã© menor que a data atual
      await authDb.sessoes.delete(sessao.id) // Remover sessÃ£o do banco
      localStorage.removeItem('authToken') // Remover token do localStorage
      localStorage.removeItem('usuarioId') // Remover ID do usuÃ¡rio do localStorage
      return false // NÃ£o estÃ¡ autenticado
    }

    return true // EstÃ¡ autenticado
  },

  // Obter usuÃ¡rio atual
  obterUsuarioAtual: async () => {
    // FunÃ§Ã£o para obter dados do usuÃ¡rio atual
    const usuarioId = parseInt(localStorage.getItem('usuarioId')) // Obter ID do usuÃ¡rio do localStorage
    if (!usuarioId) return null // Se ID do usuÃ¡rio nÃ£o existe, retornar null

    const usuario = await authDb.usuarios.get(usuarioId) // Buscar usuÃ¡rio pelo ID
    if (!usuario) return null // Se usuÃ¡rio nÃ£o encontrado, retornar null

    return {
      // Retornar dados do usuÃ¡rio (sem a senha)
      id: usuario.id, // ID do usuÃ¡rio
      nome: usuario.nome, // Nome do usuÃ¡rio
      email: usuario.email, // Email do usuÃ¡rio
      tipo: usuario.tipo, // Tipo do usuÃ¡rio
      permissoes: usuario.permissoes || [], // PermissÃµes do usuÃ¡rio
    }
  },

  // Criar novo usuÃ¡rio (apenas admin)
  criarUsuario: async (dados) => {
    // FunÃ§Ã£o para criar novo usuÃ¡rio
    try {
      // Verificar se o usuÃ¡rio atual Ã© admin
      const usuarioAtual = await AuthService.obterUsuarioAtual() // Obter dados do usuÃ¡rio atual

      if (!usuarioAtual || usuarioAtual.tipo !== 'admin') {
        // Se nÃ£o Ã© admin
        throw new Error('Apenas administradores podem criar usuÃ¡rios') // LanÃ§ar erro de permissÃ£o
      }

      const usuarioExiste = await authDb.usuarios
        .where('email')
        .equals(dados.email)
        .first() // Verificar se o email jÃ¡ estÃ¡ cadastrado
      if (usuarioExiste) {
        // Se email jÃ¡ existe
        throw new Error('Email jÃ¡ cadastrado') // LanÃ§ar erro de email duplicado
      }

      const senhaHash = await hashSenha(dados.senha) // Hash da senha fornecida

      // Criar novo usuÃ¡rio
      const novoUsuario = {
        // Objeto com dados do novo usuÃ¡rio
        nome: dados.nome, // Nome do usuÃ¡rio
        email: dados.email, // Email do usuÃ¡rio
        senha: senhaHash, // Senha (hash)
        tipo: dados.tipo || 'usuario', // 'admin' ou 'usuario' // Tipo do usuÃ¡rio
        ativo: true, // UsuÃ¡rio ativo por padrÃ£o
        dataCriacao: new Date().toISOString(), // Data de criaÃ§Ã£o
        permissoes: Array.isArray(dados.permissoes) ? dados.permissoes : [], // Garantir que permissoes seja um array
      }

      const id = await authDb.usuarios.add(novoUsuario) // Adicionar novo usuÃ¡rio ao banco

      console.log('UsuÃ¡rio criado com permissÃµes:', novoUsuario.permissoes) // Debug

      return {
        // Retornar sucesso e dados do novo usuÃ¡rio
        sucesso: true, // Indicar sucesso
        usuario: { id, ...novoUsuario, senha: undefined }, // Retornar dados do usuÃ¡rio sem a senha
      }
    } catch (error) {
      // Capturar erros
      console.error('Erro ao criar usuÃ¡rio:', error) // Debug
      return {
        // Retornar erro
        sucesso: false, // Indicar falha
        erro: error.message, // Mensagem de erro
      }
    }
  },

  // Listar usuÃ¡rios (apenas admin)
  listarUsuarios: async () => {
    // FunÃ§Ã£o para listar todos os usuÃ¡rios
    const usuarioAtual = await AuthService.obterUsuarioAtual() // Obter dados do usuÃ¡rio atual

    if (!usuarioAtual || usuarioAtual.tipo !== 'admin') {
      // Se nÃ£o Ã© admin
      throw new Error('Apenas administradores podem listar usuÃ¡rios') // LanÃ§ar erro de permissÃ£o
    }

    const usuarios = await authDb.usuarios.toArray() // Buscar todos os usuÃ¡rios

    return usuarios.map((u) => {
      const usuarioFormatado = {
        // Retornar dados sem a senha
        id: u.id, // ID do usuÃ¡rio
        nome: u.nome, // Nome do usuÃ¡rio
        email: u.email, // Email do usuÃ¡rio
        tipo: u.tipo, // Tipo do usuÃ¡rio
        ativo: u.ativo, // Status ativo/inativo
        dataCriacao: u.dataCriacao, // Data de criaÃ§Ã£o
        ultimoAcesso: u.ultimoAcesso, // Ãšltimo acesso
        permissoes: Array.isArray(u.permissoes) ? u.permissoes : [], // Garantir que permissoes seja um array
      }

      console.log(
        'UsuÃ¡rio carregado:',
        usuarioFormatado.nome,
        'PermissÃµes:',
        usuarioFormatado.permissoes
      ) // Debug

      return usuarioFormatado
    })
  },

  // Alterar status do usuÃ¡rio
  alterarStatusUsuario: async (usuarioId, ativo) => {
    // FunÃ§Ã£o para ativar/desativar usuÃ¡rio
    const usuarioAtual = await AuthService.obterUsuarioAtual() // Obter dados do usuÃ¡rio atual

    if (!usuarioAtual || usuarioAtual.tipo !== 'admin') {
      // Se nÃ£o Ã© admin
      throw new Error('Apenas administradores podem alterar status') // LanÃ§ar erro de permissÃ£o
    }

    await authDb.usuarios.update(usuarioId, { ativo }) // Atualizar campo 'ativo' do usuÃ¡rio
    return { sucesso: true } // Retornar sucesso
  },

  // Excluir usuÃ¡rio
  excluirUsuario: async (usuarioId) => {
    // FunÃ§Ã£o para excluir usuÃ¡rio
    const usuarioAtual = await AuthService.obterUsuarioAtual() // Obter dados do usuÃ¡rio atual

    if (!usuarioAtual || usuarioAtual.tipo !== 'admin') {
      // Se nÃ£o Ã© admin
      throw new Error('Apenas administradores podem excluir usuÃ¡rios') // LanÃ§ar erro de permissÃ£o
    }

    if (usuarioId === usuarioAtual.id) {
      // Prevenir auto-exclusÃ£o
      throw new Error('VocÃª nÃ£o pode excluir sua prÃ³pria conta') // LanÃ§ar erro de auto-exclusÃ£o
    }

    await authDb.usuarios.delete(usuarioId) // Excluir usuÃ¡rio do banco
    return { sucesso: true } // Retornar sucesso
  },

  // Adicione esta função DENTRO do objeto AuthService
  // DEPOIS da função excluirUsuario() e ANTES da função temPermissao()

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

  // Verificar permissÃ£o
  temPermissao: async (nomePermissao) => {
    // FunÃ§Ã£o para verificar se o usuÃ¡rio tem uma permissÃ£o especÃ­fica
    const usuarioAtual = await AuthService.obterUsuarioAtual() // Obter dados do usuÃ¡rio atual

    if (!usuarioAtual) {
      // Se nÃ£o estÃ¡ autenticado
      return false // NÃ£o tem permissÃ£o
    }

    // Admin tem todas as permissÃµes
    if (usuarioAtual.tipo === 'admin') {
      // Se Ã© admin
      return true // Tem todas as permissÃµes
    }

    // Verificar permissÃµes especÃ­ficas do usuÃ¡rio
    const permissao = await authDb.permissoes
      .where('nome')
      .equals(nomePermissao)
      .first() // Buscar permissÃ£o pelo nome
    if (!permissao) return false // Se permissÃ£o nÃ£o existe, retornar false

    // Verificar se o usuÃ¡rio possui a permissÃ£o

    const usuarioPermissao = await authDb.usuarioPermissoes // Buscar relaÃ§Ã£o usuÃ¡rio-permissÃ£o
      .where('[usuarioId+permissaoId]') //  Ãndice composto
      .equals([usuarioAtual.id, permissao.id]) // Verificar se o usuÃ¡rio possui a permissÃ£o
      .first() // Obter a primeira correspondÃªncia

    return !!usuarioPermissao // Retornar true se possui a permissÃ£o, false caso contrÃ¡rio
  },
}

export { hashSenha, verificarSenha } // Exportar funÃ§Ãµes de hash e verificaÃ§Ã£o de senha
