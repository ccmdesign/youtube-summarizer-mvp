<template>
  <section class="docs-component-demo">
    <ccm-section>
      <div class="stack" data-space="m">
        <h2>Default section</h2>
        <p>Sections provide consistent padding, background, and responsive alignment for page blocks.</p>
        <div class="stack" data-space="s">
          <p>Use sections to chunk content and establish vertical rhythm.</p>
          <div class="cluster" data-space="s">
            <ccm-button color="primary">Primary CTA</ccm-button>
            <ccm-button variant="ghost">Secondary CTA</ccm-button>
          </div>
        </div>
      </div>
    </ccm-section>

    <ccm-section background="base-tint-05">
      <template #left>
        <img
          src="https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=520&q=80"
          alt="Team collaborating"
        >
      </template>
      <template #default>
        <div class="stack" data-space="m">
          <h2>Media layout</h2>
          <p>Left/right slots accommodate imagery, diagrams, or interactive elements.</p>
          <ccm-button size="s">View case study</ccm-button>
        </div>
      </template>
    </ccm-section>

    <ccm-section background="primary-tint-10">
      <template #default>
        <div class="stack" data-space="m">
          <h2>Stacked content</h2>
          <p>Combine sections with `stack` and `cluster` utilities to build rich marketing layouts.</p>
          <div class="docs-component-demo__grid">
            <div class="stack" data-space="s" v-for="feature in sectionFeatures" :key="feature.title">
              <h3>{{ feature.title }}</h3>
              <p>{{ feature.summary }}</p>
            </div>
          </div>
        </div>
      </template>
    </ccm-section>

    <ccm-section>
      <div class="stack" data-space="m">
        <h2>Accessibility quick check</h2>
        <ul class="stack" data-space="2xs">
          <li>Ensure images inside slot content include alt attributes.</li>
          <li>Maintain heading order across sections so screen readers follow a logical structure.</li>
          <li>Use semantic HTML inside slots; <code>ccm-section</code> focuses on layout, not landmarks.</li>
        </ul>
      </div>
    </ccm-section>
  </section>
</template>

<script setup lang="ts">
interface SectionFeature {
  title: string
  summary: string
}

const sectionFeatures: SectionFeature[] = [
  {
    title: 'Composable layouts',
    summary: 'Combine slots with layout utilities for rapid page assembly.'
  },
  {
    title: 'Token-driven spacing',
    summary: 'Spacing scales with design tokens to keep rhythm consistent.'
  },
  {
    title: 'Responsive by default',
    summary: 'Slots collapse gracefully on smaller devices without extra markup.'
  }
]
</script>

<style scoped>
.docs-component-demo {
  display: grid;
  gap: var(--space-xl);
  padding: var(--space-xl);
}

.docs-component-demo img {
  width: 100%;
  height: auto;
  border-radius: var(--radius-l);
  object-fit: cover;
}

.docs-component-demo__grid {
  display: grid;
  gap: var(--space-m);
}

@media (min-width: 768px) {
  .docs-component-demo__grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }
}

@media (max-width: 768px) {
  .docs-component-demo {
    padding: var(--space-l);
    gap: var(--space-l);
  }
}
</style>

