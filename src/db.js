import Dexie from 'dexie' // Importar Dexie.js para gerenciamento de IndexedDB

export const db = new Dexie('SistemaFuncionarios') // Nome do banco de dados

db.version(6).stores({
  // Incrementar a versão do banco de dados
  funcionarios: '++id, nome, cpf, cargo, departamento', 
  documentos:
    '++id, funcionarioId, categoria, nomeArquivo, dataUpload, mes, ano, dataInicio, dataFim',
  documentosEmpresa:
    '++id, funcionarioId, categoriaEmpresa, nomeArquivo, dataUpload, mes, ano, fixado', 
  solicitacoesViagem:
    '++id, solicitanteId, viajanteId, origem, destino, dataIda, horarioIdaInicio, horarioIdaFim, dataVolta, horarioVoltaInicio, horarioVoltaFim, justificativa, observacao, status, dataSolicitacao, motivoRecusa',
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
  'PRESI',
  'DIRAP',
  'DIBEN',
  'GECAP',
  'GECON',
  'GEINF',
  'GECOR',
  'GEOPE',
  'GETEC',
  'GEFIN',
  'GEBEN',
  'GERIS',
  'SELOG',
  'SEFOP',
  'SECON',
  'SEBEN',
  'SECAB',
  'SECRE',
  'SETES',
  'SEMEF',
  'SESUP',
  'SEFIN',
  'SEDES',
  'AUDIT',
  'COJUR',
]

export const CARGOS = [
  'Advogada Jr. B',
  'Advogada Sr. D',
  'Advogado Pl. E',
  'Advogado Sr. E',
  'Analista Jr. A',
  'Analista Jr. B',
  'Analista Jr. C',
  'Analista Jr. D',
  'Analista Jr. E',
  'Analista Jr. F',
  'Analista Pl. A',
  'Analista Pl. B',
  'Analista Pl. C',
  'Analista Pl. E',
  'Analista Pl. F',
  'Analista Sr. A',
  'Analista Sr. B',
  'Analista Sr. C',
  'Analista Sr. D',
  'Analista Sr. E',
  'Analista Sr. F',
  'Diretor',
  'Diretor-Presidente',
  'Estagiário',
  'Gerente',
  'Gerente Geral',
  
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
