// src/components/AnexosViagem.js
import React, { useState, useEffect } from 'react'
import {
  Upload,
  FileText,
  Download,
  Trash2,
  X,
  CheckCircle,
  AlertCircle,
  Paperclip,
  User,
} from 'lucide-react'
import { db, notificacaoService } from '../db'
import { AuthService } from '../authDb'

function AnexosViagem({ viagem, onFechar }) {
  const [arquivos, setArquivos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [usuarioAtual, setUsuarioAtual] = useState(null)
  const [podeAnexar, setPodeAnexar] = useState(false)
  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' })

  useEffect(() => {
    carregarDados()
  }, [viagem.id])

  const carregarDados = async () => {
    try {
      // Carregar usuário e permissões
      const usuario = await AuthService.obterUsuarioAtual()
      setUsuarioAtual(usuario)

      // Verificar permissão para anexar arquivos
      const temPermissao =
        usuario.tipo === 'admin' ||
        (usuario.permissoes || []).includes('anexos_viagem')
      setPodeAnexar(temPermissao)

      // Carregar arquivos anexados
      const anexos = await db.anexosViagem
        .where('viagemId')
        .equals(viagem.id)
        .toArray()
      setArquivos(anexos)

      console.log(
        `📎 Anexos da viagem carregados: ${anexos.length} arquivo(s)`
      )
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      mostrarMensagem('erro', 'Erro ao carregar anexos')
    } finally {
      setCarregando(false)
    }
  }

  const mostrarMensagem = (tipo, texto) => {
    setMensagem({ tipo, texto })
    setTimeout(() => setMensagem({ tipo: '', texto: '' }), 3000)
  }

  const handleFileSelect = async (event) => {
    const files = Array.from(event.target.files)

    if (files.length === 0) return

    if (!podeAnexar) {
      mostrarMensagem('erro', 'Você não tem permissão para anexar arquivos')
      return
    }

    // Verificar se viagem está aprovada
    if (viagem.status !== 'APROVADA') {
      mostrarMensagem(
        'erro',
        'Só é possível anexar arquivos em viagens aprovadas'
      )
      return
    }

    setEnviando(true)

    try {
      for (const file of files) {
        // Validar tamanho (máximo 10MB)
        if (file.size > 10 * 1024 * 1024) {
          mostrarMensagem(
            'erro',
            `Arquivo ${file.name} muito grande (máx: 10MB)`
          )
          continue
        }

        // Converter para base64
        const base64 = await fileToBase64(file)

        // Salvar no banco
        const anexoId = await db.anexosViagem.add({
          viagemId: viagem.id,
          nome: file.name,
          tipo: file.type,
          tamanho: file.size,
          conteudo: base64,
          dataUpload: new Date().toISOString(),
          uploadPor: usuarioAtual.nome,
          uploadPorId: usuarioAtual.id,
        })

        console.log(`✅ Arquivo ${file.name} anexado com ID: ${anexoId}`)

        // 🔔 Criar notificação para usuários com permissão de anexos
        try {
          // Buscar dados do viajante
          const funcionario = await db.funcionarios.get(viagem.viajanteId)
          const nomeViajante = funcionario?.nome || 'Viajante'
          
          await notificacaoService.notificarAnexoAdicionado(
            viagem.id,
            file.name,
            nomeViajante,
            viagem.destino,
            usuarioAtual.nome
          )
        } catch (notifError) {
          console.error('⚠️ Erro ao criar notificação:', notifError)
          // Não bloqueia o upload se a notificação falhar
        }
      }

      // Recarregar lista de arquivos
      await carregarDados()
      mostrarMensagem('sucesso', `${files.length} arquivo(s) anexado(s)`)
    } catch (error) {
      console.error('Erro ao anexar arquivos:', error)
      mostrarMensagem('erro', 'Erro ao anexar arquivos')
    } finally {
      setEnviando(false)
      // Limpar input
      event.target.value = ''
    }
  }

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result)
      reader.onerror = (error) => reject(error)
    })
  }

  const baixarArquivo = (arquivo) => {
    try {
      // Criar link para download
      const link = document.createElement('a')
      link.href = arquivo.conteudo
      link.download = arquivo.nome
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      mostrarMensagem('sucesso', 'Download iniciado')
    } catch (error) {
      console.error('Erro ao baixar arquivo:', error)
      mostrarMensagem('erro', 'Erro ao baixar arquivo')
    }
  }

  const excluirArquivo = async (arquivoId, nomeArquivo) => {
    if (!podeAnexar) {
      mostrarMensagem('erro', 'Você não tem permissão para excluir arquivos')
      return
    }

    if (!window.confirm(`Deseja excluir o arquivo "${nomeArquivo}"?`)) {
      return
    }

    try {
      await db.anexosViagem.delete(arquivoId)
      await carregarDados()
      mostrarMensagem('sucesso', 'Arquivo excluído')
    } catch (error) {
      console.error('Erro ao excluir arquivo:', error)
      mostrarMensagem('erro', 'Erro ao excluir arquivo')
    }
  }

  const formatarTamanho = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const formatarData = (dataISO) => {
    const data = new Date(dataISO)
    return data.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (carregando) {
    return (
      <div className="modal-overlay">
        <div className="modal-anexos">
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p>Carregando...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="modal-overlay">
      <div className="modal-anexos">
        {/* Header do Modal */}
        <div className="modal-header-anexos">
          <div>
            <h2>
              <Paperclip size={24} />
              Anexos da Viagem
            </h2>
            <p className="modal-subtitle">
              {viagem.origem} → {viagem.destino} • {viagem.viajante}
            </p>
          </div>
          <button onClick={onFechar} className="btn-fechar-modal">
            <X size={24} />
          </button>
        </div>

        {/* Mensagem de feedback */}
        {mensagem.texto && (
          <div className={`mensagem-feedback mensagem-${mensagem.tipo}`}>
            {mensagem.tipo === 'sucesso' ? (
              <CheckCircle size={20} />
            ) : (
              <AlertCircle size={20} />
            )}
            <span>{mensagem.texto}</span>
          </div>
        )}

        {/* Status da viagem */}
        <div className="status-viagem-anexos">
          <div className="status-badge-anexos">
            Status: <strong>{viagem.status}</strong>
          </div>
          {viagem.status !== 'APROVADA' && (
            <div className="alerta-status">
              <AlertCircle size={18} />
              <span>
                Anexos só podem ser adicionados em viagens aprovadas
              </span>
            </div>
          )}
        </div>

        {/* Área de Upload */}
        {podeAnexar && viagem.status === 'APROVADA' && (
          <div className="area-upload">
            <div className="upload-box">
              <Upload size={32} />
              <h3>Anexar Arquivos</h3>
              <p>PDF, imagens, documentos (máx. 10MB por arquivo)</p>
              <label className="btn-upload" htmlFor="file-input">
                {enviando ? 'Enviando...' : 'Selecionar Arquivos'}
              </label>
              <input
                id="file-input"
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                onChange={handleFileSelect}
                disabled={enviando}
                style={{ display: 'none' }}
              />
            </div>
          </div>
        )}

        {/* Lista de Arquivos */}
        <div className="lista-arquivos-anexos">
          <h3>
            Arquivos Anexados ({arquivos.length})
          </h3>

          {arquivos.length === 0 ? (
            <div className="sem-arquivos">
              <FileText size={48} />
              <p>Nenhum arquivo anexado ainda</p>
            </div>
          ) : (
            <div className="arquivos-grid">
              {arquivos.map((arquivo) => (
                <div key={arquivo.id} className="arquivo-card">
                  <div className="arquivo-icon">
                    <FileText size={32} />
                  </div>
                  <div className="arquivo-info">
                    <h4>{arquivo.nome}</h4>
                    <div className="arquivo-meta">
                      <span>{formatarTamanho(arquivo.tamanho)}</span>
                      <span>•</span>
                      <span>{formatarData(arquivo.dataUpload)}</span>
                    </div>
                    <div className="arquivo-autor">
                      <User size={14} />
                      <span>{arquivo.uploadPor}</span>
                    </div>
                  </div>
                  <div className="arquivo-acoes">
                    <button
                      onClick={() => baixarArquivo(arquivo)}
                      className="btn-acao-arquivo btn-download"
                      title="Baixar"
                    >
                      <Download size={18} />
                    </button>
                    {podeAnexar && (
                      <button
                        onClick={() =>
                          excluirArquivo(arquivo.id, arquivo.nome)
                        }
                        className="btn-acao-arquivo btn-excluir"
                        title="Excluir"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Rodapé */}
        <div className="modal-footer-anexos">
          {!podeAnexar && (
            <div className="aviso-permissao">
              <AlertCircle size={18} />
              <span>
                Você não tem permissão para anexar arquivos. Apenas
                visualização.
              </span>
            </div>
          )}
          <button onClick={onFechar} className="btn-fechar">
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}

export default AnexosViagem