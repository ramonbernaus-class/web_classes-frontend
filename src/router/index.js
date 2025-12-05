import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import DificultadView from '../views/DificultadView.vue'
import SubcategoriaView from '../views/SubcategoriaView.vue'
import AutoRedirectView from '../views/AutoRedirectView.vue'
import EjercicioView from '../views/EjercicioView.vue'
import LoginView from '../views/LoginView.vue'
import EntregaView from '../views/EntregaView.vue'

// Importa los admin como lazy (recomendado)
const AdminLayout = () => import('../views/admin/AdminLayout.vue')
const AdminDashboard = () => import('../views/admin/Dashboard.vue')
const AdminUsuarios = () => import('../views/admin/Usuarios.vue')
const AdminEjercicios = () => import('../views/admin/Ejercicios.vue')
const AdminEntregas = () => import('../views/admin/Entregas.vue')
const AdminEstadisticas = () => import('../views/admin/Estadisticas.vue')
const ServerControl = () => import('../views/admin/ServerControl.vue')

// ---------------------------
// 1) DEFINICIÓN DE RUTAS
// ---------------------------
const routes = [
  { path: '/', component: HomeView },
  { path: '/login', component: LoginView },
  { path: '/entrega', component: EntregaView },

  { path: '/categoria/:categoriaId', component: AutoRedirectView },
  { path: '/categoria/:categoriaId/subcategorias', component: SubcategoriaView },
  { path: '/categoria/:categoriaId/subcategoria/:subcategoria', component: DificultadView },
  { path: '/categoria/:categoriaId/subcategoria/:subcategoria/dificultad/:nivel', component: EjercicioView },

  // Admin con layout + children
  {
    path: '/admin',
    component: AdminLayout,
    children: [
      { path: '', component: AdminDashboard, meta: { requiresAdmin: true } },
      { path: 'usuarios', component: AdminUsuarios, meta: { requiresAdmin: true } },
      { path: 'ejercicios', component: AdminEjercicios, meta: { requiresAdmin: true } },
      { path: 'entregas', component: AdminEntregas, meta: { requiresAdmin: true } },
      { path: 'estadisticas', component: AdminEstadisticas, meta: { requiresAdmin: true } },
      { path: 'servidor', component: ServerControl, meta: { requiresAdmin: true } }
    ]
  },

  // Fallback
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

// ---------------------------
// 2) CREAR ROUTER
// ---------------------------
const router = createRouter({
  history: createWebHistory(),
  routes
})

// ---------------------------
// 3) AQUÍ VA EL GUARD GLOBAL
// ---------------------------
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const usuarioStr = localStorage.getItem('usuario')

  let usuario = null
  try {
    usuario = usuarioStr ? JSON.parse(usuarioStr) : null
  } catch (e) {
    usuario = null
  }

  // Si la ruta requiere admin
  if (to.matched.some(record => record.meta.requiresAdmin)) {
    if (!token) return next('/login')     // no logueado
    if (!usuario) return next('/login')   // sin info usuario
    if (usuario.rol !== 'admin') return next('/')   // no autorizado
    return next() // OK
  }

  // Rutas públicas
  if (!token && to.path !== '/login') {
    return next('/login')
  }
  if (token && to.path === '/login') {
    return next('/')
  }

  next()
})

// ---------------------------
// 4) EXPORTAR ROUTER
// ---------------------------
export default router
  
