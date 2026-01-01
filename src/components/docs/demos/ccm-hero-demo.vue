<template>
  <section class="docs-component-demo">
    <ccm-section>
      <div class="stack" data-space="m">
        <h2>Default hero</h2>
        <p>Large headline with supporting copy and primary CTA. Background color leverages semantic tokens.</p>
        <ccm-hero size="l" background-color="color-primary-tint-20">
          <template #headline>
            <h1>Design system starter kit</h1>
          </template>
          <template #tagline>
            <p>Fast-track your product teams with accessible components, tokens, and content guidance.</p>
          </template>
          <template #actions>
            <div class="cluster" data-space="s">
              <ccm-button color="primary">Get started</ccm-button>
              <ccm-button variant="ghost">View roadmap</ccm-button>
            </div>
          </template>
        </ccm-hero>
      </div>
    </ccm-section>

    <ccm-section>
      <div class="stack" data-space="m">
        <h2>Minimal hero</h2>
        <p>Use the <code>variant="minimal"</code> option for quick page introductions without media zones.</p>
        <ccm-hero variant="minimal" size="m">
          <template #headline>
            <h2>Documentation hub</h2>
          </template>
          <template #tagline>
            <p>Find component specs, usage guidance, and governance workflows in one place.</p>
          </template>
        </ccm-hero>
      </div>
    </ccm-section>

    <ccm-section>
      <div class="stack" data-space="m">
        <h2>Media hero</h2>
        <p>Showcase a hero with rich media on the right slot (images, videos, or live components).</p>
        <ccm-hero background-color="color-base-tint-10">
          <template #headline>
            <h2>Live analytics preview</h2>
          </template>
          <template #tagline>
            <p>Monitor adoption, component usage, and accessibility compliance in real time.</p>
          </template>
          <template #actions>
            <ccm-button color="accent">Book a demo</ccm-button>
          </template>
          <template #media>
            <img
              src="https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=600&q=80"
              alt="Team collaborating over design system dashboards"
            >
          </template>
        </ccm-hero>
      </div>
    </ccm-section>

    <ccm-section>
      <div class="stack" data-space="m">
        <h2>Accessibility quick check</h2>
        <ul class="stack" data-space="2xs">
          <li>Ensure heading levels remain logical relative to the surrounding page.</li>
          <li>Provide descriptive alt text for media slot imagery or hide decorative media via <code>aria-hidden</code>.</li>
          <li>Check color contrast between text elements and the hero background token.</li>
        </ul>
      </div>
    </ccm-section>
  </section>
</template>

<script setup lang="ts">
// Declarative hero content only.
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

@media (max-width: 768px) {
  .docs-component-demo {
    padding: var(--space-l);
    gap: var(--space-l);
  }
}
</style>

