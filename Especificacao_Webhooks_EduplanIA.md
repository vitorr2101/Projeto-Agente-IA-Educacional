# **Especificação da API e Comunicação \- EduplanIA**

Este documento descreve a especificação técnica de comunicação HTTP entre as aplicações front-end e o agente de inteligência artificial EduplanIA, implementado como um serviço por meio de Webhooks no n8n.

# **1\. Visão Geral do Serviço**

## **1.1 Apresentação e Objetivo do Serviço**

O EduplanIA é um agente inteligente projetado para atuar como facilitador de planejamento escolar e acadêmico, com ênfase no atendimento a estudantes neurodivergentes (como pessoas com TDAH, TEA, entre outros perfis cognitivos).

O objetivo central do serviço é guiar o estudante por meio de um diálogo investigativo e diagnóstico. Ao longo da interação, o agente identifica rotinas, barreiras de concentração e necessidades específicas para estruturar um cronograma de estudos sob medida (semanal, mensal ou personalizado), gerando ao final um arquivo estruturado em formato Excel (.xlsx) e .csv para visualização em tela e download.

Para assegurar o alinhamento com metodologias de ensino inclusivo e evitar sobrecargas de estudo, o agente integra uma base de conhecimento via RAG (Retrieval-Augmented Generation) conectada a um banco vetorial no Supabase, garantindo respostas embasadas em boas práticas educacionais.

## **1.2 Aplicações Consumidoras**

* **Web App EduplanIA (Desktop e Mobile):** Interface principal de conversação e visualização gráfica da tabela de estudos.  
* **Módulo Tutor Personalizado (Evolução Futura):** Aplicação complementar que utilizará a base do plano gerado para guiar o estudante conforme materiais didáticos forem carregados na plataforma.

## **1.3 Integração com o n8n**

O agente é desacoplado da interface visual padrão do n8n e exposto como um serviço HTTP via Webhook. O fluxo do n8n orquestra o recebimento do payload, a formatação de campos intermediários (Edit Fields), a recuperação de memória conversacional (Simple Memory), as consultas ao banco vetorial (Supabase Vector Store) e o processamento pelo modelo de linguagem (lmChatOpenAi), devolvendo respostas síncronas ao cliente.

# **2\. Configuração do Front-end (chatConfig.js)**

// chatConfig.js

const chatConfig \= {

  bot: {

    name: 'EduplanIA',

    initialMessage:

      'Olá\! 👋 Eu sou o EduplanIA, seu facilitador de planejamento de estudos. Estou aqui para entender sua rotina, suas preferências e como você aprende melhor, para juntos montarmos um cronograma sob medida. Como posso chamar você e qual o seu foco de estudos atual?',

  },

  interface: {

    headerText: 'EduplanIA \- Planejamento Acadêmico Inclusivo',

    placeholderText: 'Compartilhe sua rotina ou dificuldade...',

    loadingText: 'Consultando diretrizes pedagógicas e organizando seu plano...',

  },

  images: {

    botAvatar: 'EduplanIA\_avatar.svg',

    userAvatar: 'estudante\_avatar.svg',

    banner: 'EduplanIA\_banner.svg',

  },

  backend: {

    baseUrl: 'https\://n8n.incluc0de.com.br/webhook/eduplania',

    chatEndpoint: '/chat',

    tableEndpoint: '/tabela',

    testEndpoint: '/test',

  },

  colors: {

    botMessageBox: '\#2B5B84',

    chatButton: '\#1B998B',

    botAvatarBorder: '\#2B5B84',

    userAvatarBorder: '\#1B998B',

  },

};

export default chatConfig;

# **3\. Identificação de Sessão e Contexto Conversacional**

* **Geração do Identificador:** O front-end instancia um identificador único (`sessionId`) no início da interação com base em hash alfanumérico comprimido.  
* **Propagação nas Requisições:** Cada mensagem enviada contém obrigatoriamente o `sessionId` no corpo do payload JSON.  
* **Persistência de Memória no n8n:** O agente utiliza o nó de memória nativo `memoryBufferWindow` configurado com janela de 10 interações, indexado pela chave `sessionId` recebida.  
* **URL Portável:** O `sessionId` funciona como chave de acesso à tabela gerada (`/tabela/:userId`), permitindo ao aluno recarregar a página ou revisitar seu cronograma sem perda de dados.

# **4\. Especificação das Rotas da API**

**URL Base:** `https://n8n.incluc0de.com.br/webhook/eduplania`

## **4.1 Rota: Diálogo com o Agente Educacional**

* **Método HTTP:** POST  
* **Caminho Relativo:** `/chat`  
* **Objetivo:** Enviar a mensagem do estudante e obter a resposta diagnóstica ou o sinal de conclusão do cronograma.  
* **Cabeçalhos:** `Content-Type: application/json`

**Corpo da Requisição (JSON):**{

  "sessionId": "edp\_7f9c2a1b",

  "user\_message": "Tenho TDAH e não consigo manter o foco por mais de 25 minutos seguidos."

}

**Respostas Esperadas:**

`200 OK` — Diálogo em andamento:{

  "status": "success",

  "sessionId": "edp\_7f9c2a1b",

  "response": "Compreendido perfeitamente. Vamos estruturar blocos com intervalos regulares. Em quais horários do dia você costuma ter mais energia para estudar?",

  "plan\_ready": false

}

`200 OK` — Diagnóstico finalizado e cronograma pronto:{

  "status": "success",

  "sessionId": "edp\_7f9c2a1b",

  "response": "Finalizei seu cronograma de estudos com base nas diretrizes pedagógicas\! Ele já está disponível para visualização e download.",

  "plan\_ready": true,

  "table\_url": "/webhook/eduplania/tabela/edp\_7f9c2a1b"

}

## **4.2 Rota: Persistir Cronograma de Estudos**

* **Método HTTP:** POST  
* **Caminho Relativo:** `/tabela/:userId`  
* **Objetivo:** Salvar a tabela estruturada de estudos gerada pelo fluxo conversacional no banco de dados.  
* **Parâmetros de Rota:** `userId` (String, obrigatório)  
* **Cabeçalhos:** `Content-Type: application/json`

**Corpo da Requisição (JSON):**{

  "title": "Cronograma de Estudos \- Foco Adaptado",

  "schedule\_json": {

    "columns": \["Dia", "Horário", "Matéria / Tarefa", "Bloco Foco", "Pausa Sensorial"\],

    "rows": \[

      \["Segunda-feira", "08:30 \- 08:55", "Matemática (Teoria)", "25 min", "5 min (Alongamento)"\],

      \["Segunda-feira", "09:00 \- 09:25", "Matemática (Exercícios)", "25 min", "15 min (Caminhada)"\]

    \]

  },

  "csv\_content": "Dia,Horário,Matéria / Tarefa,Bloco Foco,Pausa Sensorial\\nSegunda-feira,08:30 \- 08:55,Matemática (Teoria),25 min,5 min\\nSegunda-feira,09:00 \- 09:25,Matemática (Exercícios),25 min,15 min"

}

**Resposta Esperada (`201 Created`):**{

  "status": "success",

  "message": "Cronograma persistido com sucesso.",

  "userId": "edp\_7f9c2a1b",

  "access\_url": "/webhook/eduplania/tabela/edp\_7f9c2a1b"

}

## **4.3 Rota: Recuperar Cronograma para Exibição e Download**

* **Método HTTP:** GET  
* **Caminho Relativo:** `/tabela/:userId`  
* **Objetivo:** Recuperar o cronograma salvo de um estudante para renderização direta em tela e disponibilização de download nos formatos .xlsx e .csv.

**Resposta Esperada (`200 OK`):**{

  "status": "success",

  "userId": "edp\_7f9c2a1b",

  "title": "Cronograma de Estudos \- Foco Adaptado",

  "data": {

    "columns": \["Dia", "Horário", "Matéria / Tarefa", "Bloco Foco", "Pausa Sensorial"\],

    "rows": \[

      \["Segunda-feira", "08:30 \- 08:55", "Matemática (Teoria)", "25 min", "5 min (Alongamento)"\],

      \["Segunda-feira", "09:00 \- 09:25", "Matemática (Exercícios)", "25 min", "15 min (Caminhada)"\]

    \]

  },

  "csv\_content": "Dia,Horário,Matéria / Tarefa,Bloco Foco,Pausa Sensorial\\nSegunda-feira,08:30 \- 08:55,Matemática (Teoria),25 min,5 min\\nSegunda-feira,09:00 \- 09:25,Matemática (Exercícios),25 min,15 min",

  "download\_formats": \["csv", "xlsx"\]

}

## **4.4 Rota: Verificação de Integridade e Teste**

* **Método HTTP:** GET  
* **Caminho Relativo:** `/test`  
* **Objetivo:** Verificar se o serviço de Webhook do n8n está ativo e pronto para receber conexões.

**Resposta Esperada (`200 OK`):**n  
{  
"status": "online",  
"service": "EduplanIA",  
"timestamp": "2026-10-06T22:45:00Z"  
}

\#\# 5\. Tratamento de Erros e Graceful Fallback

\*\*Formato Padrão de Erro:\*\*

\`\`\`json

{

  "status": "error",

  "error\_code": "STRING\_IDENTIFIER",

  "message": "Descrição legível da ocorrência.",

  "retryable": true

}

| Código HTTP | Identificador | Descrição / Causa |
| :---- | :---- | :---- |
| **400 Bad Request** | `INVALID_INPUT` | Ausência de `user_message` ou `sessionId`. |
| **404 Not Found** | `PLAN_NOT_FOUND` | Tabela não encontrada para o `userId` informado. |
| **500 Internal Error** | `RAG_UNAVAILABLE` | Falha de conexão com a base vetorial Supabase. |
| **503 Unavailable** | `SERVICE_TIMEOUT` | Indisponibilidade de resposta do modelo ou n8n. |

**Mecanismo de Fallback:**

1. **Aviso Amigável:** Exibido na janela de chat informando tentativa de reconexão automática.  
2. **Retentativa Automática:** Executada com algoritmo de recuo exponencial (2s, 4s, 8s).  
3. **Persistência do Link Portátil:** Garante o retorno e acesso do estudante sem perda do progresso.  
4. **Polling:** Realizado na rota `/test` para reativar o chat sem necessidade de recarregar a tela.

# **6\. Fluxo de Interação**

1. Front-end inicializa token de sessão portátil.  
2. Front-end envia `POST /chat` com `sessionId` e `user_message`.  
3. n8n executa Edit Fields, carrega histórico na Simple Memory, consulta RAG no Supabase e executa raciocínio com AI Agent.  
4. n8n devolve `200 OK` com a mensagem diagnóstica.  
5. Ao concluir o diagnóstico, n8n gera a tabela estruturada e executa `POST /tabela/:userId`.  
6. Front-end faz `GET /tabela/:userId`, recebe o JSON e o CSV, renderizando a grade e os botões de download.

# **7\. Relação com Casos de Teste e Diretrizes Comportamentais**

* **Mensagens Incompletas/Vagas:** O agente detecta falta de informações e conduz o aluno gentilmente a detalhar disciplinas e horários.  
* **Fora de Escopo:** Reafirma seu papel estrito de facilitador pedagógico, declinando tópicos não acadêmicos.  
* **Sobrecargas de Horário:** Apoia-se no RAG para alertar sobre esgotamento cognitivo e propõe intervalos de descompressão motora e sensorial.

