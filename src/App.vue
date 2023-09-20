<template>
  <ion-app style="z-index: 100;">
    <ion-router-outlet />
    <ion-loading :isOpen="loading" message="Initializing MRZ Recognizer..."> </ion-loading>
  </ion-app>
</template>

<script setup lang="ts">
import { Capacitor } from '@capacitor/core';
import { IonApp, IonRouterOutlet, IonLoading } from '@ionic/vue';
import { CameraPreview } from 'capacitor-plugin-dynamsoft-camera-preview';
import { LabelRecognizer } from 'capacitor-plugin-dynamsoft-label-recognizer';
import { onMounted, ref } from 'vue';

const loading = ref(false);

onMounted(async ()=>{
  await CameraPreview.requestCameraPermission();
  await initLabelRecognizer();
});

const initLabelRecognizer = async () => {
  loading.value = true;
  await LabelRecognizer.initLicense({license:"DLS2eyJoYW5kc2hha2VDb2RlIjoiMjAwMDAxLTE2NDk4Mjk3OTI2MzUiLCJvcmdhbml6YXRpb25JRCI6IjIwMDAwMSIsInNlc3Npb25QYXNzd29yZCI6IndTcGR6Vm05WDJrcEQ5YUoifQ=="});  
  await LabelRecognizer.initialize();
  if (Capacitor.isNativePlatform() === false) {
    await LabelRecognizer.updateRuntimeSettings({settings:{template:"MRZ"}});
    await LabelRecognizer.addListener("onResourcesLoadStarted",function(){
      console.log("loadstarted");
    });
    await LabelRecognizer.addListener("onResourcesLoaded",function(){
      console.log("loaded");
      loading.value = false;
    });
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
</script>
