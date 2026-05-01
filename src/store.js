import { create } from 'zustand'

const COLOR_MAP = {
  '#333333': 'Charcoal',
  '#FFFFFF': 'White',
  '#8B5A2B': 'Wood Finish'
};

const useStore = create((set, get) => ({
  shopifyData: null,
  setShopifyData: (data) => set({ shopifyData: data }),
  isAddingToCart: false,
  setIsAddingToCart: (val) => set({ isAddingToCart: val }),

  currentModel: 'Pergola',
  setModel: (model) => set({ currentModel: model }),
  frameColor: '#333333',
  setFrameColor: (hex) => set({ frameColor: hex }),
  activeSide: 'A',
  currentSize: '3x3', // React model size reference (UI internal state)
  activeTab: 'Size',
  setActiveTab: (tab) => set({ activeTab: tab }),

  screenA_Left: false,
  screenA_Right: false,
  screenB: false,
  screenC_Left: false,
  screenC_Right: false,
  screenD: false,

  isBreakdownVisible: false,
  showDimensions: false,
  toggleDimensions: () => set((state) => ({ showDimensions: !state.showDimensions })),

  setActiveSide: (side) => set({ activeSide: side }),
  setSize: (newSize) => set((state) => {
    if (state.currentSize === newSize) return {}
    return {
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
    }
  }),
  toggleScreenA_Left: () => set((state) => ({ screenA_Left: !state.screenA_Left })),
  toggleScreenA_Right: () => set((state) => ({ screenA_Right: !state.screenA_Right })),
  toggleScreenB: () => set((state) => ({ screenB: !state.screenB })),
  toggleScreenC_Left: () => set((state) => ({ screenC_Left: !state.screenC_Left })),
  toggleScreenC_Right: () => set((state) => ({ screenC_Right: !state.screenC_Right })),
  toggleScreenD: () => set((state) => ({ screenD: !state.screenD })),

  toggleBreakdown: () => set((state) => ({ isBreakdownVisible: !state.isBreakdownVisible })),

  // ─── DYNAMIC HELPERS ──────────────────────────────────────────────

  // Finds the Shopify variant based on our internal size (e.g. '3x3' matches '3x3m') and color
  getMainVariant: () => {
    const state = get();
    if (!state.shopifyData || !state.shopifyData.product) return null;

    const targetSizeStr = state.currentSize + 'm'; // e.g. "3x3m"
    const targetColorStr = COLOR_MAP[state.frameColor] || 'Charcoal'; // e.g. "Charcoal"

    const variants = state.shopifyData.product.variants;
    // We assume option1 is size and option2 is color (or vice versa)
    const variant = variants.find(v =>
      (v.option1 === targetSizeStr || v.option2 === targetSizeStr || v.title.includes(targetSizeStr)) &&
      (v.option1 === targetColorStr || v.option2 === targetColorStr || v.title.includes(targetColorStr))
    );
    return variant || variants[0];
  },

  getBasePrice: () => {
    const variant = get().getMainVariant();
    // Shopify returns price in cents, we convert to full value for display
    return variant ? (variant.price / 100) : 1500;
  },

  getScreenVariantId: () => {
    const state = get();
    // Use 'sideBline' metafield for screen product data
    const screenProduct = state.shopifyData?.metafields?.sideBline;
    if (screenProduct && screenProduct.variants && screenProduct.variants.length > 0) {
      return screenProduct.variants[0].id;
    }
    // Fallback ID if not setup yet
    return 123456789;
  },

  getScreenPrice: () => {
    const state = get();
    const screenProduct = state.shopifyData?.metafields?.sideBline;
    if (screenProduct) {
      // Use price from sideBline product
      return (screenProduct.price || 35000) / 100;
    }
    return 350; // Static fallback
  },

  getTotalPrice: () => {
    const state = get();
    let total = state.getBasePrice();
    const screenPrice = state.getScreenPrice();

    if (state.screenA_Left) total += screenPrice;
    if (state.screenA_Right) total += screenPrice;
    if (state.screenB) total += screenPrice;
    if (state.screenC_Left) total += screenPrice;
    if (state.screenC_Right) total += screenPrice;
    if (state.screenD) total += screenPrice;
    return total;
  },

  addToCart: () => {
    const state = get();

    const mainVariant = state.getMainVariant();
    if (!mainVariant) {
      console.warn("No Shopify Data available yet!");
      return;
    }

    const items = [];
    const bundleId = Date.now().toString();

    // 1. Prepare Screens Summary based on size
    const is6x3 = state.currentSize === '6x3m';
    const selectedScreens = [];

    if (state.screenA_Left) selectedScreens.push(is6x3 ? 'Side A (Left)' : 'Side A');
    if (state.screenA_Right) selectedScreens.push(is6x3 ? 'Side A (Right)' : 'Side A');
    if (state.screenB) selectedScreens.push('Side B');
    if (state.screenC_Left) selectedScreens.push(is6x3 ? 'Side C (Left)' : 'Side C');
    if (state.screenC_Right) selectedScreens.push(is6x3 ? 'Side C (Right)' : 'Side C');
    if (state.screenD) selectedScreens.push('Side D');

    // Remove duplicates if size is not 6x3m
    const uniqueScreens = [...new Set(selectedScreens)];

    const parentProperties = {
      'Bundle ': `Bundle of ${1 + selectedScreens.length} items`,
      '_bundle_id': bundleId,
      '_bundle_role': 'parent'
    };

    if (uniqueScreens.length > 0) {
      parentProperties['Selected Screens'] = uniqueScreens.join(', ');
    }

    // 2. Add Main Pergola Frame (Parent)
    items.push({
      id: mainVariant.id,
      quantity: 1,
      properties: parentProperties
    });

    // 3. Add Screens (Children)
    const screenVariantId = state.getScreenVariantId();
    let screenQuantity = selectedScreens.length; // Keep actual count for checkout

    if (screenQuantity > 0) {
      items.push({
        id: screenVariantId,
        quantity: screenQuantity,
        parent_id: mainVariant.id,
        properties: {
          '_bundle_id': bundleId,
          '_bundle_role': 'child'
        }
      });
    }

    const payload = {
      type: 'ADD_TO_CART',
      items: items
    };

    console.log("🚀 CLEAN BUNDLE DISPATCH:", payload);

    set({ isAddingToCart: true });

    // Actually send to Shopify via parent window
    const parent = window.parent || window;
    parent.postMessage(payload, '*');
  }
}))

export default useStore
