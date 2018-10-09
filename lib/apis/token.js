const request = require('superagent')

class AccessToken {
  constructor () {}

  async get (config) {
    const appid = config.get('appid')
    const secret = config.get('secret')
    if (!appid || !secret) {
      throw new Error('缺少必要参数: appid, secret')
    }
    try {
      const {text} = await request
        .get(`https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appid}&secret=${secret}`)
      return JSON.parse(text)
    } catch (e) {
      throw new Error(`网络异常: ${e.message}`)
    }
  }
}
