<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { API_URL } from '../api.js'

const route = useRoute()
const router = useRouter()

// 🔹 Recoger el ejercicio_id de la URL
const ejercicioId = Number(route.query.ejercicio_id || route.params.ejercicioId)

const codigo = ref('')
const mensaje = ref('')
const cargando = ref(false)
const usuario = ref(null)


onMounted(async () => {
  const data = localStorage.getItem('usuario')

  if (!data) {
    router.push('/login')
    return
  }

  usuario.value = JSON.parse(data)

  try {
    categorias.value = await apiGET("/api/categorias")
  } catch (e) {
    console.error("Error cargando categorías:", e)
  }
})

// 🔹 Enviar entrega
const enviarEntrega = async () => {
  if (!codigo.value.trim()) {
    mensaje.value = 'Debes escribir algún código.'
    return
  }

  if (!usuario.value) {
    mensaje.value = 'Debes iniciar sesión para enviar entregas.'
    return
  }

  cargando.value = true
  mensaje.value = ''

  try {
    const token = localStorage.getItem("token")

    const res = await fetch(`${API_URL}/entregas`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        usuario_id: usuario.value.id,
        ejercicio_id: ejercicioId,
        codigo: codigo.value
      })
    })

    const data = await res.json()

    if (!res.ok) {
      mensaje.value = data.detail || 'Error al enviar el ejercicio'
    } else {
      mensaje.value = data.mensaje || 'Entrega enviada correctamente'
      codigo.value = ''
    }
  } catch (err) {
    mensaje.value = 'Error de conexión con el servidor'
  } finally {
    cargando.value = false
  }
}
</script>

<template>
  <div class="entrega-container">
    <h2>Enviar ejercicio</h2>

    <p v-if="!ejercicioId" class="warning">
      No se ha especificado ningún ejercicio.
    </p>

    <textarea
      v-model="codigo"
      rows="12"
      placeholder="Escribe o pega tu código aquí..."
    />

    <br />

    <button @click="enviarEntrega" :disabled="cargando">
      {{ cargando ? "Enviando..." : "Enviar" }}
    </button>

    <p class="mensaje">{{ mensaje }}</p>

    <RouterLink to="/">
      <button class="volver-btn">⬅ Tornar al menú</button>
    </RouterLink>
  </div>
</template>

<style scoped>
.entrega-container {
  max-width: 700px;
  margin: 2rem auto;
  text-align: center;
  font-family: 'Segoe UI', sans-serif;
}

textarea {
  width: 100%;
  padding: 12px;
  font-family: monospace;
  font-size: 1rem;
  border-radius: 8px;
  border: 2px solid #ccc;
  transition: 0.2s;
}

textarea:focus {
  border-color: #8A48E0;
  outline: none;
}

button {
  background: #8A48E0;
  color: white;
  padding: 10px 18px;
  border: none;
  border-radius: 8px;
  margin-top: 14px;
  cursor: pointer;
  font-weight: 600;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.volver-btn {
  background: #444;
  margin-top: 10px;
}

.mensaje {
  margin-top: 12px;
  font-weight: 600;
}

.warning {
  color: #e74c3c;
  font-weight: bold;
}
</style>

