import request from '@/utils/request'

// 查询专业管理列表
export function listExpertise(query) {
  return request({
    url: '/teach/expertise/list',
    method: 'get',
    params: query
  })
}

// 查询专业管理详细
export function getExpertise(id) {
  return request({
    url: '/teach/expertise/' + id,
    method: 'get'
  })
}

// 新增专业管理
export function addExpertise(data) {
  return request({
    url: '/teach/expertise',
    method: 'post',
    data: data
  })
}

// 修改专业管理
export function updateExpertise(data) {
  return request({
    url: '/teach/expertise',
    method: 'put',
    data: data
  })
}

// 删除专业管理
export function delExpertise(id) {
  return request({
    url: '/teach/expertise/' + id,
    method: 'delete'
  })
}
