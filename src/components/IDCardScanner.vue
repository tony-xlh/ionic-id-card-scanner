<template>
  <div class="scanner">
    <Camera :active="true" :desiredCamera="desiredCamera"></Camera>
    <div class="scannerHeader toolbar" style="justify-content: space-between;">
        <div class="closeButton" @click="close">
          <img class="icon" src="assets/cross.svg" alt="close"/>
        </div>
    </div>
    <div class="scannerFooter">
      <div class="switchButton" @click="switchCamera">
        <img class="icon" src="assets/switch.svg" alt="switch"/>
      </div>
      <div class="shutter">
        <div class="shutterButton" @click="capture"></div>
      </div>
      <div class="placeholder">
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Camera from '../components/Camera.vue';
import { CameraPreview } from 'capacitor-plugin-dynamsoft-camera-preview';

const desiredCamera = ref("");
const emit = defineEmits<{
  (e: 'onCanceled'): void
  (e: 'onCaptured',base64:string): void
}>();

const close = () => {
  emit("onCanceled");
}

const switchCamera = async () => {
  let cameras = (await CameraPreview.getAllCameras()).cameras;
    let currentCameraName = (await CameraPreview.getSelectedCamera()).selectedCamera;
    if (cameras && currentCameraName) {
      let newIndex = 0;
      for (let index = 0; index < cameras.length; index++) {
        const name = cameras[index];
        if (name.toLowerCase().indexOf(currentCameraName.toLowerCase()) != -1) {
          if ((index + 1) > cameras.length -1) {
            newIndex = 0;
          }else{
            newIndex = index + 1;
          }
          break;
        }
      }
      desiredCamera.value = cameras[newIndex].toLowerCase();
    }
}

const capture = async () => {
  const result = await CameraPreview.takeSnapshot({quality:100})
  emit("onCaptured",result.base64);
}

</script>

<style scoped>
.scannerFooter {
  left: 0;
  bottom: 0;
  position: absolute;
  height: 6em;
  width: 100%;
  display: flex;
  align-items: center;
  flex-direction: row;
  justify-content: space-evenly;
  background: rgba(0, 0, 0, 0.8);
}

.icon {
  width: 2.5em;
  height: 2.5em;
  pointer-events: all;
  cursor: pointer;
}

.shutter {
  width: 4em;
  height: 4em;
  margin-top: calc(var(--shutter-size) / -2);
  margin-left: calc(var(--shutter-size) / -2);
  border-radius: 100%;
  background-color: rgb(198, 205, 216);
  padding: 12px;
  box-sizing: border-box;
  cursor: pointer;
}

.shutterButton {
  background-color: rgb(255, 255, 255);
  border-radius: 100%;
  width: 100%;
  height: 100%;
}

.shutterButton:active {
  background-color: rgb(220, 220, 220);
  border-radius: 100%;
  width: 100%;
  height: 100%;
}
.toolbar {
  position: absolute;
  top: 0;
  left: 0;
  height: 3em;
  width: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
}
</style>
