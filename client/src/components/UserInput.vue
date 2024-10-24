<template>
    <div class="user-input">
      <h2>Ingresa tu nombre de usuario</h2>
      <input type="text" v-model="username" placeholder="Tu nombre" />
      <button @click="submitUsername">Iniciar Chat</button>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        username: '',
      };
    },
    methods: {
      submitUsername() {
        if (this.username.trim()) {
          localStorage.setItem('username', this.username);
          this.$router.push('/chat');
        }
      },
    },
  };
  </script>
  