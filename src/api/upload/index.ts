import axios from '@/request'

export const upload_already = (HASH: string) => {
  return axios({
    url: '/upload_already',
    method: 'get',
    params: {
      HASH
    },
  })
}
