# 📦 Component Registry

> Quick reference for all project components, hooks, and utilities
> **Update:** After creating/modifying any component, hook, or utility

---

## 📄 Pages

| Route | File | Description | Key Dependencies |
|-------|------|-------------|------------------|
| `/` | `app/page.tsx` | Dashboard with module links | - |
| `/items` | `app/items/page.tsx` | Items master list | items-store |
| `/suppliers` | `app/suppliers/page.tsx` | Suppliers management | suppliers-store |
| `/recipes` | `app/recipes/page.tsx` | Recipe/BOM list | recipes-store |
| `/production` | `app/production/page.tsx` | Production orders | production-store |
| `/quality` | `app/quality/page.tsx` | CCP records | - |
| `/receiving` | `app/receiving/page.tsx` | Material receiving | - |
| `/inventory` | `app/inventory/page.tsx` | Stock on hand | - |
| `/transactions` | `app/transactions/page.tsx` | Inventory transactions | transactions-store |

---

## 🧩 Components

### Transaction Components

| Component | Location | Key Props | Used By |
|-----------|----------|-----------|---------|
| TransactionTable | `components/transactions/transaction-table.tsx` | transactions, onView | TransactionsPage |
| TransactionFormModal | `components/transactions/transaction-form-modal.tsx` | isOpen, onClose, defaultType | TransactionsPage |

### Supplier Components

| Component | Location | Key Props | Used By |
|-----------|----------|-----------|---------|
| SupplierTable | `components/suppliers/supplier-table.tsx` | suppliers, onEdit, onDelete | SuppliersPage |
| SupplierFormModal | `components/suppliers/supplier-form-modal.tsx` | isOpen, onClose, supplier | SuppliersPage |

---

## 🪝 Custom Hooks

| Hook | Location | Purpose | Returns |
|------|----------|---------|---------|
| (none yet) | - | - | - |

---

## 🏪 Zustand Stores

| Store | Location | State Shape | Key Actions |
|-------|----------|-------------|-------------|
| useTransactionsStore | `stores/transactions-store.ts` | transactions, stats, filters | fetchTransactions, createTransaction |
| useSuppliersStore | `stores/suppliers-store.ts` | suppliers, isLoading | fetchSuppliers, createSupplier |
| useItemsStore | `stores/items-store.ts` | items, isLoading | fetchItems |
| useRecipesStore | `stores/recipes-store.ts` | recipes, isLoading | fetchRecipes |

---

## 🛠️ Utility Functions

| Function | Location | Purpose | Params |
|----------|----------|---------|--------|
| cn | `lib/utils.ts` | Merge Tailwind classes | `...inputs` |
| formatCurrency | `lib/utils.ts` | ฿ currency format | amount |
| formatDate | `lib/utils.ts` | Thai date format | date |
| formatDateTime | `lib/utils.ts` | Thai datetime format | date |
| formatNumber | `lib/utils.ts` | Number with separators | value, decimals |
| formatDuration | `lib/utils.ts` | Duration in Thai | minutes |

---

## 📊 Component Statistics

| Category | Count |
|----------|-------|
| Pages | 9 |
| Components | 4+ |
| Hooks | 0 |
| Stores | 4+ |

---
*Last updated: 2026-02-01*
