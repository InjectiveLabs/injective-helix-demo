//it's set dynamically, when using 'cypress run' so we need to store it somewhere before passing it to Puppeteer
let debuggerPort: string

export function setDebuggerPort(port: string) {
    debuggerPort = port
}

export function getDebuggerPort(): string {
    return debuggerPort
}