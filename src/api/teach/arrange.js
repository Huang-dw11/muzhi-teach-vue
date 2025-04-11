import request from '@/utils/request'

// 查询课程安排列表
export function listArrange(query) {
  return request({
    url: '/teach/arrange/list',
    method: 'get',
    params: query
  })
}

// 查询课程安排详细
export function getArrange(id) {
  return request({
    url: '/teach/arrange/' + id,
    method: 'get'
  })
}

// 新增课程安排
export function addArrange(data) {
  return request({
    url: '/teach/arrange',
    method: 'post',
    data: data
  })
}

// 修改课程安排
export function updateArrange(data) {
  return request({
    url: '/teach/arrange',
    method: 'put',
    data: data
  })
}

// 删除课程安排
export function delArrange(id) {
  return request({
    url: '/teach/arrange/' + id,
    method: 'delete'
  })
}
