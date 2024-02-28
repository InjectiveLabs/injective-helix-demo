// public/worker.js
self.addEventListener('message', (e) => {
  const result = e.data[0] * e.data[1]
  if (isNaN(result)) {
    postMessage('Please write two numbers')
  } else {
    const workerResult = 'Result: ' + result
    postMessage(workerResult)
  }
})
