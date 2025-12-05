<template>
  <div class="max-w-3xl mx-auto">
    <h1 class="text-2xl font-semibold mb-4">Control del servidor</h1>

    <div class="bg-white p-4 rounded shadow mb-4">
      <p class="text-sm text-gray-600 mb-3">Mantén el servicio despierto durante tu clase. Esto enviará pings periódicos al backend.</p>

      <div class="flex items-center gap-3">
        <button @click="start" :disabled="active" class="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-60">Activar 1h</button>
        <button v-if="active" @click="stop" class="px-3 py-2 bg-red-600 text-white rounded">Detener</button>
        <div v-if="active" class="text-sm">Tiempo restante: <strong>{{ remaining }}</strong></div>
      </div>
    </div>

    <div class="bg-white p-4 rounded shadow">
      <h2 class="text-sm font-medium mb-2">Historial de pings (últimos 20)</h2>
      <ul class="text-sm">
        <li v-for="(l, i) in logs" :key="i" class="py-1 border-b">{{ l }}</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { API_URL } from '../../api.js'

const active = ref(false)
const end = ref(null)
const logs = ref([])
let intervalId = null
const KEEP = 60*60*1000
const INTERVAL = 120000

function getToken(){ return localStorage.getItem('token') }

function addLog(msg){ logs.value.unshift(`${new Date().toLocaleString()} - ${msg}`); if (logs.value.length>20) logs.value.pop() }

async function ping(){
  try {
    await fetch(`${API_URL}/api/ping`)
    addLog('Ping OK')
  } catch (err) {
    addLog('Ping ERROR')
  }
}

function start(){
  if (active.value) return
  active.value = true
  end.value = Date.now() + KEEP
  localStorage.setItem('admin_keep_end', String(end.value))
  ping()
  intervalId = setInterval(()=> {
    if (Date.now() >= end.value) { stop(); return }
    ping()
  }, INTERVAL)
  addLog('Keep-alive iniciado')
}

function stop(){
  active.value = false
  end.value = null
  clearInterval(intervalId); intervalId = null
  localStorage.removeItem('admin_keep_end')
  addLog('Keep-alive detenido')
}

const remaining = computed(()=>{
  if (!active.value || !end.value) return '00:00:00'
  const diff = Math.max(0, end.value - Date.now())
  const h = Math.floor(diff/3600000); const m = Math.floor((diff%3600000)/60000); const s = Math.floor((diff%60000)/1000)
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
})

onMounted(()=>{
  const s = localStorage.getItem('admin_keep_end')
  if (s && Number(s)>Date.now()) {
    end.value = Number(s); active.value = true
    intervalId = setInterval(()=> {
      if (Date.now() >= end.value) { stop(); return }
      ping()
    }, INTERVAL)
  }
})
</script>
