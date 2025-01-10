<template>
  <div class="container mt-5" v-if="isAuthenticated">
    <div class="text-center mb-5">
      <h2 class="text-primary">Welcome to {{ appName }}</h2>
      <p class="text-muted">Your personal messaging space</p>
    </div>
    <hr />
    <div class="messages-section">
      <h3 class="text-secondary mb-4">Your Messages</h3>
      <div v-if="messages.length" class="list-group">
        <div
            class="list-group-item list-group-item-action mb-2 shadow-sm"
            v-for="message in messages"
            :key="message.id"
        >
          <div class="d-flex justify-content-between">
            <h5 class="text-info">
              From: {{ message.sender ? message.sender.username : 'Sender' }}
            </h5>
            <small class="text-muted">
              {{ new Date(message.createdAt).toLocaleString() }}
            </small>
          </div>
          <p class="mt-2 mb-1">
            <strong>Message:</strong> {{ message.content }}
          </p>
          <small class="text-muted">
            Message ID: {{ message.id }}
          </small>
        </div>
      </div>
      <div v-else class="alert alert-info text-center" role="alert">
        No messages available. Start a conversation!
      </div>
    </div>
  </div>
</template>

<script>
import apiClient from "@/api";
import { logoutUser } from "@/utils/auth";

export default {
  data() {
    return {
      appName: process.env.VUE_APP_NAME,
      isAuthenticated: false,
      messages: [],
    };
  },
  created() {
    this.checkAuth();
    this.fetchMessages();
  },
  methods: {
    checkAuth() {
      this.isAuthenticated = !!localStorage.getItem("token");
      if (!this.isAuthenticated) {
        this.$router.push({ name: "LoginPage" });
      }
    },
    async fetchMessages() {
      try {
        const token = localStorage.getItem("token");
        const response = await apiClient.get("/messages?senderId=4", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        this.messages = response.data.data;
      } catch (error) {
        console.error("Error fetching messages:", error.response?.data?.message || error.message);
        if (error.response?.status === 401) {
          await logoutUser(this.$router); // Use the utility function to handle logout
        }
      }
    },
  },
};
</script>

<style>
/* Add any custom styles here */
</style>