import Dexie from 'dexie' // Importar Dexie.js para gerenciamento de IndexedDB

export const db = new Dexie('SistemaFuncionarios') // Nome do banco de dados

db.version(6).stores({
  // Incrementar a versão do banco de dados
  funcionarios: '++id, nome, cpf, cargo, departamento', // Adicionar campo 'departamento'
  documentos:
    '++id, funcionarioId, categoria, nomeArquivo, dataUpload, mes, ano, dataInicio, dataFim', // Adicionar campos 'dataInicio' e 'dataFim'
  documentosEmpresa:
    '++id, funcionarioId, categoriaEmpresa, nomeArquivo, dataUpload, mes, ano, fixado', // Adicionar campo 'fixado'
  solicitacoesViagem:
    '++id, solicitanteId, viajanteId, origem, destino, dataIda, horarioIda, dataVolta, horarioVolta, justificativa, observacao, status, dataSolicitacao', // Adicionar campo 'dataSolicitacao'
})

export const CATEGORIAS = {
  // Definir categorias de documentos
  ABONO_ASSIDUIDADE: 'Abono de Assiduidade', // Chave para ABONO_ASSIDUIDADE
  ATESTADO_MEDICO: 'Atestado Médico', // Chave para ATESTADO_MEDICO
  ATESTADO_COMPARECIMENTO: 'Atestado de Comparecimento', // Chave para ATESTADO_COMPARECIMENTO
  FERIAS: 'Férias', // Chave para FERIAS
  AJUSTE_PONTO: 'Ajuste de Ponto', // Chave para AJUSTE_PONTO
}

export const CATEGORIAS_EMPRESA = {
  // Definir categorias de documentos da empresa
  INCLUSAO_CONVENIO: 'Inclusão do Convênio', // Chave para INCLUSAO_CONVENIO
  EXCLUSAO_CONVENIO: 'Exclusão do Convênio', // Chave para EXCLUSAO_CONVENIO
  PASSAGENS_AEREAS: 'Passagens Aéreas', // Chave para PASSAGENS_AEREAS
}

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

export const HORARIOS_VIAGEM = {
  // Definir horários de viagem
  MADRUGADA: 'Madrugada (00h - 06h)', // Chave para MADRUGADA
  MANHA: 'Manhã (06h - 12h)', // Chave para MANHA
  TARDE: 'Tarde (12h - 18h)', // Chave para TARDE
  NOITE: 'Noite (18h - 00h)', // Chave para NOITE
}

export const STATUS_VIAGEM = {
  // Definir status de viagem
  PENDENTE: 'Pendente', // Chave para PENDENTE
  APROVADA: 'Aprovada', // Chave para APROVADA
  RECUSADA: 'Recusada', // Chave para RECUSADA
}
