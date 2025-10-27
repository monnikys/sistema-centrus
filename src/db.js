import Dexie from 'dexie' // Importar Dexie.js para gerenciamento de IndexedDB

export const db = new Dexie('SistemaFuncionarios') // Nome do banco de dados

db.version(24).stores({
  funcionarios: '++id, nome, cpf, cargo, departamento',
  documentos:
    '++id, funcionarioId, categoria, nomeArquivo, dataUpload, mes, ano, dataInicio, dataFim, criadoPorId, criadoPorNome, atualizadoPorId, atualizadoPorNome',
  documentosEmpresa:
    '++id, funcionarioId, categoriaEmpresa, nomeArquivo, dataUpload, mes, ano, fixado, criadoPorId, criadoPorNome, atualizadoPorId, atualizadoPorNome',
  solicitacoesViagem:
    '++id, solicitanteId, viajanteId, origem, destino, dataIda, horarioIdaInicio, horarioIdaFim, dataVolta, horarioVoltaInicio, horarioVoltaFim, justificativa, observacao, status, dataSolicitacao, motivoRecusa, criadoPorId, criadoPorNome, aprovadoPorId, aprovadoPorNome, recusadoPorId, recusadoPorNome, dataAprovacao, dataRecusa',
  notificacoes:
    '++id, tipo, titulo, mensagem, lida, dataCreacao, dados, usuarioId, usuarioResponsavelId, usuarioResponsavelNome',
  anexosViagem:
    '++id, viagemId, nome, tipo, tamanho, conteudo, dataUpload, uploadPorId, uploadPor',
})

export const CATEGORIAS = {
  ABONO_ASSIDUIDADE: 'Abono de Assiduidade',
  ATESTADO_MEDICO: 'Atestado Médico',
  ATESTADO_COMPARECIMENTO: 'Atestado de Comparecimento',
  FERIAS: 'Férias',
  AJUSTE_PONTO: 'Ajuste de Ponto',
  LICENCA_MATERNIDADE_PATERNIDADE: 'Licença Maternidade/Paternidade',
  LICENCA_NOJO: 'Licença Nojo',
  LICENCA_GALA: 'Licença Gala',
  JUSTICA_ELEITORAL: 'Justica Eleitoral',
  DOACAO_SANGUE: 'Doação de Sangue',
}

export const CATEGORIAS_EMPRESA = {
  INCLUSAO_CONVENIO: 'Inclusão do Convênio',
  EXCLUSAO_CONVENIO: 'Exclusão do Convênio',
  PASSAGENS_AEREAS: 'Passagens Aéreas',
}

export const DEPARTAMENTOS = [
  'PRESI','DIRAP','DIBEN','GECAP',
  'GECON','GEINF','GECOR','GEOPE',
  'GETEC','GEFIN','GEBEN','GERIS',
  'SELOG','SEFOP','SECON','SEBEN',
  'SECAB','SECRE','SETES','SEMEF',
  'SESUP','SEFIN','SEDES','AUDIT',
  'COJUR',
]

export const CARGOS = [
  'Advogada Jr. B','Advogada Sr. D','Advogado Pl. E','Advogado Sr. E',
  'Analista Jr. A','Analista Jr. B','Analista Jr. C','Analista Jr. D',
  'Analista Jr. E','Analista Jr. F','Analista Pl. A','Analista Pl. B',
  'Analista Pl. C','Analista Pl. E','Analista Pl. F','Analista Sr. A',
  'Analista Sr. B','Analista Sr. C','Analista Sr. D','Analista Sr. E',
  'Analista Sr. F','Diretor','Estagiário','Gerente',
]

export const AEROPORTOS = [
  {
    nome: 'Aeroporto de São Paulo-Guarulhos',
    iata: 'GRU',
    icao: 'SBGR',
  },
  { nome: 'Aeroporto de São Paulo - Congonhas', iata: 'CGH', icao: 'SBSP' },
  { nome: 'Aeroporto de Brasília', iata: 'BSB', icao: 'SBBR' },
  {
    nome: 'Aeroporto do Rio de Janeiro - Galeão',
    iata: 'GIG',
    icao: 'SBGL',
  },
  {
    nome: 'Aeroporto de Campinas - Viracopos',
    iata: 'VCP',
    icao: 'SBKP',
  },
  {
    nome: 'Aeroporto de Belo Horizonte - Confins',
    iata: 'CNF',
    icao: 'SBCF',
  },
  {
    nome: 'Aeroporto do Recife - Guararapes',
    iata: 'REC',
    icao: 'SBRF',
  },
  { nome: 'Aeroporto de Salvador', iata: 'SSA', icao: 'SBSV' },
  {
    nome: 'Aeroporto do Rio de Janeiro - Santos Dumont',
    iata: 'SDU',
    icao: 'SBRJ',
  },
  {
    nome: 'Aeroporto de Curitiba - Afonso Pena',
    iata: 'CWB',
    icao: 'SBCT',
  },
  { nome: 'Aeroporto de Fortaleza', iata: 'FOR', icao: 'SBFZ' },
  {
    nome: 'Aeroporto de Florianópolis',
    iata: 'FLN',
    icao: 'SBFL',
  },
  {
    nome: 'Aeroporto de Belém - Val de Cans',
    iata: 'BEL',
    icao: 'SBBE',
  },
  {
    nome: 'Aeroporto de Goiânia - Santa Genoveva',
    iata: 'GYN',
    icao: 'SBGO',
  },
  {
    nome: 'Aeroporto de Porto Alegre',
    iata: 'POA',
    icao: 'SBPA',
  },
  {
    nome: 'Aeroporto de Vitória - Eurico de Aguiar Salles',
    iata: 'VIX',
    icao: 'SBVT',
  },
  {
    nome: 'Aeroporto de Manaus - Eduardo Gomes',
    iata: 'MAO',
    icao: 'SBEG',
  },
  {
    nome: 'Aeroporto de Cuiabá - Marechal Rondon',
    iata: 'CGB',
    icao: 'SBCY',
  },
  {
    nome: 'Aeroporto de Maceió - Zumbi dos Palmares',
    iata: 'MCZ',
    icao: 'SBMO',
  },
  {
    nome: 'Aeroporto de Natal - Governador Aluízio Alves',
    iata: 'NAT',
    icao: 'SBNT',
  },
]

export const DOCUMENTOS_EXEMPLO = {
  INCLUSAO_CONVENIO: [
    {
      nomeArquivo: 'Modelo_Inclusao_Bradesco.pdf',
      descricao:
        'Modelo de documento para inclusão de dependentes no convênio Bradesco',
    },
    {
      nomeArquivo: 'Checklist_Documentacao_Convenio.pdf',
      descricao:
        'Lista completa de documentos necessários para inclusão no convênio',
    },
  ],
}

export const STATUS_VIAGEM = {
  PENDENTE: 'Pendente',
  APROVADA: 'Aprovada',
  RECUSADA: 'Recusada',
}

// ==================== SERVIÇO DE NOTIFICAÇÕES ====================

export const notificacaoService = {
  /**
   * Criar uma nova notificação
   * @param {string} tipo - Tipo da notificação: 'viagem', 'documento', 'alerta', 'info'
   * @param {string} titulo - Título da notificação
   * @param {string} mensagem - Mensagem detalhada
   * @param {object} dados - Dados adicionais (opcional)
   * @param {number} usuarioId - ID do usuário que receberá a notificação (opcional)
   * @param {object} usuarioResponsavel - Objeto com {id, nome} do usuário responsável pela ação (opcional)
   */
  async criar(tipo, titulo, mensagem, dados = {}, usuarioId = null, usuarioResponsavel = null) {
    try {
      const notificacao = {
        tipo,
        titulo,
        mensagem,
        lida: false,
        dataCreacao: new Date().toISOString(),
        dados,
        usuarioId,
        usuarioResponsavelId: usuarioResponsavel?.id || null,
        usuarioResponsavelNome: usuarioResponsavel?.nome || null,
      }

      const id = await db.notificacoes.add(notificacao)
      console.log('✅ Notificação criada:', { id, ...notificacao })
      return { id, ...notificacao }
    } catch (error) {
      console.error('❌ Erro ao criar notificação:', error)
      throw error
    }
  },

  /**
   * Buscar todas as notificações
   */
  async buscarTodas() {
    try {
      return await db.notificacoes.orderBy('dataCreacao').reverse().toArray()
    } catch (error) {
      console.error('❌ Erro ao buscar notificações:', error)
      return []
    }
  },

  /**
   * Buscar notificações não lidas
   */
  async buscarNaoLidas() {
    try {
      return await db.notificacoes.where('lida').equals(false).toArray()
    } catch (error) {
      console.error('❌ Erro ao buscar notificações não lidas:', error)
      return []
    }
  },

  /**
   * Contar notificações não lidas
   */
  async contarNaoLidas() {
    try {
      return await db.notificacoes.where('lida').equals(false).count()
    } catch (error) {
      console.error('❌ Erro ao contar notificações não lidas:', error)
      return 0
    }
  },

  /**
   * Marcar notificação como lida
   */
  async marcarComoLida(id) {
    try {
      await db.notificacoes.update(id, { lida: true })
      console.log('✅ Notificação marcada como lida:', id)
    } catch (error) {
      console.error('❌ Erro ao marcar notificação como lida:', error)
    }
  },

  /**
   * Marcar todas as notificações como lidas
   */
  async marcarTodasComoLidas() {
    try {
      const naoLidas = await this.buscarNaoLidas()
      const promises = naoLidas.map((n) => this.marcarComoLida(n.id))
      await Promise.all(promises)
      console.log('✅ Todas as notificações marcadas como lidas')
    } catch (error) {
      console.error('❌ Erro ao marcar todas como lidas:', error)
    }
  },

  /**
   * Excluir notificação
   */
  async excluir(id) {
    try {
      await db.notificacoes.delete(id)
      console.log('✅ Notificação excluída:', id)
    } catch (error) {
      console.error('❌ Erro ao excluir notificação:', error)
    }
  },

  /**
   * Excluir todas as notificações
   */
  async excluirTodas() {
    try {
      await db.notificacoes.clear()
      console.log('✅ Todas as notificações excluídas')
    } catch (error) {
      console.error('❌ Erro ao excluir todas as notificações:', error)
    }
  },

  // ========== NOTIFICAÇÕES ESPECÍFICAS DE VIAGEM ==========

  /**
   * Criar notificação de nova solicitação de viagem
   */
  async notificarNovaViagem(viagemId, nomeViajante, destino, usuarioResponsavel) {
    return await this.criar(
      'viagem',
      '✈️ Nova Solicitação de Viagem',
      `${nomeViajante} solicitou uma viagem para ${destino}`,
      { viagemId, acao: 'nova_viagem' },
      null,
      usuarioResponsavel
    )
  },

  /**
   * Criar notificação de viagem aprovada
   */
  async notificarViagemAprovada(viagemId, nomeViajante, destino, usuarioResponsavel) {
    return await this.criar(
      'viagem',
      '✅ Viagem Aprovada',
      `A viagem de ${nomeViajante} para ${destino} foi aprovada`,
      { viagemId, acao: 'viagem_aprovada' },
      null,
      usuarioResponsavel
    )
  },

  /**
   * Criar notificação de viagem recusada
   */
  async notificarViagemRecusada(viagemId, nomeViajante, destino, motivo, usuarioResponsavel) {
    return await this.criar(
      'viagem',
      '❌ Viagem Recusada',
      `A viagem de ${nomeViajante} para ${destino} foi recusada. Motivo: ${motivo}`,
      { viagemId, acao: 'viagem_recusada', motivo },
      null,
      usuarioResponsavel
    )
  },

  /**
   * Criar notificação de documento enviado
   */
  async notificarDocumentoEnviado(documentoId, nomeFuncionario, categoria, usuarioResponsavel) {
    return await this.criar(
      'documento',
      '📄 Novo Documento',
      `Documento ${categoria} enviado para ${nomeFuncionario}`,
      { documentoId, acao: 'documento_enviado' },
      null,
      usuarioResponsavel
    )
  },

  /**
   * Criar notificação de anexo adicionado a viagem
   * Notifica apenas usuários com permissão 'anexos_viagem' 
   * EXCETO o próprio usuário que fez o upload
   */
  async notificarAnexoAdicionado(viagemId, nomeArquivo, nomeViajante, destino, uploadPor, uploadPorId) {
    try {
      if (!uploadPorId) {
        console.error('❌ uploadPorId é obrigatório para notificação de anexo')
        return
      }

      // Buscar usuários com permissão
      const { AuthService } = await import('./authDb')
      const todosUsuarios = await AuthService.listarUsuarios()
      
      const uploadPorIdNum = parseInt(uploadPorId)
      
      // Filtrar: tem permissão E não é o próprio usuário
      const usuariosParaNotificar = todosUsuarios.filter(usuario => {
        const usuarioIdNum = parseInt(usuario.id)
        
        // 1. Excluir o próprio usuário que fez upload
        if (usuarioIdNum === uploadPorIdNum) {
          return false
        }
        
        // 2. Admin sempre recebe
        if (usuario.tipo === 'admin') {
          return true
        }
        
        // 3. Tem permissão anexos_viagem
        return (usuario.permissoes || []).includes('anexos_viagem')
      })

      console.log(`📎 Notificando ${usuariosParaNotificar.length} usuário(s) sobre novo anexo`)

      // Criar UMA notificação para cada usuário filtrado
      const notificacoes = usuariosParaNotificar.map(usuario =>
        this.criar(
          'anexo',
          '📎 Novo Anexo em Viagem',
          `${uploadPor} anexou ${nomeArquivo} na viagem de ${nomeViajante} para ${destino}`,
          { viagemId, nomeArquivo, acao: 'anexo_adicionado' },
          usuario.id,
          uploadPor
        )
      )

      await Promise.all(notificacoes)
      console.log('✅ Notificações criadas com sucesso')
    } catch (error) {
      console.error('❌ Erro ao notificar anexo:', error)
    }
  },
}

export default db