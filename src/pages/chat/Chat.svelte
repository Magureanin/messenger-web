<!-- Chat.svelte -->
<script lang="ts">
  import { onMount, tick } from "svelte";
  import { push } from "svelte-spa-router";
  import { fly } from "svelte/transition";
  import { ChatState } from "./chatState.svelte";
  import "./chat.css";

  const chat = new ChatState();
  
  let messagesContainer = $state<HTMLDivElement>();

  onMount(() => {
    if (!chat.getToken()) {
      push("/");
      return;
    }
    chat.loadInitialData();
  });

  $effect(() => {
    if (chat.filteredMessages.length) {
      tick().then(() => {
        if (messagesContainer) {
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
      });
    }
  });
</script>

<div class="app-container">
  <aside class="sidebar">
    <header class="sidebar-header">Контакты</header>
    
    {#if chat.contacts.length === 0}
      <div class="empty-state">Пусто</div>
    {:else}
      <nav class="contacts-list">
        {#each chat.contacts as contact (contact.id)}
          <button 
            class="contact-item"
            class:active={chat.selectedContactId === contact.id}
            onclick={() => chat.selectContact(contact.id)}
          >
            <div class="contact-avatar">
              {contact.username.charAt(0).toUpperCase()}
            </div>
            
            <div class="contact-details">
              <span class="contact-name">{contact.username}</span>
              <span class="contact-status">В сети</span> 
            </div>
          </button>
        {/each}
      </nav>
    {/if}

    <footer class="sidebar-actions">
      <button class="settings-button" onclick={() => alert('Открытие настроек...')}>Настройки</button>
      <button class="logout-button" onclick={chat.logout}>Выйти</button>
    </footer>
  </aside>

  <main class="chat-container">
    {#if chat.selectedContactId}
      <div class="messages-list" bind:this={messagesContainer}>
        {#each chat.filteredMessages.slice().sort((a, b) => a.id - b.id) as msg (msg.id)}
          <div 
            class="message {msg.id_sender === chat.myId ? 'mine' : 'theirs'}"
            in:fly={{ y: 20, duration: 300 }}
          >
            <div class="message-content">
              {msg.content}
            </div>
            
            <div class="message-meta">
              <span class="message-time">12:34</span> 
              
              {#if msg.id_sender === chat.myId}
                <span class="message-status">
                  {#if msg.status === 'read'}
                    ✓✓
                  {:else if msg.status === 'sent'}
                    ✓
                  {:else}
                    🕒
                  {/if}
                </span>
              {/if}
            </div>
          </div>
        {/each}
      </div>

      <div class="input-area">
        <input
          type="text"
          bind:value={chat.messageText}
          placeholder="Введите сообщение..."
          onkeydown={(e) => e.key === "Enter" && chat.messageText.trim() && chat.sendMessage()}
        />
        <button 
          onclick={chat.sendMessage}
          disabled={!chat.messageText.trim()}
        >
          Отправить
        </button>
      </div>
    {:else}
      <div class="no-chat-selected">
        Выберите собеседника слева.
      </div>
    {/if}
  </main>
</div>