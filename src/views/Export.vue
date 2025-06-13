<template>
  <v-container fluid class="export-page">
    <v-row class="mb-8">
      <v-col cols="12">
        <h2 class="text-h5 mb-4">Finanční přehledy</h2>
        <v-row>
          <v-col cols="12" sm="6" md="4">
            <v-card class="pa-4 text-center d-flex flex-column align-center justify-center" flat min-height="150">
              <div class="text-h6 mb-3">Export tržeb</div>
              <v-btn color="primary" prepend-icon="mdi-file-export" @click="exportSalesTotal">
                Exportovat
              </v-btn>
            </v-card>
          </v-col>
          <v-col cols="12" sm="6" md="4">
            <v-card class="pa-4 text-center d-flex flex-column align-center justify-center" flat min-height="150">
              <div class="text-h6 mb-3">Export zisků</div>
              <v-btn color="primary" prepend-icon="mdi-file-export" @click="exportProfits">
                Exportovat
              </v-btn>
            </v-card>
          </v-col>
          <v-col cols="12" sm="6" md="4">
            <v-card class="pa-4 text-center d-flex flex-column align-center justify-center" flat min-height="150">
              <div class="text-h6 mb-3">Export prodejů</div>
              <v-btn color="primary" prepend-icon="mdi-file-export" @click="exportSales">
                Exportovat
              </v-btn>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <v-row class="mb-8">
      <v-col cols="12">
        <h2 class="text-h5 mb-4">Produkty a kategorie</h2>
        <v-row>
          <v-col cols="12" sm="6" md="4">
            <v-card class="pa-4 text-center d-flex flex-column align-center justify-center" flat min-height="150">
              <div class="text-h6 mb-3">Export produktů</div>
              <v-btn color="primary" prepend-icon="mdi-file-export" @click="exportProducts">
                Exportovat
              </v-btn>
            </v-card>
          </v-col>
          <v-col cols="12" sm="6" md="4">
            <v-card class="pa-4 text-center d-flex flex-column align-center justify-center" flat min-height="150">
              <div class="text-h6 mb-3">Import produktů</div>
              <v-btn color="secondary" prepend-icon="mdi-file-import" @click="importProducts">
                Importovat
              </v-btn>
            </v-card>
          </v-col>
          <v-col cols="12" sm="6" md="4">
            <v-card class="pa-4 text-center d-flex flex-column align-center justify-center" flat min-height="150">
              <div class="text-h6 mb-3">Export kategorií</div>
              <v-btn color="primary" prepend-icon="mdi-file-export" @click="exportCategories">
                Exportovat
              </v-btn>
            </v-card>
          </v-col>
          <v-col cols="12" sm="6" md="4">
            <v-card class="pa-4 text-center d-flex flex-column align-center justify-center" flat min-height="150">
              <div class="text-h6 mb-3">Import kategorií</div>
              <v-btn color="secondary" prepend-icon="mdi-file-import" @click="importCategories">
                Importovat
              </v-btn>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <v-row class="mb-8">
      <v-col cols="12">
        <h2 class="text-h5 mb-4">Adresář</h2>
        <v-row>
          <v-col cols="12" sm="6" md="4">
            <v-card class="pa-4 text-center d-flex flex-column align-center justify-center" flat min-height="150">
              <div class="text-h6 mb-3">Export adresáře</div>
              <v-btn color="primary" prepend-icon="mdi-file-export" @click="exportAddressBook">
                Exportovat
              </v-btn>
            </v-card>
          </v-col>
          <v-col cols="12" sm="6" md="4">
            <v-card class="pa-4 text-center d-flex flex-column align-center justify-center" flat min-height="150">
              <div class="text-h6 mb-3">Import adresáře</div>
              <v-btn color="secondary" prepend-icon="mdi-file-import" @click="importAddressBook">
                Importovat
              </v-btn>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <v-row class="mb-8">
      <v-col cols="12">
        <h2 class="text-h5 mb-4">Kompletní data (záloha)</h2>
        <v-row>
          <v-col cols="12" sm="6" md="4">
            <v-card class="pa-4 text-center d-flex flex-column align-center justify-center" flat min-height="150">
              <div class="text-h6 mb-3">Kompletní data Export</div>
              <v-btn color="primary" prepend-icon="mdi-database-export" @click="exportCompleteData">
                Exportovat
              </v-btn>
            </v-card>
          </v-col>
          <v-col cols="12" sm="6" md="4">
            <v-card class="pa-4 text-center d-flex flex-column align-center justify-center" flat min-height="150">
              <div class="text-h6 mb-3">Kompletní data Import</div>
              <v-btn color="error" prepend-icon="mdi-database-import" @click="importCompleteData">
                Importovat
              </v-btn>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
// Funkce pro jednotlivé operace exportu/importu
const exportSalesTotal = () => {
  alert('Export tržeb probíhá...');
  // Zde by byla logika pro generování a stažení souboru s tržbami
};

const exportProfits = () => {
  alert('Export zisků probíhá...');
  // Logika pro export zisků
};

const exportSales = () => {
  alert('Export prodejů probíhá...');
  // Logika pro export detailních prodejů/účtenek
};

const exportProducts = () => {
  alert('Export produktů probíhá...');
  // Logika pro export produktů
};

const importProducts = () => {
  alert('Import produktů se spouští...');
  // Logika pro import produktů
};

const exportCategories = () => {
  alert('Export kategorií probíhá...');
  // Logika pro export kategorií
};

const importCategories = () => {
  alert('Import kategorií se spouští...');
  // Logika pro import kategorií
};

const exportAddressBook = () => {
  alert('Export adresáře probíhá...');
  // Logika pro export adresáře
};

const importAddressBook = () => {
  alert('Import adresáře se spouští...');
  // Logika pro import adresáře
};

const exportCompleteData = () => {
  alert('Export kompletních dat probíhá...');
  // Logika pro kompletní export databáze/systému
};

const importCompleteData = () => {
  alert('Import kompletních dat se spouští (POZOR: může přepsat existující data!)...');
  // Logika pro kompletní import databáze/systému
};
</script>

<style scoped>
.export-page .v-card {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease-in-out; /* Plynulá animace při najetí myší */
}

.export-page .v-card:hover {
  transform: translateY(-5px); /* Karta se mírně zvedne při najetí myší */
}

/* Styly pro zarovnání obsahu uvnitř karty */
.export-page .v-card.d-flex {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

/* Styly pro nadpisy skupin */
.export-page h2 {
  color: rgba(var(--v-theme-on-surface), 0.8);
  font-weight: 500;
  border-bottom: 1px solid rgba(var(--v-border-color), 0.1);
  padding-bottom: 8px;
}
</style>