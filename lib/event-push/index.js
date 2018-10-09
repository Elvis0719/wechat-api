const convert = require('xml-js')
const events = require('events')
const emitter = new events.EventEmitter()

class EventPush {
  constructor () {
    this.res = null
    this.data = {}
  }

  /**
   * 初始化
   * @param {*} req 请求体
   * @param {*} res 响应体
   */
  init (req, res) {
    this.res = res
    const self = this
    // 解析xml
    let xml = ''
    req.setEncoding('utf8')
    req.on('data', chunk => {
      xml += chunk
    })
    .on('end', () => {
      const data = convert.xml2js(xml, { compact: true }).xml
      for (let k1 in data) {
        for (let k2 in data[k1]) {
          data[k1] = data[k1][k2]
        }
      }
      self.data = data
      emitter.emit('done', data)
    })
    .on('error', (error) => {
      throw new Error(`initError: ${error.message}`)
    })
  }

  done (cb) {
    emitter.on('done', cb)
    return this
  }

  get () {
    return this.data
  }

  send (sendData) {
    const xml = this.makeXml(sendData)
    this.res.type('xml')
    this.res.send(xml)
    return this
  }

  /**
   * 生成XML
   * @param {*} sendData 
   */
  makeXml (sendData) {
    let xml = '<xml>'
    const data = sendData.getData()
    for (let key in data) {
      let val = data[key]
      if (Number(val) === NaN) {
        xml += `<${key}><![CDATA[${val}]]></${key}>`
      } else {
        xml += `<${key}>${val}</${key}>`
      }
    }
    xml += '</xml>'
    return xml
  }

  /**
   * 生成时间戳(秒)
   */
  makeCreateTime () {
    const tmp = Date.parse(new Date()).toString()
    return tmp.substr(0, 10)
  }

}

class SendData {
  constructor (
    options = {}
  ) {
    this.data = options
  }

  get (key = null) {
    if (!key) {
      return null
    }
    return this.data[key]
  }

  getData () {
    return this.data
  }
}

module.exports = {
  EventPush,
  SendData,
}
