import React, { useState } from 'react';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, Key } from 'lucide-react';
import { AuthService, hashSenha, verificarSenha } from '../authDb';
import { authDb } from '../authDb';
import './styles/AlterarSenha.css';

const AlterarSenha = ({ usuario, onFechar }) => {  // Componente que recebe o usuário atual e a função para fechar o modal
  
  const [senhaAtual, setSenhaAtual] = useState('');  // Armazena a senha atual digitada pelo usuário
  const [novaSenha, setNovaSenha] = useState('');  // Armazena a nova senha digitada
  const [confirmarSenha, setConfirmarSenha] = useState('');  // Armazena a confirmação da nova senha

  const [mostrarSenhaAtual, setMostrarSenhaAtual] = useState(false);  // Controla se a senha atual será exibida ou ocultada
  const [mostrarNovaSenha, setMostrarNovaSenha] = useState(false);  // Controla se a nova senha será exibida ou ocultada
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);  // Controla se o campo de confirmação será exibido ou ocultado

  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });  // Exibe mensagens de erro ou sucesso na tela
  const [carregando, setCarregando] = useState(false);  // Indica se a operação de alteração de senha está em andamento (mostra o spinner)


  const validarSenha = (senha) => {  // Função que valida se a senha atende aos requisitos de segurança
    const requisitos = {  
      tamanho: senha.length >= 8,          // Verifica se a senha possui pelo menos 8 caracteres
      maiuscula: /[A-Z]/.test(senha),      // Verifica se contém pelo menos uma letra maiúscula
      minuscula: /[a-z]/.test(senha),      // Verifica se contém pelo menos uma letra minúscula
      numero: /[0-9]/.test(senha)          // Verifica se contém pelo menos um número
    };

    return requisitos;  // Retorna um objeto indicando quais requisitos foram atendidos
  };

  const requisitos = validarSenha(novaSenha);  // Executa a função de validação para a nova senha digitada
  const senhaForte = Object.values(requisitos).every(v => v);  // Verifica se todos os requisitos são verdadeiros (senha considerada forte)


  const mostrarMensagem = (tipo, texto) => {  // Função para exibir mensagens temporárias de erro ou sucesso
    setMensagem({ tipo, texto });  // Define o tipo e o texto da mensagem
    setTimeout(() => setMensagem({ tipo: '', texto: '' }), 4000);  // Após 4 segundos, limpa a mensagem automaticamente
  };

  const handleSubmit = async (e) => {  // Função chamada ao enviar o formulário de alteração de senha
    e.preventDefault();  // Impede o recarregamento da página ao enviar o formulário
    setCarregando(true);  // Ativa o estado de carregamento enquanto o processo é executado

    try {
      // Validações básicas antes de prosseguir
      if (!senhaAtual || !novaSenha || !confirmarSenha) {  // Verifica se todos os campos foram preenchidos
        mostrarMensagem('erro', 'Preencha todos os campos');  // Exibe erro se algum campo estiver vazio
        setCarregando(false); // Desativa o estado de carregamento
        return;
      }

      if (novaSenha !== confirmarSenha) {  // Verifica se a nova senha e a confirmação coincidem
        mostrarMensagem('erro', 'As senhas não coincidem');  // Exibe mensagem de erro
        setCarregando(false); // Desativa o estado de carregamento
        return;
      }

      if (novaSenha.length < 8) {  // Verifica se a senha tem pelo menos 8 caracteres
        mostrarMensagem('erro', 'A senha deve ter no mínimo 8 caracteres');
        setCarregando(false); // Desativa o estado de carregamento 
        return;
      }

      if (!senhaForte) {  // Confere se todos os requisitos de segurança foram atendidos
        mostrarMensagem('erro', 'A senha deve atender todos os requisitos de segurança');
        setCarregando(false); // Desativa o estado de carregamento
        return;
      }

      // Busca o usuário no banco de dados e verifica se a senha atual está correta
      const usuarioDB = await authDb.usuarios.get(usuario.id);  // Obtém os dados do usuário pelo ID
      
      if (!usuarioDB) {  // Caso o usuário não seja encontrado
        mostrarMensagem('erro', 'Usuário não encontrado'); // Exibe mensagem de erro
        setCarregando(false); // Desativa o estado de carregamento
        return;
      }

      const senhaAtualValida = await verificarSenha(senhaAtual, usuarioDB.senha);  // Verifica se a senha atual digitada é válida
      
      if (!senhaAtualValida) {  // Se a senha atual for incorreta
        mostrarMensagem('erro', 'Senha atual incorreta');
        setCarregando(false); // Desativa o estado de carregamento
        return;
      }

      // Cria o hash da nova senha antes de salvar (boa prática de segurança)
      const novaSenhaHash = await hashSenha(novaSenha);

      // Atualiza a senha do usuário no banco
      await authDb.usuarios.update(usuario.id, { //
        senha: novaSenhaHash // Hash da nova senha
      });

      mostrarMensagem('sucesso', 'Senha alterada com sucesso!');  // Exibe mensagem de sucesso
      
      // Após salvar, limpa os campos e fecha o modal após 2 segundos
      setTimeout(() => {  // Após 2 segundos
        setSenhaAtual(''); // Limpa a senha atual
        setNovaSenha(''); // Limpa a nova senha
        setConfirmarSenha(''); // Limpa a confirmação da nova senha
        if (onFechar) {  // Se a função de fechar modal foi passada
          onFechar();  // Fecha o modal
        }
      }, 2000);

    } catch (error) {  // Caso ocorra algum erro inesperado
      console.error('Erro ao alterar senha:', error); // Imprime o erro no console
      mostrarMensagem('erro', 'Erro ao alterar senha. Tente novamente.');  // Mostra mensagem genérica de erro
    } finally { // Sempre executa
      setCarregando(false);  // Finaliza o estado de carregamento
    }
  };

  return (
    <div className="alterar-senha-modal">  {/* Modal principal da tela de alteração de senha */}
      <div className="alterar-senha-backdrop" onClick={onFechar}></div>  {/* Fundo escurecido que fecha o modal ao clicar */}
      
      <div className="alterar-senha-card">  {/* Cartão central com o formulário */}
        <div className="alterar-senha-header">  {/* Cabeçalho do modal */}
          <div className="header-icon">
            <Key size={32} />  {/* Ícone de chave no topo */}
          </div>
          <h2>Alterar Senha</h2>
          <p>Mantenha sua conta segura com uma senha forte</p>
        </div>

        {mensagem.texto && (  // Exibe mensagens de sucesso ou erro caso existam
          <div className={`mensagem-senha mensagem-${mensagem.tipo}`}> {/* Mensagem de sucesso ou erro */}
            {mensagem.tipo === 'sucesso' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}  {/* Ícone condicional */}
            <span>{mensagem.texto}</span>  {/* Texto da mensagem */}
          </div>
        )}

        <form onSubmit={handleSubmit} className="form-alterar-senha">  {/* Formulário de alteração de senha */}

          {/* Senha Atual */}
          <div className="form-group-senha">
            <label>
              <Lock size={16} />  {/* Ícone de cadeado */}
              Senha Atual
            </label>
            <div className="input-senha-container"> {/* Container para a entrada de senha */}
              <input
                type={mostrarSenhaAtual ? 'text' : 'password'}  // Alterna entre texto e senha
                value={senhaAtual} // Valor digitado pelo usuário
                onChange={(e) => setSenhaAtual(e.target.value)}  // Atualiza o estado conforme o usuário digita
                placeholder="Digite sua senha atual" // Texto de placeholder
                disabled={carregando} // Desabilita a entrada de senha enquanto estiver carregando
              />
              <button
                type="button"
                className="toggle-senha-btn" // Botão para alternar a visibilidade da senha
                onClick={() => setMostrarSenhaAtual(!mostrarSenhaAtual)}  // Alterna a visibilidade da senha
                tabIndex="-1" // Desabilita o foco do botão
              >
                {mostrarSenhaAtual ? <EyeOff size={18} /> : <Eye size={18} />} {/* Ícone de olho para alternar a visibilidade da senha */}
              </button>
            </div>
          </div>

          {/* Nova Senha */}
          <div className="form-group-senha"> {/* Grupo de entrada de nova senha */}
            <label>
              <Lock size={16} />
              Nova Senha
            </label>
            <div className="input-senha-container"> {/* Container para a entrada de nova senha */}
              <input
                type={mostrarNovaSenha ? 'text' : 'password'} // Alterna entre texto e senha
                value={novaSenha} // Valor digitado pelo usuário
                onChange={(e) => setNovaSenha(e.target.value)}  // Captura a nova senha digitada
                placeholder="Digite sua nova senha" // Texto de placeholder
                disabled={carregando} // Desabilita a entrada de senha enquanto estiver carregando
              />
              <button
                type="button"
                className="toggle-senha-btn" // Botão para alternar a visibilidade da senha
                onClick={() => setMostrarNovaSenha(!mostrarNovaSenha)}  // Alterna visibilidade
                tabIndex="-1" // Desabilita o foco
              >
                {mostrarNovaSenha ? <EyeOff size={18} /> : <Eye size={18} />} {/* Ícone de olho para alternar a visibilidade da senha */}
              </button>
            </div>
          </div>

          {/* Requisitos de Senha */}
          {novaSenha && (  // Exibe os requisitos conforme o usuário digita
            <div className="requisitos-senha">  {/* Requisitos de senha */}
              <p className="requisitos-titulo">Requisitos de segurança:</p>  {/* Título dos requisitos */}
              <ul>
                <li className={requisitos.tamanho ? 'requisito-ok' : 'requisito-pendente'}>  {/* Requisito de tamanho */}
                  {requisitos.tamanho ? '✓' : '○'} Mínimo de 8 caracteres
                </li>
                <li className={requisitos.maiuscula ? 'requisito-ok' : 'requisito-pendente'}>  {/* Requisito de maiúscula */}
                  {requisitos.maiuscula ? '✓' : '○'} Pelo menos uma letra maiúscula
                </li>
                <li className={requisitos.minuscula ? 'requisito-ok' : 'requisito-pendente'}>    {/* Requisito de minúscula */}
                  {requisitos.minuscula ? '✓' : '○'} Pelo menos uma letra minúscula
                </li>
                <li className={requisitos.numero ? 'requisito-ok' : 'requisito-pendente'}>  {/* Requisito de número */}
                  {requisitos.numero ? '✓' : '○'} Pelo menos um número
                </li>
              </ul>
            </div>
          )}

          {/* Confirmar Senha */}
          <div className="form-group-senha">  {/* Grupo de entrada de confirmação de senha */}
            <label>
              <Lock size={16} />
              Confirmar Nova Senha
            </label>
            <div className="input-senha-container">  {/* Container para a entrada de confirmação de senha */}
              <input
                type={mostrarConfirmar ? 'text' : 'password'}  // Alterna entre texto e senha
                value={confirmarSenha}  // Valor digitado pelo usuário
                onChange={(e) => setConfirmarSenha(e.target.value)}  // Captura a confirmação da senha
                placeholder="Confirme sua nova senha"  // Texto de placeholder
                disabled={carregando}  // Desabilita a entrada de senha enquanto estiver carregando
              />
              <button
                type="button"
                className="toggle-senha-btn"  // Botão para alternar a visibilidade da senha
                onClick={() => setMostrarConfirmar(!mostrarConfirmar)}  // Alterna a visibilidade
                tabIndex="-1"  // Desabilita o foco
              >
                {mostrarConfirmar ? <EyeOff size={18} /> : <Eye size={18} />}  {/* Ícone de olho para alternar a visibilidade da senha */}
              </button>
            </div>
            {confirmarSenha && novaSenha !== confirmarSenha && (  // Exibe aviso se as senhas não coincidirem
              <span className="erro-confirmacao">As senhas não coincidem</span>  // Mensagem de erro
            )}
          </div>

          {/* Botões */}
          <div className="form-actions-senha">  {/* Grupo de botoões */}
            <button
              type="button"  // Tipo de botão
              className="btn-cancelar-senha"  // Botão de cancelar
              onClick={onFechar}  // Fecha o modal
              disabled={carregando}  // Desabilita o botão enquanto estiver carregando
            >
              Cancelar
            </button>
            <button 
              type="submit"  // Tipo de botão
              className="btn-salvar-senha"  // Botão de salvar
              disabled={carregando || !senhaForte || novaSenha !== confirmarSenha}  // Desabilita se não estiver pronto para salvar
            >
              {carregando ? (  // Mostra o spinner enquanto salva
                <>
                  <span className="spinner-pequeno"></span> {/* Spinner pequeno */}
                  Salvando...
                </>
              ) : (  // Caso contrário, mostra o botão normal
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

export default AlterarSenha;  // Exporta o componente para ser usado em outras partes do sistema
