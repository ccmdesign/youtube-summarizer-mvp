<template>
  <section class="docs-component-demo">
    <ccm-section>
      <div class="stack" data-space="m">
        <h2>Baseline field</h2>
        <p>Default text input with label, helper text, and required indicator wired through <code>ccm-form-field</code>.</p>
        <ccm-form-field label="Full name" required helper="Enter your first and last name">
          <input id="demo-name" type="text" name="name" autocomplete="name" placeholder="Ada Lovelace" />
        </ccm-form-field>
      </div>
    </ccm-section>

    <ccm-section>
      <div class="stack" data-space="m">
        <h2>Validation states</h2>
        <p>Use <code>state</code> and <code>message</code> props to surface success or error messaging. Disabled examples remain focusable but announce <code>aria-disabled</code>.</p>
        <div class="stack" data-space="s">
          <ccm-form-field
            label="Email address"
            message="We will never share your email."
          >
            <input type="email" name="email" autocomplete="email" placeholder="name@example.com" />
          </ccm-form-field>

          <ccm-form-field
            label="Workspace URL"
            state="error"
            message="Choose a unique subdomain."
          >
            <input type="text" name="workspace" placeholder="acme" aria-describedby="workspace-error" />
          </ccm-form-field>

          <ccm-form-field
            label="Display name"
            state="success"
            message="Looks great!"
          >
            <input type="text" name="display-name" placeholder="@acme-team" />
          </ccm-form-field>

          <ccm-form-field
            label="Invitee email"
            disabled
            message="Disabled while invitations are paused."
          >
            <input type="email" name="invite-email" placeholder="team@example.com" disabled />
          </ccm-form-field>
        </div>
      </div>
    </ccm-section>

    <ccm-section>
      <div class="stack" data-space="m">
        <h2>Density & composition</h2>
        <p>Stacked layout transitions to a two-column grid at wider breakpoints using utility classes.</p>
        <form class="docs-component-demo__grid" aria-labelledby="profile-form-heading">
          <h3 id="profile-form-heading">Profile basics</h3>
          <ccm-form-field label="First name" helper="As shown on legal documents">
            <input type="text" name="first-name" autocomplete="given-name" />
          </ccm-form-field>
          <ccm-form-field label="Last name">
            <input type="text" name="last-name" autocomplete="family-name" />
          </ccm-form-field>
          <ccm-form-field label="Job title" helper="Displayed on your public profile">
            <input type="text" name="title" autocomplete="organization-title" />
          </ccm-form-field>
          <ccm-form-field label="Pronouns">
            <select name="pronouns">
              <option value="">Select pronouns</option>
              <option value="she-her">She / Her</option>
              <option value="he-him">He / Him</option>
              <option value="they-them">They / Them</option>
              <option value="custom">Custom</option>
            </select>
          </ccm-form-field>
          <fieldset class="docs-component-demo__fieldset">
            <legend>Notifications</legend>
            <ccm-form-field label="Weekly summary" helper="Digest of activity across teams">
              <input type="checkbox" name="weekly-summary" />
            </ccm-form-field>
            <ccm-form-field label="Product updates">
              <input type="checkbox" name="product-updates" />
            </ccm-form-field>
          </fieldset>
          <div class="docs-component-demo__actions">
            <ccm-button color="success">Save profile</ccm-button>
            <ccm-button variant="ghost">Cancel</ccm-button>
          </div>
        </form>
      </div>
    </ccm-section>

    <ccm-section>
      <div class="stack" data-space="m">
        <h2>Accessibility quick check</h2>
        <ul class="stack" data-space="2xs">
          <li>Every control owns a unique <code>label</code>; the component forwards <code>for</code>/<code>id</code> wiring automatically.</li>
          <li>Error and success messages announce with <code>aria-live="polite"</code>; use concise language so screen readers do not overload users.</li>
          <li>Disabled fields keep their label announced but expose <code>aria-disabled="true"</code> to clarify the inactive state.</li>
        </ul>
      </div>
    </ccm-section>
  </section>
</template>

<script setup lang="ts">
// No additional scripting required; form controls are declarative.
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

.docs-component-demo__fieldset {
  display: grid;
  gap: var(--space-s);
  border: 1px solid var(--color-base-tint-20);
  border-radius: var(--radius-m);
  padding: var(--space-m);
}

.docs-component-demo__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-s);
  align-items: center;
}

@media (min-width: 768px) {
  .docs-component-demo__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .docs-component-demo__actions {
    grid-column: span 2;
  }
}

@media (max-width: 768px) {
  .docs-component-demo {
    padding: var(--space-l);
    gap: var(--space-l);
  }
}
</style>

