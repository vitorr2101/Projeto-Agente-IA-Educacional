import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  RotateCcw, 
  Sparkles, 
  AlertCircle, 
  ArrowRight, 
  Copy, 
  Check, 
  Calendar 
} from 'lucide-react';
import { marked } from 'marked';
import { cleanMessageForDisplay } from '../utils/planParser';

// Configure marked for smooth chat bubbles
marked.setOptions({
  breaks: true,
  gfm: true,
});

export default function ChatSection({
  messages = [],
  onSendMessage,
  isLoading = false,
  error = null,
  onRetry,
  onResetChat,
  activeSessionId,
  hasPlan = false,
  onViewPlan
}) {
  const [input, setInput] = useState('');
  const [copiedSession, setCopiedSession] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto-scroll to bottom on new messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;
    const msg = input.trim();
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    onSendMessage(msg);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInputResize = (e) => {
    const target = e.target;
    target.style.height = 'auto';
    target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
    setInput(target.value);
  };

  const handleCopySession = () => {
    if (!activeSessionId) return;
    navigator.clipboard.writeText(activeSessionId);
    setCopiedSession(true);
    setTimeout(() => setCopiedSession(false), 2000);
  };

  const quickPrompts = [
    'Quero organizar estudos para o ENEM com foco adaptado.',
    'Tenho sensibilidade sensorial e preciso de pausas regulares.',
    'Preciso planejar disciplinas da faculdade sem sobrecarga.'
  ];

  return (
    <div className="h-full flex flex-col bg-slate-50 relative overflow-hidden">
      
      {/* Chat Sub-Header */}
      <div className="px-4 py-2.5 bg-white border-b border-slate-200/80 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-medium">Sessão:</span>
          <button
            onClick={handleCopySession}
            className="flex items-center gap-1 font-mono text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200 transition-colors"
            title="Copiar código de contexto da sessão"
          >
            <span>{activeSessionId ? activeSessionId.slice(0, 16) + '...' : 'Carregando'}</span>
            {copiedSession ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-400" />}
          </button>
        </div>

        <button
          onClick={onResetChat}
          className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 px-2 py-1 rounded transition-colors flex items-center gap-1 text-[11px]"
          title="Limpar mensagens desta tela"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Limpar Tela</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => {
          const isBot = msg.sender === 'bot';
          const cleanText = cleanMessageForDisplay(msg.text);

          return (
            <div
              key={msg.id || index}
              className={`flex gap-3 max-w-3xl ${isBot ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
            >
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                isBot 
                  ? 'bg-slate-900 text-sky-400 border border-slate-800' 
                  : 'bg-sky-600 text-white'
              }`}>
                {isBot ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>

              {/* Message Content */}
              <div className={`flex flex-col space-y-1.5 max-w-[85%] ${isBot ? 'items-start' : 'items-end'}`}>
                <div
                  className={`px-4 py-3 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm ${
                    isBot
                      ? 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-sm'
                      : 'bg-sky-600 text-white rounded-tr-sm'
                  }`}
                >
                  {/* Message Formatted Body with Markdown support */}
                  <div 
                    className="markdown-content break-words"
                    dangerouslySetInnerHTML={{ __html: marked.parse(cleanText) }}
                  />

                  {/* Plan Ready Callout Card */}
                  {msg.hasPlan && (
                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 bg-teal-50/70 p-2.5 rounded-xl border border-teal-200/80">
                      <div className="flex items-center gap-2 text-teal-900 text-xs font-semibold">
                        <Calendar className="w-4 h-4 text-teal-600" />
                        <span>Cronograma Estruturado Gerado!</span>
                      </div>
                      <button
                        onClick={onViewPlan}
                        className="px-2.5 py-1 bg-teal-700 hover:bg-teal-600 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1 shadow-sm"
                      >
                        <span>Ver Tabela</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Timestamp */}
                <span className="text-[10px] text-slate-400 px-1">
                  {new Date(msg.timestamp || Date.now()).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
          );
        })}

        {/* Loading Bubble */}
        {isLoading && (
          <div className="flex gap-3 max-w-3xl mr-auto animate-fadeIn">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-sky-400 border border-slate-800 flex items-center justify-center shrink-0 shadow-sm">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white border border-slate-200/90 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex items-center gap-2.5 text-xs text-slate-600">
              <div className="flex space-x-1">
                <span className="w-2 h-2 rounded-full bg-sky-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-slate-500">Consultando diretrizes pedagógicas e organizando seu plano...</span>
            </div>
          </div>
        )}

        {/* Error notification */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
            {onRetry && (
              <button
                onClick={onRetry}
                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-md text-xs font-semibold shrink-0"
              >
                Tentar Novamente
              </button>
            )}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts (Only show if few messages) */}
      {messages.length <= 2 && (
        <div className="px-4 py-2 border-t border-slate-200/60 bg-white/70 overflow-x-auto flex items-center gap-2">
          <span className="text-[11px] text-slate-400 flex items-center gap-1 shrink-0 font-medium">
            <Sparkles className="w-3 h-3 text-amber-500" />
            Sugestões:
          </span>
          {quickPrompts.map((p, i) => (
            <button
              key={i}
              onClick={() => onSendMessage(p)}
              disabled={isLoading}
              className="text-[11px] text-slate-600 hover:text-sky-700 bg-slate-100 hover:bg-sky-50 border border-slate-200 hover:border-sky-200 px-2.5 py-1 rounded-full whitespace-nowrap transition-colors shrink-0 disabled:opacity-50"
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="p-3 bg-white border-t border-slate-200">
        <form onSubmit={handleSubmit} className="flex items-end gap-2 max-w-3xl mx-auto">
          <div className="flex-1 bg-slate-50 border border-slate-200 focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-500/10 rounded-2xl px-3.5 py-2 transition-all">
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={handleInputResize}
              onKeyDown={handleKeyDown}
              placeholder="Digite sua mensagem ou descreva sua rotina de estudos..."
              disabled={isLoading}
              className="w-full bg-transparent resize-none text-xs sm:text-sm text-slate-800 focus:outline-none max-h-32 placeholder:text-slate-400"
            />
          </div>

          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:bg-slate-200 text-white disabled:text-slate-400 shadow-sm transition-all shadow-sky-600/20 shrink-0"
            title="Enviar mensagem (Enter)"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <p className="text-[10px] text-center text-slate-400 mt-1.5">
          Pressione <kbd className="font-mono bg-slate-100 px-1 rounded text-slate-500">Enter</kbd> para enviar, ou <kbd className="font-mono bg-slate-100 px-1 rounded text-slate-500">Shift + Enter</kbd> para quebra de linha.
        </p>
      </div>

    </div>
  );
}
