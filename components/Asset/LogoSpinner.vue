<template>
  <div class="loading-spinner">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      width="200px"
      height="200px"
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid"
    >
      <circle
        cx="50"
        cy="50"
        fill="none"
        stroke="#2891e9"
        stroke-width="8"
        r="32"
        stroke-dasharray="150.79644737231007 52.26548245743669"
        style="animation-play-state: running; animation-delay: 0s"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          repeatCount="indefinite"
          dur="1s"
          values="0 50 50;360 50 50"
          keyTimes="0;1"
          style="animation-play-state: running; animation-delay: 0s"
        />
      </circle>
    </svg>
  </div>
</template>

<style scoped>
.loading-spinner {
  animation: loading-spinner 1.2s cubic-bezier(0.5, 0.4, 0.8, 1) infinite;
  width: 56px;
  height: 56px;
}

.loading-spinner svg {
  width: 100%;
  height: 100%;
}

@keyframes loading-spinner {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
