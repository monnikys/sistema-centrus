import React, { useState, useEffect } from 'react';
import { db } from '../db';
import { ArrowLeft, Save } from 'lucide-react';

function CadastroFuncionario({ funcionario, onVoltar }) {
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    cargo: '',
    departamento: '',
    email: '',
    telefone: ''
  });

  useEffect(() => {
    if (funcionario) {
      setFormData(funcionario);
    }
  }, [funcionario]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (funcionario?.id) {
        await db.funcionarios.update(funcionario.id, formData);
        alert('Funcionário atualizado com sucesso!');
      } else {
        await db.funcionarios.add(formData);
        alert('Funcionário cadastrado com sucesso!');
      }
      onVoltar();
    } catch (error) {
      alert('Erro ao salvar funcionário: ' + error.message);
    }
  };

  return (
    <div className="cadastro-container">
      <div className="cadastro-header">
        <button onClick={onVoltar} className="btn-voltar">
          <ArrowLeft size={20} />
          Voltar
        </button>
        <h2>{funcionario ? 'Editar Funcionário' : 'Novo Funcionário'}</h2>
      </div>

      <form onSubmit={handleSubmit} className="form-cadastro">
        <div className="form-group">
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
          <div className="form-group">
            <label>Cargo *</label>
            <input
              type="text"
              name="cargo"
              value={formData.cargo}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Departamento *</label>
            <input
              type="text"
              name="departamento"
              value={formData.departamento}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
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
          <Save size={20} />
          Salvar
        </button>
      </form>
    </div>
  );
}

export default CadastroFuncionario;