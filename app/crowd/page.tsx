'use client';
import React, { useEffect } from 'react';
import PageHeader from '@/components/shared/PageHeader';
import { KpiCard } from '@/components/cards/KpiCard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCrowdStore } from '@/store/crowdStore';

const sectors = [
  'North Stand', 'South Stand', 'East Stand', 'West Stand',
  'VIP', 'Food Court', 'Gate A', 'Gate B', 'Gate C', 'Gate D',
];

const statusColors: Record<string, string> = {
  normal: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400',
  warning: 'bg-amber-500/20 border-amber-500/40 text-amber-400',
  critical: 'bg-red-500/20 border-red-500/40 text-red-400',
  selected: 'bg-[#0061A4]/30 border-[#0061A4]/60 text-[#00F2FE]',
};

export default function CrowdPage() {
  const { selectedSector, sectorStatus, sectorMetrics, loading, error, selectSector, setSectorStatus, loadSummary, retryLoadSummary } = useCrowdStore();
  const metrics = selectedSector ? sectorMetrics[selectedSector] : null;

  useEffect(() => {
    void loadSummary();
  }, [loadSummary]);

  return (
    <main className="flex flex-col space-y-6">
      <PageHeader title="Crowd Flow" description="Real-time density tracking and gate control" />

      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Total Sectors" value={String(sectors.length)} iconName="Map" />
        <KpiCard label="Critical Sectors" value={String(Object.values(sectorStatus).filter((status) => status === 'critical').length)} iconName="AlertTriangle" />
        <KpiCard label="Normal Sectors" value={String(Object.values(sectorStatus).filter((status) => status === 'normal').length)} iconName="CheckCircle" />
        <KpiCard label="Selected" value={selectedSector ?? 'None'} iconName="Target" />
      </section>

      <section className="flex flex-col lg:flex-row gap-4">
        <div className="lg:w-1/2">
          <Card className="bg-[#101827] border-[#1E293B]">
            <CardHeader><CardTitle>Sector Overview</CardTitle></CardHeader>
            <CardContent>
              {loading ? <p className="text-sm text-slate-400">Loading crowd telemetry...</p> : null}
              {error ? <div className="rounded border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300"><p>{error}</p><Button variant="outline" size="sm" onClick={() => void retryLoadSummary()} className="mt-2">Retry</Button></div> : null}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {sectors.map((sector) => (
                  <button
                    key={sector}
                    onClick={() => selectSector(sector)}
                    className={`p-3 rounded-lg border text-sm font-medium text-left transition-all cursor-pointer ${statusColors[sectorStatus[sector] ?? 'normal']}`}
                  >
                    <div className="font-semibold text-xs">{sector}</div>
                    <div className="text-[10px] mt-0.5 capitalize opacity-80">{sectorStatus[sector] ?? 'normal'}</div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:w-1/2 flex flex-col gap-4">
          <Card className="bg-[#101827] border-[#1E293B] flex-1">
            <CardHeader>
              <CardTitle>{selectedSector ? `${selectedSector} — Live Metrics` : 'Select a Sector'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {metrics ? (
                <ul className="space-y-2">
                  {Object.entries(metrics).map(([key, value]) => (
                    <li key={key} className="flex justify-between border-b border-[#1E293B] pb-1">
                      <span className="text-slate-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                      <span className="text-slate-100 font-medium">{String(value)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-slate-500 text-sm">Click a sector to view live density metrics.</p>
              )}
            </CardContent>
          </Card>

          {selectedSector && (
            <div className="flex gap-2 flex-wrap">
              <Button size="sm" onClick={() => setSectorStatus(selectedSector, 'normal')} variant="outline">Set Normal</Button>
              <Button size="sm" onClick={() => setSectorStatus(selectedSector, 'warning')} variant="outline">Set Warning</Button>
              <Button size="sm" onClick={() => setSectorStatus(selectedSector, 'critical')} className="bg-red-500/20 border-red-500/40 text-red-400 hover:bg-red-500/30">Set Critical</Button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
