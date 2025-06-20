<template>
  <v-container fluid class="sales-list">
    <reusable-table
      :headers="currentHeaders"
      :items="filteredAndSearchedItems"
      :itemKey="viewMode === 'receipts' ? 'receiptNumber' : 'item'"
      :searchLabel="viewMode === 'receipts' ? 'Hledat účtenku...' : 'Hledat produkt...'"
      :enableFilters="true"
      :filterDialogTitle="viewMode === 'receipts' ? 'Filtry pro účtenky' : 'Filtry pro produkty'"
      :filter-definitions="currentFilterDefinitions"
      :enableColumnSettings="true"
      :columnSettingsDialogTitle="viewMode === 'receipts' ? 'Nastavení sloupců pro účtenky' : 'Nastavení sloupců pro produkty'"
      :loading="loading"
      :additionalButton="false"
      :mobileTitleKey="viewMode === 'receipts' ? 'dateTime' : 'item'"
      :mobileExcludedKeys="viewMode === 'receipts' ? ['amount', 'paymentType'] : ['receiptNumber', 'itemPrice', 'quantity', 'customer', 'tax', 'total']"
      @apply-column-settings="saveColumnSettings"
      @reset-column-settings="resetColumnSettings"
      @apply-filters="handleApplyFilters"
      @clear-filters="handleClearFilters"
      @update:search="handleSearchUpdate"
      @update:itemsPerPage="handleItemsPerPageUpdate"
      @update:page="handlePageUpdate"
      @load-items="loadItems">
      <template #header-left-content>
        <div class="d-flex align-center flex-grow-1">
          <v-tabs v-model="viewMode" color="primary" class="flex-grow-1">
            <v-tab value="receipts">Účtenky</v-tab>
            <v-tab value="products">Produkty</v-tab>
          </v-tabs>
          <v-btn icon variant="text" @click="statsDialog = true" class="ml-2">
            <v-icon>mdi-sigma</v-icon>
          </v-btn>
        </div>
      </template>

      <template #cell-dateTime="{ item }">{{ formatDateTime(item.dateTime) }}</template>
      <template #cell-amount="{ item }"
        ><span v-if="viewMode === 'receipts'">{{ formatCurrency(item.amount) }}</span></template
      >
      <template #cell-itemPrice="{ item }"
        ><span v-if="viewMode === 'products'">{{ formatCurrency(item.itemPrice) }}</span></template
      >
      <template #cell-total="{ item }"
        ><span v-if="viewMode === 'products'">{{ formatCurrency(item.total) }}</span></template
      >
      <template #cell-tax="{ item }"
        ><span v-if="viewMode === 'products'">{{ item.tax }} %</span></template
      >
      <template #cell-paymentType="{ item }">
        <v-chip v-if="viewMode === 'receipts'" size="small" :color="item.paymentType === 'Platba hotově' ? 'success' : 'info'">
          {{ item.paymentType }}
        </v-chip>
      </template>
      <template #cell-receiptNumber="{ item }">
        <span v-if="viewMode === 'products'">{{ item.receiptNumber || "N/A" }}</span>
      </template>
      <template #cell-quantity="{ item }">
        <span v-if="viewMode === 'products'">{{ item.quantity || "N/A" }}</span>
      </template>
      <template #cell-customer="{ item }">
        <span v-if="viewMode === 'products'">{{ item.customer || "N/A" }}</span>
      </template>
      <template #cell-note="{ item }">
        <span v-if="viewMode === 'receipts'">{{ item.note || "N/A" }}</span>
      </template>
      <template #cell-printed="{ item }">
        <span v-if="viewMode === 'receipts'">{{ item.printed === 1 ? "Ano" : "Ne" }}</span>
      </template>

      <template #mobile-title="{ item }">
        <span v-if="viewMode === 'receipts'">
          {{ formatDateTime(item.dateTime) }}
        </span>
        <span v-else>
          {{ item.item }}
        </span>
      </template>

     <template #mobile-append="{ item, isColumnVisible }">
  <div v-if="viewMode === 'receipts'" class="d-flex flex-column align-end">
    <span v-if="isColumnVisible('amount')" class="font-weight-bold text-body-1">
      {{ formatCurrency(item.amount) }}
    </span>
    <v-chip v-if="isColumnVisible('paymentType')" size="small" :color="item.paymentType === 'Platba hotově' ? 'success' : 'info'" class="mt-1">
      {{ item.paymentType }}
    </v-chip>
  </div>
  </template>
    </reusable-table>

    <v-dialog v-model="statsDialog" max-width="600">
      <v-card class="rounded-lg">
        <v-card-title class="d-flex justify-space-between align-center">
          <span>Statistiky pro {{ viewMode === "receipts" ? "účtenky" : "produkty" }}</span>
          <v-btn icon variant="text" @click="statsDialog = false"><v-icon>mdi-close</v-icon></v-btn>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="py-4">
          <p>Celkový součet: {{ formatCurrency(totalSales) }}</p>
          <p>Počet zobrazených položek: {{ filteredAndSearchedItems.length }}</p>
          <p v-if="viewMode === 'receipts'">Počet unikátních účtenek: {{ totalReceiptsCount }}</p>
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
import { ref, computed, watch } from "vue";
import receiptsDataRaw from "/src/data/receipts.json";
import salesDataRaw from "/src/data/sales.json";
import ReusableTable from "/src/components/ReusableTable.vue";
import { formatCurrency } from "@/utils/formatters.js";

const loading = ref(false);
const viewMode = ref("receipts");
const appliedFilters = ref({});
const statsDialog = ref(false);
const receiptsData = ref(receiptsDataRaw);
const salesData = ref(salesDataRaw.filter((s) => s.item));

const paymentTypes = computed(() => [...new Set(receiptsData.value.map((r) => r.paymentType).filter(Boolean))]);
const users = computed(() => [...new Set(receiptsData.value.map((r) => r.user).filter(Boolean))]);
const productCategories = computed(() => [...new Set(salesData.value.map((s) => s.category).filter(Boolean))]);
const salesTaxes = computed(() => [...new Set(salesData.value.map((s) => s.tax))].sort((a, b) => a - b));
const receiptFilterDefinitions = computed(() => [
  { key: "paymentType", label: "Typ platby", items: paymentTypes.value },
  { key: "user", label: "Uživatel", items: users.value },
  { key: "customer", label: "Zákazník", type: "text" },
  { key: "note", label: "Poznámka", type: "text" },
  {
    key: "printed",
    label: "Vytištěno",
    items: [
      { value: 1, text: "Ano" },
      { value: 0, text: "Ne" },
    ],
  },
  { key: "amount", label: "Částka", type: "range", prefix: "Kč" },
]);
const productSalesFilterDefinitions = computed(() => [
  { key: "category", label: "Kategorie", items: productCategories.value },
  { key: "tax", label: "DPH", items: salesTaxes.value, suffix: "%" },
  { key: "itemPrice", label: "Cena za položku", type: "range", prefix: "Kč" },
  { key: "quantity", label: "Množství", type: "range" },
  { key: "customer", label: "Zákazník (prodej)", type: "text" },
  { key: "receiptNumber", label: "Číslo účtenky (prodej)", type: "text" },
]);
const currentFilterDefinitions = computed(() => {
  return viewMode.value === "receipts" ? receiptFilterDefinitions.value : productSalesFilterDefinitions.value;
});

const currentSearchTerm = ref("");
const currentPage = ref(1);
const currentItemsPerPage = ref(10);

const originalReceiptHeaders = [
  { title: "Datum a čas", key: "dateTime", align: "start", mandatory: true },
  { title: "Číslo účtenky", key: "receiptNumber", align: "start" },
  { title: "Částka", key: "amount", align: "end", mandatory: true },
  { title: "Typ platby", key: "paymentType", align: "start" },
  { title: "Zákazník", key: "customer", align: "start" },
  { title: "Poznámka", key: "note", align: "start" },
  { title: "Vytištěno", key: "printed", align: "center" },
  { title: "Uživatel", key: "user", align: "start" },
];
const originalProductSalesHeaders = [
  { title: "Datum a čas", key: "dateTime", align: "start", mandatory: true },
  { title: "Položka", key: "item", align: "start", mandatory: true },
  { title: "Číslo účtenky", key: "receiptNumber", align: "start" },
  { title: "Cena za položku", key: "itemPrice", align: "end" },
  { title: "Množství", key: "quantity", align: "end" },
  { title: "Celkem", key: "total", align: "end", mandatory: true },
  { title: "Kategorie", key: "category", align: "start" },
  { title: "DPH", key: "tax", align: "end" },
  { title: "Zákazník", key: "customer", align: "start" },
];
const receiptHeaders = ref(originalReceiptHeaders);
const productSalesHeaders = ref(originalProductSalesHeaders);
const currentHeaders = computed(() => {
  return viewMode.value === "receipts" ? receiptHeaders.value : productSalesHeaders.value;
});

const filteredReceipts = computed(() => {
  let items = receiptsData.value;
  if (appliedFilters.value.paymentType?.length) items = items.filter((i) => appliedFilters.value.paymentType.includes(i.paymentType));
  if (appliedFilters.value.user?.length) items = items.filter((i) => appliedFilters.value.user.includes(i.user));
  if (appliedFilters.value.amount?.min) items = items.filter((i) => i.amount >= appliedFilters.value.amount.min);
  if (appliedFilters.value.amount?.max) items = items.filter((i) => i.amount <= appliedFilters.value.amount.max);
  if (appliedFilters.value.customer) {
    const customerSearch = appliedFilters.value.customer.toLowerCase();
    items = items.filter((i) => i.customer && i.customer.toLowerCase().includes(customerSearch));
  }
  if (appliedFilters.value.note) {
    const noteSearch = appliedFilters.value.note.toLowerCase();
    items = items.filter((i) => i.note && i.note.toLowerCase().includes(noteSearch));
  }
  if ("printed" in appliedFilters.value && appliedFilters.value.printed.length > 0) {
    const printedValues = appliedFilters.value.printed.map((p) => p.value);
    items = items.filter((i) => printedValues.includes(i.printed));
  }
  return items;
});

const filteredProductSales = computed(() => {
  let items = salesData.value;
  if (appliedFilters.value.category?.length) items = items.filter((i) => appliedFilters.value.category.includes(i.category));
  if (appliedFilters.value.tax?.length) items = items.filter((i) => appliedFilters.value.tax.includes(i.tax));
  if (appliedFilters.value.itemPrice?.min) items = items.filter((i) => i.itemPrice >= appliedFilters.value.itemPrice.min);
  if (appliedFilters.value.itemPrice?.max) items = items.filter((i) => i.itemPrice <= appliedFilters.value.itemPrice.max);
  if (appliedFilters.value.quantity?.min) items = items.filter((i) => i.quantity >= appliedFilters.value.quantity.min);
  if (appliedFilters.value.quantity?.max) items = items.filter((i) => i.quantity <= appliedFilters.value.quantity.max);
  if (appliedFilters.value.customer) {
    const customerSearch = appliedFilters.value.customer.toLowerCase();
    items = items.filter((i) => i.customer && i.customer.toLowerCase().includes(customerSearch));
  }
  if (appliedFilters.value.receiptNumber) {
    const receiptNumberSearch = appliedFilters.value.receiptNumber.toLowerCase();
    items = items.filter((i) => i.receiptNumber && i.receiptNumber.toLowerCase().includes(receiptNumberSearch));
  }
  return items;
});

const filteredAndSearchedItems = computed(() => {
  let items = viewMode.value === "receipts" ? filteredReceipts.value : filteredProductSales.value;

  if (currentSearchTerm.value) {
    const searchTerm = currentSearchTerm.value.toLowerCase();
    items = items.filter((item) => Object.values(item).some((val) => String(val).toLowerCase().includes(searchTerm)));
  }
  return items;
});

const totalSales = computed(() => filteredAndSearchedItems.value.reduce((sum, item) => sum + (item.amount || item.total || 0), 0));
const totalReceiptsCount = computed(() => {
  if (viewMode.value !== "receipts") return 0;
  return new Set(filteredAndSearchedItems.value.map((i) => i.receiptNumber)).size;
});

watch(viewMode, () => {
  currentSearchTerm.value = "";
  handleClearFilters();
});

const handleApplyFilters = (filters) => (appliedFilters.value = filters);
const handleClearFilters = () => (appliedFilters.value = {});
const handleSearchUpdate = (newSearch) => (currentSearchTerm.value = newSearch);
const handleItemsPerPageUpdate = (newItemsPerPage) => (currentItemsPerPage.value = newItemsPerPage);
const handlePageUpdate = (newPage) => (currentPage.value = newPage);
const loadItems = () => {
  /* V demo verzi není potřeba */
};
const saveColumnSettings = () => {
  /* Implementace uložení do localStorage */
};
const resetColumnSettings = () => {
  /* Implementace resetu */
};
const formatDateTime = (date) =>
  date ? new Date(date).toLocaleString("cs-CZ", { year: "2-digit", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }) : "-";
</script>
