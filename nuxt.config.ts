// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  extends: ['senp-ui'],
  srcDir: './src',
  hooks: {
    'vite:extendConfig': (config, { isClient, isServer }) => {
      if (isClient && config?.resolve?.alias) {
        ;(config.resolve.alias as any)['lodash.debounce'] = 'lodash.debounce/index.js'
        ;(config.resolve.alias as any).vuedraggable = 'vuedraggable/dist/vuedraggable.common.js'
        ;(config.resolve.alias as any).jsurl = 'jsurl/lib/jsurl.js'
        ;(config.resolve.alias as any).xlsx = 'xlsx/dist/xlsx.full.min.js'
      }
    },
  },
  components: {
    global: true,
    dirs: ['~/components'],
  },
})
