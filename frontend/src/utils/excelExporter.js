import * as XLSX from 'xlsx';

/**
 * Exports plan items to an Excel (.xlsx) file
 */
export const exportToExcel = (planData, filename = 'Cronograma_EduPlan_AI.xlsx') => {
  if (!planData || !Array.isArray(planData.items)) {
    alert('Nenhum dado de cronograma disponível para exportação.');
    return;
  }

  // 1. Prepare structured rows
  const rows = planData.items.map((item, idx) => ({
    'Nº': idx + 1,
    'Dia da Semana': item.dia,
    'Horário': item.horario,
    'Disciplina / Atividade': item.materia,
    'Tópico / Conteúdo': item.topico || '-',
    'Metodologia': item.metodologia,
    'Tipo': item.isPause ? 'Pausa Sensorial / Descompressão' : 'Bloco de Estudo',
    'Status': item.status || 'Pendente'
  }));

  // 2. Create worksheet & workbook
  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Auto-fit column widths
  const colWidths = [
    { wch: 5 },   // Nº
    { wch: 18 },  // Dia
    { wch: 15 },  // Horário
    { wch: 25 },  // Disciplina
    { wch: 30 },  // Tópico
    { wch: 24 },  // Metodologia
    { wch: 32 },  // Tipo
    { wch: 14 },  // Status
  ];
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Cronograma');

  // Add Summary sheet if available
  if (planData.summary) {
    const summaryRows = [
      { Propriedade: 'Título do Plano', Valor: planData.title || 'Plano de Estudos Personalizado' },
      { Propriedade: 'Data de Criação', Valor: new Date(planData.createdAt || Date.now()).toLocaleDateString('pt-BR') },
      { Propriedade: 'Horizonte Temporal', Valor: planData.summary.horizonte || 'Semanal' },
      { Propriedade: 'Total de Itens / Blocos', Valor: planData.items.length },
      { Propriedade: 'Total de Pausas Sensoriais', Valor: planData.items.filter(i => i.isPause).length }
    ];
    const summarySheet = XLSX.utils.json_to_sheet(summaryRows);
    summarySheet['!cols'] = [{ wch: 25 }, { wch: 40 }];
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Visão Geral');
  }

  // 3. Trigger file download
  XLSX.writeFile(workbook, filename);
};

/**
 * Exports plan items to a CSV file with UTF-8 BOM
 */
export const exportToCsv = (planData, filename = 'Cronograma_EduPlan_AI.csv') => {
  if (!planData || !Array.isArray(planData.items)) {
    alert('Nenhum dado de cronograma disponível para exportação.');
    return;
  }

  const headers = ['Nº', 'Dia', 'Horário', 'Matéria', 'Tópico', 'Metodologia', 'Tipo', 'Status'];
  const rows = planData.items.map((item, idx) => [
    idx + 1,
    `"${(item.dia || '').replace(/"/g, '""')}"`,
    `"${(item.horario || '').replace(/"/g, '""')}"`,
    `"${(item.materia || '').replace(/"/g, '""')}"`,
    `"${(item.topico || '').replace(/"/g, '""')}"`,
    `"${(item.metodologia || '').replace(/"/g, '""')}"`,
    `"${item.isPause ? 'Pausa Sensorial' : 'Estudo'}"`,
    `"${(item.status || 'Pendente').replace(/"/g, '""')}"`
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Native print trigger
 */
export const triggerPrint = () => {
  window.print();
};
