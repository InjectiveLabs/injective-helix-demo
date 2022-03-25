declare global {
    interface Number {
        toSeconds(): number
        trimDecimals(desired: number): number
    }

    interface String {
        onlyNumbers(): string
        onlyLetters(): string
    }
}

Number.prototype.toSeconds = function(): number {
    return Number(this) / 1000
}

Number.prototype.trimDecimals = function(desired: number): number {
    let value = Number(this).toString()
    let index = value.indexOf('.')
    if (index === -1) {
        return  Number(this)
    }

    let desiredLength = index + (desired + 1)

    if (value.length - desiredLength <= 0) {
        return  Number(this)
    }

    return Number(value.substring(0, desiredLength))
}

String.prototype.onlyNumbers = function(): string {
    return String(this).replace(/[^\d.-]/g, '')
}

String.prototype.onlyLetters = function(): string {
    return String(this).replace(/[^a-zA-z]/g, '')
}

export {};