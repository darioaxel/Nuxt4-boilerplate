import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    'nuxt-auth-utils',
    "@pinia/nuxt",
    "pinia-plugin-persistedstate/nuxt",
    "@nuxtjs/color-mode",
    "@vee-validate/nuxt",
    "@nuxtjs/fontaine",
    "nuxt-vitalizer",
    "nuxt-security",
    "@nuxt/eslint",
    "@nuxtjs/i18n",
    "@vueuse/nuxt",
    "shadcn-nuxt",
    "@nuxt/image",
    "@nuxt/fonts",
    "@nuxtjs/seo",
    "@nuxt/icon",
    "nuxt-svgo"],
  shadcn: {
    /**
     * Prefix for all the imported component.
     * @default "Ui"
     */
    prefix: '',
    /**
     * Directory that the component lives in.
     * Will respect the Nuxt aliases.
     * @link https://nuxt.com/docs/api/nuxt-config#alias
     * @default "@/components/ui"
     */
    componentDir: '@/components/ui'
  },
  css: ["~/assets/css/tailwind.css"],
  compatibilityDate: "2025-11-03",
  vite: {
    plugins: [tailwindcss()],
  },  
  devtools: { enabled: true },
  icon: {
     provider: 'iconify',
    aliases: {
       'Bird': 'mdi:bird',
      'Mountain': 'lucide:mountain',
      'Music': 'lucide:music',
      'Mail': 'lucide:mail',
      'Users': 'lucide:users',
      'User': 'lucide:user',
      'UserPlus': 'lucide:user-plus',
      'FileText': 'lucide:file-text',
      'Menu': 'lucide:menu',
      'ChevronDown': 'lucide:chevron-down',
      'LogIn': 'lucide:log-in',
      'Calendar': 'lucide:calendar',
      'ArrowRight': 'lucide:arrow-right',
      'AlertCircle': 'lucide:alert-circle',
      'Search': 'lucide:search',
      'X': 'lucide:x',
    }
  }
})
