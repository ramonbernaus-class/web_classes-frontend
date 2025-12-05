<template>
  <div class="flex min-h-screen bg-gray-100">

    <!-- SIDEBAR -->
    <aside class="w-64 bg-gray-900 text-gray-100 flex flex-col">
      <div class="px-6 py-5 border-b border-gray-800">
        <h1 class="text-xl font-bold">Admin Panel</h1>
      </div>

      <!-- NAV -->
      <nav class="flex-1 px-4 py-4 space-y-2">
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="block px-3 py-2 rounded-md text-gray-300 hover:bg-gray-800 hover:text-white transition"
          :class="{ 'bg-gray-800 text-white': $route.path === item.to }"
        >
          {{ item.label }}
        </RouterLink>
      </nav>

      <div class="px-4 py-4 border-t border-gray-800">
        <button @click="logout" class="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-md transition">
          Cerrar sesión
        </button>
      </div>
    </aside>

    <!-- MAIN -->
    <main class="flex-1 p-8 overflow-auto">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()

const navItems = [
  { label: "Dashboard", to: "/admin" },
  { label: "Usuarios", to: "/admin/usuarios" },
  { label: "Ejercicios", to: "/admin/ejercicios" },
  { label: "Entregas", to: "/admin/entregas" },
  { label: "Estadísticas", to: "/admin/estadisticas" },
  { label: "Servidor", to: "/admin/servidor" },
]

const logout = () => {
  localStorage.removeItem("token")
  localStorage.removeItem("usuario")
  router.push("/login")
}
</script>
