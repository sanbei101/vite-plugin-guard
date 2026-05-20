<template>
  <div v-if="!isPassed" class="password-guard-overlay">
    <div class="glass-card">
      <div class="lock-icon">🔒</div>
      <h2>项目已受保护</h2>
      <p class="desc">请输入访问密码以继续浏览</p>

      <div class="input-box">
        <input
          type="password"
          v-model="inputPwd"
          placeholder="请输入密码"
          @keydown.enter="verify"
        />
        <button @click="verify">解锁</button>
      </div>
      <p v-if="errorMsg" class="error">{{ errorMsg }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
const props = defineProps<{ passwordHash: string }>();

const inputPwd = ref("");
const errorMsg = ref("");
const isPassed = ref(sessionStorage.getItem("__guard_passed__") === "true");

async function computeSHA256(message: string) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

const verify = async () => {
  const inputHash = await computeSHA256(inputPwd.value);

  if (inputHash === props.passwordHash) {
    sessionStorage.setItem("__guard_passed__", "true");
    isPassed.value = true;
    location.reload();
  } else {
    errorMsg.value = "❌ 密码错误!";
    inputPwd.value = "";
  }
};
</script>

<style scoped>
.password-guard-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: radial-gradient(circle at center, #242430 0%, #0f0f15 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999999;
  font-family: sans-serif;
  color: white;
}
.glass-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 40px;
  border-radius: 20px;
  text-align: center;
  width: 320px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
}
.lock-icon {
  font-size: 40px;
  margin-bottom: 15px;
}
h2 {
  margin: 0 0 10px 0;
  font-size: 22px;
}
.desc {
  color: #888;
  font-size: 14px;
  margin-bottom: 25px;
}
.input-box {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
input {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 12px;
  border-radius: 8px;
  color: white;
  text-align: center;
  font-size: 16px;
  outline: none;
}
input:focus {
  border-color: #646cff;
}
button {
  background: #646cff;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  font-size: 16px;
}
button:hover {
  background: #535bf2;
}
.error {
  color: #ff4d4f;
  font-size: 13px;
  margin-top: 10px;
}
</style>
