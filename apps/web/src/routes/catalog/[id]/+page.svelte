<script lang="ts">
  import { t } from '$lib/i18n'
  import ItemDetailView from '$lib/presentation/components/ItemDetailView.svelte'

  let { data } = $props()
</script>

<svelte:head>
  <title>{data.item.title} | BabyClothes</title>
</svelte:head>

<div class="item-detail-page">
  <ItemDetailView item={data.item} seller={data.seller} />
</div>

<style>
  .item-detail-page {
    min-height: 100vh;
    background: var(--color-bg);
  }
</style>
