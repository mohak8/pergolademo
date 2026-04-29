import { create } from 'zustand'



const useStore = create((set, get) => ({
  // Model & Core State
  currentModel: 'Pergola',
  setModel: (model) => set({ currentModel: model }),
  frameColor: '#333333',
  frameColorName: 'Charcoal',
  setFrameColor: (hex, name) => set({ frameColor: hex, frameColorName: name }),
  activeSide: 'A',
  currentSize: '3x3',
  availableSizes: [],
  availableColors: [],
  activeTab: 'Size',
  setActiveTab: (tab) => set({ activeTab: tab }),

  // Dynamic Prices (Initialized from Shopify)
  activeHandle: 'pergostet-plus-1',
  productCatalog: ['pergostet-plus-1', 'model-2', 'model-3'],
  variantPrices: {}, // size_color -> price
  screenPrice: 0,

  // Custom Configuration (from Metafields)
  spatialConfig: null,
  variantMetafields: {},
  sizesConfig: {},
  addonProducts: [],

  // UI State
  screenA_Left: false,
  screenA_Right: false,
  screenB: false,
  screenC_Left: false,
  screenC_Right: false,
  screenD: false,
  isBreakdownVisible: false,
  showDimensions: false,
  isLoading: false,
  error: null,

  // Actions
  toggleDimensions: () => set((state) => ({ showDimensions: !state.showDimensions })),
  setActiveSide: (side) => set({ activeSide: side }),
  setSize: (newSize) => set((state) => {
    if (state.currentSize === newSize) return {}
    return {
      currentSize: newSize,
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

  // Shopify Integration Action
  initializeFromShopify: async (productHandle) => {
    if (!productHandle) return;
    set({ isLoading: true });

    try {
      // 1. Fetch Main Product Data via AJAX API
      const shopDomain = import.meta.env.VITE_SHOPIFY_STORE_DOMAIN || 'testing-1234563457896534798625436790315.myshopify.com';
      const fetchUrl = `https://${shopDomain}/products/${productHandle}.js`;
      const response = await fetch(fetchUrl);
      console.log('respaonce', response);

      if (!response.ok) throw new Error('Product not found');
      const product = await response.json();
      console.log("Configurator: Loaded Product Data", product);

      // 2. Map Color Names to Hex Codes (Dictionary)
      const COLOR_DICTIONARY = {
        'charcoal': '#333333',
        'white': '#FFFFFF',
        'wood finish': '#8B5A2B',
        'anthracite': '#2F4F4F',
        'grey': '#808080'
      };

      // 3. Identify Option Indices (More robust matching)
      let sizeIdx = -1;
      let colorIdx = -1;
      product.options.forEach((opt, i) => {
        const name = opt.name.toLowerCase();
        if (name.includes('size') || name.includes('dimen')) sizeIdx = i;
        if (name.includes('color') || name.includes('finish') || name.includes('frame')) colorIdx = i;
      });

      // Fallback: If we still haven't found them, assume Option 1 = Size, Option 2 = Color
      if (sizeIdx === -1 && product.options.length > 0) sizeIdx = 0;
      if (colorIdx === -1 && product.options.length > 1) colorIdx = 1;

      console.log(`Configurator: Mapping - Size Index: ${sizeIdx}, Color Index: ${colorIdx}`);

      // 4. Parse Variants and Options
      const newVariantPrices = {};
      const uniqueSizes = new Set();
      const uniqueColorsMap = new Map();

      product.variants.forEach(variant => {
        const sizeVal = variant.options[sizeIdx] || 'Default';
        const colorVal = variant.options[colorIdx] || 'Default';

        // Clean key for internal state lookup (e.g. "3x3_Charcoal")
        const key = `${sizeVal.replace(/\s/g, '')}_${colorVal}`;
        newVariantPrices[key] = variant.price / 100;

        uniqueSizes.add(sizeVal);
        if (colorIdx !== -1 && !uniqueColorsMap.has(colorVal)) {
          uniqueColorsMap.set(colorVal, {
            name: colorVal,
            hex: COLOR_DICTIONARY[colorVal.toLowerCase()] || '#808080'
          });
        }
      });

      const availableSizes = Array.from(uniqueSizes);
      const availableColors = Array.from(uniqueColorsMap.values());

      // 5. Update state with newly fetched product details
      const screenPrice = 300;

      const firstSize = availableSizes[0] || '3x3';
      const firstColor = availableColors[0] || { name: 'Charcoal', hex: '#333333' };

      set({
        variantPrices: newVariantPrices,
        availableSizes,
        availableColors,
        currentModel: product.title,
        activeHandle: productHandle,
        screenPrice: screenPrice,
        currentSize: firstSize,
        frameColor: firstColor.hex,
        frameColorName: firstColor.name,
        isLoading: false
      });

    } catch (error) {
      console.warn(`Shopify AJAX Load failed for ${productHandle}:`, error);
      set({
        isLoading: false,
        activeHandle: productHandle,
        error: `Failed to load product data for ${productHandle}`
      });
    }
  },

  initializeFromPayload: (data) => {
    // Enforce strict dynamic data. If Shopify did not pass data, do not load fake data.
    if (!data || !data.product) {
       console.error("Configurator: No valid product data received from Shopify.");
       return;
    }

    const { product, variantMetafields, addonProducts, sizesConfig } = data;
    const targetProduct = product;

    set({ isLoading: true });

    try {
      console.log("Configurator: Initializing core data...", targetProduct.title);

      const COLOR_DICTIONARY = {
        'charcoal': '#333333',
        'white': '#FFFFFF',
        'wood finish': '#8B5A2B',
        'anthracite': '#2F4F4F',
        'grey': '#808080'
      };

      let sizeIdx = -1;
      let colorIdx = -1;
      targetProduct.options.forEach((opt, i) => {
        const name = opt.name.toLowerCase();
        if (name.includes('size') || name.includes('dimen')) sizeIdx = i;
        if (name.includes('color') || name.includes('finish') || name.includes('frame')) colorIdx = i;
      });

      if (sizeIdx === -1 && targetProduct.options.length > 0) sizeIdx = 0;
      if (colorIdx === -1 && targetProduct.options.length > 1) colorIdx = 1;

      const newVariantPrices = {};
      const uniqueSizes = new Set();
      const uniqueColorsMap = new Map();

      targetProduct.variants.forEach(variant => {
        const sizeVal = variant.options[sizeIdx] || 'Default';
        const colorVal = variant.options[colorIdx] || 'Default';

        const key = `${sizeVal.replace(/\s/g, '')}_${colorVal}`;
        // Ensure price is decimal
        newVariantPrices[key] = variant.price > 1000 ? variant.price / 100 : variant.price;

        uniqueSizes.add(sizeVal);
        if (colorIdx !== -1 && !uniqueColorsMap.has(colorVal)) {
          uniqueColorsMap.set(colorVal, {
            name: colorVal,
            hex: COLOR_DICTIONARY[colorVal.toLowerCase()] || '#808080'
          });
        }
      });

      const availableSizes = Array.from(uniqueSizes);
      const availableColors = Array.from(uniqueColorsMap.values());

      const screenPrice = 300;
      const firstSize = availableSizes[0] || '3x3';
      const firstColor = availableColors[0] || { name: 'Charcoal', hex: '#333333' };

      set({
        variantPrices: newVariantPrices,
        variantMetafields: variantMetafields || {},
        sizesConfig: sizesConfig || {},
        addonProducts: addonProducts || [],
        availableSizes,
        availableColors,
        currentModel: targetProduct.title,
        activeHandle: targetProduct.handle,
        currentSize: firstSize,
        frameColor: firstColor.hex,
        frameColorName: firstColor.name,
        isLoading: false,
        error: data ? null : "Using fallback data (Shopify connection delayed)"
      });

    } catch (error) {
      console.error("Critical error in initializeFromPayload:", error);
      set({ isLoading: false, error: "Initialization failed" });
    }
  },

  switchProduct: (newHandle) => {
    const state = get();
    if (state.activeHandle === newHandle || state.isLoading) return;

    // Reset selections when switching products
    set({
      activeSide: 'A',
      activeTab: 'Size',
      screenA_Left: false,
      screenA_Right: false,
      screenB: false,
      screenC_Left: false,
      screenC_Right: false,
      screenD: false,
    });

    // Fire off initialize for the new product
    get().initializeFromShopify(newHandle);
  },


  // Getters
  getTotalPrice: () => {
    const state = get();
    // Look up price in the size_color map
    const key = `${state.currentSize.replace(/\s/g, '')}_${state.frameColorName}`;
    const base = state.variantPrices[key] || state.variantPrices[Object.keys(state.variantPrices)[0]] || 0;

    let total = base;

    const slidesData = state.sizesConfig[state.currentSize] || {}; 
    const getPrice = (side, index) => {
       const p = slidesData[`slide${side}`]?.[index]?.price || 0;
       return p > 1000 ? p / 100 : p;
    };

    if (state.screenA_Left) total += getPrice('A', 0);
    if (state.screenA_Right) total += getPrice('A', 1);
    if (state.screenB) total += getPrice('B', 0);
    if (state.screenC_Left) total += getPrice('C', 0);
    if (state.screenC_Right) total += getPrice('C', 1);
    if (state.screenD) total += getPrice('D', 0);
    
    return total;
  },

  getBasePrice: () => {
    const state = get();
    const key = `${state.currentSize.replace(/\s/g, '')}_${state.frameColorName}`;
    return state.variantPrices[key] || 0;
  }
}))

export default useStore

