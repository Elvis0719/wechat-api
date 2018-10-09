/**
 * @method
 * @param {String} str 需要计算字节长度的字符串
 * @param {String} charset 字符串编码
 * @returns {Number} 字节长度
 * @description 计算字符串的字节长度
 */
export const countBytes = (str, charset) => {
  let total = 0
  charset = charset ? charset.toLowerCase() : ''
  if (charset === 'utf-16' || charset === 'utf16') {
    for (let i = 0; i < str.length; i++) {
      charCode = str.charCodeAt(i)
      if (charCode <= 0xffff) {
        total += 2
      } else {
        total += 4
      }
    }
  } else {
    for (let i = 0; i < str.length; i++) {
      charCode = str.charCodeAt(i)
      if (charCode <= 0x007f) {
        total += 1
      } else if (charCode <= 0x07ff) {
        total += 2
      } else if (charCode <= 0xffff) {
        total += 3
      } else {
        total += 4
      }
    }
  }
  return total
}
