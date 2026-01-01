<template>
  <section class="docs-component-demo">
    <ccm-section>
      <div class="stack" data-space="m">
        <h2>Button group</h2>
        <p>Baseline grouping of related actions. Border radius is trimmed between items to create a single control surface.</p>
        <ccm-form-group>
          <ccm-button size="s">Align left</ccm-button>
          <ccm-button size="s" variant="secondary">Align center</ccm-button>
          <ccm-button size="s" variant="secondary">Align right</ccm-button>
          <ccm-button size="s" variant="secondary" disabled>Justify</ccm-button>
        </ccm-form-group>
      </div>
    </ccm-section>

    <ccm-section>
      <div class="stack" data-space="m">
        <h2>Segmented control</h2>
        <p>Use toggle buttons to represent mutually exclusive options; announce selection via <code>aria-pressed</code>.</p>
        <ccm-form-group>
          <ccm-button
            v-for="view in pressedOptions"
            :key="view.label"
            size="s"
            :variant="view.active ? 'primary' : 'secondary'"
            :aria-pressed="view.active"
          >
            {{ view.label }}
          </ccm-button>
        </ccm-form-group>
      </div>
    </ccm-section>

    <ccm-section>
      <div class="stack" data-space="m">
        <h2>Input adornments</h2>
        <p>Form groups can wrap inputs for consistent borders when combining controls with dropdowns.</p>
        <ccm-form-group>
          <ccm-button size="s" variant="ghost">USD</ccm-button>
          <input type="number" min="0" step="1" placeholder="Budget" class="docs-component-demo__input">
          <select class="docs-component-demo__select">
            <option value="weekly">Weekly</option>
            <option value="monthly" selected>Monthly</option>
            <option value="annually">Annually</option>
          </select>
        </ccm-form-group>
      </div>
    </ccm-section>

    <ccm-section>
      <div class="stack" data-space="m">
        <h2>Vertical arrangement</h2>
        <p>Add the <code>direction</code> prop to switch to a column layout for stacked wizard actions.</p>
        <ccm-form-group direction="column">
          <ccm-button color="success">Publish campaign</ccm-button>
          <ccm-button variant="ghost">Preview</ccm-button>
          <ccm-button variant="secondary">Save draft</ccm-button>
        </ccm-form-group>
      </div>
    </ccm-section>

    <ccm-section>
      <div class="stack" data-space="m">
        <h2>Accessibility quick check</h2>
        <ul class="stack" data-space="2xs">
          <li>Ensure each child control carries its own label or icon text.</li>
          <li>Toggle group patterns should leverage <code>aria-pressed</code> or <code>aria-checked</code> depending on semantics.</li>
          <li>Provide additional spacing or separators when mixing interactive and read-only content inside the group.</li>
        </ul>
      </div>
    </ccm-section>
  </section>
</template>

<script setup lang="ts">
interface PressedOption {
  label: string
  active: boolean
}

const pressedOptions: PressedOption[] = [
  { label: 'Kanban', active: true },
  { label: 'Calendar', active: false },
  { label: 'List', active: false }
]
</script>

<style scoped>
.docs-component-demo {
  display: grid;
  gap: var(--space-xl);
  padding: var(--space-xl);
}

.docs-component-demo__input,
.docs-component-demo__select {
  border: 1px solid var(--color-base-tint-20);
  padding: var(--space-2xs) var(--space-xs);
  background: var(--color-white);
  font: inherit;
}

.docs-component-demo__select {
  border-left: none;
}

@media (max-width: 768px) {
  .docs-component-demo {
    padding: var(--space-l);
    gap: var(--space-l);
  }
}
</style>

