function wrap(code, msg) {
  return {
      code,
      msg,
      success: false,
      data: null
  }
}

function succData(T) {
  return {
      code: 200,
      msg: '成功',
      success: true,
      data: T
  }
}

function succ(data, msg) {
  return {
      code: 200,
      msg,
      success: true,
      data
  }
}

function succMsg(msg) {
  return {
      code: 200,
      msg,
      success: true,
      data: null
  }
}
module.exports = {
  succData: succData,
  wrap: wrap,
  succ: succ,
  succMsg: succMsg
}