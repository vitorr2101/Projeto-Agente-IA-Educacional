import React from 'react';
import { 
  Sparkles, 
  MessageSquare, 
  PlusCircle, 
  Settings, 
  Calendar, 
  Brain, 
  Layout, 
  Menu 
} from 'lucide-react';

export default function Navbar({
  sessionsCount = 0,
  onOpenConversas,
  onNewConversation,
  onOpenSettings,
  activeTab,
  setActiveTab,
  hasPlan = false
}) {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 px-4 py-3 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Brand / Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 via-teal-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-sky-500/20">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg tracking-tight text-white flex items-center gap-1.5">
                EduPlan AI
              </h1>
              <span className="text-[11px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                TEA Inclusivo
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Planejamento de Estudos Adaptado & Gestão de Sobrecarga Cognitiva
            </p>
          </div>
        </div>

        {/* Mobile View Switcher (Only visible on small screens) */}
        <div className="flex md:hidden items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700">
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors ${
              activeTab === 'chat'
                ? 'bg-sky-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Chat
          </button>
          <button
            onClick={() => setActiveTab('artifact')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors relative ${
              activeTab === 'artifact'
                ? 'bg-sky-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Cronograma
            {hasPlan && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 absolute top-1 right-1 animate-pulse" />
            )}
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Conversas Menu Button */}
          <button
            onClick={onOpenConversas}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium transition-all shadow-sm hover:border-slate-600"
            title="Menu de conversas salvas (válidas por 30 dias)"
          >
            <MessageSquare className="w-4 h-4 text-sky-400" />
            <span className="hidden sm:inline">Conversas</span>
            <span className="bg-sky-500/20 text-sky-300 px-1.5 py-0.2 rounded-full text-[10px] font-bold">
              {sessionsCount}
            </span>
          </button>

          {/* Nova Conversa Button */}
          <button
            onClick={onNewConversation}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-sm transition-all shadow-sky-600/20"
            title="Iniciar uma nova conversa com novo código de contexto"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden md:inline">Nova Conversa</span>
          </button>

          {/* Settings / Webhook Config */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
            title="Configurar Endpoint Webhook do n8n"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
}
