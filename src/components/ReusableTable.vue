<template>
  <v-container fluid class="generic-list">
    <v-card>
      <v-card-text>
        <v-row align="center" class="mb-4">
          <v-col cols="12" sm="6" md="4" class="d-flex align-left">
            <slot name="header-left-content">
              <v-btn
                v-if="additionalButton"
                color="primary"
                prepend-icon="mdi-plus"
                @click="$emit('additional-button-click')"
                class="flex-grow-1"
              >
                {{ additionalButtonText }}
              </v-btn>
            </slot>
          </v-col>

          <v-col cols="12" sm="6" md="8" class="d-flex align-left">
            <v-text-field
              v-model="internalSearch"
              :label="searchLabel"
              append-inner-icon="mdi-magnify"
              style="flex-grow: 1"
            ></v-text-field>
            <v-btn
              v-if="enableFilters"
              icon
              variant="text"
              @click="filterDialog = true"
            >
              <v-icon>mdi-filter</v-icon>
            </v-btn>
            <v-btn
              v-if="enableColumnSettings"
              icon
              variant="text"
              @click="columnSettingsDialog = true"
            >
              <v-icon>mdi-cog</v-icon>
            </v-btn>
          </v-col>
        </v-row>

        <div class="active-filters-container mb-4">
          <div v-if="activeFiltersDisplay.length > 0" class="d-flex flex-wrap align-center ga-2">
            <span class="text-caption">Aktivní filtry:</span>
            <v-chip
              v-for="(filter, index) in activeFiltersDisplay"
              :key="index"
              closable
              @click:close="removeFilter(filter)"
              size="small"
            >
              <strong>{{ filter.label }}:</strong>&nbsp;{{ filter.displayValue }}
            </v-chip>
          </div>
        </div>

        <v-dialog v-model="filterDialog" v-if="enableFilters">
          <v-card class="rounded-lg">
            <v-card-title class="d-flex justify-space-between align-center">
              <span>{{ filterDialogTitle }}</span>
              <v-btn icon variant="text" @click="filterDialog = false">
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text class="py-4">
              <div v-for="(def, index) in filterDefinitions" :key="def.key">
                <div class="text-subtitle-1 mb-2">{{ def.label }}</div>

                <v-chip-group v-if="def.type === 'multiselect-chips'" v-model="filterValues[def.key]" multiple class="chip-group-wrap mb-4">
                  <v-chip v-for="item in def.items" :key="item" :value="item" filter>
                    {{ def.itemText ? item[def.itemText] : item }} {{ def.suffix || '' }}
                  </v-chip>
                </v-chip-group>

                <v-select
                  v-if="def.type === 'select'"
                  v-model="filterValues[def.key]"
                  :items="def.items"
                  :label="def.label"
                  clearable
                  class="mb-4"
                ></v-select>

                <v-text-field
                  v-if="def.type === 'text'"
                  v-model="filterValues[def.key]"
                  :label="def.label"
                  clearable
                  class="mb-4"
                ></v-text-field>

                <v-row v-if="def.type === 'range'" class="mb-4">
                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model.number="filterValues[def.key].min"
                      :label="`${def.label} od`"
                      type="number"
                      :prefix="def.prefix || ''"
                      clearable
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model.number="filterValues[def.key].max"
                      :label="`${def.label} do`"
                      type="number"
                      :prefix="def.prefix || ''"
                      clearable
                    ></v-text-field>
                  </v-col>
                </v-row>

                <v-divider v-if="index < filterDefinitions.length - 1" class="my-4"></v-divider>
              </div>
            </v-card-text>
            <v-divider></v-divider>
            <v-card-actions class="d-flex justify-end pa-4">
              <v-btn variant="text" @click="clearFiltersAndClose">
                Vyčistit filtry
              </v-btn>
              <v-btn color="primary" @click="applyFiltersAndClose">
                Filtrovat
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <v-dialog
          v-model="columnSettingsDialog"
          max-width="400"
          v-if="enableColumnSettings"
        >
          <v-card class="rounded-lg">
            <v-card-title class="d-flex justify-space-between align-center">
              <span>{{ columnSettingsDialogTitle }}</span>
              <v-btn icon variant="text" @click="columnSettingsDialog = false">
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text class="py-4">
              <div
                v-if="currentColumnSettings.length > 0"
                class="column-settings-container"
              >
                <p class="text-caption mb-3">
                  Přetáhněte pro změnu pořadí, zaškrtněte pro viditelnost.
                </p>

                <draggable
                  v-model="currentColumnSettings"
                  item-key="key"
                  handle=".handle"
                  tag="div"
                  class="draggable-list"
                >
                  <template #item="{ element }">
                    <div
                      :class="[
                        'draggable-item-table-settings',
                        { 'mandatory-column': element.mandatory },
                      ]"
                    >
                      <v-icon class="handle mr-2">mdi-drag-vertical</v-icon>
                      <span class="flex-grow-1">{{ element.title }}</span>
                      <v-checkbox
                        v-model="element.visible"
                        density="compact"
                        hide-details
                        class="ml-auto"
                        :disabled="element.mandatory"
                      ></v-checkbox>
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
              <v-btn variant="text" @click="resetColumnSettings">
                Resetovat
              </v-btn>
              <v-btn color="primary" @click="applyColumnSettingsAndClose">
                Použít
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <v-data-table
          :header-props="{ class: 'font-weight-bold text-center' }"
          :headers="visibleAndOrderedHeaders"
          :items="items"
          :item-value="itemKey"
          :search="internalSearch"
          :items-per-page="internalItemsPerPage"
          v-model:page="internalPage"
          :items-length="items.length"
          :loading="loading"
          @update:options="handleUpdateOptions"
          @click:row="(event, { item }) => $emit('row-click', item)"
          class="responsive-data-table d-none d-sm-block hover-row"
        >
          <template
            v-for="header in visibleAndOrderedHeaders"
            #[`item.${header.key}`]="{ item }"
            :key="header.key"
          >
            <td :class="`text-${header.dataAlign || 'start'}`">
              <slot :name="`cell-${header.key}`" :item="item">
                {{ item[header.key] }}
              </slot>
            </td>
          </template>

          <template #bottom>
            <div class="d-flex justify-space-between align-center px-4 py-2">
              <v-select
                v-model="internalItemsPerPage"
                :items="[10, 20, 40, 80]"
                label="Položek na stránku"
                style="max-width: 150px"
              ></v-select>

              <v-pagination
                v-model="internalPage"
                :length="Math.ceil(items.length / internalItemsPerPage)"
                :total-visible="5"
                density="compact"
                class="d-none d-sm-flex"
              ></v-pagination>

              <div class="text-caption d-none d-sm-flex">
                {{ (internalPage - 1) * internalItemsPerPage + 1 }}-{{
                  Math.min(internalPage * internalItemsPerPage, items.length)
                }}
                z {{ items.length }}
              </div>
            </div>
          </template>
        </v-data-table>

        <div class="d-block d-sm-none">
          <v-list lines="two" class="pa-0">
            <template v-for="item in paginatedMobileItems" :key="item.id">
              <v-list-item @click="$emit('row-click', item)">
                <v-list-item-title class="font-weight-bold">
                  <slot name="mobile-title" :item="item">
                    {{ item[mobileTitleKey] }}
                  </slot>
                </v-list-item-title>

                <v-list-item-subtitle>
                  <div class="text-caption text-medium-emphasis">
                    <template
                      v-for="header in visibleAndOrderedHeaders"
                      :key="header.key"
                    >
                      <span
                        v-if="
                          header.key !== mobileTitleKey &&
                          header.key !== 'actions' &&
                          !mobileExcludedKeys.includes(header.key) &&
                          item[header.key] !== null &&
                          item[header.key] !== undefined
                        "
                      >
                        {{ header.title }}:
                        <slot :name="`mobile-cell-${header.key}`" :item="item">
                          {{ item[header.key] }}
                        </slot>
                        <br />
                      </span>
                    </template>
                  </div>
                </v-list-item-subtitle>

                <template #append>
                  <div class="d-flex flex-column align-end">
                    <span
                      v-if="isColumnVisible('price')"
                      class="font-weight-bold text-body-1"
                    >
                      <slot name="cell-price" :item="item">
                        {{ item.price }}
                      </slot>
                    </span>
                    <span
                      v-if="isColumnVisible('tax')"
                      class="text-caption text-medium-emphasis"
                    >
                      <slot name="cell-tax" :item="item">
                        Daň: {{ item.tax }} %
                      </slot>
                    </span>
                    <slot name="mobile-append-content" :item="item"></slot>
                  </div>
                </template>
              </v-list-item>
              <v-divider></v-divider>
            </template>
          </v-list>

          <div class="d-flex justify-space-between align-center px-4 py-2 mt-2">
            <v-select
              v-model="internalItemsPerPage"
              :items="[10, 20, 40, 80]"
              label="Položek na stránku"
              style="max-width: 150px"
            ></v-select>
            <div class="d-flex align-center">
              <v-btn
                icon
                size="small"
                variant="text"
                @click="internalPage--"
                :disabled="internalPage === 1"
              >
                <v-icon>mdi-chevron-left</v-icon>
              </v-btn>
              <div class="text-caption mx-2">
                {{ (internalPage - 1) * internalItemsPerPage + 1 }}-{{
                  Math.min(internalPage * internalItemsPerPage, items.length)
                }}
                z {{ items.length }}
              </div>
              <v-btn
                icon
                size="small"
                variant="text"
                @click="internalPage++"
                :disabled="internalPage * internalItemsPerPage >= items.length"
              >
                <v-icon>mdi-chevron-right</v-icon>
              </v-btn>
            </div>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import draggable from "vuedraggable";

const props = defineProps({
  headers: { type: Array, required: true },
  items: { type: Array, required: true },
  itemKey: { type: String, required: true },
  searchLabel: { type: String, default: "Hledat" },
  enableFilters: { type: Boolean, default: false },
  filterDialogTitle: { type: String, default: "Filtry" },
  filterDefinitions: { type: Array, default: () => [] },
  enableColumnSettings: { type: Boolean, default: false },
  columnSettingsDialogTitle: { type: String, default: "Nastavení sloupců" },
  additionalButton: { type: Boolean, default: false },
  additionalButtonText: { type: String, default: "" },
  mobileTitleKey: { type: String, required: true },
  mobileExcludedKeys: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
});

const emit = defineEmits([
  "row-click",
  "apply-filters",
  "clear-filters",
  "additional-button-click",
  "update:search",
  "update:itemsPerPage",
  "update:page",
  "load-items",
  "apply-column-settings",
  "reset-column-settings",
]);

const internalSearch = ref("");
const internalPage = ref(1);
const internalItemsPerPage = ref(10);
const filterDialog = ref(false);
const columnSettingsDialog = ref(false);
const currentColumnSettings = ref([]);
const filterValues = ref({});

const initializeFilterValues = () => {
  const newValues = {};
  props.filterDefinitions.forEach(def => {
    if (def.type === 'range') {
      newValues[def.key] = { min: null, max: null };
    } else if (def.type === 'multiselect-chips') {
      newValues[def.key] = [];
    } else {
      newValues[def.key] = null;
    }
  });
  filterValues.value = newValues;
};

watch(() => props.filterDefinitions, () => {
  initializeFilterValues();
}, { immediate: true, deep: true });


const originalColumnSettings = computed(() =>
  props.headers.map((h) => ({
    ...h,
    visible: h.visible !== undefined ? h.visible : true,
    key: h.key,
    mandatory: h.mandatory || false,
  }))
);

watch(
  () => props.headers,
  () => {
    currentColumnSettings.value = JSON.parse(
      JSON.stringify(originalColumnSettings.value)
    );
  },
  { immediate: true }
);

const activeFiltersDisplay = computed(() => {
  const filters = [];
  for (const key in filterValues.value) {
    const definition = props.filterDefinitions.find(def => def.key === key);
    if (!definition) continue;

    const value = filterValues.value[key];

    if (definition.type === 'multiselect-chips' && value.length > 0) {
      value.forEach(v => {
        filters.push({
          key,
          type: definition.type,
          label: definition.label,
          value: v,
          displayValue: `${v} ${definition.suffix || ''}`.trim(),
        });
      });
    } else if (definition.type === 'range') {
      if (value.min) {
        filters.push({
          key,
          subKey: 'min',
          type: definition.type,
          label: `${definition.label} od`,
          value: value.min,
          displayValue: `${definition.prefix || ''}${value.min}`
        });
      }
      if (value.max) {
        filters.push({
          key,
          subKey: 'max',
          type: definition.type,
          label: `${definition.label} do`,
          value: value.max,
          displayValue: `${definition.prefix || ''}${value.max}`
        });
      }
    } else if (value) {
        filters.push({
          key,
          type: definition.type,
          label: definition.label,
          value: value,
          displayValue: value
        });
    }
  }
  return filters;
});

const removeFilter = (filter) => {
  if (filter.type === 'multiselect-chips') {
    filterValues.value[filter.key] = filterValues.value[filter.key].filter(v => v !== filter.value);
  } else if (filter.type === 'range') {
    filterValues.value[filter.key][filter.subKey] = null;
  } else {
    filterValues.value[filter.key] = null;
  }
  emit("apply-filters", filterValues.value);
};


const visibleAndOrderedHeaders = computed(() => {
  return currentColumnSettings.value.filter((h) => h.visible);
});

const isColumnVisible = (key) => {
  const header = currentColumnSettings.value.find((h) => h.key === key);
  return header ? header.visible : false;
};

const paginatedMobileItems = computed(() => {
  const start = (internalPage.value - 1) * internalItemsPerPage.value;
  const end = start + internalItemsPerPage.value;
  return props.items.slice(start, end);
});

watch(internalSearch, (newSearch) => {
  emit("update:search", newSearch);
  internalPage.value = 1;
});

watch(internalItemsPerPage, (newItemsPerPage) => {
  emit("update:itemsPerPage", newItemsPerPage);
  internalPage.value = 1;
});

watch(internalPage, (newPage) => {
  emit("update:page", newPage);
  emit("load-items", {
    page: newPage,
    itemsPerPage: internalItemsPerPage.value,
    search: internalSearch.value,
  });
});

const applyFiltersAndClose = () => {
  emit("apply-filters", filterValues.value);
  internalPage.value = 1;
  filterDialog.value = false;
};

const clearFiltersAndClose = () => {
  initializeFilterValues();
  emit("clear-filters");
  internalPage.value = 1;
  filterDialog.value = false;
};

const applyColumnSettingsAndClose = () => {
  emit("apply-column-settings", currentColumnSettings.value);
  columnSettingsDialog.value = false;
};

const resetColumnSettings = () => {
  currentColumnSettings.value = JSON.parse(
    JSON.stringify(originalColumnSettings.value)
  );
  emit("reset-column-settings");
};

const handleUpdateOptions = (options) => {
  emit("load-items", options);
};
</script>

<style scoped>
.column-settings-container {
  max-height: 400px;
  overflow-y: auto;
}

.draggable-list {
  list-style-type: none;
  padding: 0;
}

.draggable-item-table-settings {
  display: flex;
  align-items: center;
  padding: 8px;
  background-color: rgb(var(--v-theme-surface-variant));
  border: 1px solid rgb(var(--v-theme-on-surface), 0.1);
  margin-bottom: 4px;
  border-radius: 4px;
}

.draggable-item-table-settings .handle {
  cursor: grab;
  margin-right: 8px;
}

.hover-row :deep(tbody tr:hover) {
  cursor: pointer;
}

.chip-group-wrap :deep(.v-chip-group__container) {
  flex-wrap: wrap;
  gap: 8px;
}
</style>