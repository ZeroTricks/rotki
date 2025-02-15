<script setup lang="ts">
import useVuelidate from '@vuelidate/core';
import { helpers, required } from '@vuelidate/validators';
import { displayDateFormatter } from '@/data/date_formatter';
import { Defaults } from '@/data/defaults';

const dateDisplayFormat = ref<string>('');
const formatHelp = ref<boolean>(false);
const now = new Date();
const defaultDateDisplayFormat = Defaults.DEFAULT_DATE_DISPLAY_FORMAT;

const containsValidDirectives = (v: string) =>
  displayDateFormatter.containsValidDirectives(v);

const { t } = useI18n();

const rules = {
  dateDisplayFormat: {
    required: helpers.withMessage(
      t('general_settings.date_display.validation.empty'),
      required
    ),
    containsValidDirectives: helpers.withMessage(
      t('general_settings.date_display.validation.invalid'),
      containsValidDirectives
    )
  }
};

const v$ = useVuelidate(rules, { dateDisplayFormat }, { $autoDirty: true });
const { callIfValid } = useValidation(v$);

const { dateDisplayFormat: format } = storeToRefs(useGeneralSettingsStore());

const dateDisplayFormatExample = computed<string>(() =>
  displayDateFormatter.format(now, get(dateDisplayFormat))
);

const resetDateDisplayFormat = () => {
  set(dateDisplayFormat, get(format));
};

const debounceUpdate = useDebounceFn(callIfValid, 1500);

const successMessage = (dateFormat: string) =>
  t('general_settings.validation.date_display_format.success', {
    dateFormat
  });

onMounted(() => {
  resetDateDisplayFormat();
});
</script>

<template>
  <div>
    <DateFormatHelp v-model="formatHelp" />
    <SettingsOption
      #default="{ error, success, update }"
      setting="dateDisplayFormat"
      :error-message="
        t('general_settings.validation.date_display_format.error')
      "
      :success-message="successMessage"
      class="flex items-start gap-4 mt-2"
      @finished="resetDateDisplayFormat()"
    >
      <RuiTextField
        v-model="dateDisplayFormat"
        variant="outlined"
        color="primary"
        class="general-settings__fields__date-display-format flex-1"
        :label="t('general_settings.labels.date_display_format')"
        type="text"
        :success-messages="success"
        :error-messages="
          error || v$.dateDisplayFormat.$errors.map(e => e.$message)
        "
        :hint="
          t('general_settings.date_display_format_hint', {
            format: dateDisplayFormatExample
          })
        "
        @input="debounceUpdate($event, update)"
      >
        <template #append>
          <RuiButton size="sm" variant="text" icon @click="formatHelp = true">
            <RuiIcon name="information-line" />
          </RuiButton>
        </template>
      </RuiTextField>
      <RuiTooltip :popper="{ placement: 'top' }" :open-delay="400">
        <template #activator>
          <RuiButton
            class="general-settings__date-restore mt-1"
            variant="text"
            icon
            @click="update(defaultDateDisplayFormat)"
          >
            <RuiIcon name="history-line" />
          </RuiButton>
        </template>
        {{ t('general_settings.date_display_tooltip') }}
      </RuiTooltip>
    </SettingsOption>
  </div>
</template>
