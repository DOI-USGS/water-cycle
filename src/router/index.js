import { createRouter, createWebHistory } from 'vue-router'
import VisualizationView from '@/views/VisualizationView.vue'
const Error404Page = () => import('@/views/Error404Page.vue')

const SUPPORTED_LANGUAGES = ['en', 'es']
const DEFAULT_LANGUAGE = 'en'

// Pick a starting language from the browser's settings, falling back to the default.
function detectBrowserLanguage() {
  if (typeof navigator === 'undefined') return DEFAULT_LANGUAGE

  const preferences = navigator.languages?.length ? navigator.languages : [navigator.language]
  for (const preference of preferences) {
    if (!preference) continue
    const base = String(preference).toLowerCase().split('-')[0]
    if (SUPPORTED_LANGUAGES.includes(base)) return base
  }

  return DEFAULT_LANGUAGE
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      redirect: () => `/${detectBrowserLanguage()}`
    },
    {
      path: '/index.html',
      name: 'Index',
      redirect: () => `/${detectBrowserLanguage()}`
    },
    {
      path: '/:lang(en|es)',
      name: 'VisualizationContent',
      component: VisualizationView
    },
    {
      path: "/404",
      name: "Error404",
      component: Error404Page
    },
    { 
      path: '/:pathMatch(.*)*', 
      redirect: { name: "Error404" }
    }
  ]
})

export default router
