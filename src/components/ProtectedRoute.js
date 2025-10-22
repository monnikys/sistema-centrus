import React, { useEffect, useState } from 'react'
import { AuthService } from '../authDb'
import { Shield, AlertCircle } from 'lucide-react'
import './styles/ProtectedRoute.css'

const ProtectedRoute = ({ // Componente para proteger rotas baseado em permissões
  children,
  requererAdmin = false,
  paginaId = null,
}) => {
  
  const [autenticado, setAutenticado] = useState(null) // Estado para indicar se o usuário está autenticado
  const [usuario, setUsuario] = useState(null) // Estado para armazenar dados do usuário
  const [verificando, setVerificando] = useState(true) // Estado para indicar se a verificação de autenticação está sendo feita
  const [temPermissao, setTemPermissao] = useState(false) // Estado para indicar se o usuário tem permissão para acessar a rota

  useEffect(() => {
    verificarAutenticacao()
  }, [])

  const verificarAutenticacao = async () => { // Função para verificar autenticação
    try {
      const estaAuth = await AuthService.estaAutenticado() // Verificar se o usuário está autenticado

      if (!estaAuth) { // Se não estiver autenticado
        setAutenticado(false) // Definir autenticado como false
        setVerificando(false) // Definir verificando como false
        return
      }

      const usuarioAtual = await AuthService.obterUsuarioAtual() // Obter dados do usuário atual

      if (!usuarioAtual) { // Se o usuário atual não for encontrado
        setAutenticado(false)
        setVerificando(false)
        return
      }

      setUsuario(usuarioAtual)

      // Se requer admin, verificar se o usuário é admin
      if (requererAdmin && usuarioAtual.tipo !== 'admin') {
        setAutenticado(false)
        setTemPermissao(false)
        setVerificando(false)
        return
      }

      // Se tem paginaId, verificar permissão especifica
      if (paginaId && usuarioAtual.tipo !== 'admin') {
        const permissoesUsuario = usuarioAtual.permissoes || [] // Obter permissões do usuário
        const possuiPermissao = permissoesUsuario.includes(paginaId) // Verificar se o usuário possui a permissão

        if (!possuiPermissao) { // Se o usuário não possui permissão
          console.log(
            'Acesso negado:',
            usuarioAtual.nome,
            'tentou acessar',
            paginaId
          )
          setAutenticado(true)
          setTemPermissao(false)
          setVerificando(false)
          return
        }

        console.log(
          'Acesso permitido:',
          usuarioAtual.nome,
          'acessou',
          paginaId
        )
      }

      setAutenticado(true)
      setTemPermissao(true)
      setVerificando(false)
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error)
      setAutenticado(false)
      setVerificando(false)
    }
  }

  if (verificando) { // Se estiver verificando
    return (
      <div className="verificando-auth"> {/* Div para indicar que está verificando autenticação */}
        <div className="spinner-grande"></div> {/* Spinner grande */}
        <p>Verificando permissõess...</p>
      </div>
    )
  }

  if (!autenticado) { // Se não estiver autenticado
    return (
      <div className="acesso-negado"> {/* Div para indicar acesso negado */}
        <div className="acesso-negado-card"> {/* Div para o card de acesso negado */}
          <AlertCircle size={64} color="#ffc107" />
          <h2>Autenticação Necessária</h2>
          <p>VocÃª precisa fazer login para acessar esta página.</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-voltar" // Botão para voltar ao login
          >
            Voltar para Login
          </button>
        </div>
      </div>
    )
  }

  if (autenticado && !temPermissao) { // Se estiver autenticado e não tem permissão
    return (
      <div className="acesso-negado"> {/* Div para indicar acesso negado */}
        <div className="acesso-negado-card"> {/* Div para o card de acesso negado */}
          <Shield size={64} color="#dc3545" />
          <h2>Acesso Negado</h2>
          {requererAdmin ? (
            <>
              <p>Esta area tem permissão exclusiva para administradores.</p>
              <p className="usuario-info"> {/* Div para informações do usuário */}
                Você está logado como: <strong>{usuario?.nome}</strong> (
                {usuario?.tipo})
              </p>
            </>
          ) : (
            <>
              <p> Você não permissão para acessar esta página.</p>
              <p className="usuario-info"> {/* Div para informações do usuário */}
                Entre em contato com um administrador para solicitar acesso.
              </p>
            </>
          )}
          <button onClick={() => window.history.back()} className="btn-voltar">
            Voltar
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

export default ProtectedRoute;
