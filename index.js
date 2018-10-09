const express = require('express')

const app = express()

app.post('/', (req, res, next) => {
  const { EventPush, SendData } = require('./lib/event-push')
  const eventPush = new EventPush()
  eventPush.init(req, res)
  eventPush.done((msg) => {
    const sendData = new SendData({
      ToUserName: msg.FromUserName,
      FromUserName: msg.ToUserName,
      CreateTime: eventPush.makeCreateTime(),
      MsgType: 'text',
      Content: '123456789'
    })
    eventPush.send(sendData)
  })
})

const server = require('http').Server(app)
server.listen(3000, () => {
  console.log(`listen on port 3000`)
})