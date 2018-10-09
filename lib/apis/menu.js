const _ = require('lodash')
const request = require('superagent')
const { countBytes } = require('../middlewares')

class Menu {
  constructor () {}
  
  /**
   * @method
   * @param {Array} button 菜单数组
   * @description 创建自定义菜单
   */
  async create (
    token,
    button = []
  ) {
    if (button.length === 0) { return }
    this.check(button)
    try {
      const {text} = await request
        .post(`https://api.weixin.qq.com/cgi-bin/menu/create?access_token=${token.get()}`)
        .send({ button })
      return JSON.parse(text)
    } catch (e) {
      throw new Error(`网络异常: ${e.message}`)
    }
  }

  async delete (token) {
    try {
      const {text} = await request
        .get(`https://api.weixin.qq.com/cgi-bin/menu/delete?access_token=${token.get()}`)
      return JSON.parse(text)
    } catch (e) {
      throw new Error(`网络异常: ${e.message}`)
    }
  }

  async modify (token) {}

  async get (token) {
    try {
      const {text} = await request
        .get(`https://api.weixin.qq.com/cgi-bin/menu/get?access_token=${token.get()}`)
      return JSON.parse(text)
    } catch (e) {
      throw new Error(`网络异常: ${e.message}`)
    }
  }

  // 获取公众平台官网的自定义菜单配置
  async getRemote (token) {
    try {
      const {text} = await request
        .get(`https://api.weixin.qq.com/cgi-bin/get_current_selfmenu_info?access_token=${token.get()}`)
      return JSON.parse(text)
    } catch (e) {
      throw new Error(`网络异常: ${e.message}`)
    }
  }

  /**
   * @method
   * @param {Array} button 菜单数组
   * @param {Number} level 菜单级别(1为一级菜单, 2为二级菜单)
   */
  check (button, level = 1) {
    if (level === 1 && button.length > 3) {
      throw new Error('一级菜单个数应为1~3个')
    }
    if (level === 1 && _.map(button, 'sub_button').length > 5) {
      throw new Error('二级菜单个数应为1~5个')
    }
    _.map(button, (val) => {
      if (val.sub_button && val.sub_button.length > 0) {
        this.check(val.sub_button, 2)
      } else {
        if (val.type === 'click' && !val.key) {
          throw new Error('缺少必要参数: key')
        }
        if (val.type === 'click' && countBytes(val.key) > 128) {
          throw new Error('key 不得超过128个字节')
        }
        if ((val.type === 'view' || val.type === 'miniprogram') && !val.url) {
          throw new Error('缺少必要参数: url')
        }
        if ((val.type === 'view' || val.type === 'miniprogram') && countBytes(val.url) > 1024) {
          throw new Error('url 不得超过1024个字节')
        }
        if ((val.type === 'media_id' || val.type === 'view_limited') && !val.media_id) {
          throw new Error('缺少必要参数: media_id')
        }
        if (val.type === 'miniprogram' && (!val.appid || !val.pagepath)) {
          throw new Error('缺少必要参数: appid, pagepath')
        }
        if (level === 1 && countBytes(val.name) > 16) {
          throw new Error('一级菜单标题不得超过16个字节')
        }
        if (level === 2 && countBytes(val.name) > 60) {
          throw new Error('二级菜单标题不得超过60个字节')
        }
      }
    })
  }
}
