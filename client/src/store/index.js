import { createStore } from 'vuex';

export default createStore({
  state: {
    username: null,
  },
  mutations: {
    setUsername(state, username) {
      state.username = username;
    },
  },
});
