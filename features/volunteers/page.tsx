'use client';

import React, { useEffect, useMemo, useState } from 'react';
import PageHeader from '@/components/shared/PageHeader';
import { KpiCard } from '@/components/cards/KpiCard';
import { Timeline } from '@/components/shared/Timeline';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useVolunteerStore } from '@/store/volunteerStore';
import { VolunteerCard } from '@/components/volunteers/VolunteerCard';
import { VolunteerStatusBadge } from '@/components/volunteers/VolunteerStatusBadge';
import { LanguageBadge, SkillBadge } from '@/components/volunteers/LanguageSkillBadges';
import type { VolunteerFormValues } from '@/services/api/volunteer';

const createDraft = (): VolunteerFormValues => ({
  name: '',
  email: '',
  phone: '',
  role: 'Volunteer',
  location: 'North Stand',
  status: 'available',
  isActive: true,
});

export default function VolunteerCommandCenterPage() {
  const {
    volunteers,
    selectedVolunteerId,
    missions,
    filters,
    loading,
    error,
    selectVolunteer,
    setSearch,
    toggleStatusFilter,
    toggleLanguageFilter,
    toggleSkillFilter,
    toggleCertificationFilter,
    loadVolunteers,
    retryLoadVolunteers,
    createVolunteer,
    updateVolunteer,
    deleteVolunteer,
    assignVolunteer,
    toggleVolunteerActive,
    assignMission,
    completeMission,
  } = useVolunteerStore();

  const [draft, setDraft] = useState<VolunteerFormValues>(createDraft);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [formError, setFormError] = useState<string | null>(null);

  const selectedVolunteer = useMemo(() => volunteers.find((volunteer) => volunteer.id === selectedVolunteerId) || null, [volunteers, selectedVolunteerId]);
  const selectedMission = selectedVolunteerId
    ? missions.find((mission) => mission.assignedVolunteerId === selectedVolunteerId) || null
    : null;

  useEffect(() => {
    void loadVolunteers();
  }, [loadVolunteers]);

  useEffect(() => {
    if (selectedVolunteer) {
      setDraft({
        name: selectedVolunteer.name,
        email: selectedVolunteer.email ?? '',
        phone: selectedVolunteer.phone ?? '',
        role: selectedVolunteer.role,
        location: selectedVolunteer.location,
        status: selectedVolunteer.status,
        isActive: selectedVolunteer.isActive ?? true,
      });
      setFormMode('edit');
      setFormError(null);
    } else {
      setDraft(createDraft());
      setFormMode('create');
      setFormError(null);
    }
  }, [selectedVolunteer]);

  const totalVolunteers = volunteers.length;
  const availableVolunteers = volunteers.filter((volunteer) => volunteer.status === 'available').length;
  const assignedVolunteers = volunteers.filter((volunteer) => volunteer.status === 'assigned').length;
  const onBreakVolunteers = volunteers.filter((volunteer) => volunteer.status === 'on-break').length;
  const averageResponseTime = '2.3 min';
  const languagesSupported = Array.from(new Set(volunteers.flatMap((volunteer) => volunteer.languages))).join(', ');

  const filteredVolunteers = volunteers.filter((volunteer) => {
    const matchesSearch = filters.search
      ? volunteer.name.toLowerCase().includes(filters.search.toLowerCase()) || volunteer.role.toLowerCase().includes(filters.search.toLowerCase())
      : true;
    const matchesStatus = filters.status.length ? filters.status.includes(volunteer.status) : true;
    const matchesLanguage = filters.languages.length ? filters.languages.some((language) => volunteer.languages.includes(language)) : true;
    const matchesSkill = filters.skills.length ? filters.skills.some((skill) => volunteer.skills.includes(skill)) : true;
    const matchesCert = filters.certifications.length ? filters.certifications.every((cert) => volunteer.certifications?.includes(cert)) : true;
    return matchesSearch && matchesStatus && matchesLanguage && matchesSkill && matchesCert;
  });

  const validateDraft = (value: VolunteerFormValues) => {
    if (!value.name.trim()) return 'Volunteer name is required.';
    if (!value.email.trim()) return 'Email is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email.trim())) return 'Enter a valid email address.';
    return null;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const validationError = validateDraft(draft);
    if (validationError) {
      setFormError(validationError);
      return;
    }
    setFormError(null);
    if (formMode === 'edit' && selectedVolunteer) {
      await updateVolunteer(selectedVolunteer.id, draft);
    } else {
      await createVolunteer(draft);
    }
  };

  const handleNewVolunteer = () => {
    setDraft(createDraft());
    setFormMode('create');
    setFormError(null);
    selectVolunteer('');
  };

  const handleAssign = async () => {
    if (selectedVolunteer) {
      await assignVolunteer(selectedVolunteer.id);
    }
  };

  const handleToggleActive = async () => {
    if (selectedVolunteer) {
      await toggleVolunteerActive(selectedVolunteer.id);
    }
  };

  const handleComplete = () => {
    if (selectedMission) completeMission(selectedMission.id);
  };

  const handleAssignMission = () => {
    if (selectedVolunteer && missions.length) {
      const mission = missions.find((item) => !item.assignedVolunteerId);
      if (mission) assignMission(selectedVolunteer.id, mission.id);
    }
  };

  const handleDelete = async () => {
    if (selectedVolunteer) {
      await deleteVolunteer(selectedVolunteer.id);
    }
  };

  return (
    <main className="flex min-h-screen flex-col bg-[#0B1220] text-white p-6 space-y-6">
      <PageHeader title="Volunteer Command Center" description="Manage, assign and monitor stadium volunteers in real time" />

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KpiCard label="Total Volunteers" value={String(totalVolunteers)} iconName="Users" />
        <KpiCard label="Available" value={String(availableVolunteers)} iconName="CheckCircle" />
        <KpiCard label="Assigned" value={String(assignedVolunteers)} iconName="UserCheck" />
        <KpiCard label="On Break" value={String(onBreakVolunteers)} iconName="Coffee" />
        <KpiCard label="Avg Response Time" value={averageResponseTime} iconName="Clock" />
        <KpiCard label="Languages Supported" value={languagesSupported} iconName="Globe" />
      </section>

      <section className="flex flex-col lg:flex-row gap-4 flex-1">
        <div className="lg:w-1/3 flex flex-col space-y-4">
          <div className="flex items-center justify-between gap-2">
            <Input
              placeholder="Search volunteers…"
              value={filters.search}
              onChange={(event) => setSearch(event.target.value)}
              className="bg-[#101827] text-white"
            />
            <Button onClick={handleNewVolunteer} variant="outline" size="sm">New</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {(['available', 'assigned', 'on-break', 'unavailable'] as const).map((status) => (
              <Button key={status} variant={filters.status.includes(status) ? 'default' : 'outline'} size="sm" onClick={() => toggleStatusFilter(status)}>
                {status.replace('-', ' ')}
              </Button>
            ))}
            {Array.from(new Set(volunteers.flatMap((volunteer) => volunteer.languages))).map((language) => (
              <Button key={language} variant={filters.languages.includes(language) ? 'default' : 'outline'} size="sm" onClick={() => toggleLanguageFilter(language)}>
                {language}
              </Button>
            ))}
            {Array.from(new Set(volunteers.flatMap((volunteer) => volunteer.skills))).map((skill) => (
              <Button key={skill} variant={filters.skills.includes(skill) ? 'default' : 'outline'} size="sm" onClick={() => toggleSkillFilter(skill)}>
                {skill}
              </Button>
            ))}
            {Array.from(new Set(volunteers.flatMap((volunteer) => volunteer.certifications ?? []))).map((certification) => (
              <Button key={certification} variant={filters.certifications.includes(certification) ? 'default' : 'outline'} size="sm" onClick={() => toggleCertificationFilter(certification)}>
                {certification}
              </Button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto space-y-2">
            {loading && volunteers.length === 0 ? (
              <div className="rounded-lg border border-gray-700 bg-[#101827] p-4 text-sm text-gray-400">Loading volunteers…</div>
            ) : null}
            {error && volunteers.length === 0 ? (
              <div className="rounded-lg border border-red-700 bg-red-950/40 p-4 text-sm text-red-200">
                <p>{error}</p>
                <Button className="mt-3" variant="outline" size="sm" onClick={() => void retryLoadVolunteers()}>Retry</Button>
              </div>
            ) : null}
            {!loading && !error && filteredVolunteers.length === 0 ? (
              <div className="rounded-lg border border-gray-700 bg-[#101827] p-4 text-sm text-gray-400">No volunteers match the current filters.</div>
            ) : null}
            {filteredVolunteers.map((volunteer) => (
              <VolunteerCard key={volunteer.id} volunteer={volunteer} selected={volunteer.id === selectedVolunteerId} onSelect={selectVolunteer} />
            ))}
          </div>
        </div>

        <div className="lg:w-1/3 flex flex-col space-y-4">
          <Card className="bg-[#101827] border-none flex-1">
            <CardHeader>
              <CardTitle>{selectedVolunteer ? selectedVolunteer.name : 'Volunteer profile'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {selectedVolunteer ? (
                <>
                  <p><strong>Role:</strong> {selectedVolunteer.role}</p>
                  <p><strong>Location:</strong> {selectedVolunteer.location}</p>
                  <p><strong>Status:</strong> <VolunteerStatusBadge status={selectedVolunteer.status} /></p>
                  <p><strong>Contact:</strong> {selectedVolunteer.email || 'No email on file'}</p>
                  <p><strong>Phone:</strong> {selectedVolunteer.phone || 'No phone on file'}</p>
                  <p><strong>Languages:</strong> {selectedVolunteer.languages.length ? selectedVolunteer.languages.join(', ') : 'None listed'}</p>
                  <p><strong>Skills:</strong> {selectedVolunteer.skills.length ? selectedVolunteer.skills.join(', ') : 'None listed'}</p>
                </>
              ) : (
                <p className="text-gray-400">Select a volunteer to view details and manage availability.</p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-[#101827] border-none flex-1">
            <CardHeader>
              <CardTitle>{formMode === 'edit' ? 'Edit volunteer' : 'Create volunteer'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-3" onSubmit={handleSubmit}>
                {formError ? <p className="text-sm text-red-300">{formError}</p> : null}
                <Input placeholder="Name" value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} />
                <Input placeholder="Email" value={draft.email} onChange={(event) => setDraft((current) => ({ ...current, email: event.target.value }))} />
                <Input placeholder="Phone" value={draft.phone} onChange={(event) => setDraft((current) => ({ ...current, phone: event.target.value }))} />
                <Input placeholder="Role" value={draft.role} onChange={(event) => setDraft((current) => ({ ...current, role: event.target.value }))} />
                <Input placeholder="Location" value={draft.location} onChange={(event) => setDraft((current) => ({ ...current, location: event.target.value }))} />
                <div className="flex gap-2">
                  <select className="w-full rounded-md border border-gray-700 bg-[#0B1220] px-3 py-2 text-sm text-white" value={draft.status} onChange={(event) => setDraft((current) => ({ ...current, status: event.target.value as VolunteerFormValues['status'] }))}>
                    <option value="available">Available</option>
                    <option value="assigned">Assigned</option>
                    <option value="on-break">On break</option>
                    <option value="unavailable">Unavailable</option>
                  </select>
                  <label className="flex items-center gap-2 rounded-md border border-gray-700 bg-[#0B1220] px-3 py-2 text-sm text-gray-300">
                    <input type="checkbox" checked={draft.isActive} onChange={(event) => setDraft((current) => ({ ...current, isActive: event.target.checked }))} />
                    Active
                  </label>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button type="submit">{formMode === 'edit' ? 'Save changes' : 'Create volunteer'}</Button>
                  {selectedVolunteer ? <Button type="button" variant="outline" onClick={() => void handleDelete()}>Delete</Button> : null}
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="flex flex-wrap gap-2 justify-center">
            <Button onClick={() => void handleAssign()} disabled={!selectedVolunteer}>Assign volunteer</Button>
            <Button onClick={() => void handleToggleActive()} disabled={!selectedVolunteer}>Toggle active</Button>
            <Button onClick={handleAssignMission} disabled={!selectedVolunteer}>Assign mission</Button>
            <Button onClick={handleComplete} disabled={!selectedMission}>Complete mission</Button>
            <Button onClick={() => void retryLoadVolunteers()} variant="outline">Retry</Button>
          </div>
        </div>

        <div className="lg:w-1/3 flex flex-col space-y-4">
          <Card className="bg-[#101827] border-none flex-1">
            <CardHeader>
              <CardTitle>Mission Tracker</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {selectedMission ? (
                <>
                  <p><strong>Assigned Mission:</strong> {selectedMission.id}</p>
                  <p><strong>Progress:</strong> {selectedMission.progress}%</p>
                  <p><strong>ETA:</strong> {selectedMission.eta}</p>
                  <p><strong>Checklist:</strong></p>
                  <ul className="list-disc list-inside ml-4">
                    {selectedMission.checklist.map((item, index) => (
                      <li key={`${item}-${index}`}>{item}</li>
                    ))}
                  </ul>
                </>
              ) : (
                <p className="text-gray-400">No mission assigned.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mt-6">
        <Card className="bg-[#101827] border-none">
          <CardHeader>
            <CardTitle>Volunteer Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <Timeline events={[
              { id: 'vt-1', title: 'Roster synced', description: 'Latest volunteer data loaded from the API', timestamp: 'Now', category: 'volunteer', severity: 'info' },
              { id: 'vt-2', title: 'Assignment updated', description: 'Volunteer status changed for the current shift', timestamp: 'Now', category: 'volunteer', severity: 'primary' },
            ]} />
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
