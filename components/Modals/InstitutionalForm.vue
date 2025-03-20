<script lang="ts" setup>
import { Status, StatusType } from '@injectivelabs/utils'
import { Modal, InstitutionalForm, InstitutionalFormField } from '@/types'
import { submitInstitutionalForm } from '@/app/services/institutional'

const modalStore = useSharedModalStore()
const notificationStore = useSharedNotificationStore()
const { t } = useLang()
const {
  resetForm,
  errors,
  validate,
  values: formValues
} = useForm<InstitutionalForm>()

const status = reactive(new Status(StatusType.Idle))

const classes = 'border border-white p-4 rounded-md bg-transparent'

const { value: firstNameValue } = useStringField({
  name: InstitutionalFormField.FirstName,
  rule: 'required'
})

const { value: lastNameValue } = useStringField({
  name: InstitutionalFormField.LastName
})

const { value: emailValue } = useStringField({
  name: InstitutionalFormField.Email
})

const { value: companyValue } = useStringField({
  name: InstitutionalFormField.Company
})

async function onSubmit() {
  const { valid } = await validate()

  if (!valid) {
    return
  }

  status.setLoading()

  const { company, email, firstName, lastName, telegram } = formValues

  submitInstitutionalForm({
    email,
    firstName,
    lastName,
    telegram,
    business: company
  })
    .then(() =>
      notificationStore.success({
        title: t('common.success'),
        description: t('institutional.formSubmittedSuccesfuly')
      })
    )
    .catch(() => {
      notificationStore.error({
        title: t('common.error'),
        description: t('common.somethingHappened')
      })
    })
    .finally(() => {
      modalStore.closeModal(Modal.InstitutionalForm)
      status.setIdle()
    })
}
</script>

<template>
  <AppModal
    v-model="modalStore.modals[Modal.InstitutionalForm]"
    :ui="{ width: 'lg:max-w-5xl' }"
    @on:open="resetForm"
  >
    <div>
      <h3 class="text-5xl pb-4">
        {{ $t('institutional.modalTitle') }}
      </h3>
      <p>
        {{ $t('institutional.modalDescription') }}
      </p>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-10">
        <input
          v-model="firstNameValue"
          :class="classes"
          placeholder="First Name*"
        />

        <input
          v-model="lastNameValue"
          :class="classes"
          placeholder="Last Name*"
        />

        <input
          v-model="emailValue"
          :class="classes"
          placeholder="Email*"
          type="email"
        />

        <input v-model="companyValue" :class="classes" placeholder="Company*" />
      </div>

      <div class="mt-10">
        <AppButton
          is-dark-spinner
          class="bg-white text-black py-2 px-4 rounded-md font-semibold"
          v-bind="{ status, isDisabled: Object.keys(errors).length > 0 }"
          @click="onSubmit"
        >
          {{ $t('common.submit') }}
        </AppButton>
      </div>
    </div>
  </AppModal>
</template>
