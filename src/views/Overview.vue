<template>
  <v-container fluid class="overview-dashboard">
    <v-row>
  <v-col cols="12" md="6">
    <v-card flat class="pa-2 h-100 d-flex flex-column justify-center">
      <div class="d-flex align-center flex-wrap justify-center">
        <v-btn-toggle v-model="selectedPeriod" rounded="1" color="primary" group mandatory
          class="mr-4 flex-shrink-0">
          <v-btn value="day" size="medium" @click="resetToToday">Den</v-btn>
          <v-btn value="week" size="medium" class="ml-3" @click="resetToToday">Týden</v-btn>
          <v-btn value="month" size="medium" class="ml-3" @click="resetToToday">Měsíc</v-btn>
          <v-btn value="year" size="medium" class="ml-3" @click="resetToToday">Rok</v-btn>
          <v-btn @click="openDatePickerDialog" variant="text" class="ml-3" size="medium">Vlastní</v-btn>
        </v-btn-toggle>
        <div class="d-flex align-center">
          <v-btn icon="mdi-chevron-left" variant="text" @click="navigatePeriod(-1)"
            :disabled="selectedPeriod === 'custom'"></v-btn>
          <div class="text-subtitle-1 mx-2 text-center" style="min-width: 220px;">
            {{ displayDateRange }}
          </div>
          <v-btn icon="mdi-chevron-right" variant="text" @click="navigatePeriod(1)"
            :disabled="isNextDisabled || selectedPeriod === 'custom'"></v-btn>
        </div>
      </div>
    </v-card>
  </v-col>

<v-col cols="12" md="6">
  <v-card class="h-100 d-flex flex-column justify-center" flat>
    <div class="d-flex flex-wrap justify-center align-center">

      <div>
        <span class="text-h6">Celková tržba: </span>
        <span class="text-h5 font-weight-bold">{{ formatCurrency(totalSales) }}</span>
      </div>

      <div class="ml-4">
        <span class="text-h6">Počet účtenek: </span>
        <span class="text-h5 font-weight-bold">{{ totalReceipts }}</span>
      </div>

    </div>
  </v-card>
</v-col>
</v-row>
    <v-dialog v-model="datePickerDialog" max-width="400">

      <v-card title="Vyberte období">
        <v-card-text>
          <v-date-picker v-model="customDateRange" range show-adjacent-months color="primary" title=""
            header="Vlastní výběr" :max="today"></v-date-picker>
          <div class="text-caption text-center mt-2">
            Vyberte počáteční a koncové datum.
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="datePickerDialog = false">Zrušit</v-btn>
          <v-btn color="primary" @click="applyCustomDate" :disabled="!isCustomRangeValid">Použít</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>


    <v-row class="mt-4">
      <v-col cols="12" lg="8">

        <v-card class="pa-4" flat>

          <v-card-title class="text-h6">Prodeje a účtenky</v-card-title>

          <v-card-text>

            <div class="chart-placeholder primary-bg" style="height: 300px;"></div>

            <p class="text-center mt-2 text-caption">Zde bude kombinovaný graf prodejů a účtenek</p>

          </v-card-text>

        </v-card>

      </v-col>

    </v-row>


    <v-row class="mt-4">

      <v-col cols="12" lg="4">

        <v-card class="pa-4" flat>

          <v-card-title class="text-h6">Rozdělení plateb</v-card-title>

          <v-card-text>

            <div class="chart-placeholder secondary-bg" style="height: 300px; border-radius: 50%;"></div>

            <p class="text-center mt-2 text-caption">Zde bude kruhový graf typů plateb</p>

          </v-card-text>

        </v-card>

      </v-col>

      <v-col cols="12" lg="8">

        <v-card class="pa-4" flat>

          <v-card-title class="text-h6">Kategorie prodeje (Treemap)</v-card-title>

          <v-card-text>

            <div class="chart-placeholder info-bg" style="height: 300px;"></div>

            <p class="text-center mt-2 text-caption">Zde bude treemap graf kategorií</p>

          </v-card-text>

        </v-card>

      </v-col>

    </v-row>


    <v-row class="mt-4">

      <v-col cols="12" lg="5">

        <v-card class="pa-4" flat>

          <v-card-title class="text-h6">Nejprodávanější kategorie</v-card-title>

          <v-card-text class="px-0">

            <v-table>

              <thead>

                <tr>

                  <th class="text-left">Kategorie</th>

                  <th class="text-right">Prodej</th>

                </tr>

              </thead>

              <tbody>

                <tr v-for="cat in topCategories" :key="cat.name">

                  <td>{{ cat.name }}</td>

                  <td class="text-right">{{ formatCurrency(cat.totalSales) }}</td>

                </tr>

              </tbody>

            </v-table>

          </v-card-text>

        </v-card>

      </v-col>

      <v-col cols="12" lg="7">

        <v-card class="pa-4" flat>

          <v-card-title class="text-h6">Nejprodávanější produkty</v-card-title>

          <v-card-text class="px-0">

            <v-table>

              <thead>

                <tr>

                  <th class="text-left">Produkt</th>

                  <th class="text-right">Množství</th>

                  <th class="text-right">Prodej</th>

                </tr>

              </thead>

              <tbody>

                <tr v-for="item in topSalesItems" :key="item.name">

                  <td>{{ item.name }}</td>

                  <td class="text-right">{{ item.quantity }} ks</td>

                  <td class="text-right">{{ formatCurrency(item.totalSales) }}</td>

                </tr>

              </tbody>

            </v-table>

          </v-card-text>

        </v-card>

      </v-col>

    </v-row>


    <v-row class="mt-4">

      <v-col cols="12">

        <v-card class="pa-4" flat>

          <v-card-title class="text-h6">Aktivita zaměstnanců</v-card-title>

          <v-card-text class="px-0">

            <v-table>

              <thead>

                <tr>

                  <th class="text-left">Uživatel</th>

                  <th class="text-right">Celkový prodej</th>

                  <th class="text-right">Počet účtenek</th>

                  <th class="text-right">Počet hodin</th>

                </tr>

              </thead>

              <tbody>

                <tr v-for="seller in sellersSales" :key="seller.username">

                  <td>{{ seller.username }}</td>

                  <td class="text-right">{{ formatCurrency(seller.totalSales) }}</td>

                  <td class="text-right">{{ seller.totalReceipts }}</td>

                  <td class="text-right">{{ seller.hours }} h</td>

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

import { ref, computed } from 'vue';


// --- DATA ---

const totalSales = ref(18654.50);

const totalReceipts = ref(128);

const sellersSales = ref([

  { username: 'Petra33', totalSales: 9844.00, totalReceipts: 75, hours: 40 },

  { username: 'Jan.Kovac', totalSales: 6810.50, totalReceipts: 41, hours: 38 },

  { username: 'Admin', totalSales: 2000.00, totalReceipts: 12, hours: 16 },

]);

const topSalesItems = ref([

  { name: 'SPRITZ 11', totalSales: 4515.00, quantity: 35 },

  { name: 'Káva Latte', totalSales: 1800.00, quantity: 24 },

  { name: 'Dort čokoládový', totalSales: 1530.00, quantity: 18 },

  { name: 'Svatovavřinecké, MZ. Spakik', totalSales: 1164.00, quantity: 6 },

]);

const topCategories = ref([

  { name: 'Perlivé stáčené', totalSales: 6250.50 },

  { name: 'Káva', totalSales: 4320.00 },

  { name: 'Dorty', totalSales: 2890.00 },

  { name: 'Spalek', totalSales: 2100.00 },

]);


// --- Logika pro výběr data ---

const today = new Date('2025-06-16T12:00:00');

const selectedPeriod = ref('day');

const currentDate = ref(new Date(today));


const datePickerDialog = ref(false);

const customDateRange = ref([]);


// OPRAVA: Validace pro pole s dvěma daty

const isCustomRangeValid = computed(() => {

  return Array.isArray(customDateRange.value) && customDateRange.value.length === 2;

});


const isToday = (date) => {

  const d = new Date(date);

  return d.setHours(0, 0, 0, 0) === new Date(today).setHours(0, 0, 0, 0);

};


const isNextDisabled = computed(() => {

  return currentDate.value.setHours(0, 0, 0, 0) >= today.setHours(0, 0, 0, 0);

});


const displayDateRange = computed(() => {

  const options = { year: 'numeric', month: 'long', day: 'numeric' };

  const shortOptions = { day: 'numeric', month: 'numeric', year: 'numeric' };

  const locale = 'cs-CZ';


  if (selectedPeriod.value === 'custom') {

    if (isCustomRangeValid.value) {

      const sortedDates = [...customDateRange.value].sort((a, b) => new Date(a) - new Date(b));

      const [start, end] = sortedDates;

      const startDateStr = new Date(start).toLocaleDateString(locale, shortOptions);

      const endDateStr = new Date(end).toLocaleDateString(locale, shortOptions);


      return startDateStr === endDateStr ? startDateStr : `${startDateStr} - ${endDateStr}`;

    }

    return 'Vlastní výběr';

  }


  const d = new Date(currentDate.value);

  switch (selectedPeriod.value) {

    case 'day':

      if (isToday(d)) return `Dnes (${d.toLocaleDateString(locale, options)})`;

      const yesterday = new Date(today);

      yesterday.setDate(yesterday.getDate() - 1);

      if (new Date(d).setHours(0, 0, 0, 0) === yesterday.setHours(0, 0, 0, 0)) return `Včera (${d.toLocaleDateString(locale, options)})`;

      return d.toLocaleDateString(locale, options);

    case 'week':

      const dayOfWeek = d.getDay();

      const diff = d.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);

      const startOfWeek = new Date(new Date(d).setDate(diff));

      const endOfWeek = new Date(new Date(startOfWeek).setDate(startOfWeek.getDate() + 6));

      return `${startOfWeek.toLocaleDateString(locale, shortOptions)} - ${endOfWeek.toLocaleDateString(locale, shortOptions)}`;

    case 'month':

      return d.toLocaleDateString(locale, { month: 'long', year: 'numeric' });

    case 'year':

      return d.toLocaleDateString(locale, { year: 'numeric' });

    default:

      return 'N/A';

  }

});


const navigatePeriod = (direction) => {

  const newDate = new Date(currentDate.value);

  switch (selectedPeriod.value) {

    case 'day':

      newDate.setDate(newDate.getDate() + direction);

      break;

    case 'week':

      newDate.setDate(newDate.getDate() + 7 * direction);

      break;

    case 'month':

      newDate.setMonth(newDate.getMonth() + direction);

      break;

    case 'year':

      newDate.setFullYear(newDate.getFullYear() + direction);

      break;

  }


  if (newDate > today && direction > 0) {

    return;

  }

  currentDate.value = newDate;

};


const openDatePickerDialog = () => {

  customDateRange.value = [];

  datePickerDialog.value = true;

};


const applyCustomDate = () => {

  if (isCustomRangeValid.value) {

    selectedPeriod.value = 'custom';

    datePickerDialog.value = false;

  }

};


const resetToToday = () => {

  if (selectedPeriod.value !== 'custom') {

    currentDate.value = new Date(today);

  }

  customDateRange.value = [];

};


// --- Formátovací funkce ---

const formatCurrency = (value) => {

  return new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK' }).format(value);

};


</script>


<style scoped>
.overview-dashboard .v-card {

  border-radius: 12px;

  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);

}

.chart-placeholder {

  height: 200px;

  background-color: rgba(var(--v-theme-on-surface), 0.1);

  border-radius: 8px;

  display: flex;

  align-items: center;

  justify-content: center;

  color: rgba(var(--v-theme-on-surface), 0.5);

  font-size: 0.9em;

}

.primary-bg {

  background-color: rgba(var(--v-theme-primary), 0.2) !important;

}

.info-bg {

  background-color: rgba(var(--v-theme-info), 0.2) !important;

}

.secondary-bg {

  background-color: rgba(var(--v-theme-secondary), 0.2) !important;

}

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
