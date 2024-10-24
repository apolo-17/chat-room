<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-gray-100">
    <div v-if="!username" class="mb-4">
      <input
        v-model="usernameInput"
        class="border border-gray-300 p-2 rounded-md"
        placeholder="Ingresa tu nombre"
        @keyup.enter="setUsername"
      />
    </div>
    <div v-else class="bg-white rounded-lg shadow-lg p-4 w-11/12 md:w-1/2 flex flex-col">
      <!-- Contenedor de mensajes -->
      <div class="messages h-80 overflow-y-auto bg-gray-100 p-2 rounded-md">
        <div
          v-for="msg in filteredMessages"
          :key="msg._id"
          :class="{'text-left': msg.username !== username, 'text-right': msg.username === username}"
        >
          <div
            class="inline-block p-2 rounded-lg mb-2"
            :class="msg.username === username ? 'ml-24 bg-green-500 text-white' : 'mr-24 bg-gray-300 text-black'"
          >
            <span class="block text-left">
              <strong>{{ msg.username }}:</strong> 
              <!-- Verificar si el mensaje es un archivo o texto -->
              <span v-if="isFileUrl(msg.text)">
                <a :href="msg.text" target="_blank">Ver archivo</a>
              </span>
              <span v-else>{{ msg.text }}</span>
            </span>
            <div class="text-right text-xs text-gray-600 mt-1">
              {{ formatTimestamp(msg.timestamp) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Input de mensaje -->
      <input
        v-model="message"
        class="border border-gray-300 p-2 rounded-md mt-2 w-full"
        @keyup.enter="sendMessage"
        placeholder="Escribe un mensaje..."
      />

      <!-- Input de búsqueda -->
      <input
        v-model="searchQuery"
        class="border border-gray-300 p-2 rounded-md mt-2 w-full"
        placeholder="Buscar mensajes..."
      />
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import io from 'socket.io-client';
import axios from 'axios';

const socket = io('http://localhost:3000');

export default {
  data() {
    return {
      messages: [],
      message: '',
      usernameInput: '',
      searchQuery: '',
    };
  },
  computed: {
    ...mapState(['username']),
    filteredMessages() {
      if (this.searchQuery) {
        return this.messages.filter(msg =>
          msg.text.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
      }
      return this.messages;
    }
  },
  methods: {
    async fetchMessages() {
      try {
        const response = await axios.get('http://localhost:3000/messages');
        this.messages = response.data;
      } catch (error) {
        console.error('Error al obtener mensajes:', error);
      }
    },
    setUsername() {
      if (this.usernameInput.trim() === '') return;
      this.$store.commit('setUsername', this.usernameInput);
      this.usernameInput = '';
    },
    sendMessage() {
      if (this.message.trim() === '' || !this.username) return;

      const messageData = {
        username: this.username,
        text: this.message,
        timestamp: new Date(),
      };

      socket.emit('sendMessage', messageData);
      this.message = ''; 
    },
    isFileUrl(text) {
      return text.startsWith('http');
    },
    formatTimestamp(timestamp) {
      const date = new Date(timestamp);
      return date.toLocaleString();
    }
  },
  mounted() {
    this.fetchMessages();
    socket.on('message', (message) => {
      this.messages.push(message);
      this.$nextTick(() => {
        const messagesContainer = this.$el.querySelector('.messages');
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      });
    });
  }
};
</script>

<style scoped>
.messages {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #ccc;
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
}
</style>
