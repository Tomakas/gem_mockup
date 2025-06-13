<template>
  <v-container>
    <h1 class="text-h4 mb-4">Nastavení</h1>
    <p>Zde bude konfigurace aplikace.</p>

    <v-card class="mt-4 pa-4">
      <v-card-title>Vzhled a navigace</v-card-title>
      <v-card-text>
        <v-switch
          v-model="localIsSideNav"
          label="Použít boční navigaci (jinak horní)"
          hide-details
          inset
          @change="handleNavPositionChange"
        ></v-switch>
        <p class="text-caption mt-2">
          Poznámka: Po změně pozice navigace se stránka obnoví.
        </p>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const localIsSideNav = ref(true); // Lokální stav pro switch

const handleNavPositionChange = () => {
  // Uloží novou hodnotu do localStorage
  localStorage.setItem('nav-position', localIsSideNav.value ? 'side' : 'top');
  // A poté stránku obnoví, aby se App.vue překreslila se správným stavem
  location.reload();
};

onMounted(() => {
  // Při načtení Settings.vue načte preferenci z localStorage
  const savedNavPosition = localStorage.getItem('nav-position');
  if (savedNavPosition) {
    localIsSideNav.value = savedNavPosition === 'side';
  }
});
</script>