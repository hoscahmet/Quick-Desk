import React, { useState } from 'react'
import { Copy, RefreshCw, Key, Hash, Clock, Check, AlertCircle } from 'lucide-react'
import { useTranslation } from '../i18n/LanguageContext'

interface ToolsTabProps {
  onToast: (msg: string) => void
}

export const ToolsTab: React.FC<ToolsTabProps> = ({ onToast }) => {
  const { language, t } = useTranslation()
  const [subtool, setSubtool] = useState<'json' | 'base64' | 'text' | 'generators'>('json')

  // JSON State
  const [jsonText, setJsonText] = useState('')
  const [jsonStatus, setJsonStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Base64 State
  const [b64Text, setB64Text] = useState('')

  // Text tools State
  const [textInput, setTextInput] = useState('')

  const getLocale = () => (language === 'tr' ? 'tr-TR' : 'en-US')

  // Generator State
  const [uuid, setUuid] = useState(() => (crypto.randomUUID ? crypto.randomUUID() : ''))
  const [password, setPassword] = useState('')
  const [pwdLen, setPwdLen] = useState('16')
  const [timestamp, setTimestamp] = useState(() => {
    const now = new Date()
    return `${Math.floor(now.getTime() / 1000)} (${now.toLocaleString(getLocale())})`
  })

  const copyToClipboard = async (text: string, label: string) => {
    if (!text) return
    await window.api.copyToClipboard(text)
    onToast(t('tools.generators.copiedToast', { label }))
  }

  // JSON handlers
  const handleJsonFormat = () => {
    if (!jsonText.trim()) return
    try {
      const parsed = JSON.parse(jsonText)
      setJsonText(JSON.stringify(parsed, null, 2))
      setJsonStatus({ type: 'success', message: t('tools.json.validJson') })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      setJsonStatus({ type: 'error', message: `${t('tools.json.errorPrefix')} ${msg}` })
    }
  }

  const handleJsonMinify = () => {
    if (!jsonText.trim()) return
    try {
      const parsed = JSON.parse(jsonText)
      setJsonText(JSON.stringify(parsed))
      setJsonStatus({ type: 'success', message: t('tools.json.minified') })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      setJsonStatus({ type: 'error', message: `${t('tools.json.errorPrefix')} ${msg}` })
    }
  }

  // Base64 handlers
  const handleB64Encode = () => {
    try {
      const encoded = btoa(unescape(encodeURIComponent(b64Text)))
      setB64Text(encoded)
      onToast(t('tools.base64.encodedToast'))
    } catch {
      onToast(t('tools.base64.encodeError'))
    }
  }

  const handleB64Decode = () => {
    try {
      const decoded = decodeURIComponent(escape(atob(b64Text.trim())))
      setB64Text(decoded)
      onToast(t('tools.base64.decodedToast'))
    } catch {
      onToast(t('tools.base64.invalidBase64'))
    }
  }

  // Text Case Handlers
  const handleCase = (type: 'upper' | 'lower' | 'title' | 'camel' | 'snake' | 'kebab') => {
    if (!textInput) return
    const locale = getLocale()
    switch (type) {
      case 'upper':
        setTextInput(textInput.toLocaleUpperCase(locale))
        break
      case 'lower':
        setTextInput(textInput.toLocaleLowerCase(locale))
        break
      case 'title':
        setTextInput(
          textInput
            .toLocaleLowerCase(locale)
            .replace(/(?:^|\s)\S/g, (a) => a.toLocaleUpperCase(locale))
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
    <div className="flex-1 flex flex-col p-4 overflow-hidden gap-3.5 bg-app">
      {/* Subnav */}
      <div className="flex items-center gap-1.5 pb-2 border-b border-main shrink-0">
        {[
          { id: 'json', label: t('tools.tabs.json') },
          { id: 'base64', label: t('tools.tabs.base64') },
          { id: 'text', label: t('tools.tabs.text') },
          { id: 'generators', label: t('tools.tabs.generators') }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSubtool(tab.id as typeof subtool)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              subtool === tab.id
                ? 'bg-accent-subtle text-accent font-semibold border border-accent/30'
                : 'text-muted hover:text-app hover:bg-surface'
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
              className="px-3 py-1.5 rounded-lg bg-card hover:bg-surface border border-main text-secondary hover:text-app text-xs font-medium transition shadow-sm"
            >
              {t('tools.json.beautify')}
            </button>
            <button
              onClick={handleJsonMinify}
              className="px-3 py-1.5 rounded-lg bg-card hover:bg-surface border border-main text-secondary hover:text-app text-xs font-medium transition shadow-sm"
            >
              {t('tools.json.minify')}
            </button>
            <button
              onClick={() => {
                setJsonText('')
                setJsonStatus(null)
              }}
              className="px-3 py-1.5 rounded-lg bg-card hover:bg-surface border border-main text-muted hover:text-app text-xs transition"
            >
              {t('common.clear')}
            </button>
            <button
              onClick={() => copyToClipboard(jsonText, 'JSON')}
              className="px-3 py-1.5 rounded-lg bg-card hover:bg-surface border border-main text-secondary hover:text-app text-xs transition flex items-center gap-1.5 shadow-sm"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{t('common.copy')}</span>
            </button>

            {jsonStatus && (
              <span
                className={`ml-auto text-xs flex items-center gap-1 ${
                  jsonStatus.type === 'success' ? 'text-emerald-500 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'
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
            placeholder={t('tools.json.placeholder')}
            className="flex-1 bg-card border border-main rounded-xl p-3.5 font-mono text-xs text-app outline-none focus:border-accent resize-none leading-relaxed placeholder:text-muted"
          />
        </div>
      )}

      {/* Base64 & URL Subtool */}
      {subtool === 'base64' && (
        <div className="flex-1 flex flex-col gap-2.5 overflow-hidden">
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <button
              onClick={handleB64Encode}
              className="px-3 py-1.5 rounded-lg bg-card hover:bg-surface border border-main text-secondary hover:text-app text-xs font-medium transition shadow-sm"
            >
              {t('tools.base64.encode')}
            </button>
            <button
              onClick={handleB64Decode}
              className="px-3 py-1.5 rounded-lg bg-card hover:bg-surface border border-main text-secondary hover:text-app text-xs font-medium transition shadow-sm"
            >
              {t('tools.base64.decode')}
            </button>
            <button
              onClick={() => {
                setB64Text(encodeURIComponent(b64Text))
                onToast(t('tools.base64.urlEncodedToast'))
              }}
              className="px-3 py-1.5 rounded-lg bg-card hover:bg-surface border border-main text-secondary hover:text-app text-xs font-medium transition shadow-sm"
            >
              {t('tools.base64.urlEncode')}
            </button>
            <button
              onClick={() => {
                try {
                  setB64Text(decodeURIComponent(b64Text))
                  onToast(t('tools.base64.urlDecodedToast'))
                } catch {
                  onToast(t('tools.base64.invalidUrl'))
                }
              }}
              className="px-3 py-1.5 rounded-lg bg-card hover:bg-surface border border-main text-secondary hover:text-app text-xs font-medium transition shadow-sm"
            >
              {t('tools.base64.urlDecode')}
            </button>
            <button
              onClick={() => setB64Text('')}
              className="px-3 py-1.5 rounded-lg bg-card hover:bg-surface border border-main text-muted hover:text-app text-xs transition"
            >
              {t('common.clear')}
            </button>
            <button
              onClick={() => copyToClipboard(b64Text, t('tools.text.label'))}
              className="px-3 py-1.5 rounded-lg bg-card hover:bg-surface border border-main text-secondary hover:text-app text-xs transition flex items-center gap-1.5 ml-auto shadow-sm"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{t('common.copy')}</span>
            </button>
          </div>

          <textarea
            value={b64Text}
            onChange={(e) => setB64Text(e.target.value)}
            placeholder={t('tools.base64.placeholder')}
            className="flex-1 bg-card border border-main rounded-xl p-3.5 font-mono text-xs text-app outline-none focus:border-accent resize-none leading-relaxed placeholder:text-muted"
          />
        </div>
      )}

      {/* Text Tools Subtool */}
      {subtool === 'text' && (
        <div className="flex-1 flex flex-col gap-2.5 overflow-hidden">
          <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
            <button
              onClick={() => handleCase('upper')}
              className="px-2.5 py-1.5 rounded-lg bg-card hover:bg-surface border border-main text-secondary hover:text-app text-xs font-medium transition shadow-sm"
            >
              {t('tools.text.uppercase')}
            </button>
            <button
              onClick={() => handleCase('lower')}
              className="px-2.5 py-1.5 rounded-lg bg-card hover:bg-surface border border-main text-secondary hover:text-app text-xs font-medium transition shadow-sm"
            >
              {t('tools.text.lowercase')}
            </button>
            <button
              onClick={() => handleCase('title')}
              className="px-2.5 py-1.5 rounded-lg bg-card hover:bg-surface border border-main text-secondary hover:text-app text-xs font-medium transition shadow-sm"
            >
              {t('tools.text.titlecase')}
            </button>
            <button
              onClick={() => handleCase('camel')}
              className="px-2.5 py-1.5 rounded-lg bg-card hover:bg-surface border border-main text-secondary hover:text-app text-xs font-medium transition shadow-sm"
            >
              {t('tools.text.camelcase')}
            </button>
            <button
              onClick={() => handleCase('snake')}
              className="px-2.5 py-1.5 rounded-lg bg-card hover:bg-surface border border-main text-secondary hover:text-app text-xs font-medium transition shadow-sm"
            >
              {t('tools.text.snakecase')}
            </button>
            <button
              onClick={() => handleCase('kebab')}
              className="px-2.5 py-1.5 rounded-lg bg-card hover:bg-surface border border-main text-secondary hover:text-app text-xs font-medium transition shadow-sm"
            >
              {t('tools.text.kebabcase')}
            </button>
            <button
              onClick={() => copyToClipboard(textInput, t('tools.text.label'))}
              className="px-2.5 py-1.5 rounded-lg bg-card hover:bg-surface border border-main text-secondary hover:text-app text-xs transition flex items-center gap-1.5 ml-auto shadow-sm"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{t('common.copy')}</span>
            </button>
          </div>

          <div className="text-[11px] text-muted">
            {t('tools.text.stats', {
              chars: textInput.length,
              words: textInput.trim() ? textInput.trim().split(/\s+/).length : 0,
              lines: textInput ? textInput.split(/\r\n|\r|\n/).length : 0
            })}
          </div>

          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder={t('tools.text.placeholder')}
            className="flex-1 bg-card border border-main rounded-xl p-3.5 font-mono text-xs text-app outline-none focus:border-accent resize-none leading-relaxed placeholder:text-muted"
          />
        </div>
      )}

      {/* Generators Subtool */}
      {subtool === 'generators' && (
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {/* UUID Generator */}
          <div className="bg-card border border-main rounded-xl p-4 flex flex-col gap-2.5 shadow-app-card">
            <div className="flex items-center gap-2 text-xs font-semibold text-app">
              <Hash className="w-4 h-4 text-sky-500 dark:text-sky-400" />
              <span>{t('tools.generators.uuidTitle')}</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={uuid}
                className="flex-1 bg-surface border border-main rounded-lg px-3 py-1.5 font-mono text-xs text-sky-600 dark:text-sky-400 outline-none select-all"
              />
              <button
                onClick={() => setUuid(crypto.randomUUID ? crypto.randomUUID() : '')}
                className="px-3 py-1.5 rounded-lg bg-surface hover:bg-nav border border-main text-secondary hover:text-app text-xs font-medium transition flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{t('tools.generators.generateNew')}</span>
              </button>
              <button
                onClick={() => copyToClipboard(uuid, 'UUID')}
                className="p-2 rounded-lg bg-surface hover:bg-nav border border-main text-secondary hover:text-app text-xs transition"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Password Generator */}
          <div className="bg-card border border-main rounded-xl p-4 flex flex-col gap-2.5 shadow-app-card">
            <div className="flex items-center gap-2 text-xs font-semibold text-app">
              <Key className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{t('tools.generators.passwordTitle')}</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={password}
                placeholder={t('tools.generators.passwordPlaceholder')}
                className="flex-1 bg-surface border border-main rounded-lg px-3 py-1.5 font-mono text-xs text-emerald-600 dark:text-emerald-400 outline-none select-all placeholder:text-muted"
              />
              <select
                value={pwdLen}
                onChange={(e) => setPwdLen(e.target.value)}
                className="bg-surface border border-main rounded-lg px-2 py-1.5 text-xs text-secondary outline-none focus:border-accent"
              >
                <option value="12">{`12 ${t('tools.generators.charsUnit')}`}</option>
                <option value="16">{`16 ${t('tools.generators.charsUnit')}`}</option>
                <option value="24">{`24 ${t('tools.generators.charsUnit')}`}</option>
                <option value="32">{`32 ${t('tools.generators.charsUnit')}`}</option>
              </select>
              <button
                onClick={() => generatePassword(parseInt(pwdLen, 10))}
                className="px-3 py-1.5 rounded-lg bg-accent hover:bg-accent-hover text-white text-xs font-medium transition shadow-sm"
              >
                {t('tools.generators.generate')}
              </button>
              <button
                onClick={() => copyToClipboard(password, t('tools.generators.passwordLabel'))}
                className="p-2 rounded-lg bg-surface hover:bg-nav border border-main text-secondary hover:text-app text-xs transition"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Unix Timestamp */}
          <div className="bg-card border border-main rounded-xl p-4 flex flex-col gap-2.5 shadow-app-card">
            <div className="flex items-center gap-2 text-xs font-semibold text-app">
              <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>{t('tools.generators.timestampTitle')}</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={timestamp}
                className="flex-1 bg-surface border border-main rounded-lg px-3 py-1.5 font-mono text-xs text-amber-600 dark:text-amber-300 outline-none select-all"
              />
              <button
                onClick={() => {
                  const now = new Date()
                  setTimestamp(`${Math.floor(now.getTime() / 1000)} (${now.toLocaleString(getLocale())})`)
                }}
                className="px-3 py-1.5 rounded-lg bg-surface hover:bg-nav border border-main text-secondary hover:text-app text-xs font-medium transition flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{t('tools.generators.now')}</span>
              </button>
              <button
                onClick={() => copyToClipboard(timestamp.split(' ')[0], 'Timestamp')}
                className="p-2 rounded-lg bg-surface hover:bg-nav border border-main text-secondary hover:text-app text-xs transition"
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
