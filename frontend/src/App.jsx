import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ChatSection from './components/ChatSection';
import ArtifactSection from './components/ArtifactSection';
import ConversasModal from './components/ConversasModal';
import SettingsModal from './components/SettingsModal';
import { 
  getActiveSessionId, 
  getAllValidSessions, 
  createNewSession, 
  switchSession, 
  updateSession, 
  deleteSession, 
  saveSessionMessages, 
  loadSessionMessages, 
  saveSessionPlan, 
  loadSessionPlan 
} from './utils/sessionManager';
import { getWebhookUrl, chatConfig } from './config/chatConfig';
import { parsePlanFromText } from './utils/planParser';

export default function App() {
  const [activeSessionId, setActiveSessionId] = useState('');
  const [sessions, setSessions] = useState([]);
  const [messages, setMessages] = useState([]);
  const [planData, setPlanData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUserMessage, setLastUserMessage] = useState('');

  // Modals & tabs
  const [isConversasOpen, setIsConversasOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' or 'artifact' (mobile)

  // Initialize active session on mount
  useEffect(() => {
    const id = getActiveSessionId();
    setActiveSessionId(id);
    refreshSessionsList();
    loadSessionData(id);
  }, []);

  const refreshSessionsList = () => {
    const list = getAllValidSessions();
    setSessions(list);
  };

  const loadSessionData = (sessionId) => {
    // Load messages or create initial welcome message
    const savedMsgs = loadSessionMessages(sessionId);
    if (savedMsgs && savedMsgs.length > 0) {
      setMessages(savedMsgs);
    } else {
      const initial = [
        {
          id: 'msg-init-' + Date.now(),
          sender: 'bot',
          text: chatConfig.bot.initialMessage,
          timestamp: Date.now()
        }
      ];
      setMessages(initial);
      saveSessionMessages(sessionId, initial);
    }

    // Load plan artifact if previously generated
    const savedPlan = loadSessionPlan(sessionId);
    setPlanData(savedPlan || null);
    setError(null);
  };

  const handleSelectSession = (sessionId) => {
    switchSession(sessionId);
    setActiveSessionId(sessionId);
    refreshSessionsList();
    loadSessionData(sessionId);
  };

  const handleNewConversation = () => {
    const newSession = createNewSession('Nova Conversa');
    setActiveSessionId(newSession.id);
    refreshSessionsList();
    loadSessionData(newSession.id);
    setActiveTab('chat');
  };

  const handleDeleteSession = (sessionId) => {
    deleteSession(sessionId);
    refreshSessionsList();
    const currentActive = getActiveSessionId();
    if (currentActive !== activeSessionId) {
      setActiveSessionId(currentActive);
      loadSessionData(currentActive);
    }
  };

  const handleSendMessage = async (text) => {
    if (!text || !text.trim() || isLoading) return;

    setError(null);
    setLastUserMessage(text);

    // 1. Append user message
    const userMsg = {
      id: 'msg-u-' + Date.now(),
      sender: 'user',
      text: text.trim(),
      timestamp: Date.now()
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    saveSessionMessages(activeSessionId, updatedMessages);

    // Auto title session from first user message if still default
    const currentSession = sessions.find(s => s.id === activeSessionId);
    let titleUpdate = {};
    if (currentSession && (currentSession.title === 'Nova Conversa' || !currentSession.title)) {
      titleUpdate.title = text.slice(0, 32) + (text.length > 32 ? '...' : '');
    }

    updateSession(activeSessionId, {
      ...titleUpdate,
      lastMessage: text.slice(0, 60),
      messageCount: updatedMessages.length
    });
    refreshSessionsList();

    // 2. Call n8n webhook API
    setIsLoading(true);
    const webhookUrl = getWebhookUrl();

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          sessionId: activeSessionId,
          user_message: text.trim()
        })
      });

      if (!response.ok) {
        throw new Error(`Serviço respondeu com status ${response.status} (${response.statusText}).`);
      }

      const data = await response.json();
      
      // Extract text content from n8n response:
      // Can be [{ output: "..." }] or { output: "..." } or { response: "..." }
      let botResponseText = '';
      if (Array.isArray(data) && data.length > 0) {
        botResponseText = data[0].output || data[0].response || JSON.stringify(data[0]);
      } else if (data && typeof data === 'object') {
        botResponseText = data.output || data.response || data.message || JSON.stringify(data);
      } else if (typeof data === 'string') {
        botResponseText = data;
      }

      if (!botResponseText) {
        botResponseText = 'Resposta vazia recebida do serviço pedagógico.';
      }

      // Check if response contains a study plan artifact
      const extractedPlan = parsePlanFromText(botResponseText);
      const hasNewPlan = Boolean(extractedPlan);

      if (extractedPlan) {
        setPlanData(extractedPlan);
        saveSessionPlan(activeSessionId, extractedPlan);
        updateSession(activeSessionId, { hasPlan: true });
        refreshSessionsList();
      }

      // 3. Append bot message
      const botMsg = {
        id: 'msg-b-' + Date.now(),
        sender: 'bot',
        text: botResponseText,
        hasPlan: hasNewPlan,
        timestamp: Date.now()
      };

      const finalMessages = [...updatedMessages, botMsg];
      setMessages(finalMessages);
      saveSessionMessages(activeSessionId, finalMessages);

    } catch (err) {
      console.error('Erro na requisição ao n8n:', err);
      setError(`Não foi possível comunicar com o EduPlan AI: ${err.message}. Verifique sua conexão e se o workflow n8n está ativo.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    if (lastUserMessage) {
      handleSendMessage(lastUserMessage);
    }
  };

  const handleResetChat = () => {
    if (confirm('Deseja reiniciar as mensagens desta conversa?')) {
      const initial = [
        {
          id: 'msg-init-' + Date.now(),
          sender: 'bot',
          text: chatConfig.bot.initialMessage,
          timestamp: Date.now()
        }
      ];
      setMessages(initial);
      saveSessionMessages(activeSessionId, initial);
      setPlanData(null);
      saveSessionPlan(activeSessionId, null);
      updateSession(activeSessionId, { hasPlan: false, messageCount: 1 });
      refreshSessionsList();
    }
  };

  const handleUpdatePlan = (updatedPlan) => {
    setPlanData(updatedPlan);
    saveSessionPlan(activeSessionId, updatedPlan);
  };

  return (
    <div className="h-screen flex flex-col bg-slate-100 overflow-hidden font-sans">
      
      {/* Top Navbar */}
      <Navbar
        sessionsCount={sessions.length}
        onOpenConversas={() => setIsConversasOpen(true)}
        onNewConversation={handleNewConversation}
        onOpenSettings={() => setIsSettingsOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        hasPlan={Boolean(planData)}
      />

      {/* Main Split-Screen Layout */}
      <main className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-2 relative">
        
        {/* Left Column: Chatbot Dialogue */}
        <div className={`h-full overflow-hidden ${
          activeTab === 'chat' ? 'block' : 'hidden md:block'
        }`}>
          <ChatSection
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            error={error}
            onRetry={handleRetry}
            onResetChat={handleResetChat}
            activeSessionId={activeSessionId}
            hasPlan={Boolean(planData)}
            onViewPlan={() => setActiveTab('artifact')}
          />
        </div>

        {/* Right Column: Rendered Artifact (Timetable & Exports) */}
        <div className={`h-full overflow-hidden ${
          activeTab === 'artifact' ? 'block' : 'hidden md:block'
        }`}>
          <ArtifactSection
            planData={planData}
            onUpdatePlan={handleUpdatePlan}
          />
        </div>

      </main>

      {/* Modals */}
      <ConversasModal
        isOpen={isConversasOpen}
        onClose={() => setIsConversasOpen(false)}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onNewSession={handleNewConversation}
        onDeleteSession={handleDeleteSession}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        activeSessionId={activeSessionId}
        onUrlUpdated={() => {}}
      />

    </div>
  );
}
