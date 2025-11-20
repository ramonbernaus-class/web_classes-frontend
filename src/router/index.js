import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import DificultadView from '../views/DificultadView.vue'
import SubcategoriaView from '../views/SubcategoriaView.vue'
import AutoRedirectView from '../views/AutoRedirectView.vue'
import EjercicioView from '../views/EjercicioView.vue'
import LoginView from '../views/LoginView.vue'
import EntregaView from '../views/EntregaView.vue'
import AdminUsuarios from "../views/AdminUsuarios.vue"
import AdminDashboard from "../views/AdminDashboard.vue"

// --- Función para comprobar si el token ha expirado ---
function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.exp * 1000 < Date.now()
  } catch (e) {
    return true 
  }
}

const routes = [
  { path: '/', component: HomeView },
  { path: '/entrega', component: EntregaView },
  { path: '/login', component: LoginView },
  { path: '/categoria/:categoriaId', component: AutoRedirectView },
  { path: '/categoria/:categoriaId/subcategorias', component: SubcategoriaView },
  { path: '/categoria/:categoriaId/subcategoria/:subcategoria', component: DificultadView },
  { path: '/categoria/:categoriaId/subcategoria/:subcategoria/dificultad/:nivel', component: EjercicioView },
  { path: "/admin/usuarios", component: AdminUsuarios },
  { path: "/admin", component: AdminDashboard }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// --- Middleware global de protección ---
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const isLogin = to.path === '/login'


  if (!token) {
    if (!isLogin) return next('/login')
    return next()
  }


  if (isTokenExpired(token)) {
    localStorage.removeItem('token')
    return next('/login')
  }


  if (isLogin) return next('/')

  // 4. Todo bien → continuar
  next()
})

export default router   
