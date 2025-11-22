<template>
  <div class="max-w-6xl mx-auto">

    <!-- HEADER -->
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-semibold text-gray-900">Gestión de usuarios</h1>

      <button
        @click="abrirCrear"
        class="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800"
      >
        Crear usuario
      </button>
    </div>

    <!-- BUSCADOR -->
    <div class="mb-4">
      <input
        v-model="busqueda"
        type="text"
        placeholder="Buscar usuario por nombre..."
        class="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-gray-700 focus:outline-none"
      >
    </div>

    <!-- TABLA -->
    <div class="bg-white border rounded-lg shadow-sm overflow-hidden">
      <table class="w-full text-left">
        <thead class="bg-gray-100 text-gray-700 text-sm">
          <tr>
            <th class="py-2 px-3">ID</th>
            <th class="py-2 px-3">Nombre</th>
            <th class="py-2 px-3">Email</th>
            <th class="py-2 px-3">Rol</th>
            <th class="py-2 px-3 text-center">Acciones</th>
          </tr>
        </thead>

        <tbody>
          <tr v-if="usuariosFiltrados.length === 0">
            <td colspan="5" class="text-center py-6 text-gray-500">
              No hay usuarios que coincidan con la búsqueda.
            </td>
          </tr>

          <tr v-for="u in usuariosFiltrados" :key="u.id" class="border-b hover:bg-gray-50">
            <td class="py-2 px-3">{{ u.id }}</td>
            <td class="py-2 px-3">{{ u.nombre }}</td>
            <td class="py-2 px-3">{{ u.email }}</td>
            <td class="py-2 px-3">
              <select
                v-model="u.rol"
                @change="cambiarRol(u)"
                class="border px-2 py-1 rounded-md text-sm"
              >
                <option value="alumno">Alumno</option>
                <option value="admin">Admin</option>
              </select>
            </td>

            <td class="py-2 px-3 text-center">
              <button
                @click="resetearPassword(u)"
                class="text-blue-600 hover:underline mr-3 text-sm"
              >
                Reset pass
              </button>

              <button
                @click="borrar(u)"
                class="text-red-600 hover:underline text-sm"
              >
                Borrar
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- MODAL CREAR USUARIO -->
    <div
      v-if="modalCrear"
      class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40"
    >
      <div class="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">

        <h2 class="text-xl font-semibold mb-4">Crear nuevo usuario</h2>

        <div class="space-y-3">
          <div>
            <label class="text-sm">Email</label>
            <input v-model="nuevo.email" type="email"
                   class="w-full px-3 py-2 border rounded-md">
          </div>

          <div>
            <label class="text-sm">Nombre</label>
            <input v-model="nuevo.nombre" type="text"
                   class="w-full px-3 py-2 border rounded-md">
          </div>

          <div>
            <label class="text-sm">Contraseña</label>
            <input v-model="nuevo.password" type="password"
                   class="w-full px-3 py-2 border rounded-md">
          </div>
        </div>

        <div class="flex justify-end gap-3 mt-5">
          <button @click="modalCrear = false" class="px-4 py-2 border rounded-md">
            Cancelar
          </button>

          <button
            @click="crear"
            class="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800"
          >
            Crear
          </button>
        </div>
      </div>
    </div>

  </div>
</template>


<script setup>
import { ref, computed, onMounted } from 'vue'
import { API_URL } from '../../api.js'

const usuarios = ref([])
const busqueda = ref('')
const modalCrear = ref(false)

const nuevo = ref({
  email: '',
  nombre: '',
  password: ''
})

function getToken() {
  return localStorage.getItem('token')
}

// Cargar usuarios
async function cargar() {
  const res = await fetch(`${API_URL}/api/admin/usuarios`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  })

  if (res.ok) {
    usuarios.value = await res.json()
  }
}

// Búsqueda
const usuariosFiltrados = computed(() => {
  return usuarios.value.filter(u =>
    u.nombre.toLowerCase().includes(busqueda.value.toLowerCase())
  )
})

// Cambiar rol
async function cambiarRol(u) {
  await fetch(`${API_URL}/api/admin/usuarios/${u.id}/rol?nuevo_rol=${u.rol}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${getToken()}` }
  })
  cargar()
}

// Resetear contraseña
async function resetearPassword(u) {
  const nueva = prompt(`Nueva contraseña para ${u.nombre}:`)
  if (!nueva) return

  await fetch(`${API_URL}/api/admin/usuarios/${u.id}/password?new_password=${nueva}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${getToken()}` }
  })
  alert('Contraseña actualizada')
}

// Borrar usuario
async function borrar(u) {
  if (!confirm(`¿Seguro que quieres borrar a ${u.nombre}?`)) return

  await fetch(`${API_URL}/api/admin/usuarios/${u.id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${getToken()}` }
  })

  cargar()
}

// Crear usuario
async function crear() {
  const params = new URLSearchParams()
  params.append('email', nuevo.value.email)
  params.append('nombre', nuevo.value.nombre)
  params.append('password', nuevo.value.password)

  const res = await fetch(`${API_URL}/api/admin/usuarios?${params.toString()}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${getToken()}` }
  })

  if (res.ok) {
    alert('Usuario creado correctamente')
    modalCrear.value = false
    nuevo.value = { email: '', nombre: '', password: '' }
    cargar()
  } else {
    alert('Error al crear usuario')
  }
}

// Abrir modal
function abrirCrear() {
  modalCrear.value = true
}

onMounted(() => {
  cargar()
})
</script>
