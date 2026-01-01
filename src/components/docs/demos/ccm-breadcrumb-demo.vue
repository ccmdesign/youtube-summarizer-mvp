<template>
  <section class="docs-component-demo">
    <ccm-section>
      <div class="stack" data-space="m">
        <h2>Default breadcrumb</h2>
        <p>Baseline navigation trail with semantic list markup. Focus rings stay visible on keyboard navigation.</p>
        <ccm-breadcrumb :items="defaultTrail" aria-label="Primary breadcrumbs" />
      </div>
    </ccm-section>

    <ccm-section>
      <div class="stack" data-space="m">
        <h2>Variant showcase</h2>
        <p>Separator and size options demonstrate layout flexibility while preserving aria metadata.</p>
        <div class="stack" data-space="s">
          <div class="stack" data-space="2xs">
            <h3>Slash separator</h3>
            <ccm-breadcrumb :items="marketingTrail" separator="slash" />
          </div>
          <div class="stack" data-space="2xs">
            <h3>Custom separator slot</h3>
            <ccm-breadcrumb :items="developerTrail" separator="custom">
              <template #separator>
                <span aria-hidden="true" class="docs-component-demo__separator">·</span>
              </template>
            </ccm-breadcrumb>
          </div>
          <div class="stack" data-space="2xs">
            <h3>Size options</h3>
            <div class="cluster" data-space="s">
              <ccm-breadcrumb :items="defaultTrail" size="s" />
              <ccm-breadcrumb :items="defaultTrail" size="m" />
            </div>
          </div>
        </div>
      </div>
    </ccm-section>

    <ccm-section>
      <div class="stack" data-space="m">
        <h2>Wrapping trail</h2>
        <p>Use the <code>wrap</code> variant when paths grow long on narrow viewports.</p>
        <ccm-breadcrumb :items="wrapTrail" variant="wrap" aria-label="Deep taxonomy breadcrumbs" />
      </div>
    </ccm-section>

    <ccm-section>
      <div class="stack" data-space="m">
        <h2>Accessibility quick check</h2>
        <ul class="stack" data-space="2xs">
          <li>The last item receives <code>aria-current="page"</code> automatically.</li>
          <li>Provide specific <code>aria-label</code> text when multiple breadcrumb regions appear on a page.</li>
          <li>Keyboard navigation uses standard tab order; links retain visible focus styles.</li>
        </ul>
      </div>
    </ccm-section>
  </section>
</template>

<script setup lang="ts">
interface TrailItem {
  label: string
  to?: string
}

const defaultTrail: TrailItem[] = [
  { label: 'Home', to: '/' },
  { label: 'Library', to: '/library' },
  { label: 'Guides', to: '/library/guides' },
  { label: 'Writing effective release notes' }
]

const marketingTrail: TrailItem[] = [
  { label: 'Home', to: '/' },
  { label: 'Solutions', to: '/solutions' },
  { label: 'Marketing', to: '/solutions/marketing' },
  { label: 'Campaign templates' }
]

const developerTrail: TrailItem[] = [
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Projects', to: '/dashboard/projects' },
  { label: 'ccm-web', to: '/dashboard/projects/ccm-web' },
  { label: 'Deploy preview' }
]

const wrapTrail: TrailItem[] = [
  { label: 'Home', to: '/' },
  { label: 'Docs', to: '/docs' },
  { label: 'Components', to: '/docs/components' },
  { label: 'Navigation', to: '/docs/components/navigation' },
  { label: 'Breadcrumb', to: '/docs/components/navigation/breadcrumb' },
  { label: 'Advanced usage' }
]
</script>

<style scoped>
.docs-component-demo {
  display: grid;
  gap: var(--space-xl);
  padding: var(--space-xl);
}

.docs-component-demo__separator {
  display: inline-block;
  padding-inline: var(--space-3xs);
}

@media (max-width: 768px) {
  .docs-component-demo {
    padding: var(--space-l);
    gap: var(--space-l);
  }
}
</style>

