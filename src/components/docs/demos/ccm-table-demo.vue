<template>
  <section class="docs-component-demo">
    <ccm-section>
      <div class="stack" data-space="m">
        <h2>Static markup</h2>
        <p>Provide full table markup when you need granular control over semantics.</p>
        <ccm-table>
          <table>
            <caption>Component adoption</caption>
            <thead>
              <tr>
                <th scope="col">Component</th>
                <th scope="col">Usage</th>
                <th scope="col">Last updated</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">ccmButton</th>
                <td>High</td>
                <td>2025-10-12</td>
              </tr>
              <tr>
                <th scope="row">ccmFormField</th>
                <td>Medium</td>
                <td>2025-10-02</td>
              </tr>
              <tr>
                <th scope="row">ccmTabs</th>
                <td>Emerging</td>
                <td>2025-09-28</td>
              </tr>
            </tbody>
          </table>
        </ccm-table>
      </div>
    </ccm-section>

    <ccm-section>
      <div class="stack" data-space="m">
        <h2>Data-driven table</h2>
        <p>Use the <code>rows</code> prop for lightweight tabular data when you do not need custom markup.</p>
        <ccm-table :rows="rows" :columns="columns" />
      </div>
    </ccm-section>

    <ccm-section>
      <div class="stack" data-space="m">
        <h2>Responsive handling</h2>
        <p>Wrap the table in a scroll container for smaller viewports. Include helper text for screen reader users.</p>
        <div class="docs-component-demo__overflow" role="region" aria-live="polite" aria-label="Responsive table example">
          <ccm-table>
            <table>
              <caption>Quarterly revenue</caption>
              <thead>
                <tr>
                  <th scope="col">Quarter</th>
                  <th scope="col">North America</th>
                  <th scope="col">EMEA</th>
                  <th scope="col">APAC</th>
                  <th scope="col">LATAM</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in revenue" :key="item.quarter">
                  <th scope="row">{{ item.quarter }}</th>
                  <td>{{ item.na }}</td>
                  <td>{{ item.emea }}</td>
                  <td>{{ item.apac }}</td>
                  <td>{{ item.latam }}</td>
                </tr>
              </tbody>
            </table>
          </ccm-table>
        </div>
        <p class="docs-component-demo__hint">Hint: scroll horizontally on mobile to view all regions.</p>
      </div>
    </ccm-section>

    <ccm-section>
      <div class="stack" data-space="m">
        <h2>Accessibility quick check</h2>
        <ul class="stack" data-space="2xs">
          <li>Always provide `<caption>` or adjacent heading so the table’s purpose is clear.</li>
          <li>Mark header cells with `<th scope="col">` and `<th scope="row">` to support screen readers.</li>
          <li>For scrollable tables, describe the overflow behaviour and ensure keyboard users can reach the content.</li>
        </ul>
      </div>
    </ccm-section>
  </section>
</template>

<script setup lang="ts">
interface Column {
  key: string
  label: string
}

interface Row {
  [key: string]: string
}

const columns: Column[] = [
  { key: 'feature', label: 'Feature' },
  { key: 'status', label: 'Status' },
  { key: 'owner', label: 'Owner' }
]

const rows: Row[] = [
  { feature: 'Audit log export', status: 'Shipped', owner: 'Security' },
  { feature: 'Workflow builder', status: 'In beta', owner: 'Automation' },
  { feature: 'Design tokens sync', status: 'Planned', owner: 'Platform' }
]

interface RevenueRow {
  quarter: string
  na: string
  emea: string
  apac: string
  latam: string
}

const revenue: RevenueRow[] = [
  { quarter: 'Q1', na: '$1.2M', emea: '$900K', apac: '$760K', latam: '$340K' },
  { quarter: 'Q2', na: '$1.4M', emea: '$950K', apac: '$820K', latam: '$360K' },
  { quarter: 'Q3', na: '$1.6M', emea: '$1.05M', apac: '$880K', latam: '$390K' }
]
</script>

<style scoped>
.docs-component-demo {
  display: grid;
  gap: var(--space-xl);
  padding: var(--space-xl);
}

.docs-component-demo__overflow {
  overflow-x: auto;
  border: 1px solid var(--color-base-tint-20);
  border-radius: var(--radius-m);
}

.docs-component-demo__overflow table {
  min-width: 640px;
}

.docs-component-demo__hint {
  margin: 0;
  font-size: var(--size--1);
  color: var(--color-secondary);
}

@media (max-width: 768px) {
  .docs-component-demo {
    padding: var(--space-l);
    gap: var(--space-l);
  }
}
</style>

