const fs = require('fs')
const _ = require('lodash')
const http = require('http')
const https = require('https')
const request = require('superagent')

class Material {
  constructor () {}

  async create (token, data) {
    if (data.getType() === 'news') {
      try {
        const {text} = await request
          .post(`https://api.weixin.qq.com/cgi-bin/material/add_news?access_token=${token.get()}`)
          .send({ articles: data.getArticles() })
        return JSON.parse(text)
      } catch (e) {
        throw new Error(`网络异常: ${e.message}`)
      }
    } else {
      try {
        const {size} = fs.statSync(data.getFilePath())
        if (data.getType() === 'video') {
          const {text} = await request
            .post(`https://api.weixin.qq.com/cgi-bin/material/add_material?access_token=${token.get()}&type=${data.getType()}`)
            .attach('media', data.getFilePath(), {
              filename: data.getFileName(),
              filelength: size,
              'content-type': 'multipart/form-data'
            })
            .field('description', JSON.stringify({ title: data.getTitle(), introduction: data.getIntroduction() }))
          return JSON.parse(text)
        } else {
          const {text} = await request
            .post(`https://api.weixin.qq.com/cgi-bin/material/add_material?access_token=${token.get()}&type=${data.getType()}`)
            .attach('media', data.getFilePath(), {
              filename: data.getFileName(),
              filelength: size,
              'content-type': 'multipart/form-data'
            })
          return JSON.parse(text)
        }
      } catch (e) {
        throw new Error(`网络异常: ${e.message}`)
      }
    }
  }
  
  async delete (token, data) {
    try {
      const {text} = await request
        .post(`https://api.weixin.qq.com/cgi-bin/material/del_material?access_token=${token.get()}`)
        .send({ media_id: data.getMediaId() })
      return JSON.parse(text)
    } catch (e) {
      throw new Error(`网络异常: ${e.message}`)
    }
  }

  async modify (token, data) {
    if (data.getType() !== 'news') { return }
    const results = []
    try {
      await Promise.all(
        _.map(data.getArticles(), (val, index) => {
          const {text} = await request
            .post(`https://api.weixin.qq.com/cgi-bin/material/update_news?access_token=${token.get()}`)
            .send({
              media_id: data.getMediaId(),
              index: index,
              articles: val
            })
          results.push({ index, ...JSON.parse(text) })
        })
      )
      return results
    } catch (e) {
      throw new Error(`网络异常: ${e.message}`)
    }
  }

  async get (token, data) {
    try {
      if (data.getType() === 'news' || data.getType() === 'video') {
        const {text} = await request
          .post(`https://api.weixin.qq.com/cgi-bin/material/get_material?access_token=${token.get()}`)
          .send({ media_id: data.getMediaId() })
        if (data.getType() === 'video' && data.getFilePath()) {
          await downloadFile({
            url: JSON.parse(text).down_url,
            path: data.getFilePath()
          })
        }
        return JSON.parse(text)
      } else {
        await downloadFile({
          mediaId: data.getMediaId(),
          path: data.getFilePath()
        })
      }
    } catch (e) {
      throw new Error(`网络异常: ${e.message}`)
    }
  }

  /**
   * @method
   * @param {*} token 
   * @description 获取素材总数
   */
  async getCount (token) {
    try {
      const {text} = await request
        .get(`https://api.weixin.qq.com/cgi-bin/material/get_materialcount?access_token=${token.get()}`)
      return JSON.parse(text)
    } catch (e) {
      throw new Error(`网络异常: ${e.message}`)
    }
  }

  /**
   * @method
   * @param {*} token 
   * @param {*} data
   * @description 获取素材列表 
   */
  async getList (token, data) {
    try {
      const {text} = await request
        .post(`https://api.weixin.qq.com/cgi-bin/material/batchget_material?access_token=${token.get()}`)
        .send({
          type: data.getType(),
          offset: data.getOffset(),
          count: data.getCount()
        })
      return JSON.parse(text)
    } catch (e) {
      throw new Error(`网络异常: ${e.message}`)
    }
  }

  /**
   * @method
   * @param {String} mediaId 通过 MEDIAID 下载文件
   * @param {String} url 通过 URL 下载文件
   * @param {String} path 文件保存路径
   */
  async downloadFile ({ mediaId, url, path }) {
    if (mediaId && token) {
      const postData = JSON.stringify({ media_id: mediaId })
      const options = {
        method: 'POST',
        headers: {
          hostname: 'api.weixin.qq.com',
          port: 80,
          path: `/cgi-bin/material/get_material?access_token=${token}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': postData.length
        }
      }
      await https.request(options, (res) => {
        res.pipe(fs.createWriteStream(path))
      })
      .write(postData)
      .on('error', (e) => {
        throw new Error(`网络异常: ${e.message}`)
      })
      .end()
    } else if (url) {
      if (url.indexOf('https') >= 0) {
        https.get(url, (res) => {
          res.pipe(fs.createWriteStream(path))
        })
      } else {
        http.get(url, (res) => {
          res.pipe(fs.createWriteStream(path))
        })
      }
    }
  }
}
