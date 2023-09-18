<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>ID Scanner</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-list>
        <ion-item v-for="card in scannedCards">
          <ion-thumbnail slot="start">
            <img style="object-fit: contain;" alt="idcard" :src="card.frontImage" />
          </ion-thumbnail>
          <ion-label> {{ card.info.GivenName + " " + card.info.Surname }} </ion-label>
          <ion-button size="small" slot="end">Delete</ion-button>
        </ion-item>
      </ion-list>
    </ion-content>
    <ion-footer>
      <div class="toolbar">
        <button class="shutter-button round" @click="scan">Scan</button>
      </div>
    </ion-footer>
  </ion-page>
</template>

<script setup lang="ts">
import { IDCardManager, ScannedIDCard } from '@/utils/IDCardManager';
import { IonContent, IonHeader, IonPage, IonButton, IonList, IonThumbnail, IonItem, IonLabel, IonTitle, IonToolbar, IonFooter, useIonRouter } from '@ionic/vue';
import { onMounted, ref } from 'vue';

const scannedCards = ref<ScannedIDCard[]>([]);
const router = useIonRouter();
let manager = new IDCardManager();

onMounted(async ()=> {
  scannedCards.value = await manager.listIDCards();
})

const scan = () => {
  router.push("/scanner")
}


</script>

<style scoped>
.shutter-button {
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

.shutter-button:hover {
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
