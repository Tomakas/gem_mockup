<template>
  <v-container fluid class="overview-dashboard">
    <v-row>
      <v-col cols="12" sm="6" md="4" lg="3">
        <v-card class="pa-4 text-center" flat>
          <v-icon size="48" color="primary">mdi-cash-multiple</v-icon>
          <div class="text-h5 mt-2">Celkový prodej</div>
          <div class="text-h4 font-weight-bold">{{ formatCurrency(totalSales) }}</div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="4" lg="3">
        <v-card class="pa-4 text-center" flat>
          <v-icon size="48" color="info">mdi-receipt</v-icon>
          <div class="text-h5 mt-2">Celkem účtenek</div>
          <div class="text-h4 font-weight-bold">{{ totalReceipts }}</div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="4" lg="3">
        <v-card class="pa-4 text-center" flat>
          <v-icon size="48" color="success">mdi-account-plus</v-icon>
          <div class="text-h5 mt-2">Noví klienti</div>
          <div class="text-h4 font-weight-bold">6,782</div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="4" lg="3">
        <v-card class="pa-4 text-center" flat>
          <v-icon size="48" color="warning">mdi-account-group</v-icon>
          <div class="text-h5 mt-2">Aktivní uživatelé</div>
          <div class="text-h4 font-weight-bold">2,936</div>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-8">
      <v-col cols="12" lg="6">
        <v-card class="pa-4" flat>
          <v-card-title class="text-h6">Prodeje za den (posledních 7 dní)</v-card-title>
          <v-card-text>
            <div class="chart-placeholder primary-bg"></div>
            <p class="text-center mt-2 text-caption">Zde bude graf prodejů (sloupcový)</p>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" lg="6">
        <v-card class="pa-4" flat>
          <v-card-title class="text-h6">Účtenky za den (posledních 7 dní)</v-card-title>
          <v-card-text>
            <div class="chart-placeholder info-bg"></div>
            <p class="text-center mt-2 text-caption">Zde bude graf účtenek (liniový)</p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-8">
      <v-col cols="12" md="6">
        <v-card class="pa-4" flat>
          <v-card-title class="text-h6">Platby dle metody</v-card-title>
          <v-card-text>
            <div class="chart-placeholder secondary-bg" style="height: 250px; border-radius: 50%;"></div>
            <p class="text-center mt-2 text-caption">Zde bude kruhový graf plateb</p>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <v-card class="pa-4" flat>
          <v-card-title class="text-h6">Top prodeje (produkty)</v-card-title>
          <v-card-text>
            <v-list dense>
              <v-list-item v-for="(item, index) in topSalesItems" :key="index">
                <v-list-item-content>
                  <v-list-item-title>{{ item.name }}</v-list-item-title>
                  <v-list-item-subtitle>{{ formatCurrency(item.totalSales) }} ({{ item.quantity }} ks)</v-list-item-subtitle>
                </v-list-item-content>
                <v-list-item-action>
                  <v-chip color="success" outlined>{{ item.percentage }}%</v-chip>
                </v-list-item-action>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-8">
      <v-col cols="12">
        <v-card class="pa-4" flat>
          <v-card-title class="text-h6">Prodeje dle prodejce</v-card-title>
          <v-card-text>
            <v-table>
              <thead>
                <tr>
                  <th class="text-left">Uživatel</th>
                  <th class="text-right">Celkový prodej</th>
                  <th class="text-right">Celkem účtenek</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(seller, index) in sellersSales" :key="index">
                  <td>{{ seller.username }}</td>
                  <td class="text-right">{{ formatCurrency(seller.totalSales) }}</td>
                  <td class="text-right">{{ seller.totalReceipts }}</td>
                </tr>
              </tbody>
            </v-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue';

// Fiktivní data pro Overview stránku, inspirovaná 1x.jpg
const totalSales = ref(1644.00);
const totalReceipts = ref(7);

const sellersSales = ref([
  { username: 'Petra33', totalSales: 1644.00, totalReceipts: 7 },
  // Další prodejci, pokud by byli
]);

const topSalesItems = ref([
  { name: 'SPRITZ 31', totalSales: 786.00, quantity: 1, percentage: 47.8 },
  { name: 'Flat white', totalSales: 160.00, quantity: 2, percentage: 9.7 },
  { name: 'Amity Matcha Limeka', totalSales: 129.00, quantity: 1, percentage: 7.8 },
  // ... další položky
]);

// Funkce pro formátování měny (pro CZK)
const formatCurrency = (value) => {
  return new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK' }).format(value);
};
</script>

<style scoped>
.overview-dashboard .v-card {
  border-radius: 12px; /* Zaoblené rohy pro moderní vzhled */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); /* Jemný stín */
}

/* Styly pro placeholdery grafů - inspirováno tmavým designem */
.chart-placeholder {
  height: 200px; /* Standardní výška pro grafy */
  background-color: rgba(var(--v-theme-on-surface), 0.1); /* Světlejší pozadí v dark modu */
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(var(--v-theme-on-surface), 0.5);
  font-size: 0.9em;
}

/* Příklady barev pro pozadí grafů (pro placeholder) */
.primary-bg {
  background-color: rgba(var(--v-theme-primary), 0.2) !important;
}
.info-bg {
  background-color: rgba(var(--v-theme-info), 0.2) !important;
}
.secondary-bg {
  background-color: rgba(var(--v-theme-secondary), 0.2) !important;
}

/* Reagování na světlý mód pro placeholdery (Vuetify to řeší automaticky, ale pro jistotu) */
.v-theme--light .chart-placeholder {
  background-color: rgba(var(--v-theme-on-surface), 0.05);
}
.v-theme--light .primary-bg {
  background-color: rgba(var(--v-theme-primary), 0.1) !important;
}
.v-theme--light .info-bg {
  background-color: rgba(var(--v-theme-info), 0.1) !important;
}
.v-theme--light .secondary-bg {
  background-color: rgba(var(--v-theme-secondary), 0.1) !important;
}
</style>