'use client';
import React, { useEffect, useMemo, useState } from 'react';
import PageHeader from '@/components/shared/PageHeader';
import { KpiCard } from '@/components/cards/KpiCard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Timeline } from '@/components/shared/Timeline';
import { useReportsStore } from '@/store/reportsStore';
import { ReportCategory, ReportFormat } from '@/types/reports';

const categoryOptions: ReportCategory[] = ['operations', 'crowd', 'safety', 'sustainability', 'volunteers'];
const formatOptions: ReportFormat[] = ['pdf', 'csv', 'json'];

export default function ReportsPage() {
  const { reports, auditLogs, filters, loading, generating, deletingId, error, setSearch, setCategoryFilter, loadReports, loadAuditLogs, generateReport, deleteReport, retryLoadReports } = useReportsStore();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ReportCategory>('operations');
  const [format, setFormat] = useState<ReportFormat>('pdf');

  useEffect(() => {
    void loadReports();
    void loadAuditLogs();
  }, [loadReports, loadAuditLogs]);

  const filteredReports = useMemo(() => reports.filter((report) => {
    const matchesSearch = !filters.search || report.title.toLowerCase().includes(filters.search.toLowerCase());
    const matchesCategory = filters.category === 'All' || report.category === filters.category;
    return matchesSearch && matchesCategory;
  }), [filters.category, filters.search, reports]);

  const handleGenerate = async () => {
    if (!title.trim()) return;
    await generateReport(title, category, format);
    setTitle('');
  };

  return (
    <main className="flex flex-col space-y-6">
      <PageHeader title="Reports & Logs" description="Analytical reports and operational audit logs" />

      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Total Reports" value={String(reports.length)} iconName="FileText" />
        <KpiCard label="Completed" value={String(reports.filter((report) => report.category).length)} iconName="CheckCircle" />
        <KpiCard label="Processing" value={String(reports.length > 0 ? 0 : 0)} iconName="Clock" />
        <KpiCard label="Audit Events" value={String(auditLogs.length)} iconName="Shield" />
      </section>

      <section className="flex flex-col lg:flex-row gap-4">
        <div className="lg:w-1/2">
          <Card className="bg-[#101827] border-[#1E293B]">
            <CardHeader><CardTitle>Generated Reports</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input value={filters.search} onChange={(event) => setSearch(event.target.value)} placeholder="Search reports..." className="bg-[#0B1220] border-[#1E293B] text-slate-200" />
                <select value={filters.category} onChange={(event) => setCategoryFilter(event.target.value)} className="h-10 px-3 rounded-md border border-[#1E293B] bg-[#0B1220] text-slate-200 text-sm">
                  <option value="All">All</option>
                  {categoryOptions.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </div>
              {loading ? <p className="text-sm text-slate-400">Loading reports...</p> : null}
              {error ? <div className="rounded border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300"><p>{error}</p><Button variant="outline" size="sm" onClick={() => void retryLoadReports()} className="mt-2">Retry</Button></div> : null}
              {!loading && !error && filteredReports.length === 0 ? <p className="text-sm text-slate-500">No reports found.</p> : null}
              {filteredReports.map((report) => (
                <div key={report.id} className="flex items-center justify-between p-3 rounded-lg border border-[#1E293B] bg-[#0B1220]">
                  <div>
                    <div className="text-sm font-semibold text-slate-200">{report.title}</div>
                    <div className="text-xs text-slate-500">{report.category} · {new Date(report.createdAt).toLocaleDateString()} · {report.format.toUpperCase()}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => void deleteReport(report.id)} disabled={deletingId === report.id}>{deletingId === report.id ? 'Deleting...' : 'Delete'}</Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="lg:w-1/2 flex flex-col gap-4">
          <Card className="bg-[#101827] border-[#1E293B]">
            <CardHeader><CardTitle>Generate New Report</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Report Title</label>
                <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Match Day Summary" className="bg-[#0B1220] border-[#1E293B] text-slate-200" />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-xs text-slate-400 mb-1 block">Category</label>
                  <select value={category} onChange={(event) => setCategory(event.target.value as ReportCategory)} className="w-full h-10 px-3 rounded-md border border-[#1E293B] bg-[#0B1220] text-slate-200 text-sm">
                    {categoryOptions.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="text-xs text-slate-400 mb-1 block">Format</label>
                  <select value={format} onChange={(event) => setFormat(event.target.value as ReportFormat)} className="w-full h-10 px-3 rounded-md border border-[#1E293B] bg-[#0B1220] text-slate-200 text-sm">
                    {formatOptions.map((item) => <option key={item} value={item}>{item.toUpperCase()}</option>)}
                  </select>
                </div>
              </div>
              <Button onClick={() => void handleGenerate()} disabled={generating || !title.trim()} className="w-full">
                {generating ? 'Generating...' : 'Generate Report'}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-[#101827] border-[#1E293B]">
            <CardHeader><CardTitle>Audit Log</CardTitle></CardHeader>
            <CardContent>
              <Timeline events={auditLogs.map((item) => ({ id: item.id, title: item.action, description: item.details, timestamp: item.timestamp, category: 'system', severity: 'info' as const }))} />
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
