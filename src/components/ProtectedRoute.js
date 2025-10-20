// src/components/ProtectedRoute.js
import React, { useEffect, useState } from 'react'
import { AuthService } from '../authDb'
import { Shield, AlertCircle } from 'lucide-react'
import './styles/ProtectedRoute.css'

const ProtectedRoute = ({
  children,
  requererAdmin = false,
  paginaId = null,
}) => {
  // Componente para proteger rotas baseado em permissÃµes
  const [autenticado, setAutenticado] = useState(null)
  const [usuario, setUsuario] = useState(null)
  const [verificando, setVerificando] = useState(true)
  const [temPermissao, setTemPermissao] = useState(false)

  useEffect(() => {
    verificarAutenticacao()
  }, [])

  const verificarAutenticacao = async () => {
    try {
      const estaAuth = await AuthService.estaAutenticado()

      if (!estaAuth) {
        setAutenticado(false)
        setVerificando(false)
        return
      }

      const usuarioAtual = await AuthService.obterUsuarioAtual()

      if (!usuarioAtual) {
        setAutenticado(false)
        setVerificando(false)
        return
      }

      setUsuario(usuarioAtual)

      // Se requer admin, verificar se o usuÃ¡rio Ã© admin
      if (requererAdmin && usuarioAtual.tipo !== 'admin') {
        setAutenticado(false)
        setTemPermissao(false)
        setVerificando(false)
        return
      }

      // Se tem paginaId, verificar permissÃ£o especÃ­fica
      if (paginaId && usuarioAtual.tipo !== 'admin') {
        const permissoesUsuario = usuarioAtual.permissoes || []
        const possuiPermissao = permissoesUsuario.includes(paginaId)

        if (!possuiPermissao) {
          console.log(
            'âŒ Acesso negado:',
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
          'âœ… Acesso permitido:',
          usuarioAtual.nome,
          'acessou',
          paginaId
        )
      }

      setAutenticado(true)
      setTemPermissao(true)
      setVerificando(false)
    } catch (error) {
      console.error('Erro ao verificar autenticaÃ§Ã£o:', error)
      setAutenticado(false)
      setVerificando(false)
    }
  }

  if (verificando) {
    return (
      <div className="verificando-auth">
        <div className="spinner-grande"></div>
        <p>Verificando permissÃµes...</p>
      </div>
    )
  }

  if (!autenticado) {
    return (
      <div className="acesso-negado">
        <div className="acesso-negado-card">
          <AlertCircle size={64} color="#ffc107" />
          <h2>AutenticaÃ§Ã£o NecessÃ¡ria</h2>
          <p>VocÃª precisa fazer login para acessar esta pÃ¡gina.</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-voltar"
          >
            Voltar para Login
          </button>
        </div>
      </div>
    )
  }

  if (autenticado && !temPermissao) {
    return (
      <div className="acesso-negado">
        <div className="acesso-negado-card">
          <Shield size={64} color="#dc3545" />
          <h2>Acesso Negado</h2>
          {requererAdmin ? (
            <>
              <p>Esta Ã¡rea Ã© exclusiva para administradores.</p>
              <p className="usuario-info">
                VocÃª estÃ¡ logado como: <strong>{usuario?.nome}</strong> (
                {usuario?.tipo})
              </p>
            </>
          ) : (
            <>
              <p>VocÃª nÃ£o tem permissÃ£o para acessar esta pÃ¡gina.</p>
              <p className="usuario-info">
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

export default ProtectedRoute
