<template>
  <section class="docs-component-demo">
    <ccm-section>
      <div class="stack" data-space="m">
        <h2>Controlled navigation</h2>
        <p>Tabs accept a JSON configuration describing labels, panels, and disabled state.</p>
        <ccm-tabs :tabs="productTabs" />
      </div>
    </ccm-section>

    <ccm-section>
      <div class="stack" data-space="m">
        <h2>Slot-based tabs</h2>
        <p>Use the navigation and content slots for bespoke markup, icons, and animations.</p>
        <ccm-tabs>
          <template #navigation>
            <ul class="docs-component-demo__nav">
              <li><button type="button" class="is-active">Overview</button></li>
              <li><button type="button">Specs</button></li>
              <li><button type="button">Reviews</button></li>
            </ul>
          </template>
          <template #content>
            <div class="docs-component-demo__panel">
              <h3>Overview</h3>
              <p>Slot panels can hold anything from copy to cards and comparison tables.</p>
            </div>
          </template>
        </ccm-tabs>
      </div>
    </ccm-section>

    <ccm-section>
      <div class="stack" data-space="m">
        <h2>Vertical layout</h2>
        <p>Set the <code>orientation</code> prop to <code>vertical</code> for sidebar navigation paired with detailed content.</p>
        <ccm-tabs :tabs="verticalTabs" orientation="vertical" />
      </div>
    </ccm-section>

    <ccm-section>
      <div class="stack" data-space="m">
        <h2>Accessibility quick check</h2>
        <ul class="stack" data-space="2xs">
          <li>Arrow keys navigate between tabs, Home/End jump to extremes.</li>
          <li>Associate panels via <code>aria-controls</code>; the component handles this automatically when using the JSON config.</li>
          <li>Keep tab labels concise—prefer six words or fewer for readability.</li>
        </ul>
      </div>
    </ccm-section>
  </section>
</template>

<script setup lang="ts">
interface TabPanel {
  id: string
  label: string
  content: string
  disabled?: boolean
}

const productTabs: TabPanel[] = [
  {
    id: 'overview',
    label: 'Overview',
    content: 'Understand value propositions, target users, and feature highlights.'
  },
  {
    id: 'pricing',
    label: 'Pricing',
    content: 'Transparent tiers detailing monthly and annual billing options.'
  },
  {
    id: 'faq',
    label: 'FAQ',
    content: 'Common implementation questions and security clarifications.'
  },
  {
    id: 'roadmap',
    label: 'Roadmap',
    content: 'Upcoming initiatives and milestone estimates.',
    disabled: true
  }
]

const verticalTabs: TabPanel[] = [
  {
    id: 'design',
    label: 'Design tokens',
    content: 'Token definitions and usage guidance for designers.'
  },
  {
    id: 'engineering',
    label: 'Engineering',
    content: 'Component APIs, examples, and performance considerations.'
  },
  {
    id: 'content',
    label: 'Content standards',
    content: 'Voice, tone, and inclusivity across product surfaces.'
  }
]
</script>

<style scoped>
.docs-component-demo {
  display: grid;
  gap: var(--space-xl);
  padding: var(--space-xl);
}

.docs-component-demo__nav {
  display: flex;
  gap: var(--space-xs);
  padding: 0;
  margin: 0;
  list-style: none;
}

.docs-component-demo__nav button {
  padding: var(--space-2xs) var(--space-s);
  border-radius: var(--radius-pill);
  border: 1px solid transparent;
  background: transparent;
  cursor: pointer;
  font: inherit;
}

.docs-component-demo__nav button.is-active {
  border-color: var(--color-primary);
  background: var(--color-primary-tint-20);
}

.docs-component-demo__panel {
  margin-top: var(--space-s);
  padding: var(--space-m);
  border-radius: var(--radius-l);
  background: var(--color-base-tint-05);
}

@media (max-width: 768px) {
  .docs-component-demo {
    padding: var(--space-l);
    gap: var(--space-l);
  }

  .docs-component-demo__nav {
    flex-wrap: wrap;
  }
}
</style>

