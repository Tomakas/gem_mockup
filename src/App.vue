<template>
  <v-app :theme="theme">
    <v-app-bar app>
      <v-app-bar-nav-icon v-if="display.mdAndDown.value" @click="drawer = !drawer"></v-app-bar-nav-icon>

      <v-app-bar-title>Elementary POS Administrace</v-app-bar-title>

      <v-spacer></v-spacer>

      <v-toolbar-items v-if="!isSideNav && display.lgAndUp.value">
        <v-btn v-for="item in navItems" :key="item.title" :to="item.to" text>
          <v-icon start>{{ item.icon }}</v-icon>
          {{ item.title }}
        </v-btn>
      </v-toolbar-items>

      <v-btn icon @click="toggleTheme">
        <v-icon>{{ theme === 'light' ? 'mdi-weather-sunny' : 'mdi-weather-night' }}</v-icon>
      </v-btn>

      <v-menu>
        <template v-slot:activator="{ props }">
          <v-btn icon v-bind="props" class="ml-2">
            <v-avatar size="32">
              <v-img :src="selectedLanguage.imageUrl" :alt="selectedLanguage.name + ' vlajka'"
                onerror="this.src='https://placehold.co/32x32/E0E0E0/333333?text=?'"></v-img>
            </v-avatar>
          </v-btn>
        </template>
        <v-list>
          <v-list-item v-for="(lang, i) in languages" :key="i" @click="selectLanguage(lang)">
            <template v-slot:prepend>
              <v-avatar size="32">
                <v-img :src="lang.imageUrl" :alt="lang.name + ' vlajka'"
                  onerror="this.src='https://placehold.co/32x32/E0E0E0/333333?text=?'"></v-img>
              </v-avatar>
            </template>
            <v-list-item-title>{{ lang.name }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>

      <v-menu>
        <template v-slot:activator="{ props }">
          <v-btn icon v-bind="props" class="ml-2">
            <v-avatar color="grey-darken-1" size="32">
              <span class="text-h6">T</span>
            </v-avatar>
          </v-btn>
        </template>
        <v-list>
          <v-list-item>
            <v-list-item-title>Uživatel Tomas</v-list-item-title>
          </v-list-item>
          <v-list-item>
            <v-list-item-title>Nastavení uživatele</v-list-item-title>
          </v-list-item>
          <v-list-item>
            <v-list-item-title>Odhlásit se</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" :permanent="isSideNav && display.lgAndUp.value"
      :expand-on-hover="isSideNav && display.lgAndUp.value" location="left" app>
      <v-divider></v-divider>

      <v-list dense nav>
        <v-list-item v-for="item in navItems" :key="item.title" :to="item.to" link>
          <v-icon start>{{ item.icon }}</v-icon>
          {{ item.title }}
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <v-container fluid class="pa-0 pa-sm-1 pa-md-2">
        <router-view></router-view>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useTheme, useDisplay } from 'vuetify';

const theme = ref('dark');
const vuetifyTheme = useTheme();
const display = useDisplay();

const drawer = ref(false);
const isSideNav = ref(true);

const navItems = [
  { title: 'Přehled', icon: 'mdi-view-dashboard', to: '/overview' },
  { title: 'Prodej', icon: 'mdi-cash-multiple', to: '/sales' },
  { title: 'Produkty', icon: 'mdi-tag', to: '/products' },
  { title: 'Sklad', icon: 'mdi-warehouse', to: '/warehouse' },
  { title: 'Pokladny', icon: 'mdi-cash-register', to: '/cash-registers' },
  // { title: 'Objednávky', icon: 'mdi-clipboard-text-outline', to: '/orders' }, // REMOVED
  { title: 'Adresář', icon: 'mdi-account-box-multiple', to: '/address-book' },
  { title: 'Export', icon: 'mdi-file-export', to: '/export' },
  { title: 'Nastavení', icon: 'mdi-cog', to: '/settings' },
];

const languages = ref([
  { code: 'cs', name: 'Čeština', flag: '🇨🇿', imageUrl: 'https://flagcdn.com/cz.svg' },
  { code: 'en', name: 'Angličtina', flag: '🇬🇧', imageUrl: 'https://flagcdn.com/gb.svg' },
  { code: 'es', name: 'Španělština', flag: '🇪🇸', imageUrl: 'https://flagcdn.com/es.svg' },
  { code: 'it', name: 'Italština', flag: '🇮🇹', imageUrl: 'https://flagcdn.com/it.svg' },
  { code: 'sv', name: 'Švédština', flag: '🇸🇪', imageUrl: 'https://flagcdn.com/se.svg' },
]);

const selectedLanguage = ref(languages.value[0]);

const toggleTheme = () => {
  theme.value = theme.value === 'light' ? 'dark' : 'light';
  vuetifyTheme.global.name.value = theme.value;
  localStorage.setItem('app-theme', theme.value);
};

const selectLanguage = (lang) => {
  selectedLanguage.value = lang;
  localStorage.setItem('app-language', lang.code);
};

onMounted(() => {
  const savedTheme = localStorage.getItem('app-theme');
  if (savedTheme) {
    theme.value = savedTheme;
  }
  vuetifyTheme.global.name.value = theme.value;

  const savedNavPosition = localStorage.getItem('nav-position');
  if (savedNavPosition) {
    isSideNav.value = savedNavPosition === 'side';
  }

  const savedLanguageCode = localStorage.getItem('app-language');
  if (savedLanguageCode) {
    const foundLang = languages.value.find(lang => lang.code === savedLanguageCode);
    if (foundLang) {
      selectedLanguage.value = foundLang;
    }
  }

  // ZMĚNA: Počáteční stav draweru se řídí breakpointem LG
  drawer.value = isSideNav.value && display.lgAndUp.value;
});

// ZMĚNA: Sledujeme změnu breakpointu LG
watch(display.lgAndUp, (newVal) => {
  if (isSideNav.value) {
    drawer.value = newVal;
  } else {
    drawer.value = false;
  }
});
</script>

<style scoped>
/* Zde nejsou potřeba žádné styly */
</style>
