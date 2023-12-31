import axios from 'axios'
import { message } from 'antd'

axios.defaults.baseURL = 'http://127.0.0.1:7001'
axios.defaults.withCredentials = true
// axios.defaults.headers['Access-Control-Allow-Headers'] = '*'
// axios.defaults.headers['X-Requested-With'] = 'XMLHttpRequest'
// axios.defaults.headers.post['Content-Type'] = 'application/json'

axios.interceptors.response.use(res => {
  if (typeof res.data !== 'object') {
    return Promise.reject(res)
  }
  if (res.data.code != 200) {
    if (res.data.msg) message.error(res.data.msg)
    if (res.data.code == 401) {
      message.error('无权限')
    }
    return Promise.reject(res.data)
  }

  return res.data
})

export default axios