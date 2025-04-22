import request from '@/utils/request'

// 查询课程管理列表
export function listCourse(query) {
  return request({
    url: '/teach/course/list',
    method: 'get',
    params: query
  })
}

// 查询课程管理详细
export function getCourse(id) {
  return request({
    url: '/teach/course/' + id,
    method: 'get'
  })
}

// 新增课程管理
export function addCourse(data) {
  return request({
    url: '/teach/course',
    method: 'post',
    data: data
  })
}

// 修改课程管理
export function updateCourse(data) {
  return request({
    url: '/teach/course',
    method: 'put',
    data: data
  })
}

// 删除课程管理
export function delCourse(id) {
  return request({
    url: '/teach/course/' + id,
    method: 'delete'
  })
}

// 查询选修课
export function listOptional(query) {
  return request({
    url: '/teach/course/optional',
    method: 'get',
    params: query
  })  
}
