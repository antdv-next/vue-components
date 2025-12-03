export function isValidCount(value?: number) {
  return typeof value !== 'undefined' && !Number.isNaN(value)
}

export function getSeparatedContent(text: string, tokens: string[], end?: number): string[] | null {
  if (!tokens || !tokens.length) {
    return null
  }
  let match = false
  const separate = (str: string, [token, ...restTokens]: string[]): string[] => {
    if (!token) {
      return [str]
    }
    const list = str.split(token)
    match = match || list.length > 1
    return list
      .reduce((prevList, unitStr) => [...prevList, ...separate(unitStr, restTokens)], [] as string[])
      .filter(Boolean)
  }
  const list = separate(text, tokens)
  if (match) {
    return typeof end !== 'undefined' ? list.slice(0, end) : list
  }
  else {
    return null
  }
}
