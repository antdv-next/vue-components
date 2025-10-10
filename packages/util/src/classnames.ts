type ClassValue = string | number | boolean | undefined | null | ClassDictionary | ClassArray

interface ClassDictionary {
  [id: string]: any
}

interface ClassArray extends Array<ClassValue> {}

function toVal(mix: ClassValue): string {
  let str = ''

  if (typeof mix === 'string' || typeof mix === 'number') {
    str += mix
  }
  else if (typeof mix === 'object') {
    if (Array.isArray(mix)) {
      for (let k = 0; k < mix.length; k++) {
        if (mix[k]) {
          const y = toVal(mix[k])
          if (y) {
            str && (str += ' ')
            str += y
          }
        }
      }
    }
    else {
      for (const k in mix) {
        if (mix[k]) {
          str && (str += ' ')
          str += k
        }
      }
    }
  }

  return str
}

export default function classNames(...args: ClassValue[]): string {
  let str = ''
  for (let i = 0; i < args.length; i++) {
    const tmp = args[i]
    if (tmp) {
      const x = toVal(tmp)
      if (x) {
        str && (str += ' ')
        str += x
      }
    }
  }
  return str
}
