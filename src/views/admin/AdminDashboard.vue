<template>
  <div class="admin-dashboard">

    <h1 class="title">Panel de Control</h1>

    <!-- LOADING -->
    <div v-if="loading" class="loading">Cargando estadísticas...</div>

    <div v-else>
      <!-- TARJETAS -->
      <div class="cards">
        <div class="card">
          <h2>{{ stats.usuarios }}</h2>
          <p>Usuarios totales</p>
        </div>

        <div class="card">
          <h2>{{ stats.admins }}</h2>
          <p>Admins</p>
        </div>

        <div class="card">
          <h2>{{ stats.alumnos }}</h2>
          <p>Alumnos</p>
        </div>

        <div class="card">
          <h2>{{ stats.categorias }}</h2>
          <p>Categorías</p>
        </div>

        <div class="card">
          <h2>{{ stats.ejercicios }}</h2>
          <p>Ejercicios</p>
        </div>

        <div class="card">
          <h2>{{ stats.entregas }}</h2>
          <p>Entregas</p>
        </div>
      </div>

      <!-- ÚLTIMAS ENTREGAS -->
      <h2 class="subtitulo">Últimas entregas</h2>

      <table v-if="stats.ultimas_entregas.length > 0" class="tabla">
        <thead>
          <tr>
            <th>Usuario</th>
            <th>Ejercicio</th>
            <th>Fecha</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="e in stats.ultimas_entregas" :key="e.id">
            <td>{{ e.usuario }}</td>
            <td>{{ e.ejercicio }}</td>
            <td>{{ formatearFecha(e.fecha_envio) }}</td>
          </tr>
        </tbody>
      </table>

      <p v-else>No hay entregas recientes.</p>

    </div>

  </div>
</template>

<script>
export default {
  data() {
    return {
      API: "https://web-classes-backend.onrender.com",
      loading: true,
      stats: {
        usuarios: 0,
        admins: 0,
        alumnos: 0,
        categorias: 0,
        ejercicios: 0,
        entregas: 0,
        ultimas_entregas: []
      }
    }
  },

  async mounted() {
    await this.cargarEstadisticas()
  },

  methods: {
    getToken() {
      return localStorage.getItem("token")
    },

    async cargarEstadisticas() {
      try {
        const res = await fetch(`${this.API}/api/admin/estadisticas`, {
          headers: { Authorization: "Bearer " + this.getToken() }
        })

        if (!res.ok) throw new Error()

        this.stats = await res.json()
      } catch (err) {
        alert("No autorizado o error cargando estadísticas")
      } finally {
        this.loading = false
      }
    },

    formatearFecha(fecha) {
      return new Date(fecha).toLocaleString()
    }
  }
}
</script>

<style>
.admin-dashboard {
  max-width: 1000px;
  margin: 20px auto;
  padding: 20px;
}

.title {
  text-align: center;
  margin-bottom: 25px;
}

.loading {
  text-align: center;
  padding: 20px;
  font-size: 18px;
}

.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 18px;
  margin-bottom: 40px;
}

.card {
  background: #fafafa;
  padding: 22px;
  text-align: center;
  border-radius: 10px;
  border: 1px solid #e3e3e3;
  box-shadow: 0 2px 6px rgba(0,0,0,0.06);
  transition: 0.2s ease;
}

.card:hover {
  transform: translateY(-3px);
  box-shadow: 0 3px 10px rgba(0,0,0,0.10);
}

.card h2 {
  font-size: 32px;
  margin: 0;
  font-weight: bold;
}

.card p {
  margin: 0;
  color: #555;
  font-size: 15px;
}

.subtitulo {
  margin-bottom: 12px;
  margin-top: 20px;
}

.tabla {
  width: 100%;
  border-collapse: collapse;
}

.tabla th {
  background: #f1f1f1;
  text-align: left;
  padding: 10px;
  font-weight: bold;
}

.tabla td {
  padding: 8px 10px;
  border-bottom: 1px solid #ddd;
}
</style>
