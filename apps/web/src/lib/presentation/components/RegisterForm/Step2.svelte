<script lang="ts">
  import { getContext } from 'svelte'
  import { Input, Select } from '@babyclothes/design-system'
  import { MapPin } from 'lucide-svelte'
  import { t } from '$lib/i18n'
  import { UF_LIST } from '$lib/domain/user/schemas'
  import type { RegisterFormStore } from './RegisterFormStore'

  const store = getContext<RegisterFormStore>('registerForm')

  const ufOptions = UF_LIST.map((uf) => ({ value: uf, label: uf }))
</script>

<div class="step2__fields">
  <Input
    id="register-phone"
    label={$t('auth.register_pf.phone_label')}
    placeholder={$t('auth.register_pf.phone_placeholder')}
    value={$store.fields.phone.value}
    oninput={(e) => store.setFormattedPhone((e.target as HTMLInputElement).value)}
    onblur={() => store.handleBlur('phone')}
    error={$store.fields.phone.touched ? ($store.fields.phone.error ?? undefined) : undefined}
    inputmode="tel"
    maxlength={15}
    name="phone"
  />
  <Input
    id="register-nationality"
    label={$t('auth.register_pf.nationality_label')}
    placeholder={$t('auth.register_pf.nationality_placeholder')}
    value={$store.fields.nationality.value}
    oninput={(e) => store.setField('nationality', (e.target as HTMLInputElement).value)}
    onblur={() => store.handleBlur('nationality')}
    error={$store.fields.nationality.touched ? ($store.fields.nationality.error ?? undefined) : undefined}
    name="nationality"
  />
  <Input
    id="register-cep"
    label={$t('auth.register_pf.cep_label')}
    placeholder={$t('auth.register_pf.cep_placeholder')}
    value={$store.fields.cep.value}
    oninput={(e) => store.setFormattedCep((e.target as HTMLInputElement).value)}
    onblur={() => store.handleBlur('cep')}
    error={$store.fields.cep.touched ? ($store.fields.cep.error ?? undefined) : undefined}
    inputmode="numeric"
    maxlength={9}
    name="cep"
  />
  <Input
    id="register-address"
    label={$t('auth.register_pf.address_label')}
    placeholder={$t('auth.register_pf.address_placeholder')}
    value={$store.fields.addressLine.value}
    oninput={(e) => store.setField('addressLine', (e.target as HTMLInputElement).value)}
    onblur={() => store.handleBlur('addressLine')}
    error={$store.fields.addressLine.touched ? ($store.fields.addressLine.error ?? undefined) : undefined}
    name="addressLine"
  />
  <div class="step2__city-group">
    <Input
      id="register-city"
      label={$t('auth.register_pf.city_label')}
      placeholder={$t('auth.register_pf.city_placeholder')}
      value={$store.fields.city.value}
      oninput={(e) => store.setField('city', (e.target as HTMLInputElement).value)}
      onblur={() => store.handleBlur('city')}
      error={$store.fields.city.touched ? ($store.fields.city.error ?? undefined) : undefined}
      hint={!$store.fields.city.error ? $t('auth.register_pf.city_hint') : undefined}
      name="city"
    />
    <span class="step2__city-icon" aria-hidden="true">
      <MapPin size={16} />
    </span>
  </div>
  <Select
    id="register-state"
    label={$t('auth.register_pf.state_label')}
    placeholder={$t('auth.register_pf.state_placeholder')}
    options={ufOptions}
    value={$store.fields.state.value}
    onchange={(v) => store.setField('state', v)}
    onblur={() => store.handleBlur('state')}
    error={$store.fields.state.touched ? ($store.fields.state.error ?? undefined) : undefined}
    name="state"
  />
</div>

<style>
  .step2__fields {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 1.2rem;
  }

  .step2__city-group {
    position: relative;
  }

  .step2__city-icon {
    position: absolute;
    right: 0.8rem;
    top: 2.4rem;
    color: #9CA3AF;
    pointer-events: none;
  }
</style>
