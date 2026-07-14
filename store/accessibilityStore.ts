import { create } from 'zustand';
import { AssistanceRequest, AccessibilityStatus, AssistanceStatus } from '../types/accessibility';

interface AccessibilityStoreState {
  requests: AssistanceRequest[];
  status: AccessibilityStatus | null;
  textScale: 'normal' | 'large' | 'extra-large';
  screenReaderActive: boolean;
  setRequests: (requests: AssistanceRequest[]) => void;
  updateRequestStatus: (id: string, status: AssistanceStatus) => void;
  setStatus: (status: AccessibilityStatus) => void;
  setTextScale: (scale: 'normal' | 'large' | 'extra-large') => void;
  toggleScreenReader: () => void;
}

export const useAccessibilityStore = create<AccessibilityStoreState>((set) => ({
  requests: [],
  status: null,
  textScale: 'normal',
  screenReaderActive: false,
  setRequests: (requests) => set({ requests }),
  updateRequestStatus: (id, status) => set((state) => ({
    requests: state.requests.map(req => req.id === id ? { ...req, status } : req)
  })),
  setStatus: (status) => set({ status }),
  setTextScale: (textScale) => set({ textScale }),
  toggleScreenReader: () => set((state) => ({ screenReaderActive: !state.screenReaderActive }))
}));
export default useAccessibilityStore;
