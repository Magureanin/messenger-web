<script lang="ts">
  import { onMount } from "svelte";
  import { push } from "svelte-spa-router";
  import "./settings.css";

  let username = $state("Загрузка...");
  let isDarkMode = $state(false);
  let activeTab = $state("profile");

  onMount(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      push("/");
      return;
    }

    const response = await fetch("http://localhost:8000/users/me", {
      headers: { "Authorization": `Bearer ${token}` }
    });
    
    if (response.ok) {
      const data = await response.json();
      username = data.username;
    }

    isDarkMode = localStorage.getItem("theme") === "dark";
    applyTheme(isDarkMode);
  });

  // Новая функция для прямой установки темы
  const setTheme = (dark: boolean) => {
    isDarkMode = dark;
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
    applyTheme(isDarkMode);
  };

  const applyTheme = (dark: boolean) => {
    if (dark) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  };
</script>

<div class="settings-container">
  <header class="settings-header">
    <button class="back-button" onclick={() => push('/chat')}>← Назад</button>
    <h2>Настройки</h2>
  </header>

  <!-- Блок с навигацией по вкладкам -->
  <nav class="tabs-nav">
    <button 
      class="tab-button {activeTab === 'profile' ? 'active' : ''}" 
      onclick={() => activeTab = 'profile'}
    >
      Профиль
    </button>
    <button 
      class="tab-button {activeTab === 'interface' ? 'active' : ''}" 
      onclick={() => activeTab = 'interface'}
    >
      Интерфейс
    </button>
    <button 
      class="tab-button {activeTab === 'security' ? 'active' : ''}" 
      onclick={() => activeTab = 'security'}
    >
      Безопасность и приватность
    </button>
  </nav>

  <main class="settings-content">
    {#if activeTab === 'profile'}
      <section class="settings-card">
        <h3>Мой профиль</h3>
        <div class="profile-info">
          <div class="user-avatar">
            {username !== "Загрузка..." ? username.charAt(0).toUpperCase() : "?"}
          </div>
          <div class="user-details">
            <span>Имя пользователя:</span>
            <strong>{username}</strong>
          </div>
        </div>
      </section>
    {/if}

    {#if activeTab === 'interface'}
      <section class="settings-card">
        <h3>Внешний вид</h3>
        <div class="setting-item">
          <span>Тема</span>
          <div class="theme-buttons">
            <button 
              class="theme-button {!isDarkMode ? 'active' : ''}" 
              onclick={() => setTheme(false)}
            >
              Светлая
            </button>
            <button 
              class="theme-button {isDarkMode ? 'active' : ''}" 
              onclick={() => setTheme(true)}
            >
              Темная
            </button>
          </div>
        </div>
      </section>
    {/if}

    {#if activeTab === 'security'}
      <section class="settings-card">
        <h3>Безопасность</h3>
        <div class="setting-item">
          <span>Смена пароля</span>
          <button class="action-button" onclick={() => alert('Открытие модалки смены пароля...')}>Изменить</button>
        </div>
      </section>
    {/if}
  </main>
</div>