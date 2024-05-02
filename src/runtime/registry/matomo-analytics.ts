import { registryScript } from '../utils'
import { boolean, object, optional, string } from '#nuxt-scripts-validator'
import type { RegistryScriptInput } from '#nuxt-scripts'

export const MatomoAnalyticsOptions = object({
  matomoUrl: string(), // site is required
  siteId: string(),
  trackPageView: optional(boolean()),
  enableLinkTracking: optional(boolean()),
})

export type MatomoAnalyticsInput = RegistryScriptInput<typeof MatomoAnalyticsOptions, false>

interface MatomoAnalyticsApi {
  _paq: unknown[]
}

declare global {
  interface Window extends MatomoAnalyticsApi {}
}

export function useScriptMatomoAnalytics<T extends MatomoAnalyticsApi>(_options?: MatomoAnalyticsInput) {
  return registryScript<T, typeof MatomoAnalyticsOptions>('matomoAnalytics', options => ({
    scriptInput: {
      src: `https://${options?.matomoUrl}/matomo.js`,
    },
    schema: import.meta.dev ? MatomoAnalyticsOptions : undefined,
    scriptOptions: {
      use() {
        return { _paq: window._paq }
      },
      // allow _paq to be accessed on the server
      stub: import.meta.client
        ? undefined
        : ({ fn }) => {
            return fn === '_paq' ? [] : undefined
          },
      clientInit: import.meta.server
        ? undefined
        : () => {
            const _paq = window._paq = window._paq || []
            options?.trackPageView !== false && _paq.push(['trackPageView'])
            options?.enableLinkTracking !== false && _paq.push(['enableLinkTracking'])
            _paq.push(['setTrackerUrl', `//${options?.matomoUrl}/matomo.php`])
            _paq.push(['setSiteId', options?.siteId])
          },
    },
  }), _options)
}
