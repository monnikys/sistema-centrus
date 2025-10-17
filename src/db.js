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
  'Estagiário',
  'Gerente',
  'Gerente Geral',
]

export const AEROPORTOS = [
  {
    nome: 'Aeroporto Internacional de São Paulo-Guarulhos',
    iata: 'GRU',
    icao: 'SBGR',
  },
  { nome: 'Aeroporto de São Paulo-Congonhas', iata: 'CGH', icao: 'SBSP' },
  { nome: 'Aeroporto Internacional de Brasília', iata: 'BSB', icao: 'SBBR' },
  {
    nome: 'Aeroporto Internacional do Rio de Janeiro-Galeão',
    iata: 'GIG',
    icao: 'SBGL',
  },
  {
    nome: 'Aeroporto Internacional de Campinas (Viracopos)',
    iata: 'VCP',
    icao: 'SBKP',
  },
  {
    nome: 'Aeroporto Internacional de Belo Horizonte-Confins',
    iata: 'CNF',
    icao: 'SBCF',
  },
  {
    nome: 'Aeroporto Internacional do Recife-Guararapes',
    iata: 'REC',
    icao: 'SBRF',
  },
  { nome: 'Aeroporto Internacional de Salvador', iata: 'SSA', icao: 'SBSV' },
  {
    nome: 'Aeroporto do Rio de Janeiro-Santos Dumont',
    iata: 'SDU',
    icao: 'SBRJ',
  },
  {
    nome: 'Aeroporto Internacional de Curitiba (Afonso Pena)',
    iata: 'CWB',
    icao: 'SBCT',
  },
  { nome: 'Aeroporto Internacional de Fortaleza', iata: 'FOR', icao: 'SBFZ' },
  {
    nome: 'Aeroporto Internacional de Florianópolis',
    iata: 'FLN',
    icao: 'SBFL',
  },
  {
    nome: 'Aeroporto Internacional de Belém (Val de Cans)',
    iata: 'BEL',
    icao: 'SBBE',
  },
  {
    nome: 'Aeroporto Internacional de Goiânia (Santa Genoveva)',
    iata: 'GYN',
    icao: 'SBGO',
  },
  {
    nome: 'Aeroporto Internacional de Porto Alegre',
    iata: 'POA',
    icao: 'SBPA',
  },
  {
    nome: 'Aeroporto Internacional de Vitória (Eurico de Aguiar Salles)',
    iata: 'VIX',
    icao: 'SBVT',
  },
  {
    nome: 'Aeroporto Internacional de Manaus (Eduardo Gomes)',
    iata: 'MAO',
    icao: 'SBEG',
  },
  {
    nome: 'Aeroporto Internacional de Cuiabá (Marechal Rondon)',
    iata: 'CGB',
    icao: 'SBCY',
  },
  {
    nome: 'Aeroporto Internacional de Maceió (Zumbi dos Palmares)',
    iata: 'MCZ',
    icao: 'SBMO',
  },
  {
    nome: 'Aeroporto Internacional de Natal (Governador Aluízio Alves)',
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
