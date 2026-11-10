# EduPlan AI - Frontend (React + Vite + Tailwind CSS)

Interface web moderna para o agente inteligente **EduPlan AI**, especializado em planejamento de estudos adaptado para estudantes no espectro autista (TEA) e neurodivergentes, integrado ao **n8n via Webhooks**.

---

## 🚀 Funcionalidades

1. **Chatbot Fluido com Gestão de Contexto:**
   - Diálogo com o assistente pedagógico.
   - Geração automática e persistência do código de contexto da conversa (`sessionId`) em **cookies com validade de 30 dias**.
   - Menu **"Conversas"** que lista sessões salvas, tempo restante de expiração e limpeza automática de sessões decaídas (>30 dias).
   - Botão **"Nova Conversa"** para alternar contextos instantaneamente.

2. **Visualização em Tela Dividida (Split-Screen):**
   - Lado Esquerdo: Chat interativo com formatação Markdown e sugestões rápidas.
   - Lado Direito: **Painel de Artefato Renderizado** com a matriz semanal/diária do cronograma gerado pela IA.

3. **Exportação e Interatividade:**
   - Checkboxes interativos para marcar tarefas concluídas.
   - Download com 1 clique em **Excel (.xlsx)** com largura de colunas otimizada e aba de resumo.
   - Download em **CSV** com suporte UTF-8.
   - Suporte a impressão direta ou salvar em **PDF**.

4. **Diretrizes Pedagógicas para TEA & Baixa Carga Cognitiva:**
   - Paleta de cores calmante e acessível (tons suaves de ardósia, azul e verde-azulado).
   - Destaque visual diferenciado para **Pausas Sensoriais de Descompressão** vs. **Blocos de Foco Ativo**.
   - Comunicação clara, direta e livre de ambiguidades.

5. **Configuração de Webhook Dinâmica:**
   - Modal de configurações no aplicativo para visualizar o `sessionId` atual e alternar a URL do Webhook do n8n (produção, teste ou localhost) sem precisar recompilar.

---

## 🛠️ Como Executar Localmente

### Pré-requisitos
- Node.js 18+ (testado no Node.js v22)
- npm

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar variáveis de ambiente (opcional)
Copie o arquivo de exemplo ou edite o `.env`:
```bash
cp .env.example .env
```
Conteúdo padrão:
```env
VITE_N8N_WEBHOOK_URL=https://ea3-ai-vaguetti.app.n8n.cloud/webhook/eduplan
```

### 3. Rodar em modo de desenvolvimento
```bash
npm run dev
```
O app estará acessível em `http://localhost:5173`.

### 4. Gerar build de produção
```bash
npm run build
```
Os arquivos otimizados serão gerados na pasta `dist/`.

---

## ☁️ Como Fazer Deploy no Cloudflare Pages

O projeto já está 100% configurado para o Cloudflare Pages (`public/_redirects` e `public/_headers` inclusos):

1. Acesse o painel do **Cloudflare** $\rightarrow$ **Workers & Pages** $\rightarrow$ **Create Application** $\rightarrow$ **Pages** $\rightarrow$ **Connect to Git**.
2. Selecione o repositório `Projeto-Agente-IA-Educacional`.
3. Configure os parâmetros da build:
   - **Framework preset:** `Vite`
   - **Root directory:** `frontend`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
4. Em **Environment variables**, adicione (opcional, se diferente do padrão):
   - `VITE_N8N_WEBHOOK_URL`: `https://ea3-ai-vaguetti.app.n8n.cloud/webhook/eduplan`
5. Clique em **Save and Deploy**. Pronto!
