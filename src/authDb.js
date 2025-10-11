// src/authDb.js
import Dexie from 'dexie';

// Criar banco de dados de autenticação
export const authDb = new Dexie('SistemaCentrusAuth');

authDb.version(1).stores({
  usuarios: '++id, email, nome, senha, tipo, ativo, dataCriacao',
  sessoes: '++id, usuarioId, token, dataExpiracao',
  permissoes: '++id, nome',
  usuarioPermissoes: '++id, usuarioId, permissaoId'
});

// Classe para gerenciar usuários
class Usuario {
  constructor(dados) {
    this.id = dados.id;
    this.nome = dados.nome;
    this.email = dados.email;
    this.senha = dados.senha;
    this.tipo = dados.tipo || 'usuario'; // 'admin' ou 'usuario'
    this.ativo = dados.ativo !== undefined ? dados.ativo : true;
    this.dataCriacao = dados.dataCriacao || new Date().toISOString();
    this.ultimoAcesso = dados.ultimoAcesso || null;
  }
}

// Funções auxiliares de criptografia simples (em produção use bcrypt no backend)
const hashSenha = async (senha) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(senha);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

const verificarSenha = async (senha, hash) => {
  const senhaHash = await hashSenha(senha);
  return senhaHash === hash;
};

// Gerar token de sessão
const gerarToken = () => {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

// Inicializar banco com usuário admin padrão
export const inicializarAuth = async () => {
  const usuariosCount = await authDb.usuarios.count();
  
  if (usuariosCount === 0) {
    // Criar usuário administrador padrão
    const senhaHash = await hashSenha('admin123');
    await authDb.usuarios.add({
      nome: 'Administrador',
      email: 'admin@centrus.com',
      senha: senhaHash,
      tipo: 'admin',
      ativo: true,
      dataCriacao: new Date().toISOString()
    });

    // Criar permissões padrão
    const permissoes = [
      { nome: 'visualizar_funcionarios' },
      { nome: 'criar_funcionarios' },
      { nome: 'editar_funcionarios' },
      { nome: 'excluir_funcionarios' },
      { nome: 'gerenciar_documentos' },
      { nome: 'gerenciar_usuarios' }
    ];

    await authDb.permissoes.bulkAdd(permissoes);
    
    console.log('Usuário admin criado: admin@centrus.com / admin123');
  }
};

// Serviço de Autenticação
export const AuthService = {
  // Login
  login: async (email, senha) => {
    try {
      const usuario = await authDb.usuarios.where('email').equals(email).first();
      
      if (!usuario) {
        throw new Error('Usuário não encontrado');
      }

      if (!usuario.ativo) {
        throw new Error('Usuário inativo');
      }

      const senhaValida = await verificarSenha(senha, usuario.senha);
      
      if (!senhaValida) {
        throw new Error('Senha incorreta');
      }

      // Atualizar último acesso
      await authDb.usuarios.update(usuario.id, {
        ultimoAcesso: new Date().toISOString()
      });

      // Criar sessão
      const token = gerarToken();
      const dataExpiracao = new Date();
      dataExpiracao.setHours(dataExpiracao.getHours() + 8); // 8 horas

      await authDb.sessoes.add({
        usuarioId: usuario.id,
        token: token,
        dataExpiracao: dataExpiracao.toISOString()
      });

      // Salvar no localStorage
      localStorage.setItem('authToken', token);
      localStorage.setItem('usuarioId', usuario.id);

      return {
        sucesso: true,
        usuario: {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          tipo: usuario.tipo
        },
        token: token
      };
    } catch (error) {
      return {
        sucesso: false,
        erro: error.message
      };
    }
  },

  // Logout
  logout: async () => {
    const token = localStorage.getItem('authToken');
    if (token) {
      await authDb.sessoes.where('token').equals(token).delete();
    }
    localStorage.removeItem('authToken');
    localStorage.removeItem('usuarioId');
  },

  // Verificar se está autenticado
  estaAutenticado: async () => {
    const token = localStorage.getItem('authToken');
    const usuarioId = localStorage.getItem('usuarioId');

    if (!token || !usuarioId) {
      return false;
    }

    const sessao = await authDb.sessoes.where('token').equals(token).first();
    
    if (!sessao) {
      return false;
    }

    // Verificar se a sessão expirou
    if (new Date(sessao.dataExpiracao) < new Date()) {
      await authDb.sessoes.delete(sessao.id);
      localStorage.removeItem('authToken');
      localStorage.removeItem('usuarioId');
      return false;
    }

    return true;
  },

  // Obter usuário atual
  obterUsuarioAtual: async () => {
    const usuarioId = parseInt(localStorage.getItem('usuarioId'));
    if (!usuarioId) return null;

    const usuario = await authDb.usuarios.get(usuarioId);
    if (!usuario) return null;

    return {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      tipo: usuario.tipo
    };
  },

  // Criar novo usuário (apenas admin)
  criarUsuario: async (dados) => {
    try {
      const usuarioAtual = await AuthService.obterUsuarioAtual();
      
      if (!usuarioAtual || usuarioAtual.tipo !== 'admin') {
        throw new Error('Apenas administradores podem criar usuários');
      }

      const usuarioExiste = await authDb.usuarios.where('email').equals(dados.email).first();
      if (usuarioExiste) {
        throw new Error('Email já cadastrado');
      }

      const senhaHash = await hashSenha(dados.senha);
      
      const novoUsuario = {
        nome: dados.nome,
        email: dados.email,
        senha: senhaHash,
        tipo: dados.tipo || 'usuario',
        ativo: true,
        dataCriacao: new Date().toISOString()
      };

      const id = await authDb.usuarios.add(novoUsuario);

      return {
        sucesso: true,
        usuario: { id, ...novoUsuario, senha: undefined }
      };
    } catch (error) {
      return {
        sucesso: false,
        erro: error.message
      };
    }
  },

  // Listar usuários (apenas admin)
  listarUsuarios: async () => {
    const usuarioAtual = await AuthService.obterUsuarioAtual();
    
    if (!usuarioAtual || usuarioAtual.tipo !== 'admin') {
      throw new Error('Apenas administradores podem listar usuários');
    }

    const usuarios = await authDb.usuarios.toArray();
    return usuarios.map(u => ({
      id: u.id,
      nome: u.nome,
      email: u.email,
      tipo: u.tipo,
      ativo: u.ativo,
      dataCriacao: u.dataCriacao,
      ultimoAcesso: u.ultimoAcesso
    }));
  },

  // Alterar status do usuário
  alterarStatusUsuario: async (usuarioId, ativo) => {
    const usuarioAtual = await AuthService.obterUsuarioAtual();
    
    if (!usuarioAtual || usuarioAtual.tipo !== 'admin') {
      throw new Error('Apenas administradores podem alterar status');
    }

    await authDb.usuarios.update(usuarioId, { ativo });
    return { sucesso: true };
  },

  // Excluir usuário
  excluirUsuario: async (usuarioId) => {
    const usuarioAtual = await AuthService.obterUsuarioAtual();
    
    if (!usuarioAtual || usuarioAtual.tipo !== 'admin') {
      throw new Error('Apenas administradores podem excluir usuários');
    }

    if (usuarioId === usuarioAtual.id) {
      throw new Error('Você não pode excluir sua própria conta');
    }

    await authDb.usuarios.delete(usuarioId);
    return { sucesso: true };
  },

  // Verificar permissão
  temPermissao: async (nomePermissao) => {
    const usuarioAtual = await AuthService.obterUsuarioAtual();
    
    if (!usuarioAtual) {
      return false;
    }

    // Admin tem todas as permissões
    if (usuarioAtual.tipo === 'admin') {
      return true;
    }

    // Verificar permissões específicas do usuário
    const permissao = await authDb.permissoes.where('nome').equals(nomePermissao).first();
    if (!permissao) return false;

    const usuarioPermissao = await authDb.usuarioPermissoes
      .where('[usuarioId+permissaoId]')
      .equals([usuarioAtual.id, permissao.id])
      .first();

    return !!usuarioPermissao;
  }
};

export { hashSenha, verificarSenha };