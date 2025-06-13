<template>
  <v-container fluid class="sales-list">
    <reusable-table
      :headers="currentHeaders"
      :items="filteredAndSearchedItems"
      :itemKey="viewMode === 'receipts' ? 'receiptNumber' : 'item'"
      :searchLabel="viewMode === 'receipts' ? 'Hledat účtenku...' : 'Hledat produkt...'"
      :enableFilters="true"
      :filterDialogTitle="viewMode === 'receipts' ? 'Filtry pro účtenky' : 'Filtry pro produkty'"
      :enableColumnSettings="true"
      :columnSettingsDialogTitle="viewMode === 'receipts' ? 'Nastavení sloupců pro účtenky' : 'Nastavení sloupců pro produkty'"
      :loading="loading"
      :additionalButton="false" :mobileTitleKey="viewMode === 'receipts' ? 'receiptNumber' : 'item'"
      :mobileExcludedKeys="viewMode === 'receipts' ? ['amount', 'paymentType'] : ['itemPrice', 'quantity', 'total']"
      @row-click="handleRowClick"
      @apply-column-settings="saveColumnSettings"
      @reset-column-settings="resetColumnSettings"
      @apply-filters="applyFilters"
      @clear-filters="clearFilters"
      @update:search="handleSearchUpdate"
      @update:itemsPerPage="handleItemsPerPageUpdate"
      @update:page="handlePageUpdate"
      @load-items="loadItems"
    >
      <template #header-left-content>
        <div class="d-flex align-center flex-grow-1">
          <v-btn-toggle v-model="viewMode" rounded="1" color="primary" group class="flex-grow-1"
            style="flex-shrink: 0;">
            <v-btn value="receipts" class="flex-grow-1">
              Účtenky
            </v-btn>
            <v-btn value="products" class="flex-grow-1">
              Produkty
            </v-btn>
          </v-btn-toggle>
          <v-btn icon variant="text" @click="statsDialog = true" class="ml-2">
            <v-icon>mdi-sigma</v-icon>
          </v-btn>
        </div>
      </template>

      <template #cell-dateTime="{ item }">
        {{ formatDateTime(item.dateTime) }}
      </template>

      <template #cell-amount="{ item }">
        <span v-if="viewMode === 'receipts'">
          {{ formatCurrency(item.amount) }}
        </span>
      </template>

      <template #cell-itemPrice="{ item }">
        <span v-if="viewMode === 'products'">
          {{ formatCurrency(item.itemPrice) }}
        </span>
      </template>

      <template #cell-total="{ item }">
        <span v-if="viewMode === 'products'">
          {{ formatCurrency(item.total) }}
        </span>
      </template>

      <template #cell-tax="{ item }">
        <span v-if="viewMode === 'products'">
          {{ item.tax }} %
        </span>
      </template>

      <template #cell-paymentType="{ item }">
        <v-chip v-if="viewMode === 'receipts'" size="small"
          :color="item.paymentType === 'Platba hotově' ? 'success' : 'info'">
          {{ item.paymentType }}
        </v-chip>
      </template>

      <template #actions="{ item }">
        <v-btn v-if="viewMode === 'receipts'" icon size="small" variant="text" color="info"
          @click.stop="viewReceipt(item)">
          <v-icon>mdi-eye</v-icon>
        </v-btn>
        <v-btn v-else-if="viewMode === 'products'" icon size="small" variant="text" color="info"
          @click.stop="viewProductDetail(item)">
          <v-icon>mdi-eye</v-icon>
        </v-btn>
      </template>

      <template #mobile-title="{ item }">
        <span v-if="viewMode === 'receipts'">Účtenka: {{ item.receiptNumber || '-' }}</span>
        <span v-else-if="viewMode === 'products'">Položka: {{ item.item }}</span>
      </template>

      <template #mobile-cell-dateTime="{ item }">
        {{ formatDateTime(item.dateTime) }}
      </template>

      <template #mobile-cell-amount="{ item }">
        <span v-if="isColumnVisible('amount') && viewMode === 'receipts'">
          {{ formatCurrency(item.amount) }}
        </span>
      </template>

      <template #mobile-cell-itemPrice="{ item }">
        <span v-if="isColumnVisible('itemPrice') && viewMode === 'products'">
          {{ formatCurrency(item.itemPrice) }}
        </span>
      </template>

      <template #mobile-cell-total="{ item }">
        <span v-if="isColumnVisible('total') && viewMode === 'products'">
          {{ formatCurrency(item.total) }}
        </span>
      </template>

      <template #mobile-cell-tax="{ item }">
        <span v-if="isColumnVisible('tax') && viewMode === 'products'">
          Daň: {{ item.tax }} %
        </span>
      </template>

      <template #mobile-cell-paymentType="{ item }">
        <span v-if="isColumnVisible('paymentType') && viewMode === 'receipts'">
          Typ platby: <v-chip size="x-small" :color="item.paymentType === 'Platba hotově' ? 'success' : 'info'">
            {{ item.paymentType }}
          </v-chip>
        </span>
      </template>

      <template #mobile-append-content="{ item }">
        <div class="d-flex flex-column align-end">
          <span v-if="viewMode === 'receipts' && isColumnVisible('amount')" class="font-weight-bold text-body-1">
            {{ formatCurrency(item.amount) }}
          </span>
          <span v-if="viewMode === 'receipts' && isColumnVisible('paymentType')" class="text-caption text-medium-emphasis">
            {{ item.paymentType }}
          </span>
          <span v-if="viewMode === 'products' && isColumnVisible('total')" class="font-weight-bold text-body-1">
            {{ formatCurrency(item.total) }}
          </span>
          <span v-if="viewMode === 'products' && isColumnVisible('quantity')" class="text-caption text-medium-emphasis">
            {{ item.quantity }} ks
          </span>
        </div>
      </template>

    </reusable-table>

    <v-dialog v-model="statsDialog">
      <v-card class="rounded-lg">
        <v-card-title class="d-flex justify-space-between align-center">
          <span>Statistiky pro {{ viewMode === 'receipts' ? 'účtenky' : 'produkty' }}</span>
          <v-btn icon variant="text" @click="statsDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="py-4">
          <v-row>
            <v-col cols="12" md="4">
              <v-card class="pa-3 text-center" flat>
                <div class="text-h5">Součet tržeb</div>
                <div class="text-h4 font-weight-bold">{{ formatCurrency(totalSales) }}</div>
              </v-card>
            </v-col>
            <v-col cols="12" md="4">
              <v-card class="pa-3 text-center" flat>
                <div class="text-h5">Vystaveno účtenek</div>
                <div class="text-h4 font-weight-bold">{{ totalReceiptsCount }}</div>
              </v-card>
            </v-col>
            <v-col cols="12" md="4">
              <v-card class="pa-3 text-center" flat>
                <div class="text-h5">Prodáno položek</div>
                <div class="text-h4 font-weight-bold">{{ itemsSold }}</div>
              </v-card>
            </v-col>
            <v-col cols="12" md="4">
              <v-card class="pa-3 text-center" flat>
                <div class="text-h5">Prům. výše účtenky</div>
                <div class="text-h4 font-weight-bold">{{ formatCurrency(averageReceiptAmount) }}</div>
              </v-card>
            </v-col>
            <v-col cols="12" md="4">
              <v-card class="pa-3 text-center" flat>
                <div class="text-h5">Prům. cena produktu</div>
                <div class="text-h4 font-weight-bold">{{ formatCurrency(averageProductPrice) }}</div>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="d-flex justify-end pa-4">
          <v-btn color="primary" @click="statsDialog = false">Zavřít</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import receiptsDataRaw from '/src/data/receipts.json';
import salesDataRaw from '/src/data/sales.json';
import ReusableTable from '/src/components/ReusableTable.vue';

const loading = ref(false);

const viewMode = ref('receipts'); // 'receipts' or 'products'

// --- Data Loading and Transformation ---
const receiptsData = ref(receiptsDataRaw.map(r => ({
  ...r,
  dateTime: r.dateTime ? new Date(r.dateTime) : null,
  amount: parseFloat(r.amount) || 0,
  printed: parseInt(r.printed) || 0
})));

const salesData = ref(salesDataRaw.map(s => ({
  ...s,
  dateTime: s.dateTime ? new Date(s.dateTime) : null,
  itemPrice: parseFloat(s.itemPrice) || 0,
  quantity: parseFloat(s.quantity) || 0,
  total: parseFloat(s.total) || 0,
  tax: parseInt(s.tax) || 0
})).filter(s => s.item));


// --- Filters for Receipts ---
const receiptFilterPaymentType = ref(null);
const receiptFilterUser = ref(null);
const receiptFilterAmountMin = ref(null);
const receiptFilterAmountMax = ref(null);
const paymentTypes = computed(() => [...new Set(receiptsData.value.map(r => r.paymentType))].filter(Boolean));
const users = computed(() => [...new Set(receiptsData.value.map(r => r.user))].filter(Boolean));

// --- Filters for Products ---
const productFilterCategory = ref(null);
const productFilterItemPriceMin = ref(null);
const productFilterItemPriceMax = ref(null);
const productFilterQuantityMin = ref(null);
const productFilterQuantityMax = ref(null);
const productCategories = computed(() => [...new Set(salesData.value.map(s => s.category).filter(Boolean))]);

// --- Dialogs ---
const statsDialog = ref(false);

// --- Search and Pagination handled by ReusableTable props and events ---
const currentSearchTerm = ref('');
const currentPage = ref(1);
const currentItemsPerPage = ref(10);

// --- Headers for ReusableTable ---
const originalReceiptHeaders = [
  { title: 'Datum a čas', key: 'dateTime', align: 'start' },
  { title: 'Číslo účtenky', key: 'receiptNumber', align: 'start' },
  { title: 'Pokladna', key: 'cashRegister', align: 'start' },
  { title: 'Částka', key: 'amount', align: 'end' },
  { title: 'Typ platby', key: 'paymentType', align: 'start' },
  { title: 'Zákazník', key: 'customer', align: 'start' },
  { title: 'Poznámka', key: 'note', align: 'start' },
  { title: 'Uživatel', key: 'user', align: 'start' },
  { title: 'Vytištěno', key: 'printed', align: 'center' },
  { title: 'Akce', key: 'actions', align: 'center', sortable: false, fixed: true },
];

const originalProductSalesHeaders = [
  { title: 'Účtenka', key: 'receiptNumber', align: 'start' },
  { title: 'Datum a čas', key: 'dateTime', align: 'start' },
  { title: 'Položka', key: 'item', align: 'start' },
  { title: 'Cena za položku', key: 'itemPrice', align: 'end' },
  { title: 'Množství', key: 'quantity', align: 'end' },
  { title: 'Celkem', key: 'total', align: 'end' },
  { title: 'DPH', key: 'tax', align: 'end' },
  { title: 'Kategorie', key: 'category', align: 'start' },
  { title: 'Zákazník', key: 'customer', align: 'start' },
  { title: 'Akce', key: 'actions', align: 'center', sortable: false, fixed: true },
];

const receiptHeaders = ref(originalReceiptHeaders.map(h => ({ ...h, visible: true, key: h.key })));
const productSalesHeaders = ref(originalProductSalesHeaders.map(h => ({ ...h, visible: true, key: h.key })));

// Computed property to select the correct headers based on viewMode
const currentHeaders = computed(() => {
  return viewMode.value === 'receipts' ? receiptHeaders.value : productSalesHeaders.value;
});

// Computed property for the actual items to display based on viewMode and filters
const filteredAndSearchedItems = computed(() => {
  let itemsToFilter = viewMode.value === 'receipts' ? receiptsData.value : salesData.value;
  let filtered = itemsToFilter;

  // Apply search filter
  if (currentSearchTerm.value) {
    const searchTerm = currentSearchTerm.value.toLowerCase();
    filtered = filtered.filter(item =>
      Object.values(item).some(val =>
        val !== null && val !== undefined && String(val).toLowerCase().includes(searchTerm)
      )
    );
  }

  // Apply specific filters based on viewMode
  if (viewMode.value === 'receipts') {
    if (receiptFilterPaymentType.value) {
      filtered = filtered.filter(item => item.paymentType === receiptFilterPaymentType.value);
    }
    if (receiptFilterUser.value) {
      filtered = filtered.filter(item => item.user === receiptFilterUser.value);
    }
    if (receiptFilterAmountMin.value !== null) {
      filtered = filtered.filter(item => item.amount >= receiptFilterAmountMin.value);
    }
    if (receiptFilterAmountMax.value !== null) {
      filtered = filtered.filter(item => item.amount <= receiptFilterAmountMax.value);
    }
  } else { // viewMode === 'products'
    if (productFilterCategory.value) {
      filtered = filtered.filter(item => item.category === productFilterCategory.value);
    }
    if (productFilterItemPriceMin.value !== null) {
      filtered = filtered.filter(item => item.itemPrice >= productFilterItemPriceMin.value);
    }
    if (productFilterItemPriceMax.value !== null) {
      filtered = filtered.filter(item => item.itemPrice <= productFilterItemPriceMax.value);
    }
    if (productFilterQuantityMin.value !== null) {
      filtered = filtered.filter(item => item.quantity >= productFilterQuantityMin.value);
    }
    if (productFilterQuantityMax.value !== null) {
      filtered = filtered.filter(item => item.quantity <= productFilterQuantityMax.value);
    }
  }

  return filtered;
});

// --- Computed Statistics (remaining from original Sales.vue) ---
const totalSales = computed(() => {
  return receiptsData.value.reduce((sum, receipt) => sum + receipt.amount, 0);
});

const totalReceiptsCount = computed(() => {
  return receiptsData.value.length;
});

const itemsSold = computed(() => {
  return salesData.value.reduce((sum, item) => sum + item.quantity, 0);
});

const averageReceiptAmount = computed(() => {
  if (totalReceiptsCount.value === 0) return 0;
  return totalSales.value / totalReceiptsCount.value;
});

const averageProductPrice = computed(() => {
  if (salesData.value.length === 0) return 0;
  const total = salesData.value.reduce((sum, item) => sum + item.itemPrice, 0);
  return total / salesData.value.length;
});

// Utility function to check column visibility for mobile slots
const isColumnVisible = (key) => {
  const headers = viewMode.value === 'receipts' ? receiptHeaders.value : productSalesHeaders.value;
  const header = headers.find((h) => h.key === key);
  return header ? header.visible : false;
};


// --- Lifecycle Hook for Loading Saved Column Settings ---
onMounted(() => {
  const savedReceiptSettings = localStorage.getItem('salesReceiptColumnSettings');
  if (savedReceiptSettings) {
    receiptHeaders.value = JSON.parse(savedReceiptSettings);
  }

  const savedProductSalesSettings = localStorage.getItem('salesProductSalesColumnSettings');
  if (savedProductSalesSettings) {
    productSalesHeaders.value = JSON.parse(savedProductSalesSettings);
  }
});

// --- Handlers for ReusableTable Events ---
const handleSearchUpdate = (newSearch) => {
  currentSearchTerm.value = newSearch;
};

const handleItemsPerPageUpdate = (newItemsPerPage) => {
  currentItemsPerPage.value = newItemsPerPage;
};

const handlePageUpdate = (newPage) => {
  currentPage.value = newPage;
};

const loadItems = (options) => {
  loading.value = true;
  console.log('Loading items with options:', options);
  setTimeout(() => {
    loading.value = false;
  }, 300);
};

const handleRowClick = (item) => {
  if (viewMode.value === 'receipts') {
    viewReceipt(item);
  } else {
    viewProductDetail(item);
  }
};

const saveColumnSettings = (newSettings) => {
  if (viewMode.value === 'receipts') {
    receiptHeaders.value = newSettings;
    localStorage.setItem('salesReceiptColumnSettings', JSON.stringify(newSettings));
  } else {
    productSalesHeaders.value = newSettings;
    localStorage.setItem('salesProductSalesColumnSettings', JSON.stringify(newSettings));
  }
};

const resetColumnSettings = () => {
  if (viewMode.value === 'receipts') {
    receiptHeaders.value = originalReceiptHeaders.map(h => ({ ...h, visible: true, key: h.key }));
    localStorage.removeItem('salesReceiptColumnSettings');
  } else {
    productSalesHeaders.value = originalProductSalesHeaders.map(h => ({ ...h, visible: true, key: h.key }));
    localStorage.removeItem('salesProductSalesColumnSettings');
  }
};

const applyFilters = () => {
  // ReusableTable automatically updates items when filters change.
  // This function is mostly for closing the dialog.
};

const clearFilters = () => {
  if (viewMode.value === 'receipts') {
    receiptFilterPaymentType.value = null;
    receiptFilterUser.value = null;
    receiptFilterAmountMin.value = null;
    receiptFilterAmountMax.value = null;
  } else {
    productFilterCategory.value = null;
    productFilterItemPriceMin.value = null;
    productFilterItemPriceMax.value = null;
    productFilterQuantityMin.value = null;
    productFilterQuantityMax.value = null;
  }
  currentPage.value = 1;
};

// --- Utility Functions ---
const formatCurrency = (value) => {
  if (value === null || value === undefined) return '';
  return new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK' }).format(value);
};

const formatDateTime = (date) => {
  if (!date || isNaN(new Date(date).getTime())) {
    return '-';
  }
  const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
  return new Date(date).toLocaleDateString('cs-CZ', options);
};

const viewReceipt = (item) => {
  alert(`Zobrazit detail účtenky: ${item.receiptNumber}`);
};

const viewProductDetail = (item) => {
  alert(`Zobrazit detail produktu: ${item.item} (Účtenka: ${item.receiptNumber})`);
};

// Watch for viewMode changes to update headers and reset search/filters
watch(viewMode, () => {
  currentSearchTerm.value = '';
  clearFilters();
  currentPage.value = 1;
});
</script>

<style scoped></style>