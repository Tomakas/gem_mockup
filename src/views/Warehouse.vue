<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12" md="8">
        <h1 class="text-h4 mb-4">Skladové doklady</h1>
        <reusable-table
          :headers="documentHeaders"
          :items="filteredDocuments"
          itemKey="id"
          searchLabel="Hledat doklad..."
          :enableFilters="true"
          :filter-definitions="filterDefinitions"
          :enableColumnSettings="true"
          columnSettingsDialogTitle="Nastavení sloupců dokladů"
          mobileTitleKey="documentNumber"
          :mobileExcludedKeys="['supplier', 'itemCount']"
          @row-click="openDocumentDetail"
          @apply-filters="handleApplyFilters"
          @clear-filters="handleClearFilters"
          @update:search="handleSearchUpdate"
        >
          <template #cell-type="{ item }">
            <v-chip size="small" :color="getTypeColor(item.type)" variant="tonal">
              {{ item.type }}
            </v-chip>
          </template>
          <template #cell-dateTime="{ item }">
            {{ formatDateTime(item.dateTime) }}
          </template>
          <template #cell-totalPurchasePrice="{ item }">
            {{ formatCurrency(item.totalPurchasePrice) }}
          </template>
          <template #cell-totalSellingPrice="{ item }">
            {{ formatCurrency(item.totalSellingPrice) }}
          </template>
        </reusable-table>
      </v-col>

      <v-col cols="12" md="4">
        <h1 class="text-h4 mb-4">Poslední pohyby</h1>
        <v-card>
          <v-card-text>
            <v-data-table
              :headers="movementsHeaders"
              :items="stockMovements"
              item-key="id"
              density="compact"
            >
              <template #item.dateTime="{ item }">
                {{ formatDateTime(item.dateTime) }}
              </template>
              <template #item.change="{ item }">
                <span :class="item.change.startsWith('+') ? 'text-success' : 'text-error'">
                  {{ item.change }}
                </span>
              </template>
              <template #item.valueChangeNC="{ item }">
                {{ formatCurrency(item.valueChangeNC) }}
              </template>
              <template #bottom></template> </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <stock-document-detail
      v-model="isDetailDialogVisible"
      :document="selectedDocument"
    />
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import ReusableTable from '@/components/ReusableTable.vue';
import StockDocumentDetail from '@/components/StockDocumentDetail.vue';
import { formatCurrency } from '@/utils/formatters.js';
import stockData from '@/data/stock.json';

// --- State ---
const stockDocuments = ref([]);
const stockMovements = ref([]);
const currentSearchTerm = ref('');
const appliedFilters = ref({});
const isDetailDialogVisible = ref(false);
const selectedDocument = ref(null);

// --- Načtení dat ---
onMounted(() => {
  stockDocuments.value = stockData.stockDocuments;
  stockMovements.value = stockData.stockMovements;
});

// --- Hlavičky a filtry pro ReusableTable ---
const documentHeaders = ref([
  { title: 'Typ', key: 'type', mandatory: true },
  { title: 'Číslo dokladu', key: 'documentNumber', mandatory: true },
  { title: 'Datum a čas', key: 'dateTime' },
  { title: 'Dodavatel', key: 'supplier' },
  { title: 'Počet položek', key: 'itemCount', align: 'end' },
  { title: 'Cena v NC', key: 'totalPurchasePrice', align: 'end' },
  { title: 'Cena v PC', key: 'totalSellingPrice', align: 'end' },
]);

const filterDefinitions = computed(() => [
  {
    key: 'type',
    label: 'Typ záznamu',
    items: [...new Set(stockDocuments.value.map(d => d.type))]
  },
  {
    key: 'supplier',
    label: 'Dodavatel',
    items: [...new Set(stockDocuments.value.map(d => d.supplier).filter(Boolean))]
  },
  {
    key: 'totalPurchasePrice',
    label: 'Celková nákupní cena',
    type: 'range',
    prefix: 'Kč'
  }
]);

// --- Hlavičky pro tabulku pohybů ---
const movementsHeaders = [
  { title: 'Datum a čas', key: 'dateTime', sortable: false },
  { title: 'Produkt', key: 'productName', sortable: false },
  { title: 'Změna', key: 'change', align: 'end', sortable: false },
  { title: 'Změna v NC', key: 'valueChangeNC', align: 'end', sortable: false },
];

// --- Logika filtrování ---
const filteredDocuments = computed(() => {
  let filtered = stockDocuments.value;

  // Filtrování podle textu
  if (currentSearchTerm.value) {
    const term = currentSearchTerm.value.toLowerCase();
    filtered = filtered.filter(doc =>
      Object.values(doc).some(val => String(val).toLowerCase().includes(term))
    );
  }

  // Filtrování podle definic
  if (appliedFilters.value.type?.length) {
    filtered = filtered.filter(doc => appliedFilters.value.type.includes(doc.type));
  }
  if (appliedFilters.value.supplier?.length) {
    filtered = filtered.filter(doc => appliedFilters.value.supplier.includes(doc.supplier));
  }
  if (appliedFilters.value.totalPurchasePrice?.min) {
    filtered = filtered.filter(doc => doc.totalPurchasePrice >= appliedFilters.value.totalPurchasePrice.min);
  }
  if (appliedFilters.value.totalPurchasePrice?.max) {
    filtered = filtered.filter(doc => doc.totalPurchasePrice <= appliedFilters.value.totalPurchasePrice.max);
  }

  return filtered;
});

// --- Handlery událostí ---
const handleSearchUpdate = (search) => {
  currentSearchTerm.value = search;
};
const handleApplyFilters = (filters) => {
  appliedFilters.value = filters;
};
const handleClearFilters = () => {
  appliedFilters.value = {};
};
const openDocumentDetail = (document) => {
  selectedDocument.value = document;
  isDetailDialogVisible.value = true;
};

// --- Formátovací a pomocné funkce ---
const formatDateTime = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleString('cs-CZ');
};

const getTypeColor = (type) => {
  switch(type) {
    case 'Příjemka': return 'success';
    case 'Inventura': return 'warning';
    case 'Oprava skladu': return 'error';
    default: return 'grey';
  }
};
</script>
