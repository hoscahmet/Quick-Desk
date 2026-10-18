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
    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 overflow-y-auto bg-slate-950">
      {/* Pomodoro Timer Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between items-center text-center shadow-lg">
        <div className="w-full flex items-center justify-between pb-3 border-b border-slate-800/80">
          <span className="text-xs font-semibold text-slate-300">{t('focus.timerTitle')}</span>
          <span
            className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full ${
              mode === 'work'
                ? 'bg-emerald-500/15 text-emerald-400'
                : 'bg-amber-500/15 text-amber-400'
            }`}
          >
            {mode === 'work' ? t('focus.workTime') : t('focus.breakTime')}
          </span>
        </div>

        <div className="py-10">
          <div className="text-6xl font-extrabold font-mono tracking-tight text-slate-100 drop-shadow">
            {formattedTime}
          </div>
        </div>

        <div className="w-full flex flex-col gap-2.5">
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={toggleTimer}
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition shadow-md"
            >
              {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isRunning ? t('focus.pause') : t('focus.start')}</span>
            </button>
            <button
              onClick={resetTimer}
              title={t('focus.reset')}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 pt-1 border-t border-slate-800/50">
            <button
              onClick={() => switchMode('work')}
              className={`text-xs px-3 py-1 rounded-lg transition ${
                mode === 'work'
                  ? 'bg-slate-800 text-slate-100 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t('focus.workDuration')}
            </button>
            <button
              onClick={() => switchMode('break')}
              className={`text-xs px-3 py-1 rounded-lg transition flex items-center gap-1 ${
                mode === 'break'
                  ? 'bg-slate-800 text-slate-100 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Coffee className="w-3.5 h-3.5" />
              <span>{t('focus.breakDuration')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Todo Checklist Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-lg overflow-hidden">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 shrink-0">
          <span className="text-xs font-semibold text-slate-300">{t('focus.tasksTitle')}</span>
          <span className="text-[11px] text-slate-400 font-medium">
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
                  ? 'bg-slate-950/40 border-slate-800/40 opacity-70'
                  : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <button
                onClick={() => onToggleTodo(todo.id)}
                className={`p-0.5 rounded transition ${
                  todo.done ? 'text-indigo-400' : 'text-slate-600 hover:text-slate-400'
                }`}
              >
                <CheckCircle2
                  className={`w-4 h-4 ${todo.done ? 'fill-indigo-500/20' : ''}`}
                />
              </button>
              <span
                className={`flex-1 text-xs select-text ${
                  todo.done ? 'line-through text-slate-500' : 'text-slate-200'
                }`}
              >
                {todo.text}
              </span>
              <button
                onClick={() => onDeleteTodo(todo.id)}
                title={t('focus.deleteTask')}
                className="text-slate-600 hover:text-rose-400 p-1 rounded transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          {todos.length === 0 && (
            <div className="text-center py-10 text-slate-500 text-xs">
              {t('focus.noTasks')}
            </div>
          )}
        </div>

        {/* Add Todo Input */}
        <form onSubmit={handleAdd} className="flex items-center gap-2 pt-2 border-t border-slate-800/80 shrink-0">
          <input
            type="text"
            value={newTodoText}
            onChange={(e) => setNewTodoText(e.target.value)}
            placeholder={t('focus.addTaskPlaceholder')}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition shrink-0"
          >
            <Plus className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  )
}
