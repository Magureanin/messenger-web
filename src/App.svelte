<script lang="ts">
  import Router from "svelte-spa-router";
  import Login from './pages/Authentication/login/login.svelte';
  import Chat from './pages/chat/Chat.svelte';

// Определяем наши routes
  const routes = {
    "/": Login,
    "/chat": Chat,
  };
</script>

<Router {routes} />