<template>
  <div class="admin-dashboard">

    <h1>Panel de Control</h1>

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
    <h2>Últimas entregas</h2>
    <table v-if="stats.ultimas_entregas.length > 0">
      <thead>
        <tr>
          <th>Usuario</th>
          <th>Ejercicio</th>
          <th>Fecha</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="e in stats.ultimas_entregas" :key="e.fecha_envio">
          <td>{{ e.usuario }}</td>
          <td>{{ e.ejercicio }}</td>
          <td>{{ formatearFecha(e.fecha_envio) }}</td>
        </tr>
      </tbody>
    </table>

    <p v-else>No hay entregas recientes.</p>

  </div>
</template>

<script>
export default {
  data() {
    return {
      API: "https://web-classes-backend.onrender.com",
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
      const res = await fetch(`${this.API}/api/admin/estadisticas`, {
        headers: { Authorization: "Bearer " + this.getToken() }
      })

      if (res.ok) {
        this.stats = await res.json()
      } else {
        alert("No autorizado o error cargando estadísticas")
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
  max-width: 900px;
  margin: 20px auto;
}

.cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
  margin-bottom: 40px;
}

.card {
  background: #f4f4f4;
  padding: 16px;
  text-align: center;
  border-radius: 6px;
  border: 1px solid #ddd;
}

.card h2 {
  font-size: 28px;
  margin: 0;
}

.card p {
  margin: 0;
  color: #444;
  font-size: 14px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  border: 1px solid #ccc;
  padding: 6px;
}

th {
  background: #eee;
}
</style>
