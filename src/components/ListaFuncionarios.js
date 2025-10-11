import React, { useState } from 'react';
import { db } from '../db';
import { UserPlus, Edit, Trash2, FolderOpen, Search, FileArchive, Building2, PlaneTakeoff } from 'lucide-react';

function ListaFuncionarios({ funcionarios, onNovoFuncionario, onEditar, onGerenciarDocumentos, onRelatorio, onDocumentosEmpresa, onSolicitacaoViagem }) {
  const [busca, setBusca] = useState('');

  const funcionariosFiltrados = funcionarios.filter(f => 
    f.nome.toLowerCase().includes(busca.toLowerCase()) ||
    f.cpf.includes(busca) ||
    f.cargo.toLowerCase().includes(busca.toLowerCase()) ||
    f.departamento.toLowerCase().includes(busca.toLowerCase())
  );

  const handleExcluir = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este funcionário? Todos os documentos serão removidos.')) {
      try {
        await db.documentos.where('funcionarioId').equals(id).delete();
        await db.funcionarios.delete(id);
        alert('Funcionário excluído com sucesso!');
      } catch (error) {
        alert('Erro ao excluir funcionário: ' + error.message);
      }
    }
  };

  return (
    <div className="lista-container">
      <div className="lista-header">
        <h2>Funcionários</h2>
        <div className="header-acoes">
          <button onClick={onSolicitacaoViagem} className="btn-solicitacao-viagem">
            <PlaneTakeoff size={20} />
            Solicitação Viagem
          </button>
          <button onClick={onDocumentosEmpresa} className="btn-docs-empresa">
            <Building2 size={20} />
            Docs Empresa
          </button>
          <button onClick={onRelatorio} className="btn-relatorio">
            <FileArchive size={20} />
            Download em Massa
          </button>
          <button onClick={onNovoFuncionario} className="btn-novo">
            <UserPlus size={20} />
            Novo Funcionário
          </button>
        </div>
      </div>

      <div className="busca-container">
        <Search size={20} />
        <input
          type="text"
          placeholder="Buscar por nome, CPF, cargo ou departamento..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="input-busca"
        />
      </div>

      <div className="tabela-container">
        <table className="tabela-funcionarios">
          <thead>
            <tr>
              <th>Nome</th>
              <th>CPF</th>
              <th>Cargo</th>
              <th>Departamento</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {funcionariosFiltrados.length === 0 ? (
              <tr>
                <td colSpan="5" className="sem-dados">
                  {busca ? 'Nenhum funcionário encontrado' : 'Nenhum funcionário cadastrado'}
                </td>
              </tr>
            ) : (
              funcionariosFiltrados.map(funcionario => (
                <tr key={funcionario.id}>
                  <td>{funcionario.nome}</td>
                  <td>{funcionario.cpf}</td>
                  <td>{funcionario.cargo}</td>
                  <td>{funcionario.departamento}</td>
                  <td className="acoes">
                    <button
                      onClick={() => onGerenciarDocumentos(funcionario)}
                      className="btn-acao btn-documentos"
                      title="Gerenciar Documentos"
                    >
                      <FolderOpen size={18} />
                    </button>
                    <button
                      onClick={() => onEditar(funcionario)}
                      className="btn-acao btn-editar"
                      title="Editar"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleExcluir(funcionario.id)}
                      className="btn-acao btn-excluir"
                      title="Excluir"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ListaFuncionarios;