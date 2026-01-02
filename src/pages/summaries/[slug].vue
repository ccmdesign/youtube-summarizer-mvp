<template>
  <ccm-section>
    <div v-if="pending">Loading...</div>
    <div v-else-if="error">Error: {{ error }}</div>
    <div v-else-if="!summary">Not found</div>
    <div v-else>
      <div class="center">
        <nuxt-link to="/">Back to summaries</nuxt-link>
        <h1>{{ summary.title }}</h1>
        <ContentRenderer :value="summary" class="prose-layout | prose" />
      </div>
    </div>
  </ccm-section>
</template>

<script setup lang="ts">

definePageMeta({
  hero: false,
  footer: false
})

const route = useRoute()
const slug = route.params.slug as string

const { data: summary, pending, error } = useAsyncData(
  `summary-${slug}`,
  async () => {
    // Try path first
    let result = await queryCollection('summaries').path(`/summaries/${slug}`).first()
    // Fallback to videoId filter if path doesn't work
    if (!result) {
      const all = await queryCollection('summaries').all()
      result = all.find((item: any) => item.videoId === slug) || null
    }
    return result
  }
)

</script>

<style scoped>
.center {
  --theme-center-measure: 80ch;
}
</style>

