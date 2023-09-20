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
            <img class="id-card" @click="captureFront" alt="front" :src="frontImageDataURL" v-if="frontImageDataURL"/>
            <ion-button v-if="!frontImageDataURL" @click="captureFront">
              Add Front Image
            </ion-button>
          </ion-item>
        </ion-item-group>

        <ion-item-group>
          <ion-item-divider>
            <ion-label> Back </ion-label>
          </ion-item-divider>
          <ion-item>
            <img class="id-card" @click="captureBack" alt="back" :src="backImageDataURL" v-if="backImageDataURL"/>
            <ion-button v-if="!backImageDataURL" @click="captureBack">
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
    <ion-modal ref="modal" :is-open="isModalOpen">
      <ion-header>
        <ion-toolbar>
          <ion-buttons slot="start">
            <ion-button @click="cancel">Cancel</ion-button>
          </ion-buttons>
          <ion-title>Action</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
        <label for="file-input">
          <ion-button expand="block" @click="triggerPickingImage()">
            Pick an Image
          </ion-button>
          <input type="file" ref="fileInput" @change="filePicked" id="file-input"/>
        </label>
        <ion-button expand="block" @click="takePhoto()">
          Take a photo
        </ion-button>
      </ion-content>
    </ion-modal>
  </ion-page>
</template>

<script setup lang="ts">
import { IonButtons, IonBackButton, IonTitle,IonModal, IonPage, IonContent, IonHeader, IonInput, IonToolbar, IonButton, IonItem, IonItemDivider, IonItemGroup, IonLabel, IonList, IonCardContent, useIonRouter } from '@ionic/vue';
import { ref,onMounted } from 'vue';
import IDCardScanner from '../components/IDCardScanner.vue';
import { LabelRecognizer } from 'capacitor-plugin-dynamsoft-label-recognizer';
import { Capacitor } from '@capacitor/core';
import { parse } from 'mrz';
import { IDCardManager, ParsedResult } from '../utils/IDCardManager';
import { getUrlParam } from '../utils/URLUtils';
import { Camera, CameraResultType } from '@capacitor/camera';
import { Filesystem } from '@capacitor/filesystem';
import { isPlatform } from '@ionic/vue';

const frontImageDataURL = ref("");
const backImageDataURL = ref("");
const showScanner = ref(false);
const router = useIonRouter();
const modal = ref();
const fileInput = ref();
const isModalOpen = ref(false);
const parsedResult = ref<ParsedResult>({
  Surname:"",
  GivenName:"",
  IDNumber:"",
  DateOfBirth:"",
  DateOfExpiry:""
});

let existingCardKey = "";

onMounted(()=>{
  let key = getUrlParam("key");
  if (key) {
    loadExistingCard(key)
  }
});

const loadExistingCard = async (key:string) => {
  let manager = new IDCardManager();
  let card = await manager.getIDCard(key)
  if (card) {
    parsedResult.value = card.info;
    backImageDataURL.value = card.backImage;
    frontImageDataURL.value = card.frontImage;
    existingCardKey = key;
  }
}

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

const triggerPickingImage = async () => {
  fileInput.value.click();
}

const filePicked = () => {
  isModalOpen.value = false;
  const loadImage = async () => {
    let input = fileInput.value;
    if (input.files) {
      if (input.files.length>0) {
        let file = input.files[0];
        let dataURL = await readFileAsDataURL(file);
        if (isForFront) {
          frontImageDataURL.value = dataURL;
        }else{
          backImageDataURL.value = dataURL;
          readMRZ(dataURL);
        }
      }
    }
  }
  loadImage();
}

const takePhoto = () => {
  isModalOpen.value = false;
  showScanner.value = true;
}

const cancel = () => {
  isModalOpen.value = false;
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

const readMRZ = async (base64:string) => {
  let DLRResults = (await LabelRecognizer.recognizeBase64String({base64:base64})).results;
  console.log(DLRResults);
  let MRZLines = [];
  for (let i = 0; i < DLRResults.length; i++) {
    const DLRResult = DLRResults[i];
    for (let j = 0; j < DLRResult.lineResults.length; j++) {
      const lineResult = DLRResult.lineResults[j];
      if (lineResult.confidence<50) { //low confidence line
        continue;
      }
      MRZLines.push(lineResult.text);
    }
  }
  try {
    const parsed = parse(MRZLines);
    parsedResult.value = {
      Surname:parsed.fields.lastName ?? "",
      GivenName:parsed.fields.firstName ?? "",
      IDNumber:parsed.fields.documentNumber ?? "",
      DateOfBirth:parsed.fields.birthDate ?? "",
      DateOfExpiry:parsed.fields.expirationDate ?? ""
    }  
  } catch (error) {
    alert("Failed to read the info from the card.");
  }
  
}

const pickOrCapture = () => {
  isModalOpen.value = true;
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
    frontImageDataURL.value = "data:image/jpeg;base64," + base64;
  }else{
    backImageDataURL.value = "data:image/jpeg;base64," + base64;
    readMRZ("data:image/jpeg;base64,"+base64);
  }
  showScanner.value = false;
}

const save = () => {
  let incomplete = false;
  let keys = Object.keys(parsedResult.value);
   for (let index = 0; index < keys.length; index++) {
    let key = keys[index];
    if (!(parsedResult.value as any)[key]) {
      incomplete = true;
      break;
    }
   }

  if (backImageDataURL.value === "" || frontImageDataURL.value === "") {
    incomplete = true;
  }
  if (incomplete) {
    alert("Incomplete");
  }else{
    let key;
    if (existingCardKey) {
      key = parseInt(existingCardKey);
    }else{
      key = new Date().getTime();
    }
    let manager = new IDCardManager();
    manager.saveIDCard({
      backImage:backImageDataURL.value,
      frontImage:frontImageDataURL.value,
      info:parsedResult.value,
      timestamp: key
    })
    alert("Saved");
    router.back();
  }
}

</script>

<style scoped>
.hidden {
  visibility: hidden;
}
.id-card {
  width: 200px;
}
#file-input {
  display: none;
}

@media screen and (max-device-width: 600px){
  .id-card {
    width: 100%;
  }
}
</style>
