import React from 'react';
import PageHeader from '@/components/shared/PageHeader';
import { KpiCard } from '@/components/cards/KpiCard';
import { Timeline } from '@/components/shared/Timeline';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useVolunteerStore } from '@/features/volunteers/store/volunteerStore';
import { VolunteerCard } from '@/components/volunteers/VolunteerCard';
import { VolunteerStatusBadge } from '@/components/volunteers/VolunteerStatusBadge';
import { LanguageBadge, SkillBadge } from '@/components/volunteers/LanguageSkillBadges';
import { motion } from 'framer-motion';

export default function VolunteerCommandCenterPage() {
  const {
    volunteers,
    selectedVolunteerId,
    assignments,
    missions,
    filters,
    selectVolunteer,
    setSearch,
    toggleStatusFilter,
    toggleLanguageFilter,
    toggleSkillFilter,
    toggleCertificationFilter,
    assignMission,
    updateMissionProgress,
    completeMission,
  } = useVolunteerStore();

  const selectedVolunteer = volunteers.find(v => v.id === selectedVolunteerId) || null;
  const selectedMission = selectedVolunteerId
    ? missions.find(m => m.assignedVolunteerId === selectedVolunteerId) || null
    : null;

  // KPI calculations
  const totalVolunteers = volunteers.length;
  const availableVolunteers = volunteers.filter(v => v.status === 'available').length;
  const assignedVolunteers = volunteers.filter(v => v.status === 'assigned').length;
  const onBreakVolunteers = volunteers.filter(v => v.status === 'on-break').length;
  const averageResponseTime = '2.3 min'; // static placeholder
  const languagesSupported = Array.from(
    new Set(volunteers.flatMap(v => v.languages))
  ).join(', ');

  // Filtering logic
  const filteredVolunteers = volunteers.filter(v => {
    const matchesSearch = filters.search
      ? v.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        v.role.toLowerCase().includes(filters.search.toLowerCase())
      : true;
    const matchesStatus = filters.status.length ? filters.status.includes(v.status) : true;
    const matchesLanguage = filters.languages.length
      ? filters.languages.some(lang => v.languages.includes(lang))
      : true;
    const matchesSkill = filters.skills.length
      ? filters.skills.some(skill => v.skills.includes(skill))
      : true;
    const matchesCert = filters.certifications.length
      ? filters.certifications.every(cert => v.certifications?.includes(cert))
      : true;
    return matchesSearch && matchesStatus && matchesLanguage && matchesSkill && matchesCert;
  });

  // Operator control handlers (mock, just invoke store actions)
  const handleAssign = () => {
    if (selectedVolunteer && missions.length) {
      // assign first unassigned mission for demo
      const mission = missions.find(m => !m.assignedVolunteerId);
      if (mission) assignMission(selectedVolunteer.id, mission.id);
    }
  };
  const handleReassign = () => {
    // For demo, just log
    console.log('Reassign clicked');
  };
  const handleNotify = () => {
    console.log('Notify volunteer');
  };
  const handleBackup = () => {
    console.log('Request backup');
  };
  const handleComplete = () => {
    if (selectedMission) completeMission(selectedMission.id);
  };
  const handleCancel = () => {
    console.log('Cancel assignment');
  };

  return (
    <main className="flex min-h-screen flex-col bg-[#0B1220] text-white p-6 space-y-6">
      {/* Header */}
      <PageHeader
        title="Volunteer Command Center"
        description="Manage, assign and monitor stadium volunteers in real time"
      />

      {/* Top KPI Row */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KpiCard title="Total Volunteers" value={String(totalVolunteers)} icon="Users" />
        <KpiCard title="Available" value={String(availableVolunteers)} icon="CheckCircle" />
        <KpiCard title="Assigned" value={String(assignedVolunteers)} icon="UserCheck" />
        <KpiCard title="On Break" value={String(onBreakVolunteers)} icon="Coffee" />
        <KpiCard title="Avg Response Time" value={averageResponseTime} icon="Clock" />
        <KpiCard title="Languages Supported" value={languagesSupported} icon="Globe" />
      </section>

      {/* Main layout */}
      <section className="flex flex-col lg:flex-row gap-4 flex-1">
        {/* LEFT PANEL: Directory */}
        <div className="lg:w-1/3 flex flex-col space-y-4">
          <Input
            placeholder="Search volunteers…"
            value={filters.search}
            onChange={e => setSearch(e.target.value)}
            className="bg-[#101827] text-white"
          />
          <div className="flex flex-wrap gap-2">
            {/* Status filters */}
            {['available', 'assigned', 'on-break', 'unavailable'] as const.map(st => (
              <Button
                key={st}
                variant={filters.status.includes(st) ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleStatusFilter(st)}
              >
                {st.replace('-', ' ')}
              </Button>
            ))}
            {/* Languages */}
            {Array.from(new Set(volunteers.flatMap(v => v.languages))).map(lang => (
              <Button
                key={lang}
                variant={filters.languages.includes(lang) ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleLanguageFilter(lang)}
              >
                {lang}
              </Button>
            ))}
            {/* Skills */}
            {Array.from(new Set(volunteers.flatMap(v => v.skills))).map(skill => (
              <Button
                key={skill}
                variant={filters.skills.includes(skill) ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleSkillFilter(skill)}
              >
                {skill}
              </Button>
            ))}
            {/* Certifications */}
            {Array.from(new Set(volunteers.flatMap(v => v.certifications ?? []))).map(cert => (
              <Button
                key={cert}
                variant={filters.certifications.includes(cert) ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleCertificationFilter(cert)}
              >
                {cert}
              </Button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto space-y-2">
            {filteredVolunteers.map(v => (
              <VolunteerCard
                key={v.id}
                volunteer={v}
                selected={v.id === selectedVolunteerId}
                onSelect={selectVolunteer}
              />
            ))}
          </div>
        </div>

        {/* CENTER PANEL */}
        <div className="lg:w-1/3 flex flex-col space-y-4">
          {/* Volunteer Profile */}
          <Card className="bg-[#101827] border-none flex-1">
            <CardHeader>
              <CardTitle>{selectedVolunteer ? selectedVolunteer.name : 'Select a volunteer'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {selectedVolunteer ? (
                <>
                  <p><strong>Role:</strong> {selectedVolunteer.role}</p>
                  <p><strong>Location:</strong> {selectedVolunteer.location}</p>
                  <p><strong>Status:</strong> <VolunteerStatusBadge status={selectedVolunteer.status} /></p>
                  <p><strong>Languages:</strong> {selectedVolunteer.languages.map(l => <LanguageBadge key={l} language={l} />)}</p>
                  <p><strong>Skills:</strong> {selectedVolunteer.skills.map(s => <SkillBadge key={s} skill={s} />)}</p>
                  {selectedVolunteer.certifications && selectedVolunteer.certifications.length > 0 && (
                    <p><strong>Certifications:</strong> {selectedVolunteer.certifications.join(', ')}</p>
                  )}
                </>
              ) : (
                <p className="text-gray-400">Click a volunteer on the left to view details.</p>
              )}
            </CardContent>
          </Card>

          {/* AI Assignment Recommendation */}
          <Card className="bg-[#101827] border-none flex-1">
            <CardHeader>
              <CardTitle>AI Assignment Recommendation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {selectedVolunteer ? (
                <>
                  <p><strong>Recommended Mission:</strong> {selectedMission ? selectedMission.title : 'Assist Gate A Crowd'}</p>
                  <p><strong>Reason:</strong> Proximity and skill match.</p>
                  <p><strong>Distance:</strong> 150 m</p>
                  <p><strong>Skill Match:</strong> 92%</p>
                  <p><strong>Confidence Score:</strong> 94%</p>
                  <p><strong>Est. Arrival:</strong> 3 min</p>
                </>
              ) : (
                <p className="text-gray-400">Select a volunteer to see AI recommendation.</p>
              )}
            </CardContent>
          </Card>

          {/* Operator Controls */}
          <div className="flex flex-wrap gap-2 justify-center">
            <Button onClick={handleAssign} disabled={!selectedVolunteer}>Assign Mission</Button>
            <Button onClick={handleReassign} disabled={!selectedVolunteer}>Reassign</Button>
            <Button onClick={handleNotify} disabled={!selectedVolunteer}>Notify Volunteer</Button>
            <Button onClick={handleBackup} disabled={!selectedVolunteer}>Request Backup</Button>
            <Button onClick={handleComplete} disabled={!selectedMission}>Complete Mission</Button>
            <Button onClick={handleCancel} disabled={!selectedVolunteer}>Cancel Assignment</Button>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="lg:w-1/3 flex flex-col space-y-4">
          <Card className="bg-[#101827] border-none flex-1">
            <CardHeader>
              <CardTitle>Mission Tracker</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {selectedMission ? (
                <>
                  <p><strong>Assigned Incident:</strong> {selectedMission.incidentId}</p>
                  <p><strong>Progress:</strong> {selectedMission.progress}%</p>
                  <p><strong>ETA:</strong> {selectedMission.eta}</p>
                  <p><strong>Checklist:</strong></p>
                  <ul className="list-disc list-inside ml-4">
                    {selectedMission.checklist.map((c, i) => (
                      <li key={i}>{c}</li>
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

      {/* Bottom Timeline */}
      <section className="mt-6">
        <Card className="bg-[#101827] border-none">
          <CardHeader>
            <CardTitle>Volunteer Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <Timeline
              events={[
                { time: '08:00', description: 'Assignment Accepted' },
                { time: '08:10', description: 'Travelling' },
                { time: '08:25', description: 'Arrived' },
                { time: '08:30', description: 'Task Started' },
                { time: '09:00', description: 'Task Completed' },
                { time: '09:10', description: 'Available Again' },
              ]}
            />
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
