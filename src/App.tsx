import React from 'react';
import axios from '@/request'
import SparkMD5 from 'spark-md5'

import { UploadOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { Button, message, Upload } from 'antd';
import { RcFile } from 'antd/es/upload';

import { upload_already } from '@/api/upload'

/**
 * 1. 获取文件hash，作为这批切片通用的标识，查询已经上传的切片信息
 * 2. blob slice 切片
 * 3. 计算切片数量，每个切片的大小
 * 5. 并发上传
 * 6. 查询是否上传完毕
 */

// 获取文件相关信息，hash 后缀 文件名
 const changeBuffer = (file: RcFile): Promise<fileInfo> => {
  return new Promise((resolve, reject) => {
    
    const spark = new SparkMD5.ArrayBuffer()
    const fileReader = new FileReader()
    fileReader.onload = (event) => {
      const buffer = event.target?.result as ArrayBuffer
      spark.append(buffer)
      const HASH = spark.end()

      // 提取文件名后缀
      const suffix = /\.([a-zA-Z0-9]+)$/.exec(file.name)![1]

      resolve({
        buffer,
        HASH,
        suffix,
        filename: `${HASH}.${suffix}` 
      })
    }

    fileReader.readAsArrayBuffer(file)
  })
}

const props: UploadProps = {
  name: 'file',
  action: 'https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188',
  headers: {
    authorization: 'authorization-text',
  },
  async beforeUpload(file) {
    let already: string[] = []
    let { HASH, suffix } = await changeBuffer(file)
    console.log('HASH: ', HASH);

    // 获取已上传的切片信息
    try {
      const res = await upload_already(HASH)
      console.log('已上传的切片信息 res: ', res);
      // TODO: 获取已上传的信息，保存到 already
    } catch (error) {
      message.error('已上传的切片信息获取失败')
    }

    // 计算合适的切片数量、单个切片大小
    let max = (1024 * 100) * 3 // 单切片最大size, 300kb
    let count = Math.ceil(file.size / max)
    if (count > 100) {
      max = file.size / 100
      count = 100
    }

    // 切成chunks
    let index = 0
    let chunks = []
    while (index < count) {
      chunks.push({
        file: file.slice(index * max, (index+1) * max),
        filename: `${HASH}_${index+1}.${suffix}`
      })
      index++
    }


    // 切片每次上传成功时，判断是否上传完毕，传完则通知合并
    let index1 = 0
    const onComplete = async () => {
      console.log('单个文件上传成功');
      index1++
      const noMoreFile = index1 >= count
      let progress = noMoreFile ? '100%' : index1 / count + '%'
      if (!noMoreFile) return
      // 通知后台合并切片
      try {
        const res = await axios.post('/upload_merge', {
          body: {
            HASH,
            count
          },
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        })
        console.log('res', res)

        message.success('切片合并成功')
      } catch (error)  {
        message.error('切片合并失败')
      }
    }

    // 依次将切片上传
    chunks.forEach((chunk) => {
      if (already.length > 0 && already.includes(chunk.filename)){
        onComplete()
        return
      }
      let formData = new FormData()
      formData.append('file', chunk.file)
      formData.append('filename', chunk.filename)
  
      // axios.post('/upload_chunk', {
      //   body: formData
      // }).then(res => {
      //   console.log('res: ', res);
      //   // if (res.code === 200) {
      //   //   onComplete()
      //   // }
      //   // return Promise.reject(res.msg)
      // })
    })
  },
  onChange(info) {
    if (info.file.status !== 'uploading') {
      // console.log(info.file, info.fileList);
    }
    if (info.file.status === 'done') {
      message.success(`${info.file.name} file uploaded successfully`);
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} file upload failed.`);
    }
  },
}

const App: React.FC = () => (
  <Upload {...props}>
    <Button icon={<UploadOutlined />}>Click to Upload</Button>
  </Upload>
)

export default App