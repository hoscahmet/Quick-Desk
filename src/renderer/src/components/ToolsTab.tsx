import React, { useState } from 'react'
import { Copy, RefreshCw, Key, Hash, Clock, Check, AlertCircle } from 'lucide-react'

interface ToolsTabProps {
  onToast: (msg: string) => void
}

export const ToolsTab: React.FC<ToolsTabProps> = ({ onToast }) => {
  const [subtool, setSubtool] = useState<'json' | 'base64' | 'text' | 'generators'>('json')

  // JSON State
  const [jsonText, setJsonText] = useState('')
  const [jsonStatus, setJsonStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Base64 State
  const [b64Text, setB64Text] = useState('')

  // Text tools State
  const [textInput, setTextInput] = useState('')

  // Generator State
  const [uuid, setUuid] = useState(() => (crypto.randomUUID ? crypto.randomUUID() : ''))
  const [password, setPassword] = useState('')
  const [pwdLen, setPwdLen] = useState('16')
  const [timestamp, setTimestamp] = useState(() => `${Math.floor(Date.now() / 1000)} (${new Date().toLocaleString('tr-TR')})`)

  const copyToClipboard = async (text: string, label: string) => {
    if (!text) return
    await window.api.copyToClipboard(text)
    onToast(`${label} kopyalandı! 📋`)
  }

  // JSON handlers
  const handleJsonFormat = () => {
    if (!jsonText.trim()) return
    try {
      const parsed = JSON.parse(jsonText)
      setJsonText(JSON.stringify(parsed, null, 2))
      setJsonStatus({ type: 'success', message: 'Geçerli JSON ✔️' })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      setJsonStatus({ type: 'error', message: `Hata: ${msg}` })
    }
  }

  const handleJsonMinify = () => {
    if (!jsonText.trim()) return
    try {
      const parsed = JSON.parse(jsonText)
      setJsonText(JSON.stringify(parsed))
      setJsonStatus({ type: 'success', message: 'Sıkıştırıldı ✔️' })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      setJsonStatus({ type: 'error', message: `Hata: ${msg}` })
    }
  }

  // Base64 handlers
  const handleB64Encode = () => {
    try {
      const encoded = btoa(unescape(encodeURIComponent(b64Text)))
      setB64Text(encoded)
      onToast('Base64 kodlandı')
    } catch {
      onToast('Kodlama hatası!')
    }
  }

  const handleB64Decode = () => {
    try {
      const decoded = decodeURIComponent(escape(atob(b64Text.trim())))
      setB64Text(decoded)
      onToast('Base64 çözüldü')
    } catch {
      onToast('Geçersiz Base64 verisi!')
    }
  }

  // Text Case Handlers
  const handleCase = (type: 'upper' | 'lower' | 'title' | 'camel' | 'snake' | 'kebab') => {
    if (!textInput) return
    switch (type) {
      case 'upper':
        setTextInput(textInput.toLocaleUpperCase('tr-TR'))
        break
      case 'lower':
        setTextInput(textInput.toLocaleLowerCase('tr-TR'))
        break
      case 'title':
        setTextInput(
          textInput
            .toLocaleLowerCase('tr-TR')
            .replace(/(?:^|\s)\S/g, (a) => a.toLocaleUpperCase('tr-TR'))
        )
        break
      case 'camel':
        setTextInput(
          textInput
            .replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match, index) =>
              +match === 0 ? '' : index === 0 ? match.toLowerCase() : match.toUpperCase()
            )
            .replace(/[^a-zA-Z0-9]/g, '')
        )
        break
      case 'snake':
        setTextInput(
          textInput
            .trim()
            .toLowerCase()
            .replace(/\s+/g, '_')
            .replace(/[^a-z0-9_]/g, '')
        )
        break
      case 'kebab':
        setTextInput(
          textInput
            .trim()
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '')
        )
        break
    }
  }

  // Password Generator
  const generatePassword = (len: number) => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-='
    let res = ''
    for (let i = 0; i < len; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setPassword(res)
  }

  return (
    <div className="flex-1 flex flex-col p-4 overflow-hidden gap-3.5 bg-slate-950">
      {/* Subnav */}
      <div className="flex items-center gap-1.5 pb-2 border-b border-slate-800 shrink-0">
        {[
          { id: 'json', label: 'JSON Formatlayıcı' },
          { id: 'base64', label: 'Base64 & URL' },
          { id: 'text', label: 'Metin Dönüştürücü' },
          { id: 'generators', label: 'UUID & Parola Üretici' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSubtool(tab.id as typeof subtool)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              subtool === tab.id
                ? 'bg-indigo-500/20 text-indigo-400 font-semibold border border-indigo-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* JSON Subtool */}
      {subtool === 'json' && (
        <div className="flex-1 flex flex-col gap-2.5 overflow-hidden">
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleJsonFormat}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-medium transition"
            >
              Biçimlendir (Beautify)
            </button>
            <button
              onClick={handleJsonMinify}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-medium transition"
            >
              Sıkıştır (Minify)
            </button>
            <button
              onClick={() => {
                setJsonText('')
                setJsonStatus(null)
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 text-xs transition"
            >
              Temizle
            </button>
            <button
              onClick={() => copyToClipboard(jsonText, 'JSON')}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs transition flex items-center gap-1.5"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Kopyala</span>
            </button>

            {jsonStatus && (
              <span
                className={`ml-auto text-xs flex items-center gap-1 ${
                  jsonStatus.type === 'success' ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {jsonStatus.type === 'success' ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5" />
                )}
                <span>{jsonStatus.message}</span>
              </span>
            )}
          </div>

          <textarea
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            placeholder="JSON verinizi buraya yapıştırın..."
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-3.5 font-mono text-xs text-slate-100 outline-none focus:border-indigo-500 resize-none leading-relaxed"
          />
        </div>
      )}

      {/* Base64 & URL Subtool */}
      {subtool === 'base64' && (
        <div className="flex-1 flex flex-col gap-2.5 overflow-hidden">
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <button
              onClick={handleB64Encode}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-medium transition"
            >
              Base64 Kodla
            </button>
            <button
              onClick={handleB64Decode}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-medium transition"
            >
              Base64 Çöz
            </button>
            <button
              onClick={() => {
                setB64Text(encodeURIComponent(b64Text))
                onToast('URL Encode uygulandı')
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-medium transition"
            >
              URL Encode
            </button>
            <button
              onClick={() => {
                try {
                  setB64Text(decodeURIComponent(b64Text))
                  onToast('URL Decode uygulandı')
                } catch {
                  onToast('Geçersiz URL verisi!')
                }
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-medium transition"
            >
              URL Decode
            </button>
            <button
              onClick={() => setB64Text('')}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 text-xs transition"
            >
              Temizle
            </button>
            <button
              onClick={() => copyToClipboard(b64Text, 'Metin')}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs transition flex items-center gap-1.5 ml-auto"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Kopyala</span>
            </button>
          </div>

          <textarea
            value={b64Text}
            onChange={(e) => setB64Text(e.target.value)}
            placeholder="Metninizi buraya yazın veya yapıştırın..."
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-3.5 font-mono text-xs text-slate-100 outline-none focus:border-indigo-500 resize-none leading-relaxed"
          />
        </div>
      )}

      {/* Text Tools Subtool */}
      {subtool === 'text' && (
        <div className="flex-1 flex flex-col gap-2.5 overflow-hidden">
          <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
            <button
              onClick={() => handleCase('upper')}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-medium transition"
            >
              BÜYÜK HARF
            </button>
            <button
              onClick={() => handleCase('lower')}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-medium transition"
            >
              küçük harf
            </button>
            <button
              onClick={() => handleCase('title')}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-medium transition"
            >
              Başlık Düzeni
            </button>
            <button
              onClick={() => handleCase('camel')}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-medium transition"
            >
              camelCase
            </button>
            <button
              onClick={() => handleCase('snake')}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-medium transition"
            >
              snake_case
            </button>
            <button
              onClick={() => handleCase('kebab')}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-medium transition"
            >
              kebab-case
            </button>
            <button
              onClick={() => copyToClipboard(textInput, 'Metin')}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs transition flex items-center gap-1.5 ml-auto"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Kopyala</span>
            </button>
          </div>

          <div className="text-[11px] text-slate-500">
            Karakter: {textInput.length} | Kelime:{' '}
            {textInput.trim() ? textInput.trim().split(/\s+/).length : 0} | Satır:{' '}
            {textInput ? textInput.split(/\r\n|\r|\n/).length : 0}
          </div>

          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Dönüştürmek istediğiniz metni buraya girin..."
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-3.5 font-mono text-xs text-slate-100 outline-none focus:border-indigo-500 resize-none leading-relaxed"
          />
        </div>
      )}

      {/* Generators Subtool */}
      {subtool === 'generators' && (
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {/* UUID Generator */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
              <Hash className="w-4 h-4 text-indigo-400" />
              <span>Rastgele UUID (v4)</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={uuid}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 font-mono text-xs text-sky-400 outline-none select-all"
              />
              <button
                onClick={() => setUuid(crypto.randomUUID ? crypto.randomUUID() : '')}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Yeni Üret</span>
              </button>
              <button
                onClick={() => copyToClipboard(uuid, 'UUID')}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Password Generator */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
              <Key className="w-4 h-4 text-emerald-400" />
              <span>Güvenli Rastgele Parola</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={password}
                placeholder="Parola üretmek için butona tıklayın..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 font-mono text-xs text-emerald-400 outline-none select-all placeholder:text-slate-600"
              />
              <select
                value={pwdLen}
                onChange={(e) => setPwdLen(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-300 outline-none"
              >
                <option value="12">12 Krk</option>
                <option value="16">16 Krk</option>
                <option value="24">24 Krk</option>
                <option value="32">32 Krk</option>
              </select>
              <button
                onClick={() => generatePassword(parseInt(pwdLen, 10))}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition"
              >
                Üret
              </button>
              <button
                onClick={() => copyToClipboard(password, 'Parola')}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Unix Timestamp */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Unix Zaman Damgası (Timestamp)</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={timestamp}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 font-mono text-xs text-amber-300 outline-none select-all"
              />
              <button
                onClick={() => {
                  const now = new Date()
                  setTimestamp(`${Math.floor(now.getTime() / 1000)} (${now.toLocaleString('tr-TR')})`)
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Şimdi</span>
              </button>
              <button
                onClick={() => copyToClipboard(timestamp.split(' ')[0], 'Timestamp')}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
