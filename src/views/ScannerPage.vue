<template>
  <ion-page>
    <ion-header :translucent="true" :class="showScanner?'hidden':''">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/"></ion-back-button>
        </ion-buttons>
        <ion-title>ID Scanner</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="save"> Save </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true"  :class="showScanner?'hidden':''">
      <ion-list>
        <ion-item-group>
          <ion-item-divider>
            <ion-label> Front </ion-label>
          </ion-item-divider>
          <ion-item>
            <img class="id-card" alt="front" :src="frontImageBase64" v-if="frontImageBase64"/>
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
            <img class="id-card" alt="back" :src="backImageBase64" v-if="backImageBase64"/>
            <ion-button v-if="!backImageBase64" @click="captureBack">
              Add Back Image
            </ion-button>
          </ion-item>
        </ion-item-group>
        <ion-item-group>
          <ion-item-divider>
            <ion-label> Info </ion-label>
          </ion-item-divider>
          <ion-item v-for="key in Object.keys(parsedResult)">
            <ion-input :label="getDisplayNameOfMRZField(key)" v-model="(parsedResult as any)[key]"></ion-input>
          </ion-item>
        </ion-item-group>
      </ion-list>
    </ion-content>
    <IDCardScanner
        v-if="showScanner"
        @onCanceled="scanningCanceled"
        @onCaptured="captured"
      ></IDCardScanner>
      <ion-action-sheet 
        :isOpen="isActionSheetOpen" 
        header="Actions" 
        :buttons="actionSheetButtons"
        @didDismiss="setActionResult($event)"
      ></ion-action-sheet>
  </ion-page>
</template>

<script setup lang="ts">
import { IonActionSheet, IonButtons, IonBackButton, IonTitle, IonPage, IonContent, IonHeader, IonInput, IonToolbar, IonButton, IonItem, IonItemDivider, IonItemGroup, IonLabel, IonList, IonCardContent } from '@ionic/vue';
import { ref } from 'vue';
import IDCardScanner from '../components/IDCardScanner.vue';

interface ParsedResult {
  Surname:string,
  GivenName:string,
  IDNumber:string,
  DateOfBirth:string,
  DateOfExpiry:string
}

const frontImageBase64 = ref("");
const backImageBase64 = ref("");
const showScanner = ref(false);
const isActionSheetOpen = ref(false);
const parsedResult = ref<ParsedResult>({
  Surname:"",
  GivenName:"",
  IDNumber:"",
  DateOfBirth:"",
  DateOfExpiry:""
});

const getDisplayNameOfMRZField = (fieldName:string) => {
  if (fieldName === "IDNumber") {
    return "ID number";
  }else if (fieldName === "GivenName") {
    return "Given name";
  }else if (fieldName === "DateOfBirth") {
    return "Date of birth";
  }else if (fieldName === "DateOfExpiry") {
    return "Date of expiry";
  }
  return fieldName;
}

let isForFront = false;
const actionSheetButtons = [
  {
    text: 'Pick an image',
    data: {
      action: 'pick',
    },
  },
  {
    text: 'Take a photo',
    data: {
      action: 'capture',
    },
  },
  {
    text: 'Cancel',
    role: 'cancel',
    data: {
      action: 'cancel',
    },
  },
];

const setActionResult = async (ev: CustomEvent) => {
  isActionSheetOpen.value = false;
  console.log(parsedResult);
  if (!ev.detail.data) {
    return;
  }
  if (ev.detail.data.action === "pick") {
    let input:HTMLInputElement = document.createElement("input");
    input.type = "file"
    input.onchange = async function(){
      if (input.files) {
        if (input.files.length>0) {
          let file = input.files[0];
          let dataURL = await readFileAsDataURL(file);
          if (isForFront) {
            frontImageBase64.value = dataURL;
          }else{
            backImageBase64.value = dataURL;
          }
        }
      }
    }
    input.click();
  }else if (ev.detail.data.action === "capture") {
    showScanner.value = true;
  }
}

const readFileAsDataURL = (file:File):Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    let fileReader = new FileReader();
    fileReader.onload = function(e){
      let dataURL:string = e.target!.result as string;
      resolve(dataURL);
    };
    fileReader.onerror = function () {
      reject("failed to read the file as dataURL");
    };
    fileReader.readAsDataURL(file);
  }) 
}

const pickOrCapture = () => {
  isActionSheetOpen.value = true;
}

const captureFront = () => {
  isForFront = true;
  pickOrCapture();
}

const captureBack = () => {
  isForFront = false;
  pickOrCapture();
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

const save = () => {
  
}

</script>

<style scoped>
.hidden {
  visibility: hidden;
}
.id-card {
  width: 200px;
}
</style>
