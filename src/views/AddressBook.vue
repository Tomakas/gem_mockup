<template>
  <v-container fluid class="customers-list">
    <reusable-table
      :headers="customerHeaders"
      :items="filteredCustomers"
      itemKey="id"
      searchLabel="Hledat kontakt"
      :enableFilters="true"
      filterDialogTitle="Filtry kontaktů"
      :filter-definitions="addressBookFilterDefinitions"
      :enableColumnSettings="true"
      columnSettingsDialogTitle="Nastavení sloupců"
      :loading="loading"
      additionalButton
      additionalButtonText="Nový kontakt"
      @additional-button-click="addNewCustomer"
      mobileTitleKey="name"
      :mobileExcludedKeys="['email', 'phone']"
      @apply-column-settings="saveCustomerColumnSettings"
      @reset-column-settings="resetCustomerColumnSettings"
      @apply-filters="handleApplyFilters"
      @clear-filters="handleClearFilters"
      @update:search="handleSearchUpdate"
      @load-items="loadItems"
    >
      <template #cell-name="{ item }">
        <div class="py-2">
          <div class="font-weight-medium">{{ item.name }}</div>
        </div>
      </template>

      <template #mobile-title="{ item }">
        {{ item.name }}
      </template>
    </reusable-table>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import ReusableTable from '/src/components/ReusableTable.vue';
import customerDataJson from '/src/data/customers.json'; // Import nových dat 

const loading = ref(false);
const appliedFilters = ref({});
const currentSearchTerm = ref('');

const customerHeaders = ref([
  { title: 'Jméno', key: 'name', dataAlign: 'center', mandatory: true },
  { title: 'Email', key: 'email', dataAlign: 'center' },
  { title: 'Telefon', key: 'phone', dataAlign: 'center' },
  { title: 'Role', key: 'role', dataAlign: 'center' },
]);

// Načtení dat z importovaného JSON souboru
const customers = ref([]); 
const roles = ref([]); // Nová reaktivní proměnná pro role

onMounted(() => {
  try {
    customers.value = customerDataJson; // Přiřazení dat z JSON souboru 
    // Dynamické získání unikátních rolí z dat
    roles.value = [...new Set(customers.value.map(c => c.role))].sort(); 
  } catch (error) {
    console.error('Chyba při načítání dat zákazníků:', error);
    customers.value = [];
  }
});

const addressBookFilterDefinitions = computed(() => [
  {
    key: 'role',
    label: 'Role',
    items: roles.value // Použití dynamicky získaných rolí
  },
  {
    key: 'phonePrefix',
    label: 'Telefonní předvolba',
    type: 'text'
  }
]);

const filteredCustomers = computed(() => {
  let filtered = customers.value;

  if (currentSearchTerm.value) {
    const searchTerm = currentSearchTerm.value.toLowerCase();
    filtered = filtered.filter(customer =>
      Object.values(customer).some(val => String(val).toLowerCase().includes(searchTerm))
    );
  }
  
  if (appliedFilters.value.role?.length > 0) {
    filtered = filtered.filter(customer => appliedFilters.value.role.includes(customer.role));
  }
  
  if (appliedFilters.value.phonePrefix) {
    const prefix = appliedFilters.value.phonePrefix.toLowerCase();
    filtered = filtered.filter(customer =>
      customer.phone && customer.phone.toLowerCase().startsWith(prefix)
    );
  }

  return filtered;
});

const handleApplyFilters = (filters) => {
  appliedFilters.value = filters;
};

const handleClearFilters = () => {
  appliedFilters.value = {};
};

const handleSearchUpdate = (newSearch) => {
  currentSearchTerm.value = newSearch;
};

const loadItems = () => {
  // Funkce pro načítání položek (pro demo není třeba kompletní implementace)
  // Zde by mohla být logika pro asynchronní načítání dat např. z API
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
  }, 300);
};

const addNewCustomer = () => {
  console.log('Přidat nový kontakt');
  // Zde by byla logika pro otevření dialogu/formuláře pro přidání nového kontaktu
};

const saveCustomerColumnSettings = (newSettings) => {
  // Uložení nastavení sloupců do localStorage nebo na server
  console.log('Uložit nastavení sloupců', newSettings);
  localStorage.setItem('customerColumnSettings', JSON.stringify(newSettings));
};

const resetCustomerColumnSettings = () => {
  // Reset nastavení sloupců na výchozí
  console.log('Resetovat nastavení sloupců');
  localStorage.removeItem('customerColumnSettings');
  // Možná budete chtít znovu inicializovat customerHeaders z originalHeaders, pokud existují
};
</script>

<style scoped>
/* Styly specifické pro AddressBook.vue (pokud jsou potřeba) */
</style>