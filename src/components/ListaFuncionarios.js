// src/components/ListaFuncionarios.js
import React, { useState, useEffect } from 'react'
import {
  Search,
  Edit,
  FileText,
  Trash2,
  UserPlus,
  Download,
} from 'lucide-react'
import { db } from '../db'
import { AuthService } from '../authDb'

function ListaFuncionarios({ funcionarios, onEditar, onGerenciarDocumentos }) {
  // Componente para listar funcionários
  const [busca, setBusca] = useState('') // Estado para armazenar o termo de busca
  const [usuarioAtual, setUsuarioAtual] = useState(null) // Usuário logado
  const [permissoes, setPermissoes] = useState({
    podeEditar: false,
    podeGerenciarDocs: false,
    podeExcluir: false,
  })

  useEffect(() => {
    // Carregar permissões do usuário ao montar o componente
    carregarPermissoes()
  }, [])

  const carregarPermissoes = async () => {
    // Função para carregar as permissões do usuário
    try {
      const usuario = await AuthService.obterUsuarioAtual()
      setUsuarioAtual(usuario)

      // Se for admin, tem todas as permissões
      if (usuario.tipo === 'admin') {
        setPermissoes({
          podeEditar: true,
          podeGerenciarDocs: true,
          podeExcluir: true,
        })
        console.log('👑 Admin: Todas as permissões concedidas')
        return
      }

      // Se for usuário comum, verificar permissões específicas
      const permissoesUsuario = usuario.permissoes || []
      const permissoesCarregadas = {
        podeEditar: permissoesUsuario.includes('cadastro_funcionarios'),
        podeGerenciarDocs: permissoesUsuario.includes(
          'documentos_funcionarios'
        ),
        podeExcluir: permissoesUsuario.includes('cadastro_funcionarios'), // Só quem pode cadastrar pode excluir
      }

      setPermissoes(permissoesCarregadas)
      console.log('🔑 Permissões do usuário na lista de funcionários:')
      console.log('  - Pode editar:', permissoesCarregadas.podeEditar)
      console.log(
        '  - Pode gerenciar documentos:',
        permissoesCarregadas.podeGerenciarDocs
      )
      console.log('  - Pode excluir:', permissoesCarregadas.podeExcluir)
    } catch (error) {
      console.error('Erro ao carregar permissões:', error)
    }
  }

  const excluirFuncionario = async (id, nome) => {
    // Função para excluir um funcionário
    if (!permissoes.podeExcluir) {
      alert('Você não tem permissão para excluir funcionários')
      return
    }

    if (!window.confirm(`Deseja realmente excluir ${nome}?`)) {
      return
    }

    try {
      await db.funcionarios.delete(id) // Excluir funcionário do banco
      // A lista será atualizada automaticamente pelo useLiveQuery no App.js
    } catch (error) {
      console.error('Erro ao excluir funcionário:', error)
      alert('Erro ao excluir funcionário')
    }
  }

  // Filtrar funcionários pela busca
  const funcionariosFiltrados = funcionarios.filter((func) => {
    const termoBusca = busca.toLowerCase()
    return (
      func.nome?.toLowerCase().includes(termoBusca) ||
      func.cpf?.includes(termoBusca) ||
      func.matricula?.includes(termoBusca) ||
      func.cargo?.toLowerCase().includes(termoBusca)
    )
  })

  return (
    <div className="lista-funcionarios">
      {/* Cabeçalho da lista */}
      <div className="lista-header">
        <div className="titulo-secao">
          <h2>Lista de Funcionários</h2>
          <span className="contador">
            {funcionariosFiltrados.length} funcionário(s)
          </span>
        </div>

        {/* Campo de busca */}
        <div className="busca-container">
          <Search size={20} className="busca-icon" />
          <input
            type="text"
            placeholder="Buscar por nome, CPF, matrícula ou cargo..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="input-busca"
          />
        </div>
      </div>

      {/* Lista de funcionários */}
      {funcionariosFiltrados.length === 0 ? (
        <div className="lista-vazia">
          <p>Nenhum funcionário encontrado</p>
        </div>
      ) : (
        <div className="tabela-funcionarios">
          {funcionariosFiltrados.map((func) => (
            <div key={func.id} className="funcionario-card">
              <div className="funcionario-info">
                <div className="funcionario-avatar">
                  {func.nome?.charAt(0).toUpperCase() || 'F'}
                </div>
                <div className="funcionario-dados">
                  <h3>{func.nome}</h3>
                  <div className="funcionario-detalhes">
                    <span>CPF: {func.cpf}</span>
                    <span>Matrícula: {func.matricula}</span>
                    {func.cargo && <span>Cargo: {func.cargo}</span>}
                  </div>
                </div>
              </div>

              <div className="funcionario-acoes">
                {/* Botão Gerenciar Documentos - só aparece se tiver permissão */}
                {permissoes.podeGerenciarDocs && (
                  <button
                    className="btn-acao btn-documentos"
                    onClick={() => onGerenciarDocumentos(func)}
                    title="Gerenciar Documentos"
                  >
                    <FileText size={18} />
                    <span>Documentos</span>
                  </button>
                )}

                {/* Botão Editar - só aparece se tiver permissão */}
                {permissoes.podeEditar && (
                  <button
                    className="btn-acao btn-editar"
                    onClick={() => onEditar(func)}
                    title="Editar Funcionário"
                  >
                    <Edit size={18} />
                    <span>Editar</span>
                  </button>
                )}

                {/* Botão Excluir - só aparece se tiver permissão */}
                {permissoes.podeExcluir && (
                  <button
                    className="btn-acao btn-excluir"
                    onClick={() => excluirFuncionario(func.id, func.nome)}
                    title="Excluir Funcionário"
                  >
                    <Trash2 size={18} />
                    <span>Excluir</span>
                  </button>
                )}

                {/* Se não tem nenhuma permissão de ação, mostrar mensagem */}
                {!permissoes.podeEditar &&
                  !permissoes.podeGerenciarDocs &&
                  !permissoes.podeExcluir && (
                    <div
                      style={{
                        padding: '10px',
                        color: '#999',
                        fontSize: '13px',
                        fontStyle: 'italic',
                      }}
                    >
                      Apenas visualização
                    </div>
                  )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ListaFuncionarios
