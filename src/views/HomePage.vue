<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>ID Scanner</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
    </ion-content>
    <ion-footer>
      <div class="toolbar">
        <button class="button round" @click="scan">Scan</button>
      </div>
    </ion-footer>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonFooter, useIonRouter } from '@ionic/vue';

const router = useIonRouter();

const scan = () => {
  router.push("/scanner")
}
</script>

<style scoped>
.button {
  background-color: #3880ff;
  border: none;
  color: white;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  width: 50px;
  height: 50px;
  transform: translateY(-10px);
}

.button:hover {
  background-color: #79a8f9;
}

.round{
  border-radius: 50%;
}

.toolbar {
  display: flex;
  justify-content: center;
  height: 40px;
}
</style>
