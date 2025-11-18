export default defineEventHandler(async (event) => {
  try {
    // 从请求体中获取参数
    const body = await readBody(event)
    const { api_url, history_data, steps } = body

    // 验证必需参数
    if (!api_url) {
      throw createError({
        statusCode: 400,
        statusMessage: 'API URL is required'
      })
    }

    if (!history_data || !Array.isArray(history_data)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'history_data must be an array'
      })
    }

    // 转发请求到实际的预测API
    const response = await $fetch(`${api_url}/api/v1/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: {
        history_data,
        steps: steps || 15
      }
    })

    // 返回响应
    return response
  } catch (error) {
    console.error('预测API转发失败:', error)

    throw createError({
      statusCode: (error as { statusCode?: number }).statusCode || 500,
      statusMessage: (error as { message?: string }).message || '预测服务请求失败'
    })
  }
})
