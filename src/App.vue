<template>
  <ion-app style="z-index: 100;">
    <ion-router-outlet />
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import { LabelRecognizer } from 'capacitor-plugin-dynamsoft-label-recognizer';
import { onMounted } from 'vue';

onMounted(async ()=>{
  try {
    await LabelRecognizer.initLicense({license:"DLS2eyJoYW5kc2hha2VDb2RlIjoiMjAwMDAxLTE2NDk4Mjk3OTI2MzUiLCJvcmdhbml6YXRpb25JRCI6IjIwMDAwMSIsInNlc3Npb25QYXNzd29yZCI6IndTcGR6Vm05WDJrcEQ5YUoifQ=="});  
    await LabelRecognizer.initialize();
  } catch (error) {
    console.log(error);
  }
});
</script>
