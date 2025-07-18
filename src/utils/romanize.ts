export const romanizeTask = (jp: string): string => {
  const map: Record<string, string> = {
    '数学': 'Mathematica',
    '英語': 'Lingua Anglica',
    '物理': 'Physica',
    '化学': 'Chemia',
    '歴史': 'Historia',
    '読書': 'Lectio',
    '休憩': 'Intermissio'
  }
  return map[jp] ?? jp
}

export const toRoman = (num: number): string => {
  const romans: [number, string][] = [
    [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
    [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
    [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']
  ]
  let result = ''
  let n = num
  for (const [value, symbol] of romans) {
    while (n >= value) {
      result += symbol
      n -= value
    }
  }
  return result
} 