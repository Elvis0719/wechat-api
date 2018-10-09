const request = require('superagent')

class AccessToken {
  constructor (config) {
    if (!config.get('appid') || !config.get('secret')) {
      throw new Error('缺少必要参数: appid, secret')
    }
    this.config = config
    this.token = null
    this.expiresAt = null
  }

  get () {
    return this.token
  }

  async fetch () {
    if (!appid || !secret) {
      throw new Error('缺少必要参数: appid, secret')
    }
    try {
      const appid = this.config.get('appid')
      const secret = this.config.get('secret')
      const {text} = await request
        .get(`https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appid}&secret=${secret}`)
      const { errcode, access_token, expires_in } = JSON.parse(text)
      if (!errcode) {
        this.token = access_token
        const timestamp = Date.parse(new Date()) / 1000
        this.expiresAt = new Date((timestamp + expires_in) * 1000)
      }
      return JSON.parse(text)
    } catch (e) {
      throw new Error(`网络异常: ${e.message}`)
    }
  }

  /**
   * @method
   * @param {Boolean} refresh 检查到 AccessToken 过期后, 是否刷新 AccessToken
   * @returns {Boolean} AccessToken 是否过期
   * @description 检查 AccessToken 是否过期
   */
  async check (
    refresh = false
  ) {
    if (!this.token) { return false }
    try {
      const {text} = await request
        .get(`https://api.weixin.qq.com/cgi-bin/getcallbackip?access_token=${this.token}`)
      const { errcode } = JSON.parse(text)
      if (errcode) {
        if (refresh) {
          await this.fetch()
          return await this.check()
        }
        return false
      } else {
        return true
      }
    } catch (e) {
      throw new Error(`网络异常: ${e.message}`)
    }
  }
}

module.exports = AccessToken
