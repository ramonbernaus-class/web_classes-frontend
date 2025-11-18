<script setup>
import { ref } from 'vue'

const codigo = ref('')
const mensaje = ref('')
const cargando = ref(false)

// El usuario logueado y ejercicio pueden venir del localStorage o de props
const usuario = JSON.parse(localStorage.getItem('usuario'))
const ejercicioId = 1 // <-- más adelante lo harás dinámico

const enviarEntrega = async () => {
  cargando.value = true
  mensaje.value = ''
  try {
    const res = await fetch('${API_URL}/entregas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        usuario_id: usuario.id,
        ejercicio_id: ejercicioId,
        codigo: codigo.value
      })
    })
    const data = await res.json()
    mensaje.value = data.mensaje || 'Envío realizado'
  } catch (e) {
    mensaje.value = 'Error al enviar'
  } finally {
    cargando.value = false
  }
}
</script>

<template>
  <div class="entrega-container">
    <h2>Enviar ejercicio</h2>
    <textarea v-model="codigo" rows="10" cols="60" placeholder="Pega tu código aquí..."></textarea>
    <br />
    <button @click="enviarEntrega" :disabled="cargando">Enviar</button>
    <p>{{ mensaje }}</p>
    <RouterLink to="/">
    <button class="volver-btn">⬅ Tornar al menú</button>
    </RouterLink>
  </div>
</template>

<style scoped>
.entrega-container {
  max-width: 600px;
  margin: 2rem auto;
  text-align: center;
}
textarea {
  width: 100%;
  padding: 10px;
  font-family: monospace;
}
</style>
