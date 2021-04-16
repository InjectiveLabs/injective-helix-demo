export default class Egg {
  constructor(/* keySequence, fn, metadata */) {
    this.eggs = []
    this.hooks = []
    this.kps = []
    this.activeEgg = ''
    // for now we'll just ignore the shift key to allow capital letters
    this.ignoredKeys = [16]

    if (arguments.length) {
      this.addCode.apply(this, arguments)
    }
  }

  // attempt to call passed function bound to Egg object instance
  __execute(fn) {
    return typeof fn === 'function' && fn.call(this)
  }

  // converts literal character values to keyCodes
  __toCharCodes(keys) {
    const special = {
      slash: 191,
      up: 38,
      down: 40,
      left: 37,
      right: 39,
      enter: 13,
      space: 32,
      ctrl: 17,
      alt: 18,
      tab: 9,
      esc: 27
    }
    const specialKeys = Object.keys(special)

    if (typeof keys === 'string') {
      // make sure there isn't any whitespace
      keys = keys.split(',').map(function (key) {
        return key.trim()
      })
    }

    const characterKeyCodes = keys.map(function (key) {
      // check if it's already a keycode
      if (key === parseInt(key, 10)) {
        return key
      }

      // lookup in named key map
      if (specialKeys.indexOf(key) > -1) {
        return special[key]
      }
      // it's a letter, return the char code for it
      return key.charCodeAt(0)
    })

    return characterKeyCodes.join(',')
  }

  addCode(keys, fn, metadata) {
    this.eggs.push({ keys: this.__toCharCodes(keys), fn, metadata })

    return this
  }

  addHook(fn) {
    this.hooks.push(fn)

    return this
  }

  handleEvent(e) {
    let keyCode = e.which
    const isLetter = keyCode >= 65 && keyCode <= 90
    /*
      This prevents find as you type in Firefox.
      Only prevent default behavior for letters A-Z.
      I want keys like page up/down to still work.
    */
    if (
      e.type === 'keydown' &&
      !e.metaKey &&
      !e.ctrlKey &&
      !e.altKey &&
      !e.shiftKey
    ) {
      const tag = e.target.tagName

      if ((tag === 'HTML' || tag === 'BODY') && isLetter) {
        e.preventDefault()
        return
      }
    }

    if (e.type === 'keyup' && this.eggs.length > 0) {
      // keydown defaults all letters to uppercase
      if (isLetter) {
        if (!e.shiftKey) {
          // convert to lower case letter
          keyCode = keyCode + 32
        }
      }

      // make sure that it's not an ignored key (shift for one)
      if (this.ignoredKeys.indexOf(keyCode) === -1) {
        this.kps.push(keyCode)
      }

      this.eggs.forEach(function (currentEgg) {
        const foundEgg = this.kps.toString().indexOf(currentEgg.keys) >= 0

        if (foundEgg) {
          // Reset keys; if more keypresses occur while the callback is executing, it could retrigger the match
          this.kps = []
          // Set the activeEgg to this one
          this.activeEgg = currentEgg
          // if callback is a function, call it
          this.__execute(currentEgg.fn, this)
          // Call the hooks
          this.hooks.forEach(this.__execute, this)

          this.activeEgg = ''
        }
      }, this)
    }
  }

  listen() {
    document.addEventListener('keydown', this, false)
    document.addEventListener('keyup', this, false)

    return this
  }
}
