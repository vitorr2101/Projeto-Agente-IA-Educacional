// chatConfig.js - Configuration for EduPlan AI interface

const DEFAULT_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL || 'https://ea3-ai-vaguetti.app.n8n.cloud/webhook/eduplan';

export const chatConfig = {
  bot: {
    name: 'EduPlan AI',
    title: 'Planejamento de Estudos & Foco Neurodivergente (TEA)',
    initialMessage: 'Olá! 👋 Eu sou o **EduPlan AI**, seu consultor pedagógico e tutor de planejamento acadêmico adaptado para o espectro autista (TEA) e neurodivergência.\n\nEstou aqui para entender sua rotina, sua forma de foco, suas sensibilidades sensoriais e seus interesses, para criarmos um cronograma estruturado, previsível e sem sobrecarga.\n\nPara começarmos, como posso chamar você e qual o seu objetivo principal de estudos no momento?',
  },
  backend: {
    defaultWebhookUrl: DEFAULT_WEBHOOK_URL,
    storageKey: 'eduplan_webhook_url',
  },
  theme: {
    primaryColor: '#0369a1',
    focusColor: '#0d9488',
    pauseColor: '#d97706',
  }
};

export const getWebhookUrl = () => {
  try {
    const saved = localStorage.getItem(chatConfig.backend.storageKey);
    if (saved && saved.trim()) return saved.trim();
  } catch (e) {
    console.warn('Could not read localStorage for webhook url', e);
  }
  return chatConfig.backend.defaultWebhookUrl;
};

export const setWebhookUrl = (url) => {
  try {
    if (!url || !url.trim()) {
      localStorage.removeItem(chatConfig.backend.storageKey);
    } else {
      localStorage.setItem(chatConfig.backend.storageKey, url.trim());
    }
  } catch (e) {
    console.warn('Could not save webhook url to localStorage', e);
  }
};
