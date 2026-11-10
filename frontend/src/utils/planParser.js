/**
 * planParser.js
 * Extracts structured study plans from AI Agent responses:
 * 1. <excel_data> JSON blocks
 * 2. Markdown tables
 */

export const parsePlanFromText = (text) => {
  if (!text || typeof text !== 'string') return null;

  // 1. Try parsing <excel_data> block
  const excelTagRegex = /<excel_data>([\s\S]*?)<\/excel_data>/i;
  const match = text.match(excelTagRegex);

  if (match && match[1]) {
    try {
      const cleanJson = match[1].trim();
      const parsed = JSON.parse(cleanJson);
      if (parsed && (Array.isArray(parsed.cronograma) || Array.isArray(parsed.items))) {
        return normalizePlanData(parsed, 'excel_data');
      }
    } catch (e) {
      console.warn('Failed parsing JSON inside <excel_data>:', e);
    }
  }

  // 2. Try parsing a fenced ```json ... ``` block with cronograma
  const jsonFencedRegex = /```(?:json)?\s*(\{[\s\S]*?"cronograma"[\s\S]*?\})\s*```/i;
  const fencedMatch = text.match(jsonFencedRegex);
  if (fencedMatch && fencedMatch[1]) {
    try {
      const parsed = JSON.parse(fencedMatch[1].trim());
      if (parsed && Array.isArray(parsed.cronograma)) {
        return normalizePlanData(parsed, 'fenced_json');
      }
    } catch (e) {
      console.warn('Failed parsing fenced json:', e);
    }
  }

  // 3. Try parsing Markdown Table
  const mdTable = parseMarkdownTable(text);
  if (mdTable && mdTable.items.length >= 2) {
    return mdTable;
  }

  return null;
};

/**
 * Normalizes JSON plan data into standard internal structure
 */
const normalizePlanData = (raw, source = 'json') => {
  const items = (raw.cronograma || raw.items || []).map((row, idx) => ({
    id: `item-${idx + 1}`,
    dia: row.dia || row.dia_semana || row.Day || 'Geral',
    horario: row.horario || row.hora || row.Time || '-',
    materia: row.materia || row.disciplina || row.Subject || '-',
    topico: row.topico || row.conteudo || row.Topic || '',
    metodologia: row.metodologia || row.metodo || row.Method || 'Estudo Ativo',
    status: row.status || row.Status || 'Pendente',
    isPause: isSensoryPause(row.materia, row.topico, row.metodologia)
  }));

  return {
    source,
    title: raw.titulo_plano || raw.title || 'Cronograma de Estudos Estruturado - EduPlan AI',
    summary: raw.resumo || raw.summary || {
      total_itens: items.length,
      horizonte: 'Semanal'
    },
    items,
    createdAt: new Date().toISOString()
  };
};

/**
 * Helper to identify sensory/rest pauses
 */
export const isSensoryPause = (materia = '', topico = '', metodologia = '') => {
  const combined = `${materia} ${topico} ${metodologia}`.toLowerCase();
  return (
    combined.includes('pausa') ||
    combined.includes('intervalo') ||
    combined.includes('descanso') ||
    combined.includes('sensorial') ||
    combined.includes('descompress') ||
    combined.includes('alongamento')
  );
};

/**
 * Parse Markdown Table into structured rows
 */
const parseMarkdownTable = (text) => {
  const lines = text.split('\n').map(l => l.trim());
  const tableLines = lines.filter(l => l.startsWith('|') && l.endsWith('|'));

  if (tableLines.length < 3) return null; // Needs header, separator, at least 1 row

  // Extract header
  const headers = tableLines[0]
    .slice(1, -1)
    .split('|')
    .map(h => h.trim().toLowerCase());

  // Check if this looks like a study schedule table
  const hasScheduleHeaders = headers.some(h =>
    h.includes('dia') || h.includes('hor') || h.includes('mat') || h.includes('disc') || h.includes('tóp')
  );

  if (!hasScheduleHeaders) return null;

  // Find column indices
  const diaIdx = headers.findIndex(h => h.includes('dia'));
  const horaIdx = headers.findIndex(h => h.includes('hor'));
  const matIdx = headers.findIndex(h => h.includes('mat') || h.includes('disc') || h.includes('taref'));
  const topicoIdx = headers.findIndex(h => h.includes('tóp') || h.includes('conte'));
  const metodoIdx = headers.findIndex(h => h.includes('metod') || h.includes('bloco') || h.includes('estrat'));
  const statusIdx = headers.findIndex(h => h.includes('status') || h.includes('check'));

  const items = [];
  // Skip header (0) and separator (1)
  for (let i = 2; i < tableLines.length; i++) {
    const cols = tableLines[i].slice(1, -1).split('|').map(c => c.trim());
    if (cols.length < 2) continue;

    const dia = diaIdx !== -1 ? cols[diaIdx] : cols[0] || 'Geral';
    const horario = horaIdx !== -1 ? cols[horaIdx] : (cols[1] || '-');
    const materia = matIdx !== -1 ? cols[matIdx] : (cols[2] || '-');
    const topico = topicoIdx !== -1 ? cols[topicoIdx] : '';
    const metodologia = metodoIdx !== -1 ? cols[metodoIdx] : 'Estudo Ativo';
    const status = statusIdx !== -1 ? cols[statusIdx] : 'Pendente';

    items.push({
      id: `item-${items.length + 1}`,
      dia,
      horario,
      materia,
      topico,
      metodologia,
      status: status.replace(/\[\s*\]/, 'Pendente').replace(/\[x\]/i, 'Concluído'),
      isPause: isSensoryPause(materia, topico, metodologia)
    });
  }

  if (items.length === 0) return null;

  return {
    source: 'markdown_table',
    title: 'Cronograma de Estudos Estruturado - EduPlan AI',
    summary: {
      total_itens: items.length,
      horizonte: 'Semanal'
    },
    items,
    createdAt: new Date().toISOString()
  };
};

/**
 * Remove raw <excel_data> tags from visible chat text so the user's bubble stays clean
 */
export const cleanMessageForDisplay = (text) => {
  if (!text) return '';
  return text.replace(/<excel_data>[\s\S]*?<\/excel_data>/gi, '').trim();
};
