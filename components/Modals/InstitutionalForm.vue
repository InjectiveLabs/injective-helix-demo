<script lang="ts" setup>
import { Status, StatusType } from '@injectivelabs/utils'
import { Modal, InstitutionalForm, InstitutionalFormField } from '@/types'
import { submitInstitutionalForm } from '@/app/services/institutional'

const modalStore = useModalStore()
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

const isModalOpen = computed(() => modalStore.modals[Modal.InstitutionalForm])

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

watch(isModalOpen, () => {
  resetForm()
})

function closeModal() {
  modalStore.closeModal(Modal.InstitutionalForm)
}

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
    class="w-full"
    v-bind="{ isOpen: isModalOpen }"
    @modal:closed="closeModal"
  >
    <div>
      <h3 class="text-4xl pb-4">
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
