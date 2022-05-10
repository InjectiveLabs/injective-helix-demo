build-ci:
   DOCKER_BUILDKIT=1 docker build . -t injective-dex-ci:${BRANCH_NAME} -f .github/Dockerfile --build-arg APP_BASE_URL="http://localhost:3000"
