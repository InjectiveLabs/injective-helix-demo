<script lang="ts" setup></script>

<template>
  <div
    class="gradient-bg__container fixed top-0 l-0 p-10 pointer-events-none brightness-50 w-screen h-screen overflow-hidden"
  >
    <svg xmlns="http://www.w3.org/2000/svg" class="hidden">
      <defs>
        <filter id="blursvg">
          <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
          <feColorMatrix
            in="blur"
            mode="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8"
            result="blursvg"
          />
          <feBlend in="SourceGraphic" in2="blursvg" />
        </filter>
      </defs>
    </svg>
    <div class="gradients-container w-full h-full">
      <div class="g1 absolute mix-blend-hard-light" />
      <div class="g2 absolute mix-blend-hard-light" />
      <div class="g3 absolute mix-blend-hard-light" />
      <div class="g4 absolute mix-blend-hard-light opacity-70" />
      <div class="g5 absolute mix-blend-hard-light opacity-70" />
    </div>
  </div>
</template>

<style>
.gradient-bg__container {
  --color1: 0, 130, 250;
  --color2: 64, 169, 255;
  --color3: 0, 130, 250;
  --color4: 14, 226, 155;
  --color5: 64, 169, 255;
  --circle-size: 80%;
}

.gradient-bg__container .gradients-container {
  filter: url(#blursvg) blur(40px);
}

.gradient-bg__container .g1 {
  background: radial-gradient(
      circle at center,
      rgba(var(--color1), 0.8) 0,
      rgba(var(--color1), 0) 50%
    )
    no-repeat;

  width: var(--circle-size);
  height: var(--circle-size);
  top: calc(50% - var(--circle-size) / 2);
  left: calc(50% - var(--circle-size) / 2);

  transform-origin: center center;
  animation: moveVertical 30s ease infinite;
}

.gradient-bg__container .g2 {
  background: radial-gradient(
      circle at center,
      rgba(var(--color2), 0.8) 0,
      rgba(var(--color2), 0) 50%
    )
    no-repeat;

  width: var(--circle-size);
  height: var(--circle-size);
  top: calc(50% - var(--circle-size) / 2);
  left: calc(50% - var(--circle-size) / 2);

  transform-origin: calc(50% - 400px);
  animation: moveInCircle 20s reverse infinite;
}

.gradient-bg__container .g3 {
  background: radial-gradient(
      circle at center,
      rgba(var(--color3), 0.8) 0,
      rgba(var(--color3), 0) 50%
    )
    no-repeat;

  width: var(--circle-size);
  height: var(--circle-size);
  top: calc(50% - var(--circle-size) / 2 + 200px);
  left: calc(50% - var(--circle-size) / 2 - 500px);

  transform-origin: calc(50% + 400px);
  animation: moveInCircle 40s linear infinite;
}

.gradient-bg__container .g4 {
  background: radial-gradient(
      circle at center,
      rgba(var(--color4), 0.8) 0,
      rgba(var(--color4), 0) 50%
    )
    no-repeat;

  width: var(--circle-size);
  height: var(--circle-size);
  top: calc(50% - var(--circle-size) / 2);
  left: calc(50% - var(--circle-size) / 2);

  transform-origin: calc(50% - 200px);
  animation: moveHorizontal 40s ease infinite;
}

.gradient-bg__container .g5 {
  background: radial-gradient(
      circle at center,
      rgba(var(--color5), 0.8) 0,
      rgba(var(--color5), 0) 50%
    )
    no-repeat;

  width: 100%;
  height: 100%;
  top: -50%;
  left: -50%;
}

@keyframes moveInCircle {
  0% {
    transform: rotate(0deg);
  }
  50% {
    transform: rotate(180deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes moveVertical {
  0% {
    transform: translateY(-50%);
  }
  50% {
    transform: translateY(50%);
  }
  100% {
    transform: translateY(-50%);
  }
}

@keyframes moveHorizontal {
  0% {
    transform: translateX(-50%) translateY(-10%);
  }
  50% {
    transform: translateX(50%) translateY(10%);
  }
  100% {
    transform: translateX(-50%) translateY(-10%);
  }
}
</style>
