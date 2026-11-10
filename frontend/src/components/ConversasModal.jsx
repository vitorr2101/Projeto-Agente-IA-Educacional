import React from 'react';
import { 
  X, 
  MessageSquare, 
  Clock, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Cookie, 
  Calendar 
} from 'lucide-react';

export default function ConversasModal({
  isOpen,
  onClose,
  sessions = [],
  activeSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession
}) {
  if (!isOpen) return null;

  const calculateDaysLeft = (expiresAt) => {
    if (!expiresAt) return 30;
    const diffMs = expiresAt - Date.now();
    const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return Math.max(0, days);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-100 text-sky-700">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900 text-base">Conversas Salvas</h2>
              <p className="text-xs text-slate-500">
                Sessões ativas armazenadas em cookies por até 30 dias
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Button */}
        <div className="p-4 border-b border-slate-100 bg-white">
          <button
            onClick={() => {
              onNewSession();
              onClose();
            }}
            className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-sm shadow-sky-600/20"
          >
            <Plus className="w-4 h-4" />
            Iniciar Nova Conversa
          </button>
        </div>

        {/* Sessions List */}
        <div className="overflow-y-auto p-4 space-y-2.5 flex-1 divide-y divide-slate-50">
          {sessions.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <MessageSquare className="w-10 h-10 mx-auto stroke-1 text-slate-300 mb-2" />
              <p className="text-sm font-medium">Nenhuma conversa encontrada</p>
              <p className="text-xs mt-1 text-slate-400">Suas conversas ativas aparecerão aqui.</p>
            </div>
          ) : (
            sessions.map((session) => {
              const isActive = session.id === activeSessionId;
              const daysLeft = calculateDaysLeft(session.expiresAt);

              return (
                <div
                  key={session.id}
                  onClick={() => {
                    onSelectSession(session.id);
                    onClose();
                  }}
                  className={`group relative p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isActive
                      ? 'bg-sky-50/70 border-sky-300 shadow-sm'
                      : 'bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/70'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`font-semibold text-sm truncate ${isActive ? 'text-sky-900' : 'text-slate-800'}`}>
                          {session.title || 'Conversa sem título'}
                        </span>
                        {isActive && (
                          <span className="text-[10px] uppercase tracking-wider font-bold bg-sky-600 text-white px-2 py-0.5 rounded-full">
                            Atual
                          </span>
                        )}
                        {session.hasPlan && (
                          <span className="text-[10px] font-medium bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Com Cronograma
                          </span>
                        )}
                      </div>

                      {session.lastMessage && (
                        <p className="text-xs text-slate-500 truncate mb-2">
                          {session.lastMessage}
                        </p>
                      )}

                      <div className="flex items-center gap-3 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(session.updatedAt || session.createdAt).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        <span className="flex items-center gap-1 font-mono text-slate-500">
                          <Cookie className="w-3 h-3 text-amber-500" />
                          {daysLeft > 0 ? `${daysLeft} dias restantes` : 'Expirando'}
                        </span>
                      </div>
                    </div>

                    {/* Delete button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('Deseja excluir esta conversa e seus dados salvos?')) {
                          onDeleteSession(session.id);
                        }
                      }}
                      className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                      title="Excluir conversa"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
          <Cookie className="w-3.5 h-3.5 text-amber-500" />
          <span>Sessões inativas por mais de 30 dias expiram e desaparecem automaticamente do menu.</span>
        </div>

      </div>
    </div>
  );
}
