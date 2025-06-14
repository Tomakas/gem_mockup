// File: /src/views/AddressBook.vue
<template>
  <v-container fluid class="customers-list">
    <reusable-table
      :headers="customerHeaders"
      :items="filteredCustomers"
      itemKey="id"
      searchLabel="Hledat zákazníka"
      :enableFilters="true"
      filterDialogTitle="Filtry zákazníků"
      :enableColumnSettings="true"
      columnSettingsDialogTitle="Nastavení sloupců zákazníků"
      :loading="loading"
      additionalButton
      additionalButtonText="Nový zákazník"
      @additional-button-click="addNewCustomer"
      mobileTitleKey="name"
      :mobileExcludedKeys="['email', 'phone']"
      @apply-column-settings="saveCustomerColumnSettings"
      @reset-column-settings="resetCustomerColumnSettings"
      @apply-filters="applyFilters"
      @clear-filters="clearFilters"
      @update:search="handleSearchUpdate"
      @update:itemsPerPage="handleItemsPerPageUpdate"
      @update:page="handlePageUpdate"
      @load-items="loadItems"
    >
      <template #filters>
        <v-row>
          <v-col cols="12" sm="6">
            <v-select
              v-model="filterRole"
              :items="['Zákazník', 'Dodavatel', 'Zaměstnanec']"
              label="Role"
              clearable
            ></v-select>
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="filterPhonePrefix"
              label="Telefonní předvolba"
            ></v-text-field>
          </v-col>
        </v-row>
      </template>

      <template #cell-name="{ item }">
        <div class="py-2 text-start">
          <div class="font-weight-medium">{{ item.name }}</div>
        </div>
      </template>

      <template #mobile-title="{ item }">
        {{ item.name }}
      </template>

      <template #mobile-append-content="{ item }">
        </template>
    </reusable-table>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import ReusableTable from '/src/components/ReusableTable.vue'; // Cesta k ReusableTable

const loading = ref(false);
// Pro indikaci načítání dat (např. z API)

// Stavy pro filtry (zůstávají zde, protože jsou specifické pro zákazníky)
const filterRole = ref(null);
const filterPhonePrefix = ref('');

// Původní hlavičky, které budou sloužit jako "reset" a pro získání všech možných sloupců
// Důležité je zde definovat headers jako jednoduchý Array, ReusableTable si spravuje viditelnost
const customerHeaders = ref([
  { title: 'Jméno', key: 'name', dataAlign: 'center', mandatory: true }, // "Jméno" jako fixed
  { title: 'Email', key: 'email', dataAlign: 'center' },
  { title: 'Telefon', key: 'phone', dataAlign: 'center' },
  { title: 'Role', key: 'role', dataAlign: 'center' },
]);
// Fiktivní data pro zákazníky
const customers = ref([
  { id: 1, name: 'Samantha Lee', email: 'samantha.lee@example.com', phone: '+420 777 123 456', role: 'Zákazník' },
  { id: 2, name: 'Andrew Johnson', email: 'andrew.johnson@example.com', phone: '+420 601 234 567', role: 'Zaměstnanec' },
  { id: 3, name: 'Michelle Rodriguez', email: 'michelle.rodriguez@example.com', phone: '+420 733 987 654', role: 'Dodavatel' },
  { id: 4, name: 'Jason Smith', email: 'jason.smith@example.com', phone: '+420 608 111 222', role: 'Zákazník' },
  { id: 5, name: 'Karen Lee', email: 'karen.lee@example.com', phone: '+420 720 333 444', role: 'Zákazník' },
  { id: 6, name: 'Steven Davis', email: 'steven.davis@example.com', phone: '+420 775 555 666', role: 'Zaměstnanec' },
  { id: 7, name: 'Rachel Hernandez', email: 'rachel.hernandez@example.com', phone: '+420 602 777 888', role: 'Dodavatel' },
  { id: 8, name: 'David Kim', email: 'david.kim@example.com', phone: '+420 774 999 000', role: 'Zákazník' },
  { id: 9, name: 'Emily Wong', email: 'emily.wong@example.com', phone: '+420 605 123 789', role: 'Zaměstnanec' },
  { id: 10, name: 'Kevin Chen', email: 'kevin.chen@example.com', phone: '+420 731 456 012', role: 'Dodavatel' },
  { id: 11, name: 'Anna Nováková', email: 'anna.novakova@example.com', phone: '+420 777 000 111', role: 'Zákazník' },
  { id: 12, name: 'Petr Svoboda', email: 'petr.svoboda@example.com', phone: '+420 602 111 222', role: 'Zákazník' },
  { id: 13, name: 'Jana Dvořáková', email: 'jana.dvorakova@example.com', phone: '+420 733 222 333', role: 'Dodavatel' },
  { id: 14, name: 'Martin Procházka', email: 'martin.prochazka@example.com', phone: '+420 608 444 555', role: 'Zaměstnanec' },
  { id: 15, name: 'Lucie Kučerová', email: 'lucie.kucerova@example.com', phone: '+420 720 666 777', role: 'Zákazník' },
  { id: 16, name: 'Pavel Novotný', email: 'pavel.novotny@example.com', phone: '+420 775 888 999', role: 'Dodavatel' },
  { id: 17, name: 'Kateřina Veselá', email: 'katerina.vesela@example.com', phone: '+420 602 012 345', role: 'Zákazník' },
  { id: 18, name: 'Tomáš Jelínek', email: 'tomas.jelinek@example.com', phone: '+420 774 567 890', role: 'Zaměstnanec' },
  { id: 19, name: 'Eliška Horáková', email: 'eliska.horakova@example.com', phone: '+420 605 987 654', role: 'Zákazník' },
  { id: 20, name: 'Filip Beneš', email: 'filip.benes@example.com', phone: '+420 731 321 098', role: 'Dodavatel' },
]);
// Proměnné pro stav vyhledávání a stránkování z ReusableTable
const currentSearchTerm = ref('');
// const currentPage = ref(1);
// ReusableTable si spravuje vlastní stránkování
// const currentItemsPerPage = ref(10);
// ReusableTable si spravuje vlastní itemsPerPage

// Computed property pro filtrované zákazníky
const filteredCustomers = computed(() => {
  let filtered = customers.value;

  // Aplikace vyhledávacího filtru z ReusableTable
  if (currentSearchTerm.value) {
    const searchTerm = currentSearchTerm.value.toLowerCase();
    filtered = filtered.filter(customer =>
      customer.name.toLowerCase().includes(searchTerm) ||
      customer.email.toLowerCase().includes(searchTerm) ||
      customer.phone.toLowerCase().includes(searchTerm) ||
      customer.role.toLowerCase().includes(searchTerm)
    );
  }

  // Filtrace podle role
  if (filterRole.value) {
    filtered = filtered.filter(customer => customer.role === filterRole.value);
  }

  // Filtrace podle telefonní předvolby
  if (filterPhonePrefix.value) {
    const prefix = filterPhonePrefix.value.toLowerCase();
    filtered = filtered.filter(customer =>
      customer.phone && customer.phone.toLowerCase().startsWith(prefix)
    );
  }

  return filtered;
});

// Zpracování událostí z ReusableTable
const handleSearchUpdate = (newSearch) => {
  currentSearchTerm.value = newSearch;
};
const handleItemsPerPageUpdate = (newItemsPerPage) => {
  // currentItemsPerPage.value = newItemsPerPage; // ReusableTable si spravuje interně
};
const handlePageUpdate = (newPage) => {
  // currentPage.value = newPage; // ReusableTable si spravuje interně
};
const loadItems = (options) => {
  loading.value = true;
  console.log('Načítám zákazníky s možnostmi:', options);
  // Zde byste obvykle načítali data z API na základě 'options'
  // Pro účely demo simulujeme načítání
  setTimeout(() => {
    loading.value = false;
  }, 300);
};

// Funkce pro akce zákazníků
const addNewCustomer = () => {
  console.log('Funkce pro přidání nového zákazníka bude implementována.');
  // Zde byste otevřeli dialog pro přidání nového zákazníka
};

// Funkce pro aplikaci filtru (volá se z ReusableTable)
const applyFilters = () => {
  // Filtrace se provede automaticky díky computed property filteredCustomers
  console.log('Filtry zákazníků aplikovány.');
};

// Funkce pro vyčištění všech filtrů (volá se z ReusableTable)
const clearFilters = () => {
  filterRole.value = null;
  filterPhonePrefix.value = '';
  console.log('Filtry zákazníků vyčištěny.');
};

// Funkce pro uložení a reset nastavení sloupců (např. do localStorage)
const saveCustomerColumnSettings = (newSettings) => {
  console.log('Ukládám nastavení sloupců zákazníků do localStorage:', newSettings);
  localStorage.setItem('customerColumnSettings', JSON.stringify(newSettings));
};

const resetCustomerColumnSettings = () => {
  console.log('Resetuji nastavení sloupců zákazníků.');
  localStorage.removeItem('customerColumnSettings');
  // ReusableTable má vlastní metodu resetování na základě props.headers
};

// Načtení uložených nastavení sloupců při mountu
onMounted(() => {
  const savedSettings = localStorage.getItem('customerColumnSettings');
  if (savedSettings) {
    // Pokud bychom chtěli, aby ReusableTable načetla uložené nastavení při startu
    // customerHeaders.value = JSON.parse(savedSettings); // Toto by změnilo prop headers
    // V současné implementaci ReusableTable si spravuje vlastní interní stav pro columnSettings
    // a inicializuje ho z `props.headers`. Pokud chcete, aby se načetlo uložené nastavení,
    // museli bychom přidat prop `initialColumnSettings` do ReusableTable.
    // Prozatím se spoléháme na resetování uvnitř ReusableTable na základě `props.headers`.
    // Zde je pouze log pro demonstraci:
    console.log('Načtené nastavení sloupců z localStorage (pro demonstraci):', JSON.parse(savedSettings));
  }
});
</script>

<style scoped></style>