import React, { useState } from 'react';
import { db } from '../db';
import { Edit, Trash2, FolderOpen, Search } from 'lucide-react';

function ListaFuncionarios({ funcionarios, onEditar, onGerenciarDocumentos }) {
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