import React, { useState, useEffect } from 'react'
import { CARGOS, db } from '../db'
import { ArrowLeft, Save } from 'lucide-react'
import { DEPARTAMENTOS } from '../db'

function CadastroFuncionario({ funcionario, onVoltar }) {
  // Componente que cadastra ou edita funcionários; recebe o funcionário e uma função para voltar
  const [formData, setFormData] = useState({
    // Estado que armazena os dados do formulário
    nome: '', // Nome completo do funcionário
    cpf: '', // CPF do funcionário
    cargo: '', // Cargo ocupado
    departamento: '', // Departamento do funcionário
    email: '', // E-mail corporativo
    telefone: '', // Telefone de contato
  })

  useEffect(() => {
    // Executa sempre que o prop "funcionario" mudar
    if (funcionario) {
      // Se houver um funcionário
      setFormData(funcionario) // Se houver um funcionário, preenche o formulário para edição
    }
  }, [funcionario]) // Dependência: será executado novamente se "funcionario" mudar

  const handleChange = (e) => {
    // Função para atualizar os valores dos campos
    const { name, value } = e.target // Desestrutura o nome e valor do campo alterado
    console.log(`🔄 Campo "${name}" alterado para: "${value}"`) // DEBUG: mostrar mudanças
    setFormData((prev) => ({ ...prev, [name]: value })) // Atualiza apenas o campo modificado, mantendo os demais
  }

  const handleSubmit = async (e) => {
    // Função que será executada ao enviar o formulário
    e.preventDefault() // Evita o recarregamento da página ao enviar o form

    // DEBUG: Mostrar os dados antes de salvar
    console.log('📋 Dados do formulário:', formData)

    try {
      if (funcionario?.id) {
        // Se o funcionário já tiver um ID, é uma edição
        await db.funcionarios.update(funcionario.id, formData) // Atualiza os dados no banco
        alert('Funcionário atualizado com sucesso!') // Mostra mensagem de sucesso
      } else {
        // Caso contrário, é um novo cadastro
        await db.funcionarios.add(formData) // Adiciona o novo funcionário no banco
        alert('Funcionário cadastrado com sucesso!') // Mostra mensagem de sucesso
      }
      onVoltar() // Retorna à tela anterior após salvar
    } catch (error) {
      // Caso ocorra algum erro no processo
      console.error('❌ Erro completo:', error) // Log do erro completo
      alert('Erro ao salvar funcionário: ' + error.message) // Exibe mensagem de erro
    }
  }

  return (
    <div className="cadastro-container">
      {' '}
      {/* Container principal do formulário */}
      <div className="cadastro-header">
        {' '}
        {/* Cabeçalho do formulário */}
        <button onClick={onVoltar} className="btn-voltar">
          {' '}
          {/* Botão para voltar */}
          <ArrowLeft size={20} />
          Voltar
        </button>
        <h2>{funcionario ? 'Editar Funcionário' : 'Novo Funcionário'}</h2>{' '}
        {/* Título dinâmico */}
      </div>
      <form onSubmit={handleSubmit} className="form-cadastro">
        {' '}
        {/* Formulário principal */}
        <div className="form-group">
          {' '}
          {/* Campo: Nome */}
          <label>Nome Completo *</label>
          <input
            type="text"
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          {' '}
          {/* Campo: CPF */}
          <label>CPF *</label>
          <input
            type="text"
            name="cpf"
            value={formData.cpf}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-row">
          {' '}
          {/* Linha com dois campos lado a lado */}
          <div className="form-group">
            {' '}
            {/* Campo: Cargo */}
            <label>Cargo *</label>
            <select
              name="cargo"
              value={formData.cargo}
              onChange={handleChange}
              required
            >
              <option value="">Selecione um cargo</option>
              {CARGOS.map((cargo, index) => (
                <option key={index} value={cargo}>
                  {cargo}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            {' '}
            {/* Campo: Departamento */}
            <label>Departamento *</label>
            <select
              name="departamento"
              value={formData.departamento}
              onChange={handleChange}
              required
            >
              <option value="">Selecione um departamento</option>
              {DEPARTAMENTOS.map((dept, index) => (
                <option key={index} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="form-row">
          {' '}
          {/* Linha com campos de e-mail e telefone */}
          <div className="form-group">
            {' '}
            {/* Campo: Email */}
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            {' '}
            {/* Campo: Telefone */}
            <label>Telefone</label>
            <input
              type="tel"
              name="telefone"
              value={formData.telefone}
              onChange={handleChange}
            />
          </div>
        </div>
        <button type="submit" className="btn-salvar">
          {' '}
          {/* Botão de salvar */}
          <Save size={20} />
          Salvar
        </button>
      </form>
    </div>
  )
}

export default CadastroFuncionario // Exporta o componente para uso em outras partes do sistema
