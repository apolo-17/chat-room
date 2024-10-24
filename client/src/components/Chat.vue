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
      <!-- Input de búsqueda -->
      <input
        v-model="searchQuery"
        class="border border-gray-300 p-2 rounded-md mb-2"
        placeholder="Buscar en el chat..."
        @input="searchMessages"
      />

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
            <span v-if="msg.text" class="block text-left">
              <strong>{{ msg.username }}:</strong> {{ msg.text }}
            </span>
            <!-- Renderiza una imagen si el mensaje contiene una URL de archivo -->
            <img v-if="msg.fileUrl" :src="msg.fileUrl" class="max-w-xs my-2 rounded-md" />
            <div class="text-right text-xs text-gray-600 mt-1">
              {{ formatTimestamp(msg.timestamp) }}
            </div>
          </div>
        </div>
      </div>
      <input
        v-model="message"
        class="border border-gray-300 p-2 rounded-md mt-2 w-full"
        @keyup.enter="sendMessage"
        placeholder="Escribe un mensaje..."
      />
      <input type="file" @change="sendFile" class="mt-2" />
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
      filteredMessages: [],
      selectedFile: null,
    };
  },
  computed: {
    ...mapState(['username']),
  },
  methods: {
    async fetchMessages() {
      try {
        const response = await axios.get('http://localhost:3000/messages');
        this.messages = response.data;
        this.filteredMessages = this.messages;
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
  if (!this.username) return;

  const messageData = {
    username: this.username,
    timestamp: new Date(),
        text: this.message.trim() || '', 
      };

      
      if (this.selectedFile) {
        const formData = new FormData();
        formData.append('file', this.selectedFile);

        axios.post('http://localhost:3000/upload', formData)
          .then((response) => {
            messageData.fileUrl = response.data.fileUrl;
            socket.emit('sendMessage', messageData);
            this.selectedFile = null;
            this.message = '';
          })
          .catch((error) => {
            console.error('Error al subir el archivo:', error);
          });
      } else {
        
        socket.emit('sendMessage', messageData);
        this.message = '';
      }
    },

    async sendFile(event) {
      console.log('Enviando imagen...')
      const file = event.target.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await axios.post('http://localhost:3000/upload', formData);
        const messageData = {
          username: this.username,
          text: '', // Aquí puedes dejar el texto vacío, ya que estás enviando una imagen
          timestamp: new Date(),
          fileUrl: response.data.fileUrl // Aquí asignamos la URL del archivo
        };
        socket.emit('sendMessage', messageData);
      } catch (error) {
        console.error('Error al enviar el archivo:', error);
      }
    },
    searchMessages() {
      const query = this.searchQuery.trim().toLowerCase();
      if (query) {
        this.filteredMessages = this.messages.filter(msg =>
          (msg.text && msg.text.toLowerCase().includes(query)) ||
          (msg.username && msg.username.toLowerCase().includes(query))
        );
      } else {
        this.filteredMessages = this.messages; // Si no hay búsqueda, mostramos todos los mensajes
      }
    },
    formatTimestamp(timestamp) {
      const date = new Date(timestamp);
      return date.toLocaleString();
    },
  },
  mounted() {
  this.fetchMessages();
  socket.on('message', (message) => {
    console.log('Mensaje recibido:', message); // Verificar qué se recibe
    this.messages.push(message);
    this.filteredMessages = this.messages; // Actualizamos los mensajes filtrados
    this.$nextTick(() => {
      const messagesContainer = this.$el.querySelector('.messages');
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    });
  });
},
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
