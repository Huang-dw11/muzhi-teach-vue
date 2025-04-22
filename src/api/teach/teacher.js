import request from '@/utils/request'

// 查询教师信息列表
export function listTeacher(query) {
  return request({
    url: '/teach/teacher/list',
    method: 'get',
    params: query
  })
}

// 查询教师信息详细
export function getTeacher(userId) {
  return request({
    url: '/teach/teacher/' + userId,
    method: 'get'
  })
}

// 新增教师信息
export function addTeacher(data) {
  return request({
    url: '/teach/teacher',
    method: 'post',
    data: data
  })
}

// 修改教师信息
export function updateTeacher(data) {
  return request({
    url: '/teach/teacher',
    method: 'put',
    data: data
  })
}

// 删除教师信息
export function delTeacher(userId) {
  return request({
    url: '/teach/teacher/' + userId,
    method: 'delete'
  })
}

// 查询班级列表
export function listClassByteacher() {
  return request({
    url: '/teach/teacher/myclass',
    method: 'get'
  })
}

