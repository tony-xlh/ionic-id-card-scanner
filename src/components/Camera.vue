<template>

</template>

<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { CameraPreview, ScanRegion } from 'capacitor-plugin-dynamsoft-camera-preview';
import { PluginListenerHandle } from "@capacitor/core";

const props = defineProps<{
  scanRegion?: ScanRegion
  active?: boolean
  desiredCamera?: string
}>()
const emit = defineEmits<{
  (e: 'onPlayed',resolution:string): void
}>();
const initialized = ref(false);
let onPlayedListener:PluginListenerHandle|undefined;

onMounted(async () => {
  console.log(props);
  await CameraPreview.initialize();

  if (onPlayedListener) {
    onPlayedListener.remove();
  }
  
  onPlayedListener = await CameraPreview.addListener("onPlayed", async (result:{resolution:string}) => {
    emit("onPlayed",result.resolution);
  });

  //set original scan region
  await CameraPreview.setScanRegion({region:{left:10,right:90,top:20,bottom:50,measuredByPercentage:1}});
 
  if (props.desiredCamera) {
    await selectDesiredCamera();
  }
  
  if (props.active === true) {
    await CameraPreview.startCamera();
  }
  initialized.value = true;
});

onBeforeUnmount(async () => {
  if (onPlayedListener) {
    onPlayedListener.remove();
  }
  await CameraPreview.stopCamera();
});

const selectDesiredCamera = async () => {
  let camerasResult = await CameraPreview.getAllCameras();
  if (camerasResult.cameras) {
    for (let index = 0; index < camerasResult.cameras.length; index++) {
      const cameraID = camerasResult.cameras[index];
      let desiredCameraString = "founder"; //the USB camera's name of the developer
      if (props.desiredCamera) {
        desiredCameraString = props.desiredCamera;
      }
      if (cameraID.toLowerCase().indexOf(desiredCameraString) != -1 ){
        await CameraPreview.selectCamera({cameraID:cameraID});
        break;
      }
    }
  }
}

watch(() => props.scanRegion, async (newVal, oldVal) => {
  if (initialized.value) {
    if (newVal) {
      await CameraPreview.setScanRegion({region:newVal});
    }else{
      await CameraPreview.setScanRegion({region:{left:0,top:0,right:100,bottom:100,measuredByPercentage:1}});
    }
  }
});

watch(() => props.active, (newVal, oldVal) => {
  if (initialized.value) {
    if (newVal === true) {
      CameraPreview.startCamera();
    }else if (newVal === false){
      CameraPreview.stopCamera();
    }
  }
});

watch(() => props.desiredCamera, async (newVal, oldVal) => {
  if (initialized.value) {
    if (newVal) {
      selectDesiredCamera();
    }
  }
});
</script>

<style scoped>
</style>