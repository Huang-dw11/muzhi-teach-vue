import request from '@/utils/request'

// 查询门类管理列表
export function listCategory(query) {
  return request({
    url: '/teach/category/list',
    method: 'get',
    params: query
  })
}

// 查询门类管理详细
export function getCategory(id) {
  return request({
    url: '/teach/category/' + id,
    method: 'get'
  })
}

// 新增门类管理
export function addCategory(data) {
  return request({
    url: '/teach/category',
    method: 'post',
    data: data
  })
}

// 修改门类管理
export function updateCategory(data) {
  return request({
    url: '/teach/category',
    method: 'put',
    data: data
  })
}

// 删除门类管理
export function delCategory(id) {
  return request({
    url: '/teach/category/' + id,
    method: 'delete'
  })
}
