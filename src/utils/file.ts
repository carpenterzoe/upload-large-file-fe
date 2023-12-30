export const uploadChunks = (chunks: fileChunk[]) => {
  chunks.forEach((chunk) => {
    let formData = new FormData()
    formData.append('file', chunk.file)
    formData.append('filename', chunk.filename)

    fetch('/upload_chunk', {
      method: 'POST',
      body: formData
    }).then(res => {
      console.log('res: ', res);
    })
  })
}