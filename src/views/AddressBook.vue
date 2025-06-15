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

const loading = ref(false);
const appliedFilters = ref({});
const currentSearchTerm = ref('');

const customerHeaders = ref([
  { title: 'Jméno', key: 'name', dataAlign: 'center', mandatory: true },
  { title: 'Email', key: 'email', dataAlign: 'center' },
  { title: 'Telefon', key: 'phone', dataAlign: 'center' },
  { title: 'Role', key: 'role', dataAlign: 'center' },
]);

const customers = ref([
  { id: 1, name: 'Samantha Lee', email: 'samantha.lee@example.com', phone: '+420 777 123 456', role: 'Zákazník' },
  { id: 2, name: 'Andrew Johnson', email: 'andrew.johnson@example.com', phone: '+420 601 234 567', role: 'Zaměstnanec' },
  { id: 3, name: 'Michelle Rodriguez', email: 'michelle.rodriguez@example.com', phone: '+420 733 987 654', role: 'Dodavatel' },
  { id: 4, name: 'Jason Smith', email: 'jason.smith@example.com', phone: '+420 608 111 222', role: 'Zákazník' },
  { id: 5, name: 'Karen Lee', email: 'karen.lee@example.com', phone: '+420 720 333 444', role: 'Zákazník' },
]);

const addressBookFilterDefinitions = computed(() => [
  {
    key: 'role',
    label: 'Role',
    items: ['Zákazník', 'Dodavatel', 'Zaměstnanec']
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

const handleApplyFilters = (filters) => appliedFilters.value = filters;
const handleClearFilters = () => appliedFilters.value = {};
const handleSearchUpdate = (newSearch) => currentSearchTerm.value = newSearch;

const loadItems = () => { /* Pro demo není třeba */ };
const addNewCustomer = () => { console.log('Přidat nový kontakt'); };
const saveCustomerColumnSettings = () => { /* Implementovat uložení */ };
const resetCustomerColumnSettings = () => { /* Implementovat reset */ };

</script>