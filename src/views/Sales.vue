<template>
  <v-container fluid class="sales-list">
    <v-card>
      <v-card-text>

        <v-row class="mb-4">
          <v-col cols="12" sm="6" md="6" class="d-flex align-left">
            <v-btn-toggle v-model="viewMode" rounded="1" color="primary" group class="flex-grow-1"
              style="flex-shrink: 0;">
              <v-btn value="receipts" class="flex-grow-1">
                Účtenky
              </v-btn>
              <v-btn value="products" class="flex-grow-1">
                Produkty
              </v-btn>
            </v-btn-toggle>
          </v-col>

          <v-col cols="12" sm="6" md="6" class="d-flex align-left">
            <v-text-field v-model="search" label="Hledat..." append-inner-icon="mdi-magnify"
              style="flex-grow: 1;"></v-text-field>

            <v-btn icon variant="text" @click="filterDialog = true">
              <v-icon>mdi-filter</v-icon>
            </v-btn>
            <v-btn icon variant="text" @click="statsDialog = true">
              <v-icon>mdi-sigma</v-icon>
            </v-btn>
            <v-btn icon variant="text" @click="columnSettingsDialog = true">
              <v-icon>mdi-cog</v-icon>
            </v-btn>
          </v-col>
        </v-row>



        <v-dialog v-model="filterDialog">
          <v-card class="rounded-lg">
            <v-card-title class="d-flex justify-space-between align-center">
              <span>Filtry pro {{ viewMode === 'receipts' ? 'účtenky' : 'produkty' }}</span>
              <v-btn icon variant="text" @click="filterDialog = false">
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text class="py-4">
              <v-row v-if="viewMode === 'receipts'">
                <v-col cols="12" sm="6" md="4">
                  <v-select v-model="receiptFilterPaymentType" :items="paymentTypes" label="Typ platby"
                    clearable></v-select>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <v-select v-model="receiptFilterUser" :items="users" label="Uživatel" clearable></v-select>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <v-text-field v-model.number="receiptFilterAmountMin" label="Částka od" type="number"
                    prefix="Kč"></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <v-text-field v-model.number="receiptFilterAmountMax" label="Částka do" type="number"
                    prefix="Kč"></v-text-field>
                </v-col>
              </v-row>
              <v-row v-else-if="viewMode === 'products'">
                <v-col cols="12" sm="6" md="4">
                  <v-select v-model="productFilterCategory" :items="productCategories" label="Kategorie produktu"
                    clearable></v-select>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <v-text-field v-model.number="productFilterItemPriceMin" label="Cena položky od" type="number"
                    prefix="Kč"></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <v-text-field v-model.number="productFilterItemPriceMax" label="Cena položky do" type="number"
                    prefix="Kč"></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <v-text-field v-model.number="productFilterQuantityMin" label="Množství od"
                    type="number"></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <v-text-field v-model.number="productFilterQuantityMax" label="Množství do"
                    type="number"></v-text-field>
                </v-col>
              </v-row>
            </v-card-text>
            <v-divider></v-divider>
            <v-card-actions class="d-flex justify-end pa-4">
              <v-btn variant="text" @click="clearFilters">Vyčistit filtry</v-btn>
              <v-btn color="primary" @click="applyFilters">Filtrovat</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <v-dialog v-model="columnSettingsDialog" max-width="400">
          <v-card class="rounded-lg">
            <v-card-title class="d-flex justify-space-between align-center">
              <span>Nastavení sloupců pro {{ viewMode === 'receipts' ? 'účtenky' : 'produkty' }}</span>
              <v-btn icon variant="text" @click="columnSettingsDialog = false">
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text class="py-4">
              <div v-if="currentColumnSettings.length > 0" class="column-settings-container-final">
                <p class="text-caption mb-3">Přetáhněte pro změnu pořadí, zaškrtněte pro viditelnost.</p>

                <draggable v-model="currentColumnSettings" item-key="key" handle=".handle" tag="div"
                  class="draggable-list-final">
                  <template #item="{ element }">
                    <div :class="['draggable-item-table-settings', { 'fixed-column': element.fixed }]">
                      <v-icon class="handle mr-2">mdi-drag-vertical</v-icon>
                      <span class="flex-grow-1">{{ element.title }}</span>
                      <v-checkbox v-model="element.visible" density="compact" hide-details class="ml-auto"
                        :disabled="element.fixed"></v-checkbox>
                    </div>
                  </template>
                </draggable>
              </div>
              <div v-else class="text-center text-medium-emphasis">
                Žádné sloupce k nastavení.
              </div>
            </v-card-text>
            <v-divider></v-divider>
            <v-card-actions class="d-flex justify-end pa-4">
              <v-btn variant="text" @click="resetColumnSettings">Resetovat</v-btn>
              <v-btn color="primary" @click="applyColumnSettings">Použít</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

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

        <v-data-table :headers="visibleAndOrderedHeaders" :items="filteredAndSearchedItems"
          :item-value="viewMode === 'receipts' ? 'receiptNumber' : 'item'" class="elevation-0 mt-4"
          :items-per-page="itemsPerPage" v-model:page="page" :items-length="filteredAndSearchedItems.length">
          <template v-slot:item.dateTime="{ item }">
            {{ formatDateTime(item.dateTime) }}
          </template>

          <template v-slot:item.receiptNumber="{ item }">
            {{ item.receiptNumber || '-' }}
          </template>

          <template v-slot:item.amount="{ item }">
            <span v-if="viewMode === 'receipts'">
              {{ formatCurrency(item.amount) }}
            </span>
          </template>

          <template v-slot:item.itemPrice="{ item }">
            <span v-if="viewMode === 'products'">
              {{ formatCurrency(item.itemPrice) }}
            </span>
          </template>

          <template v-slot:item.total="{ item }">
            <span v-if="viewMode === 'products'">
              {{ formatCurrency(item.total) }}
            </span>
          </template>

          <template v-slot:item.tax="{ item }">
            <span v-if="viewMode === 'products'">
              {{ item.tax }} %
            </span>
          </template>

          <template v-slot:item.paymentType="{ item }">
            <v-chip v-if="viewMode === 'receipts'" size="small"
              :color="item.paymentType === 'Platba hotově' ? 'success' : 'info'">
              {{ item.paymentType }}
            </v-chip>
          </template>

          <template v-slot:item.actions="{ item }">
            <v-btn v-if="viewMode === 'receipts'" icon size="small" variant="text" color="info"
              @click="viewReceipt(item)">
              <v-icon>mdi-eye</v-icon>
            </v-btn>
            <v-btn v-else-if="viewMode === 'products'" icon size="small" variant="text" color="info"
              @click="viewProductDetail(item)">
              <v-icon>mdi-eye</v-icon>
            </v-btn>
          </template>

          <template v-slot:bottom>
            <div class="d-flex justify-space-between align-center px-4 py-2">
              <v-select v-model="itemsPerPage" :items="[5, 10, 15, 20]" label="Položek na stránku"
                style="max-width: 150px;"></v-select>

              <v-pagination v-model="page" :length="Math.ceil(filteredAndSearchedItems.length / itemsPerPage)"
                :total-visible="5" density="compact" class="d-none d-sm-flex"></v-pagination>

              <div class="d-flex align-center d-sm-none"> <v-btn icon size="small" variant="text" @click="page--"
                  :disabled="page === 1">
                  <v-icon>mdi-chevron-left</v-icon>
                </v-btn>
                <div class="text-caption mx-2 text-no-wrap"> {{ (page - 1) * itemsPerPage + 1 }}-{{ Math.min(page *
                  itemsPerPage, filteredAndSearchedItems.length) }} z {{
                    filteredAndSearchedItems.length }}
                </div>
                <v-btn icon size="small" variant="text" @click="page++"
                  :disabled="page * itemsPerPage >= filteredAndSearchedItems.length">
                  <v-icon>mdi-chevron-right</v-icon>
                </v-btn>
              </div>

              <div class="text-caption d-none d-sm-flex">
                {{ (page - 1) * itemsPerPage + 1 }}-{{ Math.min(page * itemsPerPage, filteredAndSearchedItems.length) }}
                z {{ filteredAndSearchedItems.length }}
              </div>
            </div>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import draggable from 'vuedraggable';
import receiptsDataRaw from '/src/data/receipts.json';
import salesDataRaw from '/src/data/sales.json';

const page = ref(1);
const itemsPerPage = ref(10);

// --- Načtení dat z JSON ---
// Data jsou nyní načítána přímo z importovaných JSON souborů.
// Mapujeme je, abychom zajistili správné typy (Date objekty, čísla).
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
})).filter(s => s.item)); // Filter pro odstranění prázdných řádků, kde item je null (pokud by se objevily)


// --- Původní fiktivní proměnné nahrazené computed properties z načtených dat ---
const totalSales = computed(() => {
  return receiptsData.value.reduce((sum, receipt) => sum + receipt.amount, 0);
});
const totalReceiptsCount = computed(() => {
  return receiptsData.value.length;
});
const itemsSold = computed(() => {
  return salesData.value.reduce((sum, item) => sum + item.quantity, 0);
});


const viewMode = ref('receipts');

const search = ref('');
const filterDialog = ref(false);

const receiptFilterPaymentType = ref(null);
const receiptFilterUser = ref(null);
const receiptFilterAmountMin = ref(null);
const receiptFilterAmountMax = ref(null);
const paymentTypes = computed(() => [...new Set(receiptsData.value.map(r => r.paymentType))]);
const users = computed(() => [...new Set(receiptsData.value.map(r => r.user))]);


const productFilterCategory = ref(null);
const productFilterItemPriceMin = ref(null);
const productFilterItemPriceMax = ref(null);
const productFilterQuantityMin = ref(null);
const productFilterQuantityMax = ref(null);
const productCategories = computed(() => [...new Set(salesData.value.map(s => s.category).filter(Boolean))]);


const columnSettingsDialog = ref(false);
const statsDialog = ref(false);

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

const receiptColumnSettings = ref(originalReceiptHeaders.map(h => ({ ...h, visible: true, key: h.key })));
const productColumnSettings = ref(originalProductSalesHeaders.map(h => ({ ...h, visible: true, key: h.key })));


const currentColumnSettings = computed({
  get() {
    return viewMode.value === 'receipts' ? receiptColumnSettings.value : productColumnSettings.value;
  },
  set(newValue) {
    if (viewMode.value === 'receipts') {
      receiptColumnSettings.value = newValue;
    } else {
      productColumnSettings.value = newValue;
    }
  }
});

const visibleAndOrderedHeaders = computed(() => {
  return currentColumnSettings.value.filter(h => h.visible);
});


watch(viewMode, () => {
  search.value = '';
  clearFilters();
  page.value = 1;
});


const filteredAndSearchedItems = computed(() => {
  let itemsToFilter = viewMode.value === 'receipts' ? receiptsData.value : salesData.value;
  let filtered = itemsToFilter;

  if (viewMode.value === 'receipts') {
    if (receiptFilterPaymentType.value) {
      filtered = filtered.filter(item => item.paymentType === receiptFilterPaymentType.value);
    }
    if (receiptFilterUser.value) {
      filtered = filtered.filter(item => item.user === receiptFilterUser.value);
    }
    if (receiptFilterAmountMin.value !== null && receiptFilterAmountMin.value !== '') {
      filtered = filtered.filter(item => item.amount >= receiptFilterAmountMin.value);
    }
    if (receiptFilterAmountMax.value !== null && receiptFilterAmountMax.value !== '') {
      filtered = filtered.filter(item => item.amount <= receiptFilterAmountMax.value);
    }

    if (search.value) {
      const searchTerm = search.value.toLowerCase();
      filtered = filtered.filter(item =>
        item.receiptNumber.toLowerCase().includes(searchTerm) ||
        item.cashRegister.toLowerCase().includes(searchTerm) ||
        item.paymentType.toLowerCase().includes(searchTerm) ||
        item.customer.toLowerCase().includes(searchTerm) ||
        item.user.toLowerCase().includes(searchTerm) ||
        (item.note && item.note.toLowerCase().includes(searchTerm)) ||
        formatCurrency(item.amount).toLowerCase().includes(searchTerm)
      );
    }

  } else { // viewMode === 'products'
    if (productFilterCategory.value) {
      filtered = filtered.filter(item => item.category === productFilterCategory.value);
    }
    if (productFilterItemPriceMin.value !== null && productFilterItemPriceMin.value !== '') {
      filtered = filtered.filter(item => item.itemPrice >= productFilterItemPriceMin.value);
    }
    if (productFilterItemPriceMax.value !== null && productFilterItemPriceMax.value !== '') {
      filtered = filtered.filter(item => item.itemPrice <= productFilterItemPriceMax.value);
    }
    if (productFilterQuantityMin.value !== null && productFilterQuantityMin.value !== '') {
      filtered = filtered.filter(item => item.quantity >= productFilterQuantityMin.value);
    }
    if (productFilterQuantityMax.value !== null && productFilterQuantityMax.value !== '') {
      filtered = filtered.filter(item => item.quantity <= productFilterQuantityMax.value);
    }

    if (search.value) {
      const searchTerm = search.value.toLowerCase();
      filtered = filtered.filter(item =>
        item.item.toLowerCase().includes(searchTerm) || // Hledání v názvu položky
        item.receiptNumber.toLowerCase().includes(searchTerm) ||
        item.category.toLowerCase().includes(searchTerm) ||
        item.customer.toLowerCase().includes(searchTerm) ||
        formatCurrency(item.itemPrice).toLowerCase().includes(searchTerm) ||
        formatCurrency(item.total).toLowerCase().includes(searchTerm)
      );
    }
  }

  const totalPages = Math.ceil(filtered.length / itemsPerPage.value);
  if (page.value > totalPages && totalPages > 0) {
    page.value = 1;
  } else if (totalPages === 0 && page.value !== 1) {
    page.value = 1;
  }
  return filtered;
});


const applyFilters = () => {
  filterDialog.value = false;
  page.value = 1;
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
  page.value = 1;
  filterDialog.value = false;
};

const openColumnSettingsDialog = () => {
  columnSettingsDialog.value = true;
};

const applyColumnSettings = () => {
  columnSettingsDialog.value = false;
};

const resetColumnSettings = () => {
  if (viewMode.value === 'receipts') {
    receiptColumnSettings.value = originalReceiptHeaders.map(h => ({ ...h, visible: true, key: h.key }));
  } else {
    productColumnSettings.value = originalProductSalesHeaders.map(h => ({ ...h, visible: true, key: h.key }));
  }
};


const formatCurrency = (value) => {
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

const averageReceiptAmount = computed(() => {
  if (receiptsData.value.length === 0) return 0;
  const total = receiptsData.value.reduce((sum, receipt) => sum + receipt.amount, 0);
  return total / receiptsData.value.length;
});

const averageProductPrice = computed(() => {
  if (salesData.value.length === 0) return 0;
  const total = salesData.value.reduce((sum, item) => sum + item.itemPrice, 0);
  return total / salesData.value.length;
});
</script>

<style scoped></style>