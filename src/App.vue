<script setup>
import { ref, onMounted } from "vue"
import { API_URL } from "./api.js"

const serverReady = ref(false)
const serverError = ref(false)

// Comprueba si el backend está despierto
const checkBackend = async () => {
  try {
    const res = await fetch(`${API_URL}/categorias`, {
    method: "GET",
    headers: { "Authorization": `Bearer ${localStorage.getItem('token') || ''}` }
  })


    serverReady.value = res.ok
  } catch (err) {
    serverReady.value = false
  }
}

onMounted(async () => {
  // Reintenta durante unos segundos mientras Render despierta
  for (let i = 0; i < 10; i++) {
    await checkBackend()
    if (serverReady.value) break
    await new Promise(r => setTimeout(r, 1000)) // esperar 1s
  }

  if (!serverReady.value) serverError.value = true
})
</script>

<template>
  <div v-if="!serverReady && !serverError" class="loading-screen">
  <h2>Carregant servidor...</h2>
  <p>Pot tardar uns segons si el servidor està despertant.</p>
</div>

<div v-else-if="serverError" class="error-screen">
  <h2>No s'ha pogut connectar amb el servidor</h2>
  <p>Torna-ho a intentar en uns segons.</p>
</div>
<router-view v-else />

</template>

<style>
.loading-screen,
.error-screen {
  position: fixed;
  inset: 0;
  background: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-family: 'Segoe UI', sans-serif;
  color: #0A2283;
  text-align: center;
  padding: 20px;
  z-index: 9999;
}

.loading-screen h2,
.error-screen h2 {
  font-size: 1.8rem;
  margin-bottom: 10px;
}

.loading-screen p,
.error-screen p {
  font-size: 1rem;
  opacity: 0.7;
}

</style>