import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import DificultadView from '../views/DificultadView.vue'
import SubcategoriaView from '../views/SubcategoriaView.vue'
import AutoRedirectView from '../views/AutoRedirectView.vue'
import EjercicioView from '../views/EjercicioView.vue'
import LoginView from '../views/LoginView.vue'
import EntregaView from '../views/EntregaView.vue'

const routes = [
  { path: '/', component: HomeView },
  { path: '/entrega', component: EntregaView },
  { path: '/login', component: LoginView },
  { path: '/categoria/:categoriaId', component: AutoRedirectView },
  { path: '/categoria/:categoriaId/subcategorias', component: SubcategoriaView },
  { path: '/categoria/:categoriaId/subcategoria/:subcategoria', component: DificultadView },
  { path: '/categoria/:categoriaId/subcategoria/:subcategoria/dificultad/:nivel', component: EjercicioView }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 🔒 Middleware global to protect links 
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')

  if (!token && to.path !== '/login') {
    next('/login')
  } 
  else if (token && to.path === '/login') {
    next('/')
  } 
  else {
    next()
  }
})

export default router
