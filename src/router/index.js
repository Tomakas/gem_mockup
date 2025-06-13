// router/index.js
import { createRouter, createWebHistory } from 'vue-router';

// Import komponent pro jednotlivé stránky
// Tyto komponenty budeme vytvářet v dalším kroku
import Overview from '@/views/Overview.vue';
import Sales from '@/views/Sales.vue';
import Products from '@/views/Products.vue';
import Warehouse from '@/views/Warehouse.vue';
import CashRegisters from '@/views/CashRegisters.vue';
// import Orders from '@/views/Orders.vue'; // REMOVED
import AddressBook from '@/views/AddressBook.vue';
import Export from '@/views/Export.vue';
import Settings from '@/views/Settings.vue';

const routes = [
  {
    path: '/',
    redirect: '/overview' // Přesměrování z kořenové cesty na 'Overview'
  },
  {
    path: '/overview',
    name: 'Overview',
    component: Overview
  },
  {
    path: '/sales',
    name: 'Sales',
    component: Sales
  },
  {
    path: '/products',
    name: 'Products',
    component: Products
  },
  {
    path: '/warehouse',
    name: 'Warehouse',
    component: Warehouse
  },
  {
    path: '/cash-registers',
    name: 'CashRegisters',
    component: CashRegisters
  },
  // {
  //   path: '/orders', // REMOVED
  //   name: 'Orders',
  //   component: Orders
  // },
  {
    path: '/address-book',
    name: 'AddressBook',
    component: AddressBook
  },
  {
    path: '/export',
    name: 'Export',
    component: Export
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;