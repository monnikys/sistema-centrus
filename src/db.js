import Dexie from 'dexie';

export const db = new Dexie('SistemaFuncionarios');

db.version(6).stores({
  funcionarios: '++id, nome, cpf, cargo, departamento',
  documentos: '++id, funcionarioId, categoria, nomeArquivo, dataUpload, mes, ano, dataInicio, dataFim',
  documentosEmpresa: '++id, funcionarioId, categoriaEmpresa, nomeArquivo, dataUpload, mes, ano, fixado',
  solicitacoesViagem: '++id, solicitanteId, viajanteId, origem, destino, dataIda, horarioIda, dataVolta, horarioVolta, justificativa, observacao, status, dataSolicitacao'
});

export const CATEGORIAS = {
  ABONO_ASSIDUIDADE: 'Abono de Assiduidade',
  ATESTADO_MEDICO: 'Atestado Médico',
  ATESTADO_COMPARECIMENTO: 'Atestado de Comparecimento',
  FALTA: 'Falta',
  AJUSTE_PONTO: 'Ajuste de Ponto'
};

export const CATEGORIAS_EMPRESA = {
  INCLUSAO_CONVENIO: 'Inclusão do Convênio',
  PASSAGENS_AEREAS: 'Passagens Aéreas'
};

export const DOCUMENTOS_EXEMPLO = {
  INCLUSAO_CONVENIO: [
    {
      nomeArquivo: 'Modelo_Inclusao_Bradesco.pdf',
      descricao: 'Modelo de documento para inclusão de dependentes no convênio Bradesco'
    },
    {
      nomeArquivo: 'Checklist_Documentacao_Convenio.pdf',
      descricao: 'Lista completa de documentos necessários para inclusão no convênio'
    }
  ]
};

export const HORARIOS_VIAGEM = {
  MADRUGADA: 'Madrugada (00h - 06h)',
  MANHA: 'Manhã (06h - 12h)',
  TARDE: 'Tarde (12h - 18h)',
  NOITE: 'Noite (18h - 00h)'
};

export const STATUS_VIAGEM = {
  PENDENTE: 'Pendente',
  APROVADA: 'Aprovada',
  RECUSADA: 'Recusada'
};