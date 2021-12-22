export function getErrorMessage(error: any) {
  if (error === undefined) {
    return ''
  } else if (typeof error === 'string') {
    return error
  }

  return error.message
}
