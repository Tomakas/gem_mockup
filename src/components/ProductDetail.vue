<template>
  <v-dialog v-model="dialog" max-width="600">
    <v-card class="rounded-lg">
      <v-card-title class="d-flex justify-space-between align-center">
        </v-card-title>
      <v-card-text class="py-4">
        <v-row>
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="editableProduct.productName"
              label="Název produktu"
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field
              :model-value="editableProduct.id"
              label="ID"
              readonly
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="6">
            <v-select
              v-model="editableProduct.category"
              :items="categories"
              label="Kategorie"
            ></v-select>
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field
              v-model.number="editableProduct.price"
              label="Cena"
              type="number"
              prefix="Kč"
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="6">
            <v-select
              v-model.number="editableProduct.tax"
              :items="taxes"
              label="Daň"
            ></v-select>
          </v-col>
          
          <v-col cols="12" sm="6" v-if="editableProduct.Dodavatel !== undefined">
            <v-text-field
              v-model="editableProduct.Dodavatel"
              label="Dodavatel"
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="6" v-if="editableProduct.Barva !== undefined">
            <v-text-field
              v-model="editableProduct.Barva"
              label="Barva"
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="6" v-if="editableProduct.SKU !== undefined">
            <v-text-field
              v-model="editableProduct.SKU"
              label="SKU"
            ></v-text-field>
          </v-col>
          
          <v-col cols="12" v-if="editableProduct.Poznámka !== undefined">
            <v-textarea
              v-model="editableProduct.Poznámka"
              label="Poznámka"
              rows="2"
              variant="outlined"
            ></v-textarea>
          </v-col>
        </v-row>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions class="d-flex pa-4 flex-wrap">
        <v-btn variant="flat" color="success" @click="saveChanges" class="my-1" icon="mdi-content-save">
        </v-btn>
        <v-btn variant="flat" color="error" @click="handleDeleteProduct" class="my-1" icon="mdi-delete">
        </v-btn>
        <v-btn variant="flat" color="info" @click="handleDuplicateProduct" class="my-1" icon="mdi-content-copy">
        </v-btn>
        <v-btn variant="flat" color="secondary" @click="handleViewSales" class="my-1" icon="mdi-chart-bar">
        </v-btn>        
        <v-spacer></v-spacer> 
        <v-btn variant="flat" color="primary" @click="closeDialog" class="my-1" icon="mdi-close">
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch } from 'vue';
// Žádné další importy zde nejsou potřeba, protože formátovací funkce se v <template> této komponenty nepoužívá.

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  product: {
    type: Object,
    default: null,
  },
});
const emit = defineEmits(['update:modelValue', 'saveProduct', 'deleteProduct', 'duplicateProduct', 'viewSales']);

const dialog = ref(props.modelValue);
const editableProduct = ref(null);
const categories = ref(['Elektronika', 'Domácnost', 'Sport', 'Oblečení', 'Jídlo', 'Knihy', 'Hračky', 'Kosmetika']); // Rozšířeno pro plnou kompatibilitu
const taxes = ref([10, 15, 21]);

watch(() => props.product, (newProduct) => {
  if (newProduct) {
    // Zjednodušená logika: Klonujeme objekt pro editaci.
    // Původní fallback na 'description' byl odstraněn jako nadbytečný.
    editableProduct.value = { ...newProduct };
  } else {
    editableProduct.value = null;
  }
}, { immediate: true });

watch(() => props.modelValue, (newValue) => {
  dialog.value = newValue;
});

watch(dialog, (newValue) => {
  emit('update:modelValue', newValue);
});

const closeDialog = () => {
  dialog.value = false;
};

const saveChanges = () => {
  if (editableProduct.value) {
    const productToSave = { ...editableProduct.value };
    emit('saveProduct', productToSave);
    closeDialog();
  }
};

const handleDeleteProduct = () => {
  emit('deleteProduct', props.product);
  closeDialog();
};

const handleDuplicateProduct = () => {
  emit('duplicateProduct', props.product);
  closeDialog();
};

const handleViewSales = () => {
  emit('viewSales', props.product);
  closeDialog();
};
</script>

<style>
/* Zde můžete přidat specifické styly pro ProductDetail */
</style>