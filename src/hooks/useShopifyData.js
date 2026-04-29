import { useState, useEffect } from 'react'
import useStore from '../store'

/**
 * useShopifyData Hook
 * 
 * Listens for SHOPIFY_PRODUCT_DATA messages from the parent window (Shopify Liquid)
 * and initializes the Zustand store.
 */
export const useShopifyData = () => {
  const initializeFromPayload = useStore(state => state.initializeFromPayload)
  const isLoading = useStore(state => state.isLoading)
  const availableSizes = useStore(state => state.availableSizes)
  const error = useStore(state => state.error)

  const [payloadReceived, setPayloadReceived] = useState(false)

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data?.type === 'SHOPIFY_PRODUCT_DATA') {
        console.log("Configurator Hook: Received Shopify Data Payload", event.data)
        initializeFromPayload(event.data)
        setPayloadReceived(true)
      }
    }

    window.addEventListener('message', handleMessage)

    // Notify the Shopify parent window that the React app is listening!
    if (window.parent !== window) {
      console.log("Configurator Hook: Emitting CONFIGURATOR_READY signal to parent window");
      window.parent.postMessage({ type: 'CONFIGURATOR_READY' }, '*');
    }

    return () => window.removeEventListener('message', handleMessage)
  }, [initializeFromPayload])

  // Derived state: Loaded if payload received OR store finished AJAX load with data
  const isLoaded = payloadReceived || (!isLoading && availableSizes.length > 0)

  return { isLoaded, error }
}
