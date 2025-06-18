<template>
  <v-dialog :model-value="modelValue" @update:modelValue="$emit('update:modelValue', $event)" max-width="800">
    <v-card v-if="document" class="rounded-lg">
      <v-card-title class="d-flex justify-space-between align-center">
        <span>Detail dokladu: {{ document.documentNumber }}</span>
        <v-chip size="small" color="primary">{{ document.type }}</v-chip>
      </v-card-title>
      <v-card-subtitle>
        Vytvořeno: {{ formatDateTime(document.dateTime) }}
        <span v-if="document.supplier"> | Dodavatel: {{ document.supplier }}</span>
      </v-card-subtitle>

      <v-divider class="my-3"></v-divider>

      <v-card-text>
        <v-data-table
          :headers="detailHeaders"
          :items="document.items"
          item-key="productId"
          density="compact"
          class="elevation-0 border"
        >
          <template #item.purchasePrice="{ item }">
            {{ formatCurrency(item.purchasePrice) }}
          </template>
          <template #item.total="{ item }">
            {{ formatCurrency(item.total) }}
          </template>
        </v-data-table>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions class="pa-4">
        <v-spacer></v-spacer>
        <v-btn color="primary" variant="flat" @click="$emit('update:modelValue', false)">
          Zavřít
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { formatCurrency } from '@/utils/formatters.js';

defineProps({
  modelValue: { type: Boolean, default: false },
  document: { type: Object, default: null },
});

defineEmits(['update:modelValue']);

const detailHeaders = [
  { title: 'Produkt', key: 'productName', sortable: true },
  { title: 'Nákupní cena/ks', key: 'purchasePrice', align: 'end', sortable: false },
  { title: 'Počet', key: 'quantity', align: 'end', sortable: false },
  { title: 'Cena celkem (NC)', key: 'total', align: 'end', sortable: false },
];

const formatDateTime = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleString('cs-CZ');
};
</script>
