<script lang="ts">
  import { goto } from '$app/navigation'
  import AuthScreen from '$lib/presentation/components/AuthScreen.svelte'

  let loading = $state(false)

  function handleGoogleLogin() {
    loading = true
    // Simulate login delay
    setTimeout(() => {
      loading = false
      goto('/catalog')
    }, 1000)
  }
</script>

<svelte:head>
  <title>Login | BabyClothes</title>
</svelte:head>

<div class="login-page">
  <AuthScreen onGoogleLogin={handleGoogleLogin} {loading} />
</div>

<style>
  .login-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, var(--of2), var(--pk3));
    padding: 1rem;
  }
</style>
