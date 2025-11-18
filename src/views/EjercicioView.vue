<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { marked } from 'marked'

const route = useRoute()
const router = useRouter()
const categoriaId = computed(() => Number(route.params.categoriaId))
const nivel = computed(() => route.params.nivel)

const ejercicios = ref([])
const currentIndex = ref(0)
const loading = ref(true)
const mostrarSolucion = ref(false)

const cargarEjercicios = async () => {
  try {
    const res = await fetch('/api/ejercicios')
    if (!res.ok) throw new Error('Error al cargar ejercicios')
    const todos = await res.json()

    ejercicios.value = todos
      .filter(ej => 
        ej.categoria_id === categoriaId.value && 
        ej.dificultad === nivel.value
      )
      .map(ej => ({
        ...ej,
        enunciadoHtml: marked.parse(ej.enunciado || ''),
        solucionHtml: marked.parse(ej.solucion || '')
      }))

    currentIndex.value = 0
  } catch (err) {
    console.error('Error al cargar ejercicios:', err)
    router.push('/')
  } finally {
    loading.value = false
  }
}

const ejercicioActual = computed(() => {
  return ejercicios.value[currentIndex.value] || null
})

const toggleSolucion = () => {
  mostrarSolucion.value = !mostrarSolucion.value
}

const irAIndice = (index) => {
  if (index >= 0 && index < ejercicios.value.length) {
    currentIndex.value = index
    mostrarSolucion.value = false
  }
}

const volver = () => {
  router.push('/')
}

onMounted(cargarEjercicios)
</script>

<template>
  <div class="ejercicio-vista">
    <button @click="volver" class="btn-volver">← Categorías</button>

    <div v-if="loading">
      <div class="skeleton-loader"></div>
    </div>

    <div v-else-if="!ejercicioActual">
      <p class="mensaje-vacio">No hay ejercicios para esta categoría y nivel.</p>
    </div>

    <div v-else>
      <h2>{{ ejercicioActual.titulo }}</h2>
      <div class="enunciado" v-html="ejercicioActual.enunciadoHtml"></div>

      <button @click="toggleSolucion" class="btn-toggle">
        {{ mostrarSolucion ? 'Ocultar solución' : 'Mostrar solución' }}
      </button>

      <div v-if="mostrarSolucion" class="solucion" v-html="ejercicioActual.solucionHtml"></div>

      <div class="navegacion">
        <button 
          @click="irAIndice(currentIndex - 1)" 
          :disabled="currentIndex === 0"
          class="btn-nav btn-nav--prev"
        >
          ← Anterior
        </button>
        <span class="contador">
          {{ currentIndex + 1 }} / {{ ejercicios.length }}
        </span>
        <button 
          @click="irAIndice(currentIndex + 1)" 
          :disabled="currentIndex >= ejercicios.length - 1"
          class="btn-nav btn-nav--next"
        >
          Siguiente →
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ejercicio-vista {
  padding: 32px 24px;
  max-width: 860px;
  margin: 0 auto;
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
  background: white;
  border-radius: 16px;
  box-shadow: 0 6px 24px rgba(10, 34, 131, 0.1);
}

h2 {
  color: #0A2283;
  font-weight: 800;
  margin-bottom: 24px;
  font-size: 1.75rem;
  line-height: 1.3;
}

.enunciado {
  line-height: 1.65;
  color: #333;
  margin-bottom: 28px;
  font-size: 1.08rem;
}

.btn-volver {
  background: #f8f6ff;
  color: #8A48E0;
  border: 1px solid #e0d7f5;
  padding: 9px 18px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  margin-bottom: 28px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
}

.btn-volver:hover {
  background: #efe6ff;
  border-color: #d0c0f0;
}

.btn-toggle {
  margin: 24px 0;
  padding: 12px 24px;
  background: #8A48E0;
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1.05rem;
  transition: background 0.2s ease, transform 0.15s ease;
  box-shadow: 0 4px 10px rgba(138, 72, 224, 0.28);
}

.btn-toggle:hover:not(:disabled) {
  background: #7a3ed5;
  transform: translateY(-2px);
}

.solucion {
  background: #f9f7ff;
  color: #0A2283;
  padding: 22px;
  border-radius: 12px;
  margin: 24px 0;
  overflow-x: auto;
  font-family: 'Fira Code', 'Consolas', monospace;
  white-space: pre-wrap;
  font-size: 0.98rem;
  border: 1px solid #eae6f5;
  box-shadow: inset 0 2px 4px rgba(138, 72, 224, 0.08);
}

.navegacion {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 36px;
  gap: 16px;
}

.contador {
  background: #B493E0;
  color: #4a3a7a;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.95rem;
  min-width: 80px;
  text-align: center;
}

.btn-nav {
  flex: 1;
  padding: 14px;
  border: none;
  border-radius: 14px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1.05rem;
  transition: all 0.25s ease;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
}

.btn-nav--prev {
  background: #5B75C1;
  color: white;
  box-shadow: 0 4px 12px rgba(91, 117, 193, 0.3);
}

.btn-nav--next {
  background: #8A48E0;
  color: white;
  box-shadow: 0 4px 12px rgba(138, 72, 224, 0.3);
}

.btn-nav--prev:hover:not(:disabled),
.btn-nav--next:hover:not(:disabled) {
  transform: translateY(-3px);
  filter: brightness(1.08);
}

.btn-nav:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.mensaje-vacio {
  text-align: center;
  color: #5a4a7a;
  font-size: 1.15rem;
  padding: 32px 0;
}

/* Skeleton loader (opcional) */
.skeleton-loader {
  height: 200px;
  background: linear-gradient(90deg, #f0eaff 25%, #e0d7f5 50%, #f0eaff 75%);
  background-size: 200% 100%;
  border-radius: 12px;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Responsive */
@media (max-width: 650px) {
  .navegacion {
    flex-direction: column;
  }
  .btn-nav {
    width: 100%;
    margin-bottom: 10px;
  }
  .contador {
    order: -1;
    margin-bottom: 12px;
  }
}
</style>
