<template>
  <section class="docs-component-demo">
    <ccm-section>
      <div class="stack" data-space="m">
        <h2>Primary card</h2>
        <p>Cards accept free-form content with optional media slots and CTA regions.</p>
        <ccm-card>
          <div class="stack" data-space="s">
            <h3>Design System Foundations</h3>
            <p>Learn how tokens, typography, and layout primitives combine to deliver cohesive experiences.</p>
            <ccm-button size="s">Read more</ccm-button>
          </div>
        </ccm-card>
      </div>
    </ccm-section>

    <ccm-section>
      <div class="stack" data-space="m">
        <h2>Media slot</h2>
        <p>Supply imagery via the <code>media</code> slot to surface product screenshots or illustrations.</p>
        <ccm-card>
          <template #media>
            <img
              src="https://images.unsplash.com/photo-1523475472560-d2df97ec485c?auto=format&fit=crop&w=640&q=80"
              alt="Analytics dashboard screenshot"
            >
          </template>
          <div class="stack" data-space="s">
            <h3>Analytics launch</h3>
            <p>Bring real-time dashboards to stakeholders with configurable widgets.</p>
            <div class="cluster" data-space="s">
              <ccm-button size="s" color="accent">Enable</ccm-button>
              <ccm-button size="s" variant="ghost">View docs</ccm-button>
            </div>
          </div>
        </ccm-card>
      </div>
    </ccm-section>

    <ccm-section>
      <div class="stack" data-space="m">
        <h2>Grid layout</h2>
        <p>Cards adapt to auto-fit grids; use responsive utilities to manage columns.</p>
        <div class="docs-component-demo__grid">
          <ccm-card v-for="feature in featureCards" :key="feature.title">
            <div class="stack" data-space="s">
              <h3>{{ feature.title }}</h3>
              <p>{{ feature.summary }}</p>
              <ccm-button size="s" variant="secondary">Explore</ccm-button>
            </div>
          </ccm-card>
        </div>
      </div>
    </ccm-section>

    <ccm-section>
      <div class="stack" data-space="m">
        <h2>Accessibility quick check</h2>
        <ul class="stack" data-space="2xs">
          <li>Ensure headings follow a logical hierarchy within cards.</li>
          <li>Click targets belong to explicit buttons or links; avoid making the whole card a single interactive region unless required.</li>
          <li>Maintain alt text for media slot imagery to describe meaningful content.</li>
        </ul>
      </div>
    </ccm-section>
  </section>
</template>

<script setup lang="ts">
interface FeatureCard {
  title: string
  summary: string
}

const featureCards: FeatureCard[] = [
  {
    title: 'Content scheduler',
    summary: 'Plan multi-channel campaigns with automated approvals and reminders.'
  },
  {
    title: 'Audience insights',
    summary: 'Segment audiences by behavior and ship personalized experiences rapidly.'
  },
  {
    title: 'Token management',
    summary: 'Synchronize design tokens across platforms with governance workflows.'
  }
]
</script>

<style scoped>
.docs-component-demo {
  display: grid;
  gap: var(--space-xl);
  padding: var(--space-xl);
}

.docs-component-demo__grid {
  display: grid;
  gap: var(--space-m);
}

@media (min-width: 768px) {
  .docs-component-demo__grid {
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  }
}

@media (max-width: 768px) {
  .docs-component-demo {
    padding: var(--space-l);
    gap: var(--space-l);
  }
}
</style>

