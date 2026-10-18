import React, { useState, useEffect } from 'react'
import { Play, Pause, RotateCcw, Coffee, Plus, Trash2, CheckCircle2 } from 'lucide-react'
import { Todo } from '../types'
import { useTranslation } from '../i18n/LanguageContext'

interface FocusTabProps {
  todos: Todo[]
  onAddTodo: (text: string) => void
  onToggleTodo: (id: string) => void
  onDeleteTodo: (id: string) => void
  onToast: (msg: string) => void
}

export const FocusTab: React.FC<FocusTabProps> = ({
  todos,
  onAddTodo,
  onToggleTodo,
  onDeleteTodo,
  onToast
}) => {
  const { t } = useTranslation()

  // Timer State
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [mode, setMode] = useState<'work' | 'break'>('work')

  // Todo input state
  const [newTodoText, setNewTodoText] = useState('')

  // Audio Chime
  const playChime = () => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      const ctx = new AudioCtx()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(587.33, ctx.currentTime) // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3) // A5
      gain.gain.setValueAtTime(0.3, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.6)
    } catch (e) {
      console.warn('Audio not available:', e)
    }
  }

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
    } else if (isRunning && timeLeft === 0) {
      setIsRunning(false)
      playChime()
      if (mode === 'work') {
        onToast(t('focus.workDoneToast'))
        setMode('break')
        setTimeLeft(5 * 60)
      } else {
        onToast(t('focus.breakDoneToast'))
        setMode('work')
        setTimeLeft(25 * 60)
      }
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning, timeLeft, mode, t, onToast])

  const toggleTimer = () => setIsRunning(!isRunning)

  const resetTimer = () => {
    setIsRunning(false)
    setTimeLeft(mode === 'work' ? 25 * 60 : 5 * 60)
  }

  const switchMode = (newMode: 'work' | 'break') => {
    setIsRunning(false)
    setMode(newMode)
    setTimeLeft(newMode === 'work' ? 25 * 60 : 5 * 60)
  }

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`

  const completedCount = todos.filter((t) => t.done).length

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTodoText.trim()) return
    onAddTodo(newTodoText.trim())
    setNewTodoText('')
  }

  return (
    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 overflow-y-auto bg-app">
      {/* Pomodoro Timer Card */}
      <div className="bg-card border border-main rounded-2xl p-5 flex flex-col justify-between items-center text-center shadow-app-card">
        <div className="w-full flex items-center justify-between pb-3 border-b border-main">
          <span className="text-xs font-semibold text-app">{t('focus.timerTitle')}</span>
          <span
            className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full ${
              mode === 'work'
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
            }`}
          >
            {mode === 'work' ? t('focus.workTime') : t('focus.breakTime')}
          </span>
        </div>

        <div className="py-10">
          <div className="text-6xl font-extrabold font-mono tracking-tight text-app drop-shadow">
            {formattedTime}
          </div>
        </div>

        <div className="w-full flex flex-col gap-2.5">
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={toggleTimer}
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white font-medium text-xs transition shadow-sm"
            >
              {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isRunning ? t('focus.pause') : t('focus.start')}</span>
            </button>
            <button
              onClick={resetTimer}
              title={t('focus.reset')}
              className="p-2 rounded-xl bg-surface hover:bg-nav text-secondary hover:text-app border border-main transition"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 pt-1 border-t border-main">
            <button
              onClick={() => switchMode('work')}
              className={`text-xs px-3 py-1 rounded-lg transition ${
                mode === 'work'
                  ? 'bg-surface text-app font-semibold border border-main'
                  : 'text-muted hover:text-app'
              }`}
            >
              {t('focus.workDuration')}
            </button>
            <button
              onClick={() => switchMode('break')}
              className={`text-xs px-3 py-1 rounded-lg transition flex items-center gap-1 ${
                mode === 'break'
                  ? 'bg-surface text-app font-semibold border border-main'
                  : 'text-muted hover:text-app'
              }`}
            >
              <Coffee className="w-3.5 h-3.5" />
              <span>{t('focus.breakDuration')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Todo Checklist Card */}
      <div className="bg-card border border-main rounded-2xl p-5 flex flex-col justify-between shadow-app-card overflow-hidden">
        <div className="flex items-center justify-between pb-3 border-b border-main shrink-0">
          <span className="text-xs font-semibold text-app">{t('focus.tasksTitle')}</span>
          <span className="text-[11px] text-muted font-medium">
            {t('focus.tasksCompleted', { completed: completedCount, total: todos.length })}
          </span>
        </div>

        {/* Todo List */}
        <div className="flex-1 overflow-y-auto py-3 space-y-2 pr-1 max-h-64">
          {todos.map((todo) => (
            <div
              key={todo.id}
              className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition ${
                todo.done
                  ? 'bg-surface/40 border-main/40 opacity-70'
                  : 'bg-surface border-main hover:border-accent/40'
              }`}
            >
              <button
                onClick={() => onToggleTodo(todo.id)}
                className={`p-0.5 rounded transition ${
                  todo.done ? 'text-accent' : 'text-muted hover:text-app'
                }`}
              >
                <CheckCircle2
                  className={`w-4 h-4 ${todo.done ? 'fill-accent/20' : ''}`}
                />
              </button>
              <span
                className={`flex-1 text-xs select-text ${
                  todo.done ? 'line-through text-muted' : 'text-app'
                }`}
              >
                {todo.text}
              </span>
              <button
                onClick={() => onDeleteTodo(todo.id)}
                title={t('focus.deleteTask')}
                className="text-muted hover:text-rose-500 p-1 rounded transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          {todos.length === 0 && (
            <div className="text-center py-10 text-muted text-xs">
              {t('focus.noTasks')}
            </div>
          )}
        </div>

        {/* Add Todo Input */}
        <form onSubmit={handleAdd} className="flex items-center gap-2 pt-2 border-t border-main shrink-0">
          <input
            type="text"
            value={newTodoText}
            onChange={(e) => setNewTodoText(e.target.value)}
            placeholder={t('focus.addTaskPlaceholder')}
            className="flex-1 bg-input border border-main rounded-xl px-3 py-1.5 text-xs text-app placeholder:text-muted outline-none focus:border-accent"
          />
          <button
            type="submit"
            className="p-2 rounded-xl bg-accent hover:bg-accent-hover text-white transition shrink-0 shadow-sm"
          >
            <Plus className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  )
}
