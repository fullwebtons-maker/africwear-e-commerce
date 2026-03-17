import { createClient } from '@blinkdotnew/sdk'

export const blink = createClient({
  projectId: import.meta.env.VITE_BLINK_PROJECT_ID || 'africwear-ecommerce-dr3yslyx',
  publishableKey: import.meta.env.VITE_BLINK_PUBLISHABLE_KEY || 'blnk_pk_FULleYV6d0ELgtt1osJ0gRT0Fq3JWfbC',
})
