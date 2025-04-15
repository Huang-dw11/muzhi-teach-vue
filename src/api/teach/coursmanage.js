import request from '@/utils/request'

// 查询课表管理列表
export function listCoursmanage(query) {
  return request({
    url: '/teach/coursmanage/list',
    method: 'get',
    params: query
  })
}

// 查询课表管理详细
export function getCoursmanage(id) {
  return request({
    url: '/teach/coursmanage/' + id,
    method: 'get'
  })
}

// 新增课表管理
export function addCoursmanage(data) {
  return request({
    url: '/teach/coursmanage',
    method: 'post',
    data: data
  })
}

// 修改课表管理
export function updateCoursmanage(data) {
  return request({
    url: '/teach/coursmanage',
    method: 'put',
    data: data
  })
}

// 删除课表管理
export function delCoursmanage(id) {
  return request({
    url: '/teach/coursmanage/' + id,
    method: 'delete'
  })
}
