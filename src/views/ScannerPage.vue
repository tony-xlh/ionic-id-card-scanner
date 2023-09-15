<template>
  <ion-page>
    <ion-header :translucent="true" :class="showScanner?'hidden':''">
      <ion-toolbar>
        <ion-title>ID Scanner</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true"  :class="showScanner?'hidden':''">
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
    <IDCardScanner
        v-if="showScanner"
        @onCanceled="scanningCanceled"
        @onCaptured="captured"
      ></IDCardScanner>
  </ion-page>
</template>

<script setup lang="ts">
import { IonTitle, IonPage, IonContent, IonHeader, IonToolbar, IonButton, IonItem, IonItemDivider, IonItemGroup, IonLabel, IonList, IonCardContent } from '@ionic/vue';
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

const scanningCanceled = () => {
  showScanner.value = false;
}

const captured = (base64:string) => {
  if (isForFront) {
    frontImageBase64.value = "data:image/jpeg;base64," + base64;
  }else{
    backImageBase64.value = "data:image/jpeg;base64," + base64;
  }
  showScanner.value = false;
}


</script>

<style scoped>
.hidden {
  visibility: hidden;
}
</style>
