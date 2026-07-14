import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Volunteer, Assignment, Mission } from '@/types/volunteers/volunteer';

export interface VolunteerState {
  volunteers: Volunteer[];
  selectedVolunteerId: string | null;
  assignments: Assignment[]; // history per volunteer
  missions: Mission[];
  filters: {
    search: string;
    status: string[]; // available, assigned, on-break, unavailable
    languages: string[];
    skills: string[];
    certifications: string[];
  };
  // actions
  selectVolunteer: (id: string) => void;
  setSearch: (term: string) => void;
  toggleStatusFilter: (status: string) => void;
  toggleLanguageFilter: (lang: string) => void;
  toggleSkillFilter: (skill: string) => void;
  toggleCertificationFilter: (cert: string) => void;
  assignMission: (volunteerId: string, missionId: string) => void;
  updateMissionProgress: (missionId: string, progress: number) => void;
  completeMission: (missionId: string) => void;
}

// Mock static data
const mockVolunteers: Volunteer[] = [
  {
    id: 'V001',
    name: 'Alice Nguyen',
    role: 'Gate Attendant',
    languages: ['English', 'Vietnamese'],
    skills: ['Crowd Control', 'First Aid'],
    location: 'Gate A',
    status: 'available',
    certifications: ['First Aid'],
  },
  {
    id: 'V002',
    name: 'Luis García',
    role: 'Food Service',
    languages: ['Spanish', 'English'],
    skills: ['Customer Service'],
    location: 'Food Court',
    status: 'on-break',
    certifications: [],
  },
  {
    id: 'V003',
    name: 'Sofia Petrova',
    role: 'Medical Assistant',
    languages: ['Russian', 'English'],
    skills: ['Medical Support'],
    location: 'Medical Center',
    status: 'assigned',
    certifications: ['CPR'],
  },
  {
    id: 'V004',
    name: 'John Doe',
    role: 'Security',
    languages: ['English'],
    skills: ['Security', 'Surveillance'],
    location: 'North Stand',
    status: 'available',
    certifications: ['Security Clearance'],
  },
];

const mockMissions: Mission[] = [
  {
    id: 'M001',
    title: 'Assist Gate A Crowd',
    description: 'Help manage queue at Gate A during peak entry.',
    progress: 0,
    checklist: ['Assess queue', 'Deploy volunteers', 'Monitor flow', 'Report status'],
    eta: '15 min',
    location: 'Gate A',
    assignedVolunteerId: undefined,
  },
  {
    id: 'M002',
    title: 'Medical Support East Stand',
    description: 'Provide first aid support in East Stand.',
    progress: 0,
    checklist: ['Set up station', 'Assist injured', 'Report to command'],
    eta: '10 min',
    location: 'East Stand',
    assignedVolunteerId: undefined,
  },
];

export const useVolunteerStore = create<VolunteerState>()(
  devtools((set) => ({
    volunteers: mockVolunteers,
    selectedVolunteerId: null,
    assignments: [],
    missions: mockMissions,
    filters: {
      search: '',
      status: [],
      languages: [],
      skills: [],
      certifications: [],
    },
    selectVolunteer: (id) => set({ selectedVolunteerId: id }),
    setSearch: (term) => set(state => ({ filters: { ...state.filters, search: term } })),
    toggleStatusFilter: (status) =>
      set(state => {
        const arr = state.filters.status.includes(status)
          ? state.filters.status.filter(s => s !== status)
          : [...state.filters.status, status];
        return { filters: { ...state.filters, status: arr } };
      }),
    toggleLanguageFilter: (lang) =>
      set(state => {
        const arr = state.filters.languages.includes(lang)
          ? state.filters.languages.filter(l => l !== lang)
          : [...state.filters.languages, lang];
        return { filters: { ...state.filters, languages: arr } };
      }),
    toggleSkillFilter: (skill) =>
      set(state => {
        const arr = state.filters.skills.includes(skill)
          ? state.filters.skills.filter(s => s !== skill)
          : [...state.filters.skills, skill];
        return { filters: { ...state.filters, skills: arr } };
      }),
    toggleCertificationFilter: (cert) =>
      set(state => {
        const arr = state.filters.certifications.includes(cert)
          ? state.filters.certifications.filter(c => c !== cert)
          : [...state.filters.certifications, cert];
        return { filters: { ...state.filters, certifications: arr } };
      }),
    assignMission: (volunteerId, missionId) =>
      set(state => {
        const missions = state.missions.map(m =>
          m.id === missionId ? { ...m, assignedVolunteerId: volunteerId, progress: 0 } : m
        );
        const volunteers = state.volunteers.map(v =>
          v.id === volunteerId ? { ...v, status: 'assigned' as Volunteer['status'] } : v
        );
        const assignment: Assignment = {
          incidentId: missionId,
          mission: missions.find(m => m.id === missionId)?.title ?? '',
          status: 'accepted',
          eta: missions.find(m => m.id === missionId)?.eta ?? '',
        };
        return { missions, volunteers, assignments: [...state.assignments, assignment] };
      }),
    updateMissionProgress: (missionId, progress) =>
      set(state => ({
        missions: state.missions.map(m =>
          m.id === missionId ? { ...m, progress } : m
        ),
      })),
    completeMission: (missionId) =>
      set(state => {
        const missions = state.missions.map(m =>
          m.id === missionId ? { ...m, progress: 100 } : m
        );
        const assignments = state.assignments.map(a =>
          a.incidentId === missionId ? { ...a, status: 'completed' as Assignment['status'] } : a
        );
        const volunteers = state.volunteers.map(v =>
          v.id === missions.find(m => m.id === missionId)?.assignedVolunteerId ? { ...v, status: 'available' as Volunteer['status'] } : v
        );
        return { missions, assignments, volunteers };
      }),
  }))
);
