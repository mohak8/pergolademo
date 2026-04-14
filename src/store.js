import { create } from 'zustand'

const SCREEN_PRICE = 300;
const BASE_PRICES = {
  '3x3': 1500,
  '4x3': 1800,
  '6x3': 2500,
};

const useStore = create((set, get) => ({
  activeSide: 'A', // 'A', 'B', 'C', 'D'
  currentSize: '3x3', // '3x3', '4x3', '6x3'
  screenA_Left: false,
  screenA_Right: false,
  screenB: false,
  screenC_Left: false,
  screenC_Right: false,
  screenD: false,
  isBreakdownVisible: false,
  
  setActiveSide: (side) => set({ activeSide: side }),
  setSize: (newSize) => set((state) => {
    // If clicking the current size, do absolutely nothing (ignore)
    if (state.currentSize === newSize) return {}
    // If changing sizes, update size and firmly reset all screens
    return {
      currentSize: newSize,
      screenA_Left: false,
      screenA_Right: false,
      screenB: false,
      screenC_Left: false,
      screenC_Right: false,
      screenD: false,
    }
  }),
  toggleScreenA_Left: () => set((state) => ({ screenA_Left: !state.screenA_Left })),
  toggleScreenA_Right: () => set((state) => ({ screenA_Right: !state.screenA_Right })),
  toggleScreenB: () => set((state) => ({ screenB: !state.screenB })),
  toggleScreenC_Left: () => set((state) => ({ screenC_Left: !state.screenC_Left })),
  toggleScreenC_Right: () => set((state) => ({ screenC_Right: !state.screenC_Right })),
  toggleScreenD: () => set((state) => ({ screenD: !state.screenD })),
  
  toggleBreakdown: () => set((state) => ({ isBreakdownVisible: !state.isBreakdownVisible })),
  
  getTotalPrice: () => {
    const state = get();
    let total = BASE_PRICES[state.currentSize] || 1500;
    if (state.screenA_Left) total += SCREEN_PRICE;
    if (state.screenA_Right) total += SCREEN_PRICE;
    if (state.screenB) total += SCREEN_PRICE;
    if (state.screenC_Left) total += SCREEN_PRICE;
    if (state.screenC_Right) total += SCREEN_PRICE;
    if (state.screenD) total += SCREEN_PRICE;
    return total;
  },
  
  getBasePrice: () => BASE_PRICES[get().currentSize],
  getScreenPrice: () => SCREEN_PRICE
}))

export default useStore
