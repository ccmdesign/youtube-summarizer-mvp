<template>
  <section class="docs-component-demo">
    <ccm-section>
      <div class="stack" data-space="m">
        <h2>Default footer</h2>
        <p>Baseline layout with brand area, link groups, and legal text.</p>
        <div class="docs-component-demo__surface">
          <ccm-footer :groups="defaultGroups" :legal-links="legalLinks">
            <template #brand>
              <strong>Cloud City Media</strong>
              <span class="docs-component-demo__tagline">Design systems for ambitious teams</span>
            </template>
          </ccm-footer>
        </div>
      </div>
    </ccm-section>

    <ccm-section>
      <div class="stack" data-space="m">
        <h2>Compact footer</h2>
        <p>Use fewer link groups and condensed copy for smaller products.</p>
        <div class="docs-component-demo__surface">
          <ccm-footer :groups="compactGroups" :legal-links="legalLinks">
            <template #brand>
              <strong>CCM Studio</strong>
            </template>
          </ccm-footer>
        </div>
      </div>
    </ccm-section>

    <ccm-section>
      <div class="stack" data-space="m">
        <h2>Call-to-action footer</h2>
        <p>Extend the footer with a newsletter sign-up form using the actions slot.</p>
        <div class="docs-component-demo__surface">
          <ccm-footer :groups="defaultGroups" :legal-links="legalLinks">
            <template #brand>
              <strong>Northwind</strong>
              <span class="docs-component-demo__tagline">Experience more from your data</span>
            </template>
            <template #actions>
              <form class="docs-component-demo__form">
                <label for="footer-email">Join our newsletter</label>
                <div class="docs-component-demo__form-row">
                  <input id="footer-email" type="email" placeholder="you@example.com" required>
                  <ccm-button size="s">Subscribe</ccm-button>
                </div>
              </form>
            </template>
          </ccm-footer>
        </div>
      </div>
    </ccm-section>

    <ccm-section>
      <div class="stack" data-space="m">
        <h2>Accessibility quick check</h2>
        <ul class="stack" data-space="2xs">
          <li>Group links with descriptive headings so screen readers convey structure.</li>
          <li>Ensure form controls in the footer have labels and clear error handling.</li>
          <li>Maintain sufficient contrast between footer background and text, especially in themed variants.</li>
        </ul>
      </div>
    </ccm-section>
  </section>
</template>

<script setup lang="ts">
interface FooterLink {
  label: string
  to: string
}

interface FooterGroup {
  title: string
  links: FooterLink[]
}

const defaultGroups: FooterGroup[] = [
  {
    title: 'Product',
    links: [
      { label: 'Overview', to: '/product' },
      { label: 'Roadmap', to: '/roadmap' },
      { label: 'Pricing', to: '/pricing' }
    ]
  },
  {
    title: 'Resources',
    links: [
      { label: 'Documentation', to: '/docs' },
      { label: 'API reference', to: '/docs/api' },
      { label: 'Community', to: '/community' }
    ]
  },
  {
    title: 'Company',
    links: [
      { label: 'About', to: '/about' },
      { label: 'Careers', to: '/careers' },
      { label: 'Press', to: '/press' }
    ]
  }
]

const compactGroups: FooterGroup[] = [
  {
    title: 'Explore',
    links: [
      { label: 'Features', to: '/features' },
      { label: 'Pricing', to: '/pricing' }
    ]
  },
  {
    title: 'Support',
    links: [
      { label: 'Help center', to: '/help' },
      { label: 'Status', to: '/status' }
    ]
  }
]

const legalLinks: FooterLink[] = [
  { label: 'Privacy', to: '/privacy' },
  { label: 'Terms', to: '/terms' }
]
</script>

<style scoped>
.docs-component-demo {
  display: grid;
  gap: var(--space-xl);
  padding: var(--space-xl);
}

.docs-component-demo__surface {
  background: var(--color-base-tint-05);
  border-radius: var(--radius-xl);
  padding: var(--space-xl);
}

.docs-component-demo__tagline {
  display: block;
  font-size: var(--size--1);
  color: var(--color-secondary);
}

.docs-component-demo__form {
  display: grid;
  gap: var(--space-xs);
}

.docs-component-demo__form-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
}

.docs-component-demo__form-row input {
  flex: 1;
  min-width: 200px;
  padding: var(--space-2xs) var(--space-xs);
  border: 1px solid var(--color-base-tint-20);
  border-radius: var(--radius-s);
}

@media (max-width: 768px) {
  .docs-component-demo {
    padding: var(--space-l);
    gap: var(--space-l);
  }

  .docs-component-demo__surface {
    padding: var(--space-l);
  }
}
</style>

