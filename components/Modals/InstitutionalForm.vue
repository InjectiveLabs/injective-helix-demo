<script setup lang="ts">
import { Modal, InstitutionalForm, InstitutionalFormField } from '@/types'

const modalStore = useModalStore()
const { handleSubmit } = useForm<InstitutionalForm>()

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

const onSubmit = handleSubmit(
  () => {
    // console.log('Success')
  },
  () => {
    // console.log('Error')
  }
)
</script>

<template>
  <AppModal
    class="w-full"
    v-bind="{ show: isModalOpen }"
    @modal:closed="closeModal"
  >
    <div>
      <h3 class="text-4xl">Get In Touch</h3>
      <p>Complete the form and we will be in touch shortly.</p>

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
        <button
          class="bg-white text-black py-2 px-4 rounded-md font-semibold"
          @click="onSubmit"
        >
          Submit
        </button>
      </div>
    </div>
  </AppModal>
</template>
