import Dexie from 'dexie' // Importar Dexie.js para gerenciamento de IndexedDB

export const db = new Dexie('SistemaFuncionarios') // Nome do banco de dados

db.version(21).stores({
  // Incrementar a versão do banco de dados
  funcionarios:
    '++id, nome, cpf, cargo, departamento',
  documentos:
    '++id, funcionarioId, categoria, nomeArquivo, dataUpload, mes, ano, dataInicio, dataFim',
  documentosEmpresa:
    '++id, funcionarioId, categoriaEmpresa, nomeArquivo, dataUpload, mes, ano, fixado',
  solicitacoesViagem:
    '++id, solicitanteId, viajanteId, origem, destino, dataIda, horarioIdaInicio, horarioIdaFim, dataVolta, horarioVoltaInicio, horarioVoltaFim, justificativa, observacao, status, dataSolicitacao, motivoRecusa',
  notificacoes:
    '++id, tipo, titulo, mensagem, lida, dataCreacao, dados, usuarioId',
  })

export const CATEGORIAS = {
  // Definir categorias de documentos
  ABONO_ASSIDUIDADE: 'Abono de Assiduidade', // Chave para ABONO_ASSIDUIDADE
  ATESTADO_MEDICO: 'Atestado Médico', // Chave para ATESTADO_MEDICO
  ATESTADO_COMPARECIMENTO: 'Atestado de Comparecimento', // Chave para ATESTADO_COMPARECIMENTO
  FERIAS: 'Férias', // Chave para FERIAS
  AJUSTE_PONTO: 'Ajuste de Ponto', // Chave para AJUSTE_PONTO
  LICENCA_MATERNIDADE_PATERNIDADE: 'Licença Maternidade/Paternidade', // Chave para LICENÇA_MATERNIDADE
  LICENCA_NOJO: 'Licença Nojo', // Chave para LICENÇA_NOJO
  LICENCA_GALA: 'Licença Gala', // Chave para LICENCA_GALA
  JUSTICA_ELEITORAL: 'Justica Eleitoral', // Chave para JUSTICA_ELEITORAL
  DOACAO_SANGUE: 'Doação de Sangue', // Chave para DOACAO_SANGUE
}

export const CATEGORIAS_EMPRESA = {
  // Definir categorias de documentos da empresa
  INCLUSAO_CONVENIO: 'Inclusão do Convênio', // Chave para INCLUSAO_CONVENIO
  EXCLUSAO_CONVENIO: 'Exclusão do Convênio', // Chave para EXCLUSAO_CONVENIO
  PASSAGENS_AEREAS: 'Passagens Aéreas', // Chave para PASSAGENS_AEREAS
}

export const DEPARTAMENTOS = [
  'PRESI','DIRAP','DIBEN','GECAP','GECON','GEINF','GECOR','GEOPE','GETEC',
  'GEFIN','GEBEN','GERIS','SELOG','SEFOP','SECON','SEBEN','SECAB','SECRE',
  'SETES','SEMEF','SESUP','SEFIN','SEDES','AUDIT','COJUR',
]

export const CARGOS = [
  'Advogada Jr. B','Advogada Sr. D','Advogado Pl. E','Advogado Sr. E','Analista Jr. A',
  'Analista Jr. B','Analista Jr. C','Analista Jr. D','Analista Jr. E','Analista Jr. F',
  'Analista Pl. A','Analista Pl. B','Analista Pl. C','Analista Pl. E','Analista Pl. F',
  'Analista Sr. A','Analista Sr. B','Analista Sr. C','Analista Sr. D','Analista Sr. E',
  'Analista Sr. F','Diretor','Estagiário','Gerente',
]

export const AEROPORTOS = [
  {
    nome: 'Aeroporto de São Paulo - Guarulhos',
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
    nome: 'Aeroporto de Curitiba -Afonso Pena',
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
  // Adicionar documentos de exemplo
  INCLUSAO_CONVENIO: [
    // Chave para INCLUSAO_CONVENIO
    {
      nomeArquivo: 'Modelo_Inclusao_Bradesco.pdf', // Arquivo do documento
      descricao:
        'Modelo de documento para inclusão de dependentes no convênio Bradesco', // Descrição do documento
    },
    {
      nomeArquivo: 'Checklist_Documentacao_Convenio.pdf', // Arquivo do documento
      descricao:
        'Lista completa de documentos necessários para inclusão no convênio', // Descrição do documento
    },
  ],
}

export const STATUS_VIAGEM = {
  // Definir status de viagem
  PENDENTE: 'Pendente', // Chave para PENDENTE
  APROVADA: 'Aprovada', // Chave para APROVADA
  RECUSADA: 'Recusada', // Chave para RECUSADA
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
   */
  async criar(tipo, titulo, mensagem, dados = {}, usuarioId = null) {
    try {
      const notificacao = {
        tipo,
        titulo,
        mensagem,
        lida: false,
        dataCreacao: new Date().toISOString(),
        dados,
        usuarioId,
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
  async notificarNovaViagem(viagemId, nomeViajante, destino) {
    return await this.criar(
      'viagem',
      '✈️ Nova Solicitação de Viagem',
      `${nomeViajante} solicitou uma viagem para ${destino}`,
      { viagemId, acao: 'nova_viagem' }
    )
  },

  /**
   * Criar notificação de viagem aprovada
   */
  async notificarViagemAprovada(viagemId, nomeViajante, destino) {
    return await this.criar(
      'viagem',
      '✅ Viagem Aprovada',
      `A viagem de ${nomeViajante} para ${destino} foi aprovada`,
      { viagemId, acao: 'viagem_aprovada' }
    )
  },

  /**
   * Criar notificação de viagem recusada
   */
  async notificarViagemRecusada(viagemId, nomeViajante, destino, motivo) {
    return await this.criar(
      'viagem',
      '❌ Viagem Recusada',
      `A viagem de ${nomeViajante} para ${destino} foi recusada. Motivo: ${motivo}`,
      { viagemId, acao: 'viagem_recusada', motivo }
    )
  },

  /**
   * Criar notificação de documento enviado
   */
  async notificarDocumentoEnviado(documentoId, nomeFuncionario, categoria) {
    return await this.criar(
      'documento',
      '📄 Novo Documento',
      `Documento ${categoria} enviado para ${nomeFuncionario}`,
      { documentoId, acao: 'documento_enviado' }
    )
  },
} 