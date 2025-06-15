<template>
  <v-container fluid class="products-list">
    <reusable-table
      :headers="productHeaders"
      :items="filteredProducts"
      itemKey="id"
      searchLabel="Hledat produkt"
      :enableFilters="true"
      filterDialogTitle="Filtry produktů"
      
      :filter-definitions="productFilterDefinitions"

      :enableColumnSettings="true"
      columnSettingsDialogTitle="Nastavení sloupců produktů"
      :loading="loading"
      additionalButton
      additionalButtonText="Nový produkt"
      @additional-button-click="addNewProduct"
      mobileTitleKey="productName"
      :mobileExcludedKeys="['price', 'tax']"
      @row-click="openProductDetail"
      @apply-column-settings="saveProductColumnSettings"
      @reset-column-settings="resetProductColumnSettings"

      @apply-filters="handleApplyFilters"
      @clear-filters="handleClearFilters"
      
      @update:search="handleSearchUpdate"
      @update:itemsPerPage="handleItemsPerPageUpdate"
      @update:page="handlePageUpdate"
      @load-items="loadItems"
    >
      <template #cell-productName="{ item }">
        <div class="py-2">{{ item.productName }}</div>
      </template>
      <template #cell-tax="{ item }">{{ item.tax }} %</template>
      <template #cell-price="{ item }">{{ formatCurrency(item.price) }}</template>
    
      <template #mobile-title="{ item }">
        {{ item.productName }}
      </template>

    </reusable-table>

    <product-detail
      v-model="productDetailDialog"
      :product="selectedProduct"
      @saveProduct="saveProduct"
      @deleteProduct="deleteProduct"
      @duplicateProduct="duplicateProduct"
      @viewSales="viewSales"
    ></product-detail>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import productDataJson from '/src/data/products.json';
import ProductDetail from '@/components/ProductDetail.vue';
import ReusableTable from '/src/components/ReusableTable.vue';

const loading = ref(false);

// ZMĚNA: Lokální stav pro filtry byl odstraněn.
// Místo něj máme stav pro aplikované filtry, který se plní z události.
const appliedFilters = ref({});

const productDetailDialog = ref(false);
const selectedProduct = ref(null);
const originalHeaders = [
  { title: 'Název produktu', key: 'productName', dataAlign: 'end', mandatory: true },
  { title: 'Kategorie', key: 'category', dataAlign: 'end' },
  { title: 'Cena', key: 'price', dataAlign: 'end', mandatory: true },
  { title: 'Daň', key: 'tax', dataAlign: 'end' },
  { title: 'Barva', key: 'Barva', dataAlign: 'center', visible: true },
  { title: 'SKU', key: 'SKU', dataAlign: 'start', visible: true },
];
const productHeaders = ref(originalHeaders);

const products = ref([]);
const categories = ref([]);
const taxes = ref([]);

// ZMĚNA: Definice filtrů pro produkty, které se předají do ReusableTable
const productFilterDefinitions = computed(() => [
  { 
    key: 'category', 
    label: 'Kategorie', 
    type: 'multiselect-chips', 
    items: categories.value 
  },
  { 
    key: 'tax', 
    label: 'Daň', 
    type: 'multiselect-chips', 
    items: taxes.value,
    suffix: '%'
  },
  { 
    key: 'price', 
    label: 'Cena', 
    type: 'range', 
    prefix: 'Kč'
  }
]);


const currentSearchTerm = ref('');
const currentPage = ref(1);
const currentItemsPerPage = ref(10);

onMounted(() => {
  try {
    products.value = productDataJson;
    categories.value = [...new Set(products.value.map((p) => p.category))].sort();
    taxes.value = [...new Set(products.value.map((p) => p.tax))].sort((a, b) => a - b);
  } catch (error) {
    console.error('Chyba při načítání dat produktů:', error);
    products.value = [];
  }
});

const filteredProducts = computed(() => {
  let filtered = products.value;

  if (currentSearchTerm.value) {
    const searchTerm = currentSearchTerm.value.toLowerCase();
    filtered = filtered.filter((product) =>
      Object.values(product).some(val =>
        String(val).toLowerCase().includes(searchTerm)
      )
    );
  }

  // ZMĚNA: Logika filtrace nyní používá objekt `appliedFilters`
  if (appliedFilters.value.category && appliedFilters.value.category.length > 0) {
    filtered = filtered.filter((product) => appliedFilters.value.category.includes(product.category));
  }
  if (appliedFilters.value.tax && appliedFilters.value.tax.length > 0) {
    filtered = filtered.filter((product) => appliedFilters.value.tax.includes(product.tax));
  }
  if (appliedFilters.value.price?.min) {
    filtered = filtered.filter((product) => product.price >= appliedFilters.value.price.min);
  }
  if (appliedFilters.value.price?.max) {
    filtered = filtered.filter((product) => product.price <= appliedFilters.value.price.max);
  }
  return filtered;
});

const formatCurrency = (value) => {
  if (value === null || value === undefined) return '';
  return new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK' }).format(value);
};

const handleSearchUpdate = (newSearch) => { currentSearchTerm.value = newSearch; };
const handleItemsPerPageUpdate = (newItemsPerPage) => { currentItemsPerPage.value = newItemsPerPage; };
const handlePageUpdate = (newPage) => { currentPage.value = newPage; };
const loadItems = (options) => {
  loading.value = true;
  setTimeout(() => { loading.value = false; }, 300);
};
const addNewProduct = () => {
  selectedProduct.value = {};
  productDetailDialog.value = true;
};

// ZMĚNA: Nové funkce pro zpracování událostí
const handleApplyFilters = (filters) => {
  console.log('Aplikuji filtry v Products.vue:', filters);
  appliedFilters.value = filters;
};
const handleClearFilters = () => {
  console.log('Čistím filtry v Products.vue');
  appliedFilters.value = {};
};


const openProductDetail = (item) => {
  selectedProduct.value = item;
  productDetailDialog.value = true;
};

const saveProduct = (updatedProduct) => {
  const index = products.value.findIndex((p) => p.id === updatedProduct.id);
  if (index !== -1) {
    products.value[index] = updatedProduct;
  } else {
    products.value.push({ ...updatedProduct, id: Date.now() });
  }
  productDetailDialog.value = false;
};
const deleteProduct = (item) => {
  products.value = products.value.filter(p => p.id !== item.id);
  productDetailDialog.value = false;
};
const duplicateProduct = (item) => {
  const duplicated = { ...item, id: Date.now(), productName: `${item.productName} (Kopie)` };
  products.value.push(duplicated);
  selectedProduct.value = duplicated;
  productDetailDialog.value = true;
};

const viewSales = (item) => { console.log(`Zobrazit prodeje pro produkt: ${item.productName}`); };
const saveProductColumnSettings = (newSettings) => { localStorage.setItem('productColumnSettings', JSON.stringify(newSettings)); };
const resetProductColumnSettings = () => { localStorage.removeItem('productColumnSettings'); };
</script>

<style scoped>
/* Zde nejsou potřeba žádné specifické styly */
</style>