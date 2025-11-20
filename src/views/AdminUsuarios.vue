<template>
  <div class="admin-container">
    <h1>Administración de Usuarios</h1>

    <!-- FORMULARIO CREAR USUARIO -->
    <div class="crear-usuario">
      <h2>Crear usuario nuevo</h2>

      <input v-model="nuevo.email" type="text" placeholder="Email" />
      <input v-model="nuevo.nombre" type="text" placeholder="Nombre" />
      <input v-model="nuevo.password" type="password" placeholder="Contraseña" />

      <button @click="crearUsuario">Crear usuario</button>
    </div>

    <hr />

    <!-- LISTA DE USUARIOS -->
    <h2>Usuarios</h2>

    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Email</th>
          <th>Nombre</th>
          <th>Rol</th>
          <th>Acciones</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="u in usuarios" :key="u.id">
          <td>{{ u.id }}</td>
          <td>{{ u.email }}</td>
          <td>{{ u.nombre }}</td>
          <td>
            <select v-model="u.rol" @change="cambiarRol(u)">
              <option value="admin">admin</option>
              <option value="alumno">alumno</option>
            </select>
          </td>
          <td>
            <button @click="resetearPassword(u.id)">Reset pass</button>
            <button @click="borrar(u.id)">Borrar</button>
          </td>
        </tr>
      </tbody>
    </table>

  </div>
</template>

<script>
export default {
  data() {
    return {
      API: "https://web-classes-backend.onrender.com",
      usuarios: [],
      nuevo: {
        email: "",
        nombre: "",
        password: ""
      }
    }
  },

  async mounted() {
    await this.cargarUsuarios()
  },

  methods: {
    getToken() {
      return localStorage.getItem("token")
    },

    async cargarUsuarios() {
      const res = await fetch(`${this.API}/api/admin/usuarios`, {
        headers: { Authorization: "Bearer " + this.getToken() }
      })

      if (!res.ok) {
        alert("No autorizado o error obteniendo usuarios.")
        return
      }

      this.usuarios = await res.json()
    },

    async borrar(id) {
      if (!confirm("¿Seguro que quieres borrar este usuario?")) return

      const res = await fetch(`${this.API}/api/admin/usuarios/${id}`, {
        method: "DELETE",
        headers: { Authorization: "Bearer " + this.getToken() }
      })

      if (res.ok) {
        this.usuarios = this.usuarios.filter(u => u.id !== id)
      } else {
        alert("Error al borrar usuario")
      }
    },

    async crearUsuario() {
      if (!this.nuevo.email || !this.nuevo.nombre || !this.nuevo.password) {
        alert("Faltan datos")
        return
      }

      const params = new URLSearchParams()
      params.append("email", this.nuevo.email)
      params.append("nombre", this.nuevo.nombre)
      params.append("password", this.nuevo.password)

      const res = await fetch(`${this.API}/api/admin/usuarios`, {
        method: "POST",
        headers: {
          "Authorization": "Bearer " + this.getToken(),
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: params
      })

      if (res.ok) {
        alert("Usuario creado correctamente")
        this.nuevo = { email: "", nombre: "", password: "" }
        this.cargarUsuarios()
      } else {
        alert("Error creando usuario")
      }
    },

    async cambiarRol(usuario) {
      const params = new URLSearchParams()
      params.append("nuevo_rol", usuario.rol)

      const res = await fetch(`${this.API}/api/admin/usuarios/${usuario.id}/rol`, {
        method: "PUT",
        headers: {
          Authorization: "Bearer " + this.getToken(),
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: params
      })

      if (!res.ok) {
        alert("Error cambiando rol")
      }
    },

    async resetearPassword(id) {
      const nueva = prompt("Nueva contraseña:")

      if (!nueva) return

      const params = new URLSearchParams()
      params.append("new_password", nueva)

      const res = await fetch(`${this.API}/api/admin/usuarios/${id}/password`, {
        method: "PUT",
        headers: {
          Authorization: "Bearer " + this.getToken(),
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: params
      })

      if (res.ok) {
        alert("Contraseña reseteada")
      } else {
        alert("Error al resetear contraseña")
      }
    }
  }
}
</script>

<style>
.admin-container {
  max-width: 900px;
  margin: 20px auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 16px;
}
table th, table td {
  border: 1px solid #ccc;
  padding: 6px;
  text-align: left;
}
table th {
  background: #f0f0f0;
}

.crear-usuario {
  margin-bottom: 20px;
}
.crear-usuario input {
  margin: 4px;
  padding: 6px;
}
.crear-usuario button {
  margin-left: 4px;
}
</style>
