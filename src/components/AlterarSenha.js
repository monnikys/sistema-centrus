// src/components/AlterarSenha.js
import React, { useState } from 'react';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, Key } from 'lucide-react';
import { AuthService, hashSenha, verificarSenha } from '../authDb';
import { authDb } from '../authDb';
import './styles/AlterarSenha.css';

const AlterarSenha = ({ usuario, onFechar }) => {
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [mostrarSenhaAtual, setMostrarSenhaAtual] = useState(false);
  const [mostrarNovaSenha, setMostrarNovaSenha] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });
  const [carregando, setCarregando] = useState(false);

  const validarSenha = (senha) => {
    const requisitos = {
      tamanho: senha.length >= 8,
      maiuscula: /[A-Z]/.test(senha),
      minuscula: /[a-z]/.test(senha),
      numero: /[0-9]/.test(senha)
    };

    return requisitos;
  };

  const requisitos = validarSenha(novaSenha);
  const senhaForte = Object.values(requisitos).every(v => v);

  const mostrarMensagem = (tipo, texto) => {
    setMensagem({ tipo, texto });
    setTimeout(() => setMensagem({ tipo: '', texto: '' }), 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCarregando(true);

    try {
      // Validações
      if (!senhaAtual || !novaSenha || !confirmarSenha) {
        mostrarMensagem('erro', 'Preencha todos os campos');
        setCarregando(false);
        return;
      }

      if (novaSenha !== confirmarSenha) {
        mostrarMensagem('erro', 'As senhas não coincidem');
        setCarregando(false);
        return;
      }

      if (novaSenha.length < 8) {
        mostrarMensagem('erro', 'A senha deve ter no mínimo 8 caracteres');
        setCarregando(false);
        return;
      }

      if (!senhaForte) {
        mostrarMensagem('erro', 'A senha deve atender todos os requisitos de segurança');
        setCarregando(false);
        return;
      }

      // Buscar usuário e verificar senha atual
      const usuarioDB = await authDb.usuarios.get(usuario.id);
      
      if (!usuarioDB) {
        mostrarMensagem('erro', 'Usuário não encontrado');
        setCarregando(false);
        return;
      }

      const senhaAtualValida = await verificarSenha(senhaAtual, usuarioDB.senha);
      
      if (!senhaAtualValida) {
        mostrarMensagem('erro', 'Senha atual incorreta');
        setCarregando(false);
        return;
      }

      // Hash da nova senha
      const novaSenhaHash = await hashSenha(novaSenha);

      // Atualizar senha no banco
      await authDb.usuarios.update(usuario.id, {
        senha: novaSenhaHash
      });

      mostrarMensagem('sucesso', 'Senha alterada com sucesso!');
      
      // Limpar campos
      setTimeout(() => {
        setSenhaAtual('');
        setNovaSenha('');
        setConfirmarSenha('');
        if (onFechar) {
          onFechar();
        }
      }, 2000);

    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      mostrarMensagem('erro', 'Erro ao alterar senha. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="alterar-senha-modal">
      <div className="alterar-senha-backdrop" onClick={onFechar}></div>
      
      <div className="alterar-senha-card">
        <div className="alterar-senha-header">
          <div className="header-icon">
            <Key size={32} />
          </div>
          <h2>Alterar Senha</h2>
          <p>Mantenha sua conta segura com uma senha forte</p>
        </div>

        {mensagem.texto && (
          <div className={`mensagem-senha mensagem-${mensagem.tipo}`}>
            {mensagem.tipo === 'sucesso' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            <span>{mensagem.texto}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="form-alterar-senha">
          {/* Senha Atual */}
          <div className="form-group-senha">
            <label>
              <Lock size={16} />
              Senha Atual
            </label>
            <div className="input-senha-container">
              <input
                type={mostrarSenhaAtual ? 'text' : 'password'}
                value={senhaAtual}
                onChange={(e) => setSenhaAtual(e.target.value)}
                placeholder="Digite sua senha atual"
                disabled={carregando}
              />
              <button
                type="button"
                className="toggle-senha-btn"
                onClick={() => setMostrarSenhaAtual(!mostrarSenhaAtual)}
                tabIndex="-1"
              >
                {mostrarSenhaAtual ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Nova Senha */}
          <div className="form-group-senha">
            <label>
              <Lock size={16} />
              Nova Senha
            </label>
            <div className="input-senha-container">
              <input
                type={mostrarNovaSenha ? 'text' : 'password'}
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                placeholder="Digite sua nova senha"
                disabled={carregando}
              />
              <button
                type="button"
                className="toggle-senha-btn"
                onClick={() => setMostrarNovaSenha(!mostrarNovaSenha)}
                tabIndex="-1"
              >
                {mostrarNovaSenha ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Requisitos de Senha */}
          {novaSenha && (
            <div className="requisitos-senha">
              <p className="requisitos-titulo">Requisitos de segurança:</p>
              <ul>
                <li className={requisitos.tamanho ? 'requisito-ok' : 'requisito-pendente'}>
                  {requisitos.tamanho ? '✓' : '○'} Mínimo de 8 caracteres
                </li>
                <li className={requisitos.maiuscula ? 'requisito-ok' : 'requisito-pendente'}>
                  {requisitos.maiuscula ? '✓' : '○'} Pelo menos uma letra maiúscula
                </li>
                <li className={requisitos.minuscula ? 'requisito-ok' : 'requisito-pendente'}>
                  {requisitos.minuscula ? '✓' : '○'} Pelo menos uma letra minúscula
                </li>
                <li className={requisitos.numero ? 'requisito-ok' : 'requisito-pendente'}>
                  {requisitos.numero ? '✓' : '○'} Pelo menos um número
                </li>
              </ul>
            </div>
          )}

          {/* Confirmar Senha */}
          <div className="form-group-senha">
            <label>
              <Lock size={16} />
              Confirmar Nova Senha
            </label>
            <div className="input-senha-container">
              <input
                type={mostrarConfirmar ? 'text' : 'password'}
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                placeholder="Confirme sua nova senha"
                disabled={carregando}
              />
              <button
                type="button"
                className="toggle-senha-btn"
                onClick={() => setMostrarConfirmar(!mostrarConfirmar)}
                tabIndex="-1"
              >
                {mostrarConfirmar ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {confirmarSenha && novaSenha !== confirmarSenha && (
              <span className="erro-confirmacao">As senhas não coincidem</span>
            )}
          </div>

          {/* Botões */}
          <div className="form-actions-senha">
            <button
              type="button"
              className="btn-cancelar-senha"
              onClick={onFechar}
              disabled={carregando}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-salvar-senha"
              disabled={carregando || !senhaForte || novaSenha !== confirmarSenha}
            >
              {carregando ? (
                <>
                  <span className="spinner-pequeno"></span>
                  Salvando...
                </>
              ) : (
                <>
                  <CheckCircle size={18} />
                  Alterar Senha
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AlterarSenha;