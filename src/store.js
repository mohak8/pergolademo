import { create } from 'zustand'

const SCREEN_PRICE = 300;
const BASE_PRICES = {
  '3x3': 1500,
  '4x3': 1800,
  '6x3': 2500,
};

const useStore = create((set, get) => ({
  currentModel: 'Pergola',
  frameColor: '#333333',
  activeSide: 'A',
  currentSize: '3x3',
  activeTab: 'Model',
  
  screenA_Left: false,
  screenA_Right: false,
  screenB: false,
  screenC_Left: false,
  screenC_Right: false,
  screenD: false,
  
  isBreakdownVisible: false,
  showDimensions: false,
  
  history: [],

  // Helper to save current state to history before a change
  saveHistory: () => {
    const state = get()
    const snapshot = {
      frameColor: state.frameColor,
      activeSide: state.activeSide,
      activeTab: state.activeTab,
      screenA_Left: state.screenA_Left,
      screenA_Right: state.screenA_Right,
      screenB: state.screenB,
      screenC_Left: state.screenC_Left,
      screenC_Right: state.screenC_Right,
      screenD: state.screenD,
    }
    set((state) => ({ history: [...state.history, snapshot] }))
  },

  undo: () => {
    const { history } = get()
    if (history.length === 0) return
    
    const lastSnapshot = history[history.length - 1]
    const newHistory = history.slice(0, -1)
    
    set({
      ...lastSnapshot,
      history: newHistory
    })
  },

  setModel: (model) => {
    if (get().currentModel === model) return
    set({
      currentModel: model,
      frameColor: '#333333',
      activeSide: 'A',
      activeTab: 'Model',
      screenA_Left: false,
      screenA_Right: false,
      screenB: false,
      screenC_Left: false,
      screenC_Right: false,
      screenD: false,
      history: [] // Reset history on model change
    })
  },

  setSize: (newSize) => {
    if (get().currentSize === newSize) return
    set({
      currentSize: newSize,
      frameColor: '#333333',
      activeSide: 'A',
      activeTab: 'Size',
      screenA_Left: false,
      screenA_Right: false,
      screenB: false,
      screenC_Left: false,
      screenC_Right: false,
      screenD: false,
      history: [] // Reset history on size change
    })
  },

  setFrameColor: (hex) => {
    if (get().frameColor === hex) return
    get().saveHistory()
    set({ frameColor: hex })
  },

  setActiveTab: (tab) => {
    if (get().activeTab === tab) return
    get().saveHistory()
    set({ activeTab: tab })
  },

  setActiveSide: (side) => {
    if (get().activeSide === side) return
    get().saveHistory()
    set({ activeSide: side })
  },

  toggleScreenA_Left: () => { get().saveHistory(); set((state) => ({ screenA_Left: !state.screenA_Left })) },
  toggleScreenA_Right: () => { get().saveHistory(); set((state) => ({ screenA_Right: !state.screenA_Right })) },
  toggleScreenB: () => { get().saveHistory(); set((state) => ({ screenB: !state.screenB })) },
  toggleScreenC_Left: () => { get().saveHistory(); set((state) => ({ screenC_Left: !state.screenC_Left })) },
  toggleScreenC_Right: () => { get().saveHistory(); set((state) => ({ screenC_Right: !state.screenC_Right })) },
  toggleScreenD: () => { get().saveHistory(); set((state) => ({ screenD: !state.screenD })) },

  toggleDimensions: () => set((state) => ({ showDimensions: !state.showDimensions })),
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
