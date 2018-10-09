const _ = require('lodash')

class BaseData {
  constructor () {}
}

class MaterialData extends BaseData {
  constructor (
    options = {}
  ) {
    super(options)
    this.verify(options)
    this.type = options.type
    this.articles = options.articles
    this.file = options.file
    this.title = options.title
    this.introduction = options.introduction
  }

  /**
   * @method
   * @description 参数验证
   */
  verify ({type, articles, file, title, introduction}) {
    if (!type) {
      throw new Error('缺少必要参数: type')
    }
    if (type === 'news' && !articles) {
      throw new Error('缺少必要参数: articles')
    }
    if (type === 'news') {
      _.map(articles, (val) => {
        if (
          !val.title ||
          !val.thumb_media_id ||
          (
            String(val.show_cover_pic) !== '0' &&
            String(val.show_cover_pic) !== '1'
          ) ||
          !val.content ||
          !val.content_source_url
        ) {
          throw new Error('缺少必要参数: articles(title, thumb_media_id, show_cover_pic, content, content_source_url)')
        }
      })
    }
    if (type === 'video' && (!title || !introduction)) {
      throw new Error('缺少必要参数: title, introduction')
    }
    if (type !== 'news' && !file) {
      throw new Error('缺少必要参数: file')
    }
    if (type !== 'news' && (!file.name || !file.path)) {
      throw new Error('缺少必要参数: file(name, path)')
    }
  }

  /**
   * @method
   * @description 获取素材类型
   */
  getType () {
    return this.type
  }

  /**
   * @method
   * @description 获取图文数组
   */
  getArticles () {
    return this.articles
  }

  /**
   * @method
   * @description 获取素材的文件名称
   */
  getFileName () {
    return this.file.name
  }

  /**
   * @method
   * @description 获取素材的文件路径
   */
  getFilePath () {
    return this.file.path
  }

  /**
   * @method
   * @description 获取视频素材的标题
   */
  getTitle () {
    return this.title
  }
  
  /**
   * @method
   * @description 获取视频素材的描述
   */
  getIntroduction () {
    return this.introduction
  }

  getMediaId () {}
}

module.exports = { BaseData, MaterialData }
