<template>
  <section class="docs-component-demo">
    <ccm-section>
      <div class="stack" data-space="m">
        <h2>Baseline usage</h2>
        <p>Primary action button with supporting secondary option.</p>
        <div class="cluster" data-space="s">
          <ccm-button>Submit</ccm-button>
          <ccm-button variant="secondary">Cancel</ccm-button>
        </div>
      </div>
    </ccm-section>

    <ccm-section>
      <div class="stack" data-space="m">
        <h2>Variants</h2>
        <p>Visual variants share the same sizing tokens and respond to the <code>variant</code> prop.</p>
        <div class="cluster" data-space="s">
          <ccm-button
            v-for="variant in variantOptions"
            :key="variant"
            :variant="variant"
            class="docs-component-demo__labelled"
          >
            {{ variant }}
          </ccm-button>
        </div>
      </div>
    </ccm-section>

    <ccm-section>
      <div class="stack" data-space="m">
        <h2>Semantic colors</h2>
        <p>Each color token pairs with filled and outlined treatments. Disabled examples document aria-disabled behaviour.</p>
        <div class="stack" data-space="s">
          <div class="cluster" data-space="s">
            <ccm-button
              v-for="color in colorOptions"
              :key="`primary-${color}`"
              :color="color"
            >
              {{ color }}
            </ccm-button>
          </div>
          <div class="cluster" data-space="s">
            <ccm-button
              v-for="color in colorOptions"
              :key="`secondary-${color}`"
              :color="color"
              variant="secondary"
            >
              {{ color }}
            </ccm-button>
          </div>
          <div class="cluster" data-space="s">
            <ccm-button
              v-for="color in colorOptions"
              :key="`disabled-${color}`"
              :color="color"
              variant="secondary"
              disabled
            >
              {{ color }}
            </ccm-button>
          </div>
        </div>
      </div>
    </ccm-section>

    <ccm-section>
      <div class="stack" data-space="m">
        <h2>Sizes</h2>
        <p>Size options scale padding and typography. Keyboard focus remains visible on each button.</p>
        <div class="cluster" data-space="s">
          <ccm-button
            v-for="size in sizeOptions"
            :key="size"
            :size="size"
          >
            Size {{ size.toUpperCase() }}
          </ccm-button>
        </div>
      </div>
    </ccm-section>

    <ccm-section>
      <div class="stack" data-space="m">
        <h2>Stateful interactions</h2>
        <p>Pressed and expanded states expose aria attributes for toggle-style controls.</p>
        <div class="cluster" data-space="s">
          <ccm-button :aria-pressed="true" is-pressed>
            Toggle (pressed)
          </ccm-button>
          <ccm-button :aria-expanded="true" is-expanded variant="secondary">
            Disclosure (expanded)
          </ccm-button>
          <ccm-button disabled>
            Disabled action
          </ccm-button>
        </div>
      </div>
    </ccm-section>

    <ccm-section>
      <div class="stack" data-space="m">
        <h2>Composition: toolbar group</h2>
        <p>Buttons wrapped in <code>ccmFormGroup</code> inherit shared borders and spacing for dense toolbars.</p>
        <ccm-form-group>
          <ccm-button size="s">Bold</ccm-button>
          <ccm-button size="s" variant="secondary">Italic</ccm-button>
          <ccm-button size="s" variant="secondary" disabled>Underline</ccm-button>
          <ccm-button size="s" color="accent" variant="secondary">Highlight</ccm-button>
        </ccm-form-group>
      </div>
    </ccm-section>

    <ccm-section>
      <div class="stack" data-space="m">
        <h2>Composition: card footer actions</h2>
        <p>Demonstrates primary and quiet actions inside <code>ccmCard</code> with layout utilities.</p>
        <ccm-card>
          <div class="stack" data-space="s">
            <h3>Invite collaborator</h3>
            <p>Share editing access and assign ownership of the project.</p>
            <div class="cluster" data-space="s">
              <ccm-button color="success">Send invite</ccm-button>
              <ccm-button variant="ghost">Preview email</ccm-button>
            </div>
          </div>
        </ccm-card>
      </div>
    </ccm-section>

    <ccm-section>
      <div class="stack" data-space="m">
        <h2>Accessibility quick check</h2>
        <ul class="stack" data-space="2xs">
          <li>Tab order follows DOM order. Use <kbd>Tab</kbd>/<kbd>Shift+Tab</kbd> to confirm focus rings remain visible.</li>
          <li>Toggle and disclosure examples announce <code>aria-pressed</code> / <code>aria-expanded</code> changes to assistive tech.</li>
          <li>Disabled buttons expose <code>aria-disabled="true"</code>; provide contextual messaging when disabling critical actions.</li>
        </ul>
      </div>
    </ccm-section>
  </section>
</template>

<script setup lang="ts">
const variantOptions = ['primary', 'secondary', 'ghost', 'link', 'unstyled'] as const
const colorOptions = ['primary', 'secondary', 'base', 'accent', 'success', 'warning', 'info', 'fail'] as const
const sizeOptions = ['s', 'm', 'l', 'xl'] as const
</script>

<style scoped>
.docs-component-demo {
  display: grid;
  gap: var(--space-xl);
  padding: var(--space-xl);
}

.docs-component-demo__labelled {
  text-transform: capitalize;
}

@media (max-width: 768px) {
  .docs-component-demo {
    padding: var(--space-l);
    gap: var(--space-l);
  }
}
</style>

