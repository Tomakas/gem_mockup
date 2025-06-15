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
      :mobileExcludedKeys="['price', 'tax', 'Dodavatel', 'Poznámka']"
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
      <template #cell-Dodavatel="{ item }">{{ item.Dodavatel || 'N/A' }}</template>
      <template #cell-Poznámka="{ item }">{{ item.Poznámka || 'N/A' }}</template>

      <template #mobile-title="{ item }">
        {{ item.productName }}
      </template>
      <template #mobile-append="{ item, isColumnVisible }">
        <div class="d-flex flex-column align-end">
          <span v-if="isColumnVisible('price')" class="font-weight-bold text-body-1">
            <slot name="cell-price" :item="item">
              {{ item.price }}
            </slot>
          </span>
          <span v-if="isColumnVisible('tax')" class="text-caption text-medium-emphasis">
            <slot name="cell-tax" :item="item">
              Daň: {{ item.tax }} %
            </slot>
          </span>
          <span v-if="isColumnVisible('Dodavatel')" class="text-caption text-medium-emphasis">
            Dodavatel: {{ item.Dodavatel || 'N/A' }}
          </span>
          <span v-if="isColumnVisible('Poznámka')" class="text-caption text-medium-emphasis">
            Poznámka: {{ item.Poznámka || 'N/A' }}
          </span>
        </div>
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
const appliedFilters = ref({});
const productDetailDialog = ref(false);
const selectedProduct = ref(null);
const originalHeaders = [
  { title: 'Název produktu', key: 'productName', dataAlign: 'end', mandatory: true },
  { title: 'Kategorie', key: 'category', dataAlign: 'end' },
  { title: 'Cena', key: 'price', dataAlign: 'end', mandatory: true },
  { title: 'Daň', key: 'tax', dataAlign: 'end' },
  { title: 'Dodavatel', key: 'Dodavatel', dataAlign: 'start', visible: true }, // Přidáno
  { title: 'Barva', key: 'Barva', dataAlign: 'center', visible: true },
  { title: 'SKU', key: 'SKU', dataAlign: 'start', visible: true },
  { title: 'Poznámka', key: 'Poznámka', dataAlign: 'start', visible: true }, // Přidáno
];
const productHeaders = ref(originalHeaders);

const products = ref([]);
const categories = ref([]);
const taxes = ref([]);
const suppliers = ref([]); // Nová proměnná pro dodavatele
const productFilterDefinitions = computed(() => [
  {
    key: 'category',
    label: 'Kategorie',
    items: categories.value
  },
  {
    key: 'tax',
    label: 'Daň',
    items: taxes.value,
    suffix: '%'
  },
  {
    key: 'price',
    label: 'Cena',
    type: 'range',
    prefix: 'Kč'
  },
  {
    key: 'Dodavatel', // Nový filtr pro dodavatele
    label: 'Dodavatel',
    items: suppliers.value
  },
  {
    key: 'Poznámka', // Nový filtr pro poznámku
    label: 'Poznámka',
    type: 'text'
  },
]);
const currentSearchTerm = ref('');
const currentPage = ref(1);
const currentItemsPerPage = ref(10);
onMounted(() => {
  try {
    products.value = productDataJson;
    categories.value = [...new Set(products.value.map((p) => p.category))].sort();
    taxes.value = [...new Set(products.value.map((p) => p.tax))].sort((a, b) => a - b);
    suppliers.value = [...new Set(products.value.map((p) => p.Dodavatel).filter(Boolean))].sort(); // Načtení dodavatelů
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

  if (appliedFilters.value.category?.length > 0) {
    filtered = filtered.filter((product) => appliedFilters.value.category.includes(product.category));
  }
  if (appliedFilters.value.tax?.length > 0) {
    filtered = filtered.filter((product) => appliedFilters.value.tax.includes(product.tax));
  }
  if (appliedFilters.value.price?.min) {
    filtered = filtered.filter((product) => product.price >= appliedFilters.value.price.min);
  }
  if (appliedFilters.value.price?.max) {
    filtered = filtered.filter((product) => product.price <= appliedFilters.value.price.max);
  }
  // Filtrace pro Dodavatele a Poznámku
  if (appliedFilters.value.Dodavatel?.length > 0) {
    filtered = filtered.filter((product) => appliedFilters.value.Dodavatel.includes(product.Dodavatel));
  }
  if (appliedFilters.value.Poznámka) {
    const noteSearch = appliedFilters.value.Poznámka.toLowerCase();
    filtered = filtered.filter((product) => product.Poznámka && product.Poznámka.toLowerCase().includes(noteSearch));
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
const loadItems = () => {
  loading.value = true;
  setTimeout(() => { loading.value = false; }, 300);
};
const handleApplyFilters = (filters) => {
  appliedFilters.value = filters;
};
const handleClearFilters = () => {
  appliedFilters.value = {};
};
const addNewProduct = () => {
  selectedProduct.value = {};
  productDetailDialog.value = true;
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