import React, { useState } from 'react';
import { 
  X, 
  Settings, 
  Check, 
  Copy, 
  Globe, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  ExternalLink 
} from 'lucide-react';
import { chatConfig, getWebhookUrl, setWebhookUrl } from '../config/chatConfig';

export default function SettingsModal({
  isOpen,
  onClose,
  activeSessionId,
  onUrlUpdated
}) {
  if (!isOpen) return null;

  const [url, setUrl] = useState(getWebhookUrl());
  const [copied, setCopied] = useState(false);
  const [testStatus, setTestStatus] = useState(null); // 'loading', 'success', 'error'
  const [testMessage, setTestMessage] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleCopySessionId = () => {
    if (!activeSessionId) return;
    navigator.clipboard.writeText(activeSessionId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    setWebhookUrl(url);
    setSavedSuccess(true);
    if (onUrlUpdated) onUrlUpdated(url);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleReset = () => {
    const defaultUrl = chatConfig.backend.defaultWebhookUrl;
    setUrl(defaultUrl);
    setWebhookUrl(defaultUrl);
    setSavedSuccess(true);
    if (onUrlUpdated) onUrlUpdated(defaultUrl);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleTestConnection = async () => {
    setTestStatus('loading');
    setTestMessage('Enviando requisição de teste para o n8n...');

    try {
      const startTime = performance.now();
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: 'test-ping-' + Date.now().toString(36),
          user_message: 'Olá, teste de conexão.'
        })
      });
      const endTime = performance.now();
      const elapsed = Math.round(endTime - startTime);

      if (res.ok) {
        setTestStatus('success');
        setTestMessage(`Conectado com sucesso! Resposta recebida em ${elapsed}ms (Status: ${res.status}).`);
      } else {
        setTestStatus('error');
        setTestMessage(`O servidor respondeu com status ${res.status} (${res.statusText}). Verifique se o workflow está Ativo no n8n.`);
      }
    } catch (e) {
      setTestStatus('error');
      setTestMessage(`Falha ao conectar: ${e.message}. Verifique a URL e as permissões de CORS.`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900 text-base">Configurações de Integração</h2>
              <p className="text-xs text-slate-500">
                Ajuste os parâmetros de conexão com seu workflow n8n
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

        {/* Body */}
        <div className="p-6 space-y-5">
          
          {/* Active Session ID info */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Código de Contexto Atual (Session ID)
            </label>
            <div className="flex items-center gap-2">
              <code className="text-xs font-mono bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 text-sky-800 flex-1 truncate select-all">
                {activeSessionId || 'Carregando...'}
              </code>
              <button
                onClick={handleCopySessionId}
                className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center gap-1 text-xs"
                title="Copiar Session ID"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span className="hidden sm:inline">{copied ? 'Copiado!' : 'Copiar'}</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">
              Armazenado em cookie com validade de 30 dias para indexar o histórico de mensagens no n8n.
            </p>
          </div>

          {/* Webhook URL Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Endpoint Webhook n8n (POST)
              </label>
              <button
                onClick={handleReset}
                className="text-xs text-sky-600 hover:text-sky-700 font-medium flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                Restaurar Padrão
              </button>
            </div>
            
            <div className="relative">
              <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://sua-instancia.app.n8n.cloud/webhook/eduplan"
                className="w-full pl-9 pr-3 py-2 text-xs font-mono rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-slate-800"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              URL da rota de produção gerada pelo nó <strong>Webhook</strong> no n8n.
            </p>
          </div>

          {/* Test Status feedback */}
          {testStatus && (
            <div className={`p-3 rounded-xl text-xs flex items-start gap-2 border ${
              testStatus === 'loading'
                ? 'bg-slate-50 border-slate-200 text-slate-600'
                : testStatus === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}>
              {testStatus === 'loading' && <RefreshCw className="w-4 h-4 animate-spin shrink-0 mt-0.5" />}
              {testStatus === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />}
              {testStatus === 'error' && <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />}
              <span>{testMessage}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              onClick={handleTestConnection}
              disabled={testStatus === 'loading'}
              className="px-3.5 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors disabled:opacity-50"
            >
              Testar Conexão
            </button>

            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-sm transition-all shadow-sky-600/20 flex items-center gap-1.5"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  Salvo!
                </>
              ) : (
                'Salvar Alterações'
              )}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
