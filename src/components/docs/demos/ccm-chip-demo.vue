<template>
  <section class="docs-component-demo">
    <ccm-section>
      <div class="stack" data-space="m">
        <h2>Chip variants</h2>
        <p>Display semantic styles controlled by <code>variant</code> and <code>color</code> props.</p>
        <div class="stack" data-space="s">
          <div class="cluster" data-space="s">
            <ccm-chip v-for="color in colorOptions" :key="`filled-${color}`" :color="color">
              {{ color }}
            </ccm-chip>
          </div>
          <div class="cluster" data-space="s">
            <ccm-chip
              v-for="color in colorOptions"
              :key="`outlined-${color}`"
              :color="color"
              variant="outlined"
            >
              {{ color }}
            </ccm-chip>
          </div>
        </div>
      </div>
    </ccm-section>

    <ccm-section>
      <div class="stack" data-space="m">
        <h2>Sizes & density</h2>
        <p>Use extra-small chips for metadata, small for filters, and medium for primary labels.</p>
        <div class="cluster" data-space="s">
          <ccm-chip size="xs">XS</ccm-chip>
          <ccm-chip size="s">Small</ccm-chip>
          <ccm-chip size="m">Medium</ccm-chip>
        </div>
      </div>
    </ccm-section>

    <ccm-section>
      <div class="stack" data-space="m">
        <h2>Interactive chips</h2>
        <p>Chips can act as filters or toggles. Provide buttons for dismissible actions and maintain accessible labels.</p>
        <div class="cluster" data-space="s">
          <ccm-chip dismissible @dismiss="onDismiss('Design Tokens')">
            Design Tokens
          </ccm-chip>
          <ccm-chip icon="check" variant="outlined">
            Selected filter
          </ccm-chip>
          <ccm-chip as="button" aria-pressed="true" variant="outlined" color="success">
            Active state
          </ccm-chip>
        </div>
      </div>
    </ccm-section>

    <ccm-section>
      <div class="stack" data-space="m">
        <h2>Composed usage</h2>
        <p>Group chips within clusters to visualise multiple tags in cards or search UIs.</p>
        <ccm-card>
          <div class="stack" data-space="s">
            <h3>Quarterly strategy</h3>
            <div class="cluster" data-space="s">
              <ccm-chip color="info">Research</ccm-chip>
              <ccm-chip color="accent">Design</ccm-chip>
              <ccm-chip color="success">Delivery</ccm-chip>
              <ccm-chip variant="outlined">Retrospective</ccm-chip>
            </div>
            <p>Use chips to communicate project status metadata inline.</p>
          </div>
        </ccm-card>
      </div>
    </ccm-section>

    <ccm-section>
      <div class="stack" data-space="m">
        <h2>Accessibility quick check</h2>
        <ul class="stack" data-space="2xs">
          <li>Dismissible chips expose a button with <code>aria-label</code>; ensure the computed label identifies the chip.</li>
          <li>Pressable chips should declare <code>aria-pressed</code> when used as toggles.</li>
          <li>Keep icon-only chips paired with <code>aria-label</code> or descriptive text.</li>
        </ul>
      </div>
    </ccm-section>
  </section>
</template>

<script setup lang="ts">
const colorOptions = ['neutral', 'primary', 'accent', 'success', 'warning', 'info', 'fail'] as const

function onDismiss(name: string) {
  if (import.meta.dev) {
    console.info(`[ccm-chip-demo] Dismissed chip: ${name}`)
  }
}
</script>

<style scoped>
.docs-component-demo {
  display: grid;
  gap: var(--space-xl);
  padding: var(--space-xl);
}

@media (max-width: 768px) {
  .docs-component-demo {
    padding: var(--space-l);
    gap: var(--space-l);
  }
}
</style>

