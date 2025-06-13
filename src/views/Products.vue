<template>
  <v-container fluid class="products-list">
    <reusable-table
      :headers="productHeaders"
      :items="filteredProducts"
      itemKey="id"
      searchLabel="Hledat produkt"
      :enableFilters="true"
      filterDialogTitle="Filtry produktů"
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
      @apply-filters="applyFilters"
      @clear-filters="clearFilters"
      @update:search="handleSearchUpdate"
      @update:itemsPerPage="handleItemsPerPageUpdate"
      @update:page="handlePageUpdate"
      @load-items="loadItems"
    >
      <template #active-filters>
        <div v-if="activeFilters.length > 0" class="d-flex flex-wrap align-center ga-2">
          <span class="text-caption">Aktivní filtry:</span>
          <v-chip
            v-for="(filter, index) in activeFilters"
            :key="`${filter.type}-${index}`"
            closable
            @click:close="removeFilter(filter)"
            size="small"
          >
            <strong>{{ filter.label }}:</strong>&nbsp;{{ filter.displayValue }}
          </v-chip>
        </div>
      </template>

      <template #filters>
        <div class="mb-4">
          <div class="text-subtitle-1 mb-2">Kategorie</div>
          <v-chip-group v-model="filterCategory" multiple class="chip-group-wrap">
            <v-chip
              v-for="category in categories"
              :key="category"
              :value="category"
              filter
            >
              {{ category }}
            </v-chip>
          </v-chip-group>
        </div>
        <v-divider class="my-4"></v-divider>

        <div class="mb-4">
          <div class="text-subtitle-1 mb-2">Daň</div>
           <v-chip-group v-model="filterTax" multiple class="chip-group-wrap">
            <v-chip
              v-for="tax in taxes"
              :key="tax"
              :value="tax"
              filter
            >
              {{ `${tax} %` }}
            </v-chip>
          </v-chip-group>
        </div>
        <v-divider class="my-4"></v-divider>

        <div class="mb-4">
          <div class="text-subtitle-1 mb-2">Cena</div>
          <v-row>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model.number="filterPriceMin"
                label="Cena od"
                type="number"
                prefix="Kč"
                clearable
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model.number="filterPriceMax"
                label="Cena do"
                type="number"
                prefix="Kč"
                clearable
              ></v-text-field>
            </v-col>
          </v-row>
        </div>
      </template>

      <template #cell-productName="{ item }">
        <div class="py-2">{{ item.productName }}</div>
      </template>
      <template #cell-tax="{ item }">{{ item.tax }} %</template>
      <template #cell-price="{ item }">{{ formatCurrency(item.price) }}</template>
      <template #actions="{ item }">
        <v-btn icon size="small" variant="text" color="info" @click.stop="openProductDetail(item)">
          <v-icon>mdi-eye</v-icon>
        </v-btn>
      </template>
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

const filterCategory = ref([]);
const filterTax = ref([]);
const filterPriceMin = ref(null);
const filterPriceMax = ref(null);

const productDetailDialog = ref(false);
const selectedProduct = ref(null);

const originalHeaders = [
  { title: 'Název produktu', key: 'productName', dataAlign: 'start', fixed: true },
  { title: 'Kategorie', key: 'category', dataAlign: 'start' },
  { title: 'Cena', key: 'price', dataAlign: 'end', fixed: true },
  { title: 'Daň', key: 'tax', dataAlign: 'end' },
  { title: 'Barva', key: 'Barva', dataAlign: 'center', visible: true },
  { title: 'SKU', key: 'SKU', dataAlign: 'start', visible: true },
];
const productHeaders = ref(originalHeaders);

const products = ref([]);
const categories = ref([]);
const taxes = ref([]);

const currentSearchTerm = ref('');
const currentPage = ref(1);
const currentItemsPerPage = ref(10);

const activeFilters = computed(() => {
  const filters = [];
  if (filterCategory.value.length > 0) {
    filterCategory.value.forEach(cat => {
      filters.push({ type: 'category', label: 'Kategorie', value: cat, displayValue: cat });
    });
  }
  if (filterTax.value.length > 0) {
    filterTax.value.forEach(tax => {
      filters.push({ type: 'tax', label: 'Daň', value: tax, displayValue: `${tax} %` });
    });
  }
  if (filterPriceMin.value) {
    filters.push({ type: 'priceMin', label: 'Cena od', value: filterPriceMin.value, displayValue: formatCurrency(filterPriceMin.value) });
  }
  if (filterPriceMax.value) {
    filters.push({ type: 'priceMax', label: 'Cena do', value: filterPriceMax.value, displayValue: formatCurrency(filterPriceMax.value) });
  }
  return filters;
});

const removeFilter = (filterToRemove) => {
  switch (filterToRemove.type) {
    case 'category':
      filterCategory.value = filterCategory.value.filter(cat => cat !== filterToRemove.value);
      break;
    case 'tax':
      filterTax.value = filterTax.value.filter(tax => tax !== filterToRemove.value);
      break;
    case 'priceMin':
      filterPriceMin.value = null;
      break;
    case 'priceMax':
      filterPriceMax.value = null;
      break;
  }
};

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

  if (filterCategory.value.length > 0) {
    filtered = filtered.filter((product) => filterCategory.value.includes(product.category));
  }
  if (filterTax.value.length > 0) {
    filtered = filtered.filter((product) => filterTax.value.includes(product.tax));
  }
  if (filterPriceMin.value) {
    filtered = filtered.filter((product) => product.price >= filterPriceMin.value);
  }
  if (filterPriceMax.value) {
    filtered = filtered.filter((product) => product.price <= filterPriceMax.value);
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

const applyFilters = () => { console.log('Filtry aplikovány.'); };

const clearFilters = () => {
  filterCategory.value = [];
  filterTax.value = [];
  filterPriceMin.value = null;
  filterPriceMax.value = null;
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
.chip-group-wrap :deep(.v-chip-group__container) {
  display: flex !important; 
  flex-wrap: wrap !important;
  gap: 8px;
}
</style>