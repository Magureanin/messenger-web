<script lang="ts">
  import { push } from "svelte-spa-router";
  import "./login.css";

  let username = $state("");
  let password = $state("");
  
  // Переменная для отображения статуса
  let errorMessage = $state("");

  async function handleLogin(event: Event) {
    event.preventDefault(); 
    
    // Очищаем старую ошибку
    errorMessage = ""; 

    try {
      // Сервер требует специальный класс URLSearchParams
      const formData = new URLSearchParams();
      formData.append("username", username);
      formData.append("password", password);

      // Делаем запрос
      const response = await fetch("http://localhost:8000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Неверный логин или пароль");
      }

      const data = await response.json();
      
      // Сохраняем токен
      localStorage.setItem("token", data.access_token);
      
      console.log("Успешная авторизация!");
      
      // Выполняем программный переход на страницу чата
      push("/chat");

    } catch (error: any) {
      errorMessage = error.message;
      console.error("Произошла ошибка:", error);
    }
  }
</script>

<div class="login-container">
  <h2>Вход в систему</h2>
  <form onsubmit={handleLogin}>
    
    <!-- Показываем сообщение об ошибке если она есть -->
    {#if errorMessage}
      <div style="color: red; margin-bottom: 10px;">{errorMessage}</div>
    {/if}

    <div class="form-group">
      <label for="username">Имя пользователя</label>
      <input
        type="text"
        id="username"
        bind:value={username}
        placeholder="Введите имя пользователя"
        required
      />
    </div>
    <div class="form-group">
      <label for="password">Пароль</label>
      <input
        type="password"
        id="password"
        bind:value={password}
        placeholder="Введите пароль"
        required
      />
    </div>
    <button type="submit">Войти</button>
  </form>
</div>