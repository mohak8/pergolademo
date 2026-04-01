import { create } from 'zustand'

const useStore = create((set) => ({
  activeSide: 'A', // 'A', 'B', 'C', 'D'
  screenA: false,
  screenB: false,
  screenC: false,
  screenD: false,
  setActiveSide: (side) => set({ activeSide: side }),
  toggleScreenA: () => set((state) => ({ screenA: !state.screenA })),
  toggleScreenB: () => set((state) => ({ screenB: !state.screenB })),
  toggleScreenC: () => set((state) => ({ screenC: !state.screenC })),
  toggleScreenD: () => set((state) => ({ screenD: !state.screenD })),
}))

export default useStore
