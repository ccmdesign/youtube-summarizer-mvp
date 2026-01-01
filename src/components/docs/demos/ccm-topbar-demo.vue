<template>
  <section class="docs-component-demo">
    <ccm-section>
      <div class="stack" data-space="m">
        <h2>Default topbar</h2>
        <p>Brand area on the left, primary navigation on the right, responsive collapse handled internally.</p>
        <ccm-topbar :links="mainNav">
          <template #brand>
            <NuxtLink to="/">
              <strong>CCM Studio</strong>
            </NuxtLink>
          </template>
          <template #user>
            <button type="button" class="docs-component-demo__avatar" aria-label="Open account menu">AL</button>
          </template>
        </ccm-topbar>
      </div>
    </ccm-section>

    <ccm-section>
      <div class="stack" data-space="m">
        <h2>Topbar with secondary actions</h2>
        <p>Use slots to place CTA buttons or status indicators alongside navigation.</p>
        <ccm-topbar :links="productNav">
          <template #brand>
            <NuxtLink to="/">
              <strong>Northwind</strong>
            </NuxtLink>
          </template>
          <template #actions>
            <div class="cluster" data-space="s">
              <ccm-button size="s" variant="ghost">Docs</ccm-button>
              <ccm-button size="s" color="accent">Launch app</ccm-button>
            </div>
          </template>
        </ccm-topbar>
      </div>
    </ccm-section>

    <ccm-section>
      <div class="stack" data-space="m">
        <h2>Inverse theme</h2>
        <p>Apply the <code>theme="inverse"</code> prop for dark surfaces. Ensure iconography meets contrast requirements.</p>
        <div class="docs-component-demo__inverse">
          <ccm-topbar :links="inverseNav" theme="inverse">
            <template #brand>
              <NuxtLink to="/">
                <span class="docs-component-demo__brand">Aurora</span>
              </NuxtLink>
            </template>
            <template #user>
              <button type="button" class="docs-component-demo__avatar docs-component-demo__avatar--inverse" aria-label="Open account menu">JD</button>
            </template>
          </ccm-topbar>
        </div>
      </div>
    </ccm-section>

    <ccm-section>
      <div class="stack" data-space="m">
        <h2>Accessibility quick check</h2>
        <ul class="stack" data-space="2xs">
          <li>Focus states must remain visible for all navigation links and action buttons.</li>
          <li>Provide descriptive aria labels for avatar buttons and hamburger menus.</li>
          <li>Keep navigation lists under seven items; overflow content should move into menus.</li>
        </ul>
      </div>
    </ccm-section>
  </section>
</template>

<script setup lang="ts">
interface NavLink {
  label: string
  to: string
}

const mainNav: NavLink[] = [
  { label: 'Overview', to: '/overview' },
  { label: 'Guides', to: '/guides' },
  { label: 'Components', to: '/components' }
]

const productNav: NavLink[] = [
  { label: 'Product', to: '/product' },
  { label: 'Pricing', to: '/pricing' },
  { label: 'Customers', to: '/customers' },
  { label: 'Resources', to: '/resources' }
]

const inverseNav: NavLink[] = [
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Reports', to: '/reports' },
  { label: 'Settings', to: '/settings' }
]
</script>

<style scoped>
.docs-component-demo {
  display: grid;
  gap: var(--space-xl);
  padding: var(--space-xl);
}

.docs-component-demo__avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  border: none;
  background: var(--color-primary-tint-30);
  color: var(--color-primary);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
}

.docs-component-demo__avatar--inverse {
  background: rgba(255, 255, 255, 0.16);
  color: var(--color-white);
}

.docs-component-demo__inverse {
  background: var(--color-base-inverse);
  border-radius: var(--radius-xl);
  padding: var(--space-l);
}

.docs-component-demo__brand {
  font-weight: var(--font-weight-semibold);
  color: var(--color-white);
}

@media (max-width: 768px) {
  .docs-component-demo {
    padding: var(--space-l);
    gap: var(--space-l);
  }
}
</style>

