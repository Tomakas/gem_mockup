<template>
  <v-container fluid class="cash-registers-page">
    <v-row>
      <v-col
        v-for="register in cashRegisters"
        :key="register.id"
        cols="12"
        md="6"
        lg="4"
      >
        <v-card class="pa-4 h-100 d-flex flex-column">
          <v-card-title class="d-flex align-center">
            <v-icon
              :color="register.isActive ? 'success' : 'error'"
              class="mr-3 flex-shrink-0"
              >{{
                register.isActive ? 'mdi-check-circle' : 'mdi-alert-circle'
              }}</v-icon
            >
            <div class="text-h5 flex-grow-1 flex-shrink-1 text-truncate">
              {{ register.name }}
            </div>
            <v-chip
              :color="register.isActive ? 'success' : 'grey'"
              size="small"
              class="ml-3 mr-2 flex-shrink-0"
              >{{ register.isActive ? 'Aktivní' : 'Neaktivní' }}</v-chip
            >
            <v-btn
              icon
              size="default"
              variant="text"
              @click="openRegisterSettings(register)"
              class="flex-shrink-0"
            >
              <v-icon>mdi-cog</v-icon>
            </v-btn>
          </v-card-title>
          <v-card-text class="flex-grow-1 cash-register-details">
            <v-list density="compact" class="py-0">
              <v-list-item class="detail-row">
                <span class="font-weight-bold">Kód pokladny:</span>
                <span class="ml-2 text-medium-emphasis">{{ register.code }}</span>
              </v-list-item>
              <v-list-item class="detail-row">
                <span class="font-weight-bold">Poslední aktivita:</span>
                <span class="ml-2 text-medium-emphasis">{{
                  formatDateTime(register.lastUsed)
                }}</span>
              </v-list-item>
              <v-list-item class="detail-row">
                <span class="font-weight-bold">Mód pokladny:</span>
                <span class="ml-2 text-medium-emphasis">{{
                  register.mode
                }}</span>
              </v-list-item>

              <div class="d-flex align-center detail-row px-4">
                <span class="font-weight-bold">Přihlášený uživatel:</span>
                <span class="ml-2 text-medium-emphasis">{{
                  register.currentUser || 'Není přihlášen'
                }}</span>
                <v-spacer></v-spacer>
                <v-btn
                  variant="flat"
                  size="small"
                  color="secondary"
                  class="ml-2"
                  @click="viewShiftOverview(register)"
                >
                  Směny
                </v-btn>
              </div>

              <div class="d-flex align-center detail-row px-4">
                <span class="font-weight-bold">Stav hotovosti:</span>
                <span class="ml-2 text-medium-emphasis">{{
                  formatCurrency(register.cashInDrawer)
                }}</span>
                <v-spacer></v-spacer>
                <v-btn
                  variant="flat"
                  size="small"
                  color="warning"
                  class="ml-2"
                  @click="openCashJournal(register)"
                >
                  Deník
                </v-btn>
              </div>
              
              <div class="d-flex align-center detail-row px-4">
                <span class="font-weight-bold">Počet objednávek:</span>
                <span class="ml-2 text-medium-emphasis">{{
                  register.numberOfOrders
                }}</span>
                <v-spacer></v-spacer>
                <v-btn
                  variant="flat"
                  size="small"
                  color="success"
                  class="ml-2"
                  @click="viewOrders(register)"
                >
                  Objednávky
                </v-btn>
              </div>
            </v-list>
          </v-card-text>
          <v-card-actions class="pa-4 pt-0 d-flex flex-wrap">
            <v-row no-gutters class="mb-2">
              <v-col cols="6" class="pr-1">
                <v-btn
                  color="primary"
                  variant="outlined"
                  block
                  @click="viewReceipts(register)"
                >
                  <v-icon start>mdi-receipt-text-outline</v-icon>Účtenky
                </v-btn>
              </v-col>
              <v-col cols="6" class="pl-1">
                <v-btn
                  color="info"
                  variant="outlined"
                  block
                  @click="viewSales(register)"
                >
                  <v-icon start>mdi-chart-bar</v-icon>Prodeje
                </v-btn>
              </v-col>
            </v-row>
            <v-btn
              color="error"
              variant="outlined"
              block
              @click="generateZReport(register)"
            >
              <v-icon start>mdi-file-document-outline</v-icon>Z-reporty
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue';

const cashRegisters = ref([
  {
    id: 1,
    name: 'Hlavní pokladna - Prodejna A',
    code: 'POS-001',
    isActive: true,
    lastUsed: '2025-06-13T16:30:00',
    currentUser: 'Petra33',
    cashInDrawer: 12500.50,
    numberOfOrders: 12,
    mode: 'Pokladna',
  },
  {
    id: 2,
    name: 'Kavárna - Bar',
    code: 'BAR-002',
    isActive: true,
    lastUsed: '2025-06-13T16:15:00',
    currentUser: 'Jan.Kovac',
    cashInDrawer: 5800.75,
    numberOfOrders: 0,
    mode: 'Pokladna',
  },
  {
    id: 3,
    name: 'Sklad - Expedice',
    code: 'WH-003',
    isActive: false,
    lastUsed: '2025-06-12T09:00:00',
    currentUser: null,
    cashInDrawer: 150.00,
    numberOfOrders: 0,
    mode: 'Zákaznický displej',
  },
]);

const formatCurrency = (value) => {
  if (value === null || value === undefined) return 'Není k dispozici';
  return new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK' }).format(value);
};

const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return 'N/A';
  const date = new Date(dateTimeString);
  if (isNaN(date.getTime())) return 'N/A'; // Check for invalid date
  return date.toLocaleString('cs-CZ', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const viewReceipts = (register) => {
  alert(`Zobrazit účtenky pro pokladnu: ${register.name}`);
  // Implement navigation to a receipts page filtered by this cash register
  // Example: router.push({ name: 'Sales', query: { cashRegister: register.code, type: 'receipts' } });
};

const viewSales = (register) => {
  alert(`Zobrazit prodeje pro pokladnu: ${register.name}`);
  // Implement navigation to a sales page filtered by this cash register
  // Example: router.push({ name: 'Sales', query: { cashRegister: register.code, type: 'products' } });
};

const generateZReport = (register) => {
  alert(`Vygenerovat Z-report pro pokladnu: ${register.name}`);
  // Implement logic to generate Z-report
};

const openRegisterSettings = (register) => {
  alert(`Otevřít nastavení pro pokladnu: ${register.name}`);
  // This is where you would typically open a dialog or navigate to a settings page
  // specific to this cash register.
};

const viewOrders = (register) => {
  alert(`Zobrazit objednávky pro pokladnu: ${register.name}`);
  // Implement logic to show orders related to this cash register
  // You might navigate to a new component/dialog or filter an existing one.
};

// New handlers for the inline buttons
const openCashJournal = (register) => {
  alert(`Otevřít pokladní deník pro: ${register.name}`);
  // Implement logic to open cash journal for this register
};

const viewShiftOverview = (register) => {
  alert(`Otevřít přehled směn pro: ${register.name}`);
  // Implement logic to open shift overview for this user/register
};
</script>

<style scoped>
.cash-registers-page .v-card {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease-in-out;
}

.cash-registers-page .v-card:hover {
  transform: translateY(-5px);
}

.cash-registers-page .v-card-title {
  padding-bottom: 8px;
}

/* Increased font size for all details in v-card-text */
.cash-registers-page .cash-register-details {
  font-size: 1rem; /* Adjust as needed, e.g., 0.95rem or 1rem */
}

/* Base style for all detail rows, whether v-list-item or custom div */
.cash-registers-page .detail-row {
  min-height: 36px !important; /* Slightly increased height for better spacing with larger text */
  padding-top: 4px !important;
  padding-bottom: 4px !important;
  display: flex;
  align-items: center;
  /* Add horizontal padding as v-list-item provides it */
  padding-left: 16px;
  padding-right: 16px;
}

/* Style for the value text */
.cash-registers-page .detail-row .text-medium-emphasis {
  color: rgba(var(--v-theme-on-surface), 0.7);
}


/* Ensure buttons take full width and have consistent margin */
.cash-registers-page .v-card-actions .v-btn {
  /* Removed width: 100% for the new row buttons, block handles it */
  justify-content: flex-start; /* Align icon and text to start */
}

/* Adjust padding for v-list directly to control space between custom rows and list items */
.cash-registers-page .v-list {
  padding-top: 0 !important;
  padding-bottom: 0 !important;
}

/* Specific styling for buttons within the v-card-actions row */
.cash-registers-page .v-card-actions .v-row .v-col .v-btn {
  /* This ensures the block prop makes them fill the half-column */
  /* Re-add justify-content to ensure text aligns to start within these */
  justify-content: flex-start;
}
</style>