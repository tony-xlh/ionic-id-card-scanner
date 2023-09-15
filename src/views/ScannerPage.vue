<template>
  <ion-page :class="showScanner?'hidden':''">
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>ID Scanner</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-list>
        <ion-item-group>
          <ion-item-divider>
            <ion-label> Front </ion-label>
          </ion-item-divider>
          <ion-item>
            <img alt="front" :src="frontImageBase64" v-if="frontImageBase64"/>
            <ion-button v-if="!frontImageBase64" @click="captureFront">
              Add Front Image
            </ion-button>
          </ion-item>
        </ion-item-group>

        <ion-item-group>
          <ion-item-divider>
            <ion-label> Back </ion-label>
          </ion-item-divider>
          <ion-item>
            <img alt="back" :src="backImageBase64" v-if="backImageBase64"/>
            <ion-button v-if="!backImageBase64" @click="captureBack">
              Add Back Image
            </ion-button>
          </ion-item>
        </ion-item-group>
        <ion-item-group>
          <ion-item-divider>
            <ion-label> Info </ion-label>
          </ion-item-divider>
        </ion-item-group>
      </ion-list>
    </ion-content>
  </ion-page>
  <IDCardScanner v-if="showScanner"></IDCardScanner>
</template>

<script setup lang="ts">
import { IonPage, IonContent, IonHeader, IonToolbar, IonButton, IonItem, IonItemDivider, IonItemGroup, IonLabel, IonList, IonCardContent } from '@ionic/vue';
import { ref } from 'vue';
import IDCardScanner from '../components/IDCardScanner.vue';
const frontImageBase64 = ref("");
const backImageBase64 = ref("");
const showScanner = ref(false);
let isForFront = false;

const captureFront = () => {
  isForFront = true;
  showScanner.value = true;
}

const captureBack = () => {
  isForFront = false;
  showScanner.value = true;
}


</script>

<style scoped>
.hidden {
  visibility: hidden;
}
</style>
