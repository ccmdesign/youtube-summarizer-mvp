<template>
  <section class="docs-component-demo">
    <ccm-section>
      <div class="stack" data-space="m">
        <h2>Default byline</h2>
        <p>Baseline copyright message with attribution link aligned using the component’s internal cluster utility.</p>
        <ccm-by-line
          :year="2025"
          organisation="Cloud City Media"
          link-label="Designed by CCM"
          link-url="https://cloudcitymedia.example.com"
        />
      </div>
    </ccm-section>

    <ccm-section>
      <div class="stack" data-space="m">
        <h2>Variant examples</h2>
        <p>Demonstrates custom copy, social links, and dark theme usage.</p>
        <div class="stack" data-space="s">
          <ccm-by-line
            :year="2025"
            organisation="CCM Labs"
            link-label="Brand guidelines"
            link-url="/brand"
            toot-label="Follow on Mastodon"
            toot-url="https://mastodon.social/@ccmlabs"
          />

          <div class="docs-component-demo__inverse">
            <ccm-by-line
              :year="2025"
              organisation="Northwind"
              link-label="Design system overview"
              link-url="/design-system"
              theme="inverse"
            />
          </div>
        </div>
      </div>
    </ccm-section>

    <ccm-section>
      <div class="stack" data-space="m">
        <h2>Accessibility quick check</h2>
        <ul class="stack" data-space="2xs">
          <li>Ensure the attribution link text clearly identifies the destination.</li>
          <li>If the component appears more than once, make the link label unique per instance.</li>
          <li>When using the inverse theme, double-check contrast ratios of surrounding backgrounds.</li>
        </ul>
      </div>
    </ccm-section>
  </section>
</template>

<script setup lang="ts">
// Component relies on props; no extra scripting required.
</script>

<style scoped>
.docs-component-demo {
  display: grid;
  gap: var(--space-xl);
  padding: var(--space-xl);
}

.docs-component-demo__inverse {
  padding: var(--space-m);
  border-radius: var(--radius-l);
  background: var(--color-base-inverse);
}

@media (max-width: 768px) {
  .docs-component-demo {
    padding: var(--space-l);
    gap: var(--space-l);
  }
}
</style>

