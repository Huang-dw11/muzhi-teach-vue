import request from '@/utils/request'

// 查询教室管理列表
export function listClassroom(query) {
  return request({
    url: '/teach/classroom/list',
    method: 'get',
    params: query
  })
}

// 查询教室管理详细
export function getClassroom(id) {
  return request({
    url: '/teach/classroom/' + id,
    method: 'get'
  })
}

// 新增教室管理
export function addClassroom(data) {
  return request({
    url: '/teach/classroom',
    method: 'post',
    data: data
  })
}

// 修改教室管理
export function updateClassroom(data) {
  return request({
    url: '/teach/classroom',
    method: 'put',
    data: data
  })
}

// 删除教室管理
export function delClassroom(id) {
  return request({
    url: '/teach/classroom/' + id,
    method: 'delete'
  })
}
