class Config {
  constructor (
    options = {}
  ) {
    this.config = options
  }

  set (key, value) {
    this.config[key] = value
  }

  get (key) {
    if (key) {
      return this.config
    } else {
      return this.config[key]
    }
  }
}