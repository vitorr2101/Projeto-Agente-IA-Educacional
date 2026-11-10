import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  FileText, 
  Printer, 
  CheckCircle2, 
  Circle, 
  Calendar, 
  Sparkles, 
  Clock, 
  Coffee, 
  BookOpen, 
  Filter, 
  Share2 
} from 'lucide-react';
import { exportToExcel, exportToCsv, triggerPrint } from '../utils/excelExporter';

export default function ArtifactSection({ planData, onUpdatePlan }) {
  const [selectedDay, setSelectedDay] = useState('Todos');

  if (!planData || !Array.isArray(planData.items) || planData.items.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-slate-50/60 border-l border-slate-200">
        <div className="w-16 h-16 rounded-2xl bg-sky-100/70 border border-sky-200 flex items-center justify-center text-sky-600 mb-4 shadow-sm">
          <Calendar className="w-8 h-8 stroke-[1.5]" />
        </div>
        <h3 className="font-semibold text-slate-800 text-base mb-1">
          Painel de Cronograma & Artefatos
        </h3>
        <p className="text-xs text-slate-500 max-w-sm mb-6 leading-relaxed">
          Converse com o <strong>EduPlan AI</strong> para responder às perguntas diagnósticas. 
          Assim que o planejamento for concluído, sua tabela estruturada aparecerá aqui automaticamente.
        </p>

        <div className="bg-white rounded-xl p-4 border border-slate-200 text-left max-w-xs shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-700 mb-1.5">
            <Sparkles className="w-4 h-4 text-teal-500" />
            Recursos do Cronograma
          </div>
          <ul className="text-[11px] text-slate-600 space-y-1.5">
            <li className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
              Matriz semanal interativa com checkboxes
            </li>
            <li className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              Identificação clara de pausas sensoriais
            </li>
            <li className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
              Download em <strong>Excel (.xlsx)</strong> e <strong>CSV</strong>
            </li>
          </ul>
        </div>
      </div>
    );
  }

  // Extract distinct days
  const allDays = ['Todos', ...Array.from(new Set(planData.items.map(i => i.dia).filter(Boolean)))];

  // Filter items by selected day
  const filteredItems = selectedDay === 'Todos'
    ? planData.items
    : planData.items.filter(i => i.dia === selectedDay);

  // Toggle item status
  const handleToggleStatus = (itemId) => {
    if (!onUpdatePlan) return;
    const updatedItems = planData.items.map(item => {
      if (item.id === itemId) {
        const isDone = item.status === 'Concluído';
        return {
          ...item,
          status: isDone ? 'Pendente' : 'Concluído'
        };
      }
      return item;
    });

    onUpdatePlan({
      ...planData,
      items: updatedItems
    });
  };

  const totalBlocks = planData.items.length;
  const pauseBlocks = planData.items.filter(i => i.isPause).length;
  const completedBlocks = planData.items.filter(i => i.status === 'Concluído').length;

  return (
    <div className="h-full flex flex-col bg-white border-l border-slate-200 overflow-hidden">
      
      {/* Top Header & Actions */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/70">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-slate-900 text-base tracking-tight">
                {planData.title || 'Cronograma de Estudos'}
              </h2>
              <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                Pronto para Uso
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {planData.summary?.horizonte || 'Semanal'} • {completedBlocks} de {totalBlocks} concluídos
            </p>
          </div>

          {/* Download Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportToExcel(planData)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-all shadow-emerald-600/20"
              title="Baixar planilha formatada em Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Excel (.xlsx)</span>
            </button>

            <button
              onClick={() => exportToCsv(planData)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-medium transition-colors border border-slate-700"
              title="Baixar arquivo em formato CSV"
            >
              <FileText className="w-3.5 h-3.5 text-slate-300" />
              <span>CSV</span>
            </button>

            <button
              onClick={triggerPrint}
              className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors"
              title="Imprimir ou Salvar em PDF"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Pills by Day */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-1" />
          {allDays.map(day => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium shrink-0 transition-colors ${
                selectedDay === day
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-200/60 border border-slate-200'
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      {/* Main Interactive Table */}
      <div className="flex-1 overflow-auto p-4">
        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/80 text-slate-700 border-b border-slate-200 text-[11px] uppercase tracking-wider font-semibold">
                <th className="py-2.5 px-3 w-10 text-center">Status</th>
                <th className="py-2.5 px-3">Dia</th>
                <th className="py-2.5 px-3">Horário</th>
                <th className="py-2.5 px-3">Disciplina / Atividade</th>
                <th className="py-2.5 px-3">Tópico / Detalhes</th>
                <th className="py-2.5 px-3">Metodologia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map((item) => {
                const isCompleted = item.status === 'Concluído';

                return (
                  <tr
                    key={item.id}
                    className={`transition-colors ${
                      item.isPause 
                        ? 'bg-amber-50/40 hover:bg-amber-50/70' 
                        : isCompleted
                        ? 'bg-slate-50/60 hover:bg-slate-50'
                        : 'hover:bg-slate-50/80'
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => handleToggleStatus(item.id)}
                        className="text-slate-400 hover:text-emerald-600 transition-colors focus:outline-none"
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Circle className="w-4 h-4 text-slate-300" />
                        )}
                      </button>
                    </td>

                    {/* Dia */}
                    <td className={`py-2.5 px-3 font-medium ${isCompleted ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                      {item.dia}
                    </td>

                    {/* Horário */}
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                      {item.horario}
                    </td>

                    {/* Disciplina */}
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1.5">
                        {item.isPause ? (
                          <Coffee className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        ) : (
                          <BookOpen className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        )}
                        <span className={`font-semibold ${
                          item.isPause 
                            ? 'text-amber-800' 
                            : isCompleted 
                            ? 'text-slate-400 line-through' 
                            : 'text-slate-900'
                        }`}>
                          {item.materia}
                        </span>
                      </div>
                    </td>

                    {/* Tópico */}
                    <td className={`py-2.5 px-3 ${isCompleted ? 'text-slate-400' : 'text-slate-600'}`}>
                      {item.topico || '-'}
                    </td>

                    {/* Metodologia / Tipo */}
                    <td className="py-2.5 px-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium ${
                        item.isPause
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-teal-50 text-teal-800 border border-teal-200'
                      }`}>
                        {item.metodologia}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Info */}
      <div className="px-4 py-2.5 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between text-[11px] text-slate-500">
        <span>Total: <strong>{totalBlocks} blocos</strong> ({pauseBlocks} pausas sensoriais)</span>
        <span className="hidden sm:inline">Exibindo formato renderizado de artefato com exportação direta</span>
      </div>

    </div>
  );
}
