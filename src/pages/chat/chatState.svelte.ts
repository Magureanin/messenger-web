// chatState.svelte.ts
import { push } from "svelte-spa-router";

export class ChatState {
  myId = $state(0); 
  messageText = $state("");
  selectedContactId = $state<number | null>(null);

  contacts = $state<any[]>([]);
  messages = $state<any[]>([]);

  constructor () {
    
  }

  getToken = () => {
    if (typeof window !== "undefined" && window.localStorage) {
      return localStorage.getItem("token");
    }
    return null;
  };

  loadInitialData = async () => {
    const token = this.getToken();
    if (!token) return;

    const meResponse = await fetch("http://localhost:8000/users/me", {
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (meResponse.ok) {
      const meData = await meResponse.json();
      this.myId = meData.id;
    }

    const contactsResponse = await fetch("http://localhost:8000/contacts", {
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (contactsResponse.ok) {
      this.contacts = await contactsResponse.json();
    }
  };

  selectContact = async (id: number) => {
    this.selectedContactId = id;
    const token = this.getToken();
    
    if (!token) return;

    const response = await fetch(`http://localhost:8000/messagesGet?idcompanion=${id}`, {
      headers: { "Authorization": `Bearer ${token}` }
    });

    if (response.ok) {
      this.messages = await response.json();
      await this.markAsRead(id);
    }
  };

  markAsRead = async (contactId: number) => {
    const token = this.getToken();
    if (!token) return;

    const unreadMessages = this.messages.filter(
      (msg) => msg.id_sender === contactId && msg.status !== 'read'
    );

    if (unreadMessages.length === 0) return;

    const response = await fetch(`http://localhost:8000/messagesMarkRead`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ id_sender: contactId })
    });

    if (response.ok) {
      this.messages = this.messages.map(msg => {
        if (msg.id_sender === contactId && msg.status !== 'read') {
          return { ...msg, status: 'read' };
        }
        return msg;
      });
    }
  };

  sendMessage = async () => {
    if (this.messageText.trim() === "" || !this.selectedContactId) return;

    const token = this.getToken();
    const contentToSend = this.messageText;
    
    this.messageText = "";

    const response = await fetch("http://localhost:8000/messagesCreate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        id_receiver: this.selectedContactId,
        content: contentToSend
      })
    });

    if (response.ok) {
      const newMessage = await response.json();
      this.messages.push(newMessage);
    }
  };

  get filteredMessages() {
    return this.messages;
  }

  logout = async () => {
    localStorage.removeItem("token");
    push("/");
  }
}