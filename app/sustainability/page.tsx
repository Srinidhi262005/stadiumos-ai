'use client';

import React, { useEffect, useMemo, useState } from 'react';
import PageHeader from '@/components/shared/PageHeader';
import { KpiCard } from '@/components/cards/KpiCard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSustainabilityStore } from '@/store/sustainabilityStore';
import { SustainabilityMetricType, SustainabilityMetricFormValues } from '@/types/sustainability';

const metricTypeLabels: Record<SustainabilityMetricType, string> = {
  energy: 'Energy',
  water: 'Water',
  waste: 'Waste',
  carbon: 'Carbon',
};

const initialFormState: SustainabilityMetricFormValues = {
  zoneId: 'f99304fdc1734a6b86615e6b2fd2b259',
  metricType: 'energy',
  value: '0',
  measuredAt: new Date().toISOString(),
};

const formatMetricValue = (metricType: SustainabilityMetricType, value: number) => {
  switch (metricType) {
    case 'water':
      return `${value.toLocaleString()} L`;
    case 'waste':
      return `${(value * 100).toFixed(0)}%`;
    case 'carbon':
      return `${value.toLocaleString()} kg`;
    default:
      return `${value.toLocaleString()} kWh`;
  }
};

export default function SustainabilityPage() {
  const {
    metrics,
    loading,
    error,
    selectedMetricId,
    selectedMetricType,
    loadMetrics,
    createMetric,
    updateMetric,
    deleteMetric,
    setSelectedMetricType,
    selectMetric,
    clearError,
  } = useSustainabilityStore();

  const [formValues, setFormValues] = useState<SustainabilityMetricFormValues>(initialFormState);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    void loadMetrics();
  }, [loadMetrics]);

  const filteredMetrics = useMemo(() => {
    if (selectedMetricType === 'all') {
      return metrics;
    }
    return metrics.filter((metric) => metric.metricType === selectedMetricType);
  }, [metrics, selectedMetricType]);

  const summary = useMemo(() => {
    const totals = metrics.reduce(
      (acc, metric) => {
        if (metric.metricType === 'energy') acc.energy += metric.value;
        if (metric.metricType === 'water') acc.water += metric.value;
        if (metric.metricType === 'waste') acc.waste += metric.value;
        if (metric.metricType === 'carbon') acc.carbon += metric.value;
        return acc;
      },
      { energy: 0, water: 0, waste: 0, carbon: 0 }
    );

    return {
      energy: totals.energy,
      water: totals.water,
      waste: totals.waste / Math.max(1, metrics.filter((metric) => metric.metricType === 'waste').length),
      carbon: totals.carbon,
    };
  }, [metrics]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    clearError();
    const payload = { ...formValues, value: formValues.value || '0' };

    if (editingId) {
      await updateMetric(editingId, payload);
      setEditingId(null);
    } else {
      await createMetric(payload);
    }

    setFormValues(initialFormState);
  };

  const handleEdit = (metric: { id: string; zoneId: string; metricType: SustainabilityMetricType; value: number; measuredAt: string }) => {
    setEditingId(metric.id);
    setFormValues({
      zoneId: metric.zoneId,
      metricType: metric.metricType,
      value: String(metric.value),
      measuredAt: metric.measuredAt,
    });
    selectMetric(metric.id);
  };

  const handleDelete = async (metricId: string) => {
    await deleteMetric(metricId);
  };

  return (
    <main className="flex flex-col space-y-6">
      <PageHeader title="Sustainability" description="Live environmental metrics for the current event" />

      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Energy" value={`${summary.energy.toLocaleString()} kWh`} iconName="Zap" status="primary" />
        <KpiCard label="Water" value={`${summary.water.toLocaleString()} L`} iconName="Droplets" status="info" />
        <KpiCard label="Waste" value={`${(summary.waste * 100).toFixed(0)}%`} iconName="Trash" status="warning" />
        <KpiCard label="Carbon" value={`${summary.carbon.toLocaleString()} kg`} iconName="Leaf" status="success" />
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-4">
        <Card className="bg-[#101827] border-[#1E293B]">
          <CardHeader>
            <CardTitle>Recorded sustainability metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {(['all', 'energy', 'water', 'waste', 'carbon'] as const).map((option) => (
                <Button
                  key={option}
                  variant={selectedMetricType === option ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedMetricType(option)}
                >
                  {option === 'all' ? 'All' : metricTypeLabels[option]}
                </Button>
              ))}
            </div>

            {loading && <p className="text-sm text-slate-400">Loading sustainability metrics…</p>}
            {error && <p className="rounded-lg border border-red-900/50 bg-red-950/30 p-3 text-sm text-red-200">{error}</p>}
            {!loading && !error && filteredMetrics.length === 0 && (
              <p className="rounded-lg border border-slate-800 bg-[#0B1220] p-3 text-sm text-slate-400">No sustainability metrics match the active filter.</p>
            )}
            <div className="space-y-2">
              {filteredMetrics.map((metric) => (
                <div key={metric.id} className="rounded-lg border border-slate-800 bg-[#0B1220] p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-100">{metricTypeLabels[metric.metricType]}</p>
                      <p className="text-sm text-slate-400">Zone {metric.zoneId}</p>
                      <p className="text-xs text-slate-500">Measured {new Date(metric.measuredAt).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-slate-100">{formatMetricValue(metric.metricType, metric.value)}</p>
                      <div className="mt-2 flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(metric)}>Edit</Button>
                        <Button variant="outline" size="sm" onClick={() => void handleDelete(metric.id)}>Delete</Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#101827] border-[#1E293B]">
          <CardHeader>
            <CardTitle>{editingId ? 'Update metric' : 'Create metric'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-3" onSubmit={handleSubmit}>
              <label className="block text-sm text-slate-300">
                Zone ID
                <Input value={formValues.zoneId} onChange={(event) => setFormValues((current) => ({ ...current, zoneId: event.target.value }))} placeholder="Use a seeded zone UUID such as f99304fdc1734a6b86615e6b2fd2b259" />
              </label>
              <label className="block text-sm text-slate-300">
                Metric Type
                <select
                  className="mt-1 w-full rounded-md border border-slate-700 bg-[#0B1220] px-3 py-2 text-sm text-slate-100"
                  value={formValues.metricType}
                  onChange={(event) => setFormValues((current) => ({ ...current, metricType: event.target.value as SustainabilityMetricType }))}
                >
                  {Object.entries(metricTypeLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </label>
              <label className="block text-sm text-slate-300">
                Value
                <Input type="number" step="0.01" value={formValues.value} onChange={(event) => setFormValues((current) => ({ ...current, value: event.target.value }))} />
              </label>
              <label className="block text-sm text-slate-300">
                Measured At
                <Input type="datetime-local" value={formValues.measuredAt.slice(0, 16)} onChange={(event) => setFormValues((current) => ({ ...current, measuredAt: new Date(event.target.value).toISOString() }))} />
              </label>
              <div className="flex gap-2">
                <Button type="submit">{editingId ? 'Save changes' : 'Add metric'}</Button>
                {editingId && (
                  <Button variant="outline" type="button" onClick={() => { setEditingId(null); setFormValues(initialFormState); }}>
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
