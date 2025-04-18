import request from '@/utils/request'

// 查询课管理列表
export function listCMcourse(query) {
  return request({
    url: '/teach/CMcourse/list',
    method: 'get',
    params: query
  })
}

// 查询课管理详细
export function getCMcourse(id) {
  return request({
    url: '/teach/CMcourse/' + id,
    method: 'get'
  })
}

// 新增课管理
export function addCMcourse(data) {
  return request({
    url: '/teach/CMcourse',
    method: 'post',
    data: data
  })
}

// 修改课管理
export function updateCMcourse(data) {
  return request({
    url: '/teach/CMcourse',
    method: 'put',
    data: data
  })
}

// 删除课管理
export function delCMcourse(id) {
  return request({
    url: '/teach/CMcourse/' + id,
    method: 'delete'
  })
}
