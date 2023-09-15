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
      <ion-loading :isOpen="loading" message="Initializing MRZ Recognizer..."> </ion-loading>
  </ion-page>
</template>

<script setup lang="ts">
import { IonActionSheet, IonButtons, IonBackButton, IonTitle, IonPage, IonContent, IonHeader, IonInput, IonToolbar, IonButton, IonItem, IonItemDivider, IonItemGroup, IonLabel, IonList, IonCardContent } from '@ionic/vue';
import { ref,onMounted,onBeforeUnmount } from 'vue';
import IDCardScanner from '../components/IDCardScanner.vue';
import { LabelRecognizer } from 'capacitor-plugin-dynamsoft-label-recognizer';
import { Capacitor, PluginListenerHandle } from '@capacitor/core';
import { parse } from 'mrz';

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
const loading = ref(false);
const isActionSheetOpen = ref(false);
const parsedResult = ref<ParsedResult>({
  Surname:"",
  GivenName:"",
  IDNumber:"",
  DateOfBirth:"",
  DateOfExpiry:""
});
let onResourceLoadedListener:PluginListenerHandle|undefined;

onMounted(()=>{
  if (onResourceLoadedListener) {
    onResourceLoadedListener.remove();
  }
  initLabelRecognizer();
});

onBeforeUnmount(async () => {
  if (onResourceLoadedListener) {
    onResourceLoadedListener.remove();
  }
});

const initLabelRecognizer = async () => {
  loading.value = true;
  try {
    await LabelRecognizer.initLicense({license:"DLS2eyJoYW5kc2hha2VDb2RlIjoiMjAwMDAxLTE2NDk4Mjk3OTI2MzUiLCJvcmdhbml6YXRpb25JRCI6IjIwMDAwMSIsInNlc3Npb25QYXNzd29yZCI6IndTcGR6Vm05WDJrcEQ5YUoifQ=="});  
  } catch (error) {
    console.log(error);
  }
  await LabelRecognizer.initialize();
  if (Capacitor.isNativePlatform() === false) {
    await LabelRecognizer.updateRuntimeSettings({settings:{template:"MRZ"}});
    onResourceLoadedListener = LabelRecognizer.addListener("onResourcesLoaded",function(){
      loading.value = false;
    })
  }else{
    await LabelRecognizer.updateRuntimeSettings(
      {
        settings:
        {
          template: "{\"CharacterModelArray\":[{\"DirectoryPath\":\"\",\"Name\":\"MRZ\"}],\"LabelRecognizerParameterArray\":[{\"Name\":\"default\",\"ReferenceRegionNameArray\":[\"defaultReferenceRegion\"],\"CharacterModelName\":\"MRZ\",\"LetterHeightRange\":[5,1000,1],\"LineStringLengthRange\":[30,44],\"LineStringRegExPattern\":\"([ACI][A-Z<][A-Z<]{3}[A-Z0-9<]{9}[0-9][A-Z0-9<]{15}){(30)}|([0-9]{2}[(01-12)][(01-31)][0-9][MF<][0-9]{2}[(01-12)][(01-31)][0-9][A-Z<]{3}[A-Z0-9<]{11}[0-9]){(30)}|([A-Z<]{0,26}[A-Z]{1,3}[(<<)][A-Z]{1,3}[A-Z<]{0,26}<{0,26}){(30)}|([ACIV][A-Z<][A-Z<]{3}([A-Z<]{0,27}[A-Z]{1,3}[(<<)][A-Z]{1,3}[A-Z<]{0,27}){(31)}){(36)}|([A-Z0-9<]{9}[0-9][A-Z<]{3}[0-9]{2}[(01-12)][(01-31)][0-9][MF<][0-9]{2}[(01-12)][(01-31)][0-9][A-Z0-9<]{8}){(36)}|([PV][A-Z<][A-Z<]{3}([A-Z<]{0,35}[A-Z]{1,3}[(<<)][A-Z]{1,3}[A-Z<]{0,35}<{0,35}){(39)}){(44)}|([A-Z0-9<]{9}[0-9][A-Z<]{3}[0-9]{2}[(01-12)][(01-31)][0-9][MF<][0-9]{2}[(01-12)][(01-31)][0-9][A-Z0-9<]{14}[A-Z0-9<]{2}){(44)}\",\"MaxLineCharacterSpacing\":130,\"TextureDetectionModes\":[{\"Mode\":\"TDM_GENERAL_WIDTH_CONCENTRATION\",\"Sensitivity\":8}],\"Timeout\":9999}],\"LineSpecificationArray\":[{\"BinarizationModes\":[{\"BlockSizeX\":30,\"BlockSizeY\":30,\"Mode\":\"BM_LOCAL_BLOCK\",\"MorphOperation\":\"Close\"}],\"LineNumber\":\"\",\"Name\":\"defaultTextArea->L0\"}],\"ReferenceRegionArray\":[{\"Localization\":{\"FirstPoint\":[0,0],\"SecondPoint\":[100,0],\"ThirdPoint\":[100,100],\"FourthPoint\":[0,100],\"MeasuredByPercentage\":1,\"SourceType\":\"LST_MANUAL_SPECIFICATION\"},\"Name\":\"defaultReferenceRegion\",\"TextAreaNameArray\":[\"defaultTextArea\"]}],\"TextAreaArray\":[{\"Name\":\"defaultTextArea\",\"LineSpecificationNameArray\":[\"defaultTextArea->L0\"]}]}",
          customModelConfig:{
            customModelFolder:"MRZ",
            customModelFileNames:["MRZ"]
          }
        }
      }
    );
    loading.value = false;
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
            readMRZ(dataURL);
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

const readMRZ = async (base64:string) => {
  let DLRResults = (await LabelRecognizer.recognizeBase64String({base64:base64})).results;
  console.log(DLRResults);
  let MRZLines = [];
  for (let i = 0; i < DLRResults.length; i++) {
    const DLRResult = DLRResults[i];
    for (let j = 0; j < DLRResult.lineResults.length; j++) {
      const lineResult = DLRResult.lineResults[j];
      MRZLines.push(lineResult.text);
    }
  }
  const parsed = parse(MRZLines);
  console.log(parsed);
  parsedResult.value = {
    Surname:parsed.fields.lastName ?? "",
    GivenName:parsed.fields.firstName ?? "",
    IDNumber:parsed.fields.documentNumber ?? "",
    DateOfBirth:parsed.fields.birthDate ?? "",
    DateOfExpiry:parsed.fields.expirationDate ?? ""
  }
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
    readMRZ("data:image/jpeg;base64,"+base64);
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
