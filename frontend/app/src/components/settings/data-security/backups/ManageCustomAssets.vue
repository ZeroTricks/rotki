<script setup lang="ts">
const zip = ref<File | null>(null);
const importError = ref('');
const exportError = ref('');
const downloading = ref(false);
const downloaded = ref(false);
const uploading = ref(false);
const uploaded = ref(false);

const { importCustomAssets, exportCustomAssets } = useAssets();
const importDisabled = computed(() => !get(zip));
const { start, stop } = useTimeoutFn(() => set(downloaded, false), 4000);

const importZip = async () => {
  const file = get(zip);
  assert(file);
  set(uploading, true);
  const result = await importCustomAssets(file);
  if (result.success) {
    set(uploaded, true);
  } else {
    set(importError, result.message);
  }
  set(uploading, false);
  set(zip, null);
};

const exportZip = async () => {
  stop();
  if (get(downloading)) {
    return;
  }
  set(downloading, true);
  const result = await exportCustomAssets();
  if (result.success) {
    set(downloaded, true);
    start();
  } else {
    set(exportError, result.message);
  }
  set(downloading, false);
};

const { t } = useI18n();
</script>

<template>
  <Card>
    <template #title>{{ t('manage_user_assets.title') }}</template>

    <div class="flex flex-col gap-4">
      <RuiAlert type="info">
        {{ t('manage_user_assets.warning') }}
      </RuiAlert>

      <RuiCard>
        <template #header>{{ t('manage_user_assets.export.title') }}</template>
        <template #subheader>
          {{ t('manage_user_assets.export.subtitle') }}
        </template>
        <RuiAlert v-if="exportError" class="my-2" type="error">
          {{ exportError }}
        </RuiAlert>
        <div class="flex flex-row items-center">
          <RuiButton
            color="primary"
            :loading="downloading"
            @click="exportZip()"
          >
            {{ t('manage_user_assets.export.button') }}
          </RuiButton>
          <div v-if="downloaded" class="flex items-center gap-2 ml-6">
            <SuccessDisplay success />
            <span>
              {{ t('manage_user_assets.export.success') }}
            </span>
          </div>
        </div>
      </RuiCard>

      <RuiCard>
        <template #header>{{ t('common.actions.import') }}</template>
        <template #subheader>
          {{ t('manage_user_assets.import.subtitle') }}
        </template>
        <FileUpload
          v-model="zip"
          source="zip"
          file-filter=".zip"
          :uploaded="uploaded"
          :error-message="importError"
          @update:uploaded="uploaded = $event"
          @update:error-message="importError = $event"
        />
        <RuiButton
          color="primary"
          class="mt-4"
          :disabled="importDisabled"
          :loading="uploading"
          @click="importZip()"
        >
          {{ t('common.actions.import') }}
        </RuiButton>
      </RuiCard>
    </div>
  </Card>
</template>
