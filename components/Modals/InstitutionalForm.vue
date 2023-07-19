<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import { Modal, InstitutionalForm, InstitutionalFormField } from '@/types'
import { submitInstitutionalForm } from '@/app/services/institutional'

const modalStore = useModalStore()
const { handleSubmit, resetForm, errors } = useForm<InstitutionalForm>()
const { success, error } = useNotifications()

const status = reactive(new Status(StatusType.Idle))

const classes = 'border border-white p-4 rounded-md bg-transparent'

const isModalOpen = computed(() => modalStore.modals[Modal.InstitutionalForm])

const { value: firstNameValue } = useStringField({
  name: InstitutionalFormField.FirstName,
  initialValue: '',
  rule: 'required'
})

const { value: lastNameValue } = useStringField({
  name: InstitutionalFormField.LastName,
  initialValue: ''
})

const { value: emailValue } = useStringField({
  name: InstitutionalFormField.Email,
  initialValue: ''
})

const { value: companyValue } = useStringField({
  name: InstitutionalFormField.Company,
  initialValue: ''
})

const { value: telegramValue } = useStringField({
  name: InstitutionalFormField.Telegram,
  rule: ''
})

function closeModal() {
  modalStore.closeModal(Modal.InstitutionalForm)
}

const onSubmit = handleSubmit((formValues) => {
  status.setLoading()

  submitInstitutionalForm(formValues)
    .then(() => {
      success({
        title: 'Success',
        description: 'Form submitted Successfuly.'
      })

      resetForm()
    })

    .catch(() => {
      error({ title: 'Error', description: 'Something happened...' })
    })

    .finally(() => {
      modalStore.closeModal(Modal.InstitutionalForm)
      status.setIdle()
    })
})
</script>

<template>
  <AppModal
    class="w-full"
    v-bind="{ show: isModalOpen }"
    @modal:closed="closeModal"
  >
    <div>
      <h3 class="text-4xl">
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

        <input
          v-model="telegramValue"
          :class="classes"
          placeholder="Telegram"
        />
      </div>

      <div class="mt-10">
        <AppButton
          dark-spinner
          class="bg-white text-black py-2 px-4 rounded-md font-semibold"
          v-bind="{ status, disabled: Object.keys(errors).length > 0 }"
          @click="onSubmit"
        >
          {{ $t('common.submit') }}
        </AppButton>
      </div>
    </div>
  </AppModal>
</template>
