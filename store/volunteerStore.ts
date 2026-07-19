import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { VolunteerService, type VolunteerFormValues } from '@/services/api/volunteer';
import { useNotificationStore } from '@/store/notificationStore';
import { Volunteer, Assignment, Mission } from '@/types/volunteers/volunteer';

export interface VolunteerState {
  volunteers: Volunteer[];
  selectedVolunteerId: string | null;
  assignments: Assignment[];
  missions: Mission[];
  filters: {
    search: string;
    status: string[];
    languages: string[];
    skills: string[];
    certifications: string[];
  };
  loading: boolean;
  error: string | null;
  isRealtimeConnected: boolean;
  selectVolunteer: (id: string) => void;
  setSearch: (term: string) => void;
  toggleStatusFilter: (status: string) => void;
  toggleLanguageFilter: (lang: string) => void;
  toggleSkillFilter: (skill: string) => void;
  toggleCertificationFilter: (cert: string) => void;
  loadVolunteers: () => Promise<void>;
  retryLoadVolunteers: () => Promise<void>;
  createVolunteer: (input: VolunteerFormValues) => Promise<void>;
  updateVolunteer: (id: string, input: Partial<VolunteerFormValues>) => Promise<void>;
  deleteVolunteer: (id: string) => Promise<void>;
  assignVolunteer: (id: string) => Promise<void>;
  toggleVolunteerActive: (id: string) => Promise<void>;
  assignMission: (volunteerId: string, missionId: string) => void;
  updateMissionProgress: (missionId: string, progress: number) => void;
  completeMission: (missionId: string) => void;
  setRealtimeConnected: (connected: boolean) => void;
  updateVolunteerRealtime: (volunteer: any) => void;
  updateShiftRealtime: (shift: any) => void;
}

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

const buildNotification = (title: string, description: string) => ({
  title,
  description,
  category: 'system' as const,
  severity: 'info' as const,
});

const normalizeVolunteer = (v: any): Volunteer => ({
  id: String(v.id ?? ''),
  name: v.name ?? 'Unnamed volunteer',
  role: v.role ?? 'Volunteer',
  languages: Array.isArray(v.languages) ? v.languages : ['English'],
  skills: Array.isArray(v.skills) ? v.skills : ['Crowd Control'],
  location: v.location ?? 'Gate A',
  status: v.is_active || v.isActive ? (v.status === 'assigned' || v.status === 'on-duty' ? 'assigned' : 'available') : 'unavailable',
  email: v.email ?? '',
  phone: v.phone ?? v.phoneNumber ?? '',
  isActive: v.is_active ?? v.isActive ?? true,
});

export const useVolunteerStore = create<VolunteerState>()(
  devtools((set, get) => ({
    volunteers: [],
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
    loading: false,
    error: null,
    isRealtimeConnected: false,
    selectVolunteer: (id) => set({ selectedVolunteerId: id }),
    setSearch: (term) => set((state) => ({ filters: { ...state.filters, search: term } })),
    toggleStatusFilter: (status) =>
      set((state) => {
        const arr = state.filters.status.includes(status)
          ? state.filters.status.filter((s) => s !== status)
          : [...state.filters.status, status];
        return { filters: { ...state.filters, status: arr } };
      }),
    toggleLanguageFilter: (lang) =>
      set((state) => {
        const arr = state.filters.languages.includes(lang)
          ? state.filters.languages.filter((l) => l !== lang)
          : [...state.filters.languages, lang];
        return { filters: { ...state.filters, languages: arr } };
      }),
    toggleSkillFilter: (skill) =>
      set((state) => {
        const arr = state.filters.skills.includes(skill)
          ? state.filters.skills.filter((s) => s !== skill)
          : [...state.filters.skills, skill];
        return { filters: { ...state.filters, skills: arr } };
      }),
    toggleCertificationFilter: (cert) =>
      set((state) => {
        const arr = state.filters.certifications.includes(cert)
          ? state.filters.certifications.filter((c) => c !== cert)
          : [...state.filters.certifications, cert];
        return { filters: { ...state.filters, certifications: arr } };
      }),
    loadVolunteers: async () => {
      set({ loading: true, error: null });
      try {
        const response = await VolunteerService.getVolunteers();
        const normalized = response.map(normalizeVolunteer);
        const selectedVolunteerId = normalized[0]?.id ?? null;
        set({
          volunteers: normalized,
          selectedVolunteerId: get().selectedVolunteerId && normalized.some((item) => item.id === get().selectedVolunteerId)
            ? get().selectedVolunteerId
            : selectedVolunteerId,
          loading: false,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to load volunteers';
        set({ error: message, loading: false });
      }
    },
    retryLoadVolunteers: async () => {
      await get().loadVolunteers();
    },
    createVolunteer: async (input) => {
      try {
        const created = await VolunteerService.createVolunteer(input);
        const normalized = normalizeVolunteer(created);
        set((state) => ({ volunteers: [...state.volunteers, normalized], selectedVolunteerId: normalized.id }));
        useNotificationStore.getState().addNotification(buildNotification('Volunteer created', `${normalized.name} was added to the roster.`));
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to create volunteer';
        set({ error: message });
        useNotificationStore.getState().addNotification(buildNotification('Create failed', message));
      }
    },
    updateVolunteer: async (id, input) => {
      try {
        const updated = await VolunteerService.updateVolunteer(id, input);
        const normalized = normalizeVolunteer(updated);
        set((state) => ({
          volunteers: state.volunteers.map((volunteer) => (volunteer.id === id ? normalized : volunteer)),
        }));
        useNotificationStore.getState().addNotification(buildNotification('Volunteer updated', `${normalized.name} was updated successfully.`));
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to update volunteer';
        set({ error: message });
        useNotificationStore.getState().addNotification(buildNotification('Update failed', message));
      }
    },
    deleteVolunteer: async (id) => {
      try {
        await VolunteerService.deleteVolunteer(id);
        set((state) => ({
          volunteers: state.volunteers.filter((volunteer) => volunteer.id !== id),
          selectedVolunteerId: state.selectedVolunteerId === id ? null : state.selectedVolunteerId,
        }));
        useNotificationStore.getState().addNotification(buildNotification('Volunteer deleted', 'The volunteer was removed from the roster.'));
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to delete volunteer';
        set({ error: message });
        useNotificationStore.getState().addNotification(buildNotification('Delete failed', message));
      }
    },
    assignVolunteer: async (id) => {
      try {
        const current = get().volunteers.find((volunteer) => volunteer.id === id);
        const updated = await VolunteerService.updateVolunteer(id, {
          isActive: true,
          status: 'assigned',
        });
        const normalized = normalizeVolunteer(updated);
        set((state) => ({
          volunteers: state.volunteers.map((volunteer) => volunteer.id === id ? normalized : volunteer),
        }));
        useNotificationStore.getState().addNotification(buildNotification('Volunteer assigned', `${current?.name ?? 'Volunteer'} is now assigned.`));
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to assign volunteer';
        set({ error: message });
        useNotificationStore.getState().addNotification(buildNotification('Assignment failed', message));
      }
    },
    toggleVolunteerActive: async (id) => {
      try {
        const current = get().volunteers.find((volunteer) => volunteer.id === id);
        const nextActive = current?.isActive !== false;
        const nextStatus = nextActive ? (current?.status === 'assigned' ? 'assigned' : 'available') : 'unavailable';
        const updated = await VolunteerService.updateVolunteer(id, { isActive: nextActive, status: nextStatus });
        const normalized = normalizeVolunteer(updated);
        set((state) => ({
          volunteers: state.volunteers.map((volunteer) => volunteer.id === id ? normalized : volunteer),
        }));
        useNotificationStore.getState().addNotification(buildNotification('Availability updated', nextActive ? 'Volunteer is now active.' : 'Volunteer is now inactive.'));
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to update availability';
        set({ error: message });
        useNotificationStore.getState().addNotification(buildNotification('Availability update failed', message));
      }
    },
    assignMission: (volunteerId, missionId) =>
      set((state) => {
        const missions = state.missions.map((mission) =>
          mission.id === missionId ? { ...mission, assignedVolunteerId: volunteerId, progress: 0 } : mission
        );
        const volunteers = state.volunteers.map((volunteer) =>
          volunteer.id === volunteerId ? { ...volunteer, status: 'assigned' as const } : volunteer
        );
        const assignment: Assignment = {
          incidentId: missionId,
          mission: missions.find((mission) => mission.id === missionId)?.title ?? '',
          status: 'accepted',
          eta: missions.find((mission) => mission.id === missionId)?.eta ?? '',
        };
        return { missions, volunteers, assignments: [...state.assignments, assignment] };
      }),
    updateMissionProgress: (missionId, progress) =>
      set((state) => ({
        missions: state.missions.map((mission) => (mission.id === missionId ? { ...mission, progress } : mission)),
      })),
    completeMission: (missionId) =>
      set((state) => {
        const missions = state.missions.map((mission) => (mission.id === missionId ? { ...mission, progress: 100 } : mission));
        const assignments = state.assignments.map((assignment) =>
          assignment.incidentId === missionId ? { ...assignment, status: 'completed' as Assignment['status'] } : assignment
        );
        const volunteers = state.volunteers.map((volunteer) =>
          volunteer.id === missions.find((mission) => mission.id === missionId)?.assignedVolunteerId
            ? { ...volunteer, status: 'available' as Volunteer['status'] }
            : volunteer
        );
        return { missions, assignments, volunteers };
      }),
    setRealtimeConnected: (connected) => set({ isRealtimeConnected: connected }),
    updateVolunteerRealtime: (v) => set((state) => {
      const normalized = normalizeVolunteer(v);
      const exists = state.volunteers.some((volunteer) => volunteer.id === normalized.id);
      if (v.action === 'deleted') {
        return {
          volunteers: state.volunteers.filter((volunteer) => volunteer.id !== normalized.id),
          selectedVolunteerId: state.selectedVolunteerId === normalized.id ? null : state.selectedVolunteerId,
        };
      }
      if (exists) {
        return {
          volunteers: state.volunteers.map((volunteer) => (volunteer.id === normalized.id ? normalized : volunteer)),
        };
      } else {
        return {
          volunteers: [...state.volunteers, normalized],
        };
      }
    }),
    updateShiftRealtime: (shift) => set((state) => {
      // Map shift updates to assignments or missions if needed
      return {};
    }),
  }))
);

export default useVolunteerStore;
