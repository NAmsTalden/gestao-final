import { useMemo } from 'react';
import { FileText, Download, BarChart3, PieChart, TrendingUp, Calendar, DollarSign } from 'lucide-react';
import type { Process } from '../types';
import { formatCurrency } from '../utils/formatters';

interface RelatoriosProps {
  processes: Process[];
}

const Relatorios = ({ processes }: RelatoriosProps) => {
  const stats = useMemo(() => {
    const total = processes.length;
    const emAnalise = processes.filter(p => p.status === 'em-analise').length;
    const aguardando = processes.filter(p => p.status === 'aguardando-documento').length;
    const publicados = processes.filter(p => p.status === 'publicado').length;
    const finalizados = processes.filter(p => p.status === 'finalizado').length;

    const valorTotal = processes.reduce((acc, p) => {
      const valor = parseFloat(p.valorEstimado.replace(/[^\d,.-]/g, '').replace(',', '.'));
      return acc + (isNaN(valor) ? 0 : valor);
    }, 0);

    const valorPorStatus = {
      'em-analise': processes
        .filter(p => p.status === 'em-analise')
        .reduce((acc, p) => {
          const valor = parseFloat(p.valorEstimado.replace(/[^\d,.-]/g, '').replace(',', '.'));
          return acc + (isNaN(valor) ? 0 : valor);
        }, 0),
      'aguardando-documento': processes
        .filter(p => p.status === 'aguardando-documento')
        .reduce((acc, p) => {
          const valor = parseFloat(p.valorEstimado.replace(/[^\d,.-]/g, '').replace(',', '.'));
          return acc + (isNaN(valor) ? 0 : valor);
        }, 0),
      'publicado': processes
        .filter(p => p.status === 'publicado')
        .reduce((acc, p) => {
          const valor = parseFloat(p.valorEstimado.replace(/[^\d,.-]/g, '').replace(',', '.'));
          return acc + (isNaN(valor) ? 0 : valor);
        }, 0),
      'finalizado': processes
        .filter(p => p.status === 'finalizado')
        .reduce((acc, p) => {
          const valor = parseFloat(p.valorEstimado.replace(/[^\d,.-]/g, '').replace(',', '.'));
          return acc + (isNaN(valor) ? 0 : valor);
        }, 0),
    };

    const processosPorSecretaria = processes.reduce((acc, p) => {
      acc[p.secretaria] = (acc[p.secretaria] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const processosPorMes = processes.reduce((acc, p) => {
      const data = new Date(p.dataAbertura.split('/').reverse().join('-'));
      const mes = `${data.getMonth() + 1}/${data.getFullYear()}`;
      acc[mes] = (acc[mes] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      emAnalise,
      aguardando,
      publicados,
      finalizados,
      valorTotal,
      valorPorStatus,
      processosPorSecretaria,
      processosPorMes,
    };
  }, [processes]);

  const exportToCSV = () => {
    const headers = ['Nº Processo', 'Objeto', 'Secretaria', 'Status', 'Data Abertura', 'Prazo Final', 'Responsável', 'Valor Estimado'];
    const rows = processes.map(p => [
      p.numero,
      p.objeto,
      p.secretaria,
      p.status,
      p.dataAbertura,
      p.prazoFinal,
      p.responsavel,
      p.valorEstimado,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio_processos_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Relatório de Processos de Licitação</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #1e40af; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #1e40af; color: white; }
            .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin: 20px 0; }
            .stat-card { background: #f3f4f6; padding: 15px; border-radius: 8px; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <h1>Relatório de Processos de Licitação</h1>
          <p>Data de geração: ${new Date().toLocaleString('pt-BR')}</p>
          
          <div class="stats">
            <div class="stat-card">
              <strong>Total de Processos:</strong> ${stats.total}
            </div>
            <div class="stat-card">
              <strong>Em Análise:</strong> ${stats.emAnalise}
            </div>
            <div class="stat-card">
              <strong>Aguardando:</strong> ${stats.aguardando}
            </div>
            <div class="stat-card">
              <strong>Finalizados:</strong> ${stats.finalizados}
            </div>
          </div>

          <h2>Valor Total Estimado: ${formatCurrency(stats.valorTotal.toString())}</h2>

          <table>
            <thead>
              <tr>
                <th>Nº Processo</th>
                <th>Objeto</th>
                <th>Secretaria</th>
                <th>Status</th>
                <th>Data Abertura</th>
                <th>Valor Estimado</th>
              </tr>
            </thead>
            <tbody>
              ${processes.map(p => `
                <tr>
                  <td>${p.numero}</td>
                  <td>${p.objeto}</td>
                  <td>${p.secretaria}</td>
                  <td>${p.status}</td>
                  <td>${p.dataAbertura}</td>
                  <td>${p.valorEstimado}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
  };

  const topSecretarias = Object.entries(stats.processosPorSecretaria)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Relatórios e Estatísticas</h1>
          <p className="text-gray-600">Gere relatórios detalhados sobre os processos de licitação.</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={exportToCSV}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
            aria-label="Exportar para CSV"
          >
            <Download size={18} />
            <span>Exportar CSV</span>
          </button>
          <button
            onClick={exportToPDF}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
            aria-label="Exportar para PDF"
          >
            <FileText size={18} />
            <span>Exportar PDF</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total de Processos</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <FileText className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Em Análise</p>
              <p className="text-3xl font-bold text-blue-600">{stats.emAnalise}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <BarChart3 className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Aguardando Documento</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.aguardando}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <Calendar className="text-yellow-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Valor Total Estimado</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.valorTotal.toString())}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <DollarSign className="text-green-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <PieChart className="mr-2 text-blue-600" size={20} />
            Distribuição por Status
          </h2>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Em Análise</span>
                <span className="font-medium">{stats.emAnalise} ({stats.total > 0 ? Math.round((stats.emAnalise / stats.total) * 100) : 0}%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${stats.total > 0 ? (stats.emAnalise / stats.total) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Aguardando Documento</span>
                <span className="font-medium">{stats.aguardando} ({stats.total > 0 ? Math.round((stats.aguardando / stats.total) * 100) : 0}%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-yellow-600 h-2 rounded-full" 
                  style={{ width: `${stats.total > 0 ? (stats.aguardando / stats.total) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Publicado</span>
                <span className="font-medium">{stats.publicados} ({stats.total > 0 ? Math.round((stats.publicados / stats.total) * 100) : 0}%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ width: `${stats.total > 0 ? (stats.publicados / stats.total) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Finalizado</span>
                <span className="font-medium">{stats.finalizados} ({stats.total > 0 ? Math.round((stats.finalizados / stats.total) * 100) : 0}%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gray-600 h-2 rounded-full" 
                  style={{ width: `${stats.total > 0 ? (stats.finalizados / stats.total) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="mr-2 text-green-600" size={20} />
            Top 5 Secretarias
          </h2>
          <div className="space-y-3">
            {topSecretarias.length > 0 ? (
              topSecretarias.map(([secretaria, count]) => (
                <div key={secretaria}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="truncate">{secretaria}</span>
                    <span className="font-medium">{count} processo(s)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${stats.total > 0 ? (count / stats.total) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">Nenhum dado disponível</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Valores por Status</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Em Análise</p>
            <p className="text-xl font-bold text-blue-600">{formatCurrency(stats.valorPorStatus['em-analise'].toString())}</p>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Aguardando</p>
            <p className="text-xl font-bold text-yellow-600">{formatCurrency(stats.valorPorStatus['aguardando-documento'].toString())}</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Publicado</p>
            <p className="text-xl font-bold text-green-600">{formatCurrency(stats.valorPorStatus['publicado'].toString())}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Finalizado</p>
            <p className="text-xl font-bold text-gray-600">{formatCurrency(stats.valorPorStatus['finalizado'].toString())}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Relatorios;
