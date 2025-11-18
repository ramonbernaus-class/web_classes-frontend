<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const nombre = ref('')
const password = ref('')
const error = ref('')
const router = useRouter()
const cargando = ref(false)

const handleSubmit = async () => {
  cargando.value = true
  try {
    const res = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: nombre.value, password: password.value })
    })
    const data = await res.json()
    
    if (res.ok) {
      localStorage.setItem('token', data.access_token)
      localStorage.setItem('usuario', JSON.stringify(data.usuario))
      router.push('/') 
    } else {
      error.value = data.detail || 'Error al iniciar sesión'
    }
  } catch (err) {
    error.value = 'Error de conexión'
  } finally {
    cargando.value = false
  }
}
</script>

<template>
  <div class="login-container">
    <h2>Iniciar sesión</h2>
    <form @submit.prevent="handleSubmit">
      <input v-model="nombre" type="nombre" placeholder="Nom" required />
      <input v-model="password" type="password" placeholder="Contraseña" required />
      <button type="submit">Entrar</button>
      <p v-if="error" class="error">{{ error }}</p>
    </form>
  </div>
</template>

<style scoped>
.login-container {
  max-width: 400px;
  margin: 60px auto;
  padding: 30px;
  border-radius: 12px;
  background: white;
  box-shadow: 0 4px 20px rgba(10, 34, 131, 0.1);
}
input {
  width: 100%;
  padding: 12px;
  margin: 10px 0;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
}
button {
  width: 100%;
  padding: 12px;
  background: #8A48E0;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
}
.error {
  color: #d32f2f;
  margin-top: 12px;
}
</style>