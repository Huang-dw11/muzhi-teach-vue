<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="工号" prop="teacherNo">
        <el-input
          v-model="queryParams.teacherNo"
          placeholder="请输入工号"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="姓名" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入姓名"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="最高学历" prop="education">
        <el-select v-model="queryParams.education" placeholder="请选择最高学历" clearable>
          <el-option
            v-for="dict in degree_type"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['teach:teacher:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['teach:teacher:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['teach:teacher:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['teach:teacher:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="teacherList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="主键ID" align="center" prop="id" />
      <el-table-column label="工号" align="center" prop="teacherNo" />
      <el-table-column label="姓名" align="center" prop="name" />
      <el-table-column label="照片" align="center" prop="image" width="100">
        <template #default="scope">
          <image-preview :src="scope.row.image" :width="50" :height="50"/>
        </template>
      </el-table-column>
      <el-table-column label="所属院系" align="center" prop="collegeId" />
      <el-table-column label="职位类型" align="center" prop="positionType">
        <template #default="scope">
          <dict-tag :options="position_type" :value="scope.row.positionType"/>
        </template>
      </el-table-column>
      <el-table-column label="职称" align="center" prop="title">
        <template #default="scope">
          <dict-tag :options="title_type" :value="scope.row.title"/>
        </template>
      </el-table-column>
      <el-table-column label="最高学历" align="center" prop="education">
        <template #default="scope">
          <dict-tag :options="degree_type" :value="scope.row.education"/>
        </template>
      </el-table-column>
      <el-table-column label="性别" align="center" prop="gender">
        <template #default="scope">
          <dict-tag :options="sys_user_sex" :value="scope.row.gender"/>
        </template>
      </el-table-column>
      <el-table-column label="联系电话" align="center" prop="phone" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['teach:teacher:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['teach:teacher:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改教师信息对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="teacherRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="照片" prop="image">
          <image-upload v-model="form.image"/>
        </el-form-item>
        <el-form-item label="职位类型" prop="positionType">
          <el-select v-model="form.positionType" placeholder="请选择职位类型">
            <el-option
              v-for="dict in position_type"
              :key="dict.value"
              :label="dict.label"
              :value="parseInt(dict.value)"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="职称" prop="title">
          <el-select v-model="form.title" placeholder="请选择职称">
            <el-option
              v-for="dict in title_type"
              :key="dict.value"
              :label="dict.label"
              :value="parseInt(dict.value)"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="最高学历" prop="education">
          <el-select v-model="form.education" placeholder="请选择最高学历">
            <el-option
              v-for="dict in degree_type"
              :key="dict.value"
              :label="dict.label"
              :value="parseInt(dict.value)"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-select v-model="form.gender" placeholder="请选择性别">
            <el-option
              v-for="dict in sys_user_sex"
              :key="dict.value"
              :label="dict.label"
              :value="parseInt(dict.value)"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="国籍" prop="nationality">
          <el-input v-model="form.nationality" placeholder="请输入国籍" />
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="身份证号" prop="idCard">
          <el-input v-model="form.idCard" placeholder="请输入身份证号" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Teacher">
import { listTeacher, getTeacher, delTeacher, addTeacher, updateTeacher } from "@/api/teach/teacher";

const { proxy } = getCurrentInstance();
const { title_type, sys_user_sex, position_type, degree_type } = proxy.useDict('title_type', 'sys_user_sex', 'position_type', 'degree_type');

const teacherList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    teacherNo: null,
    name: null,
    collegeId: null,
    education: null,
  },
  rules: {
    name: [
      { required: true, message: "姓名不能为空", trigger: "blur" }
    ],
    image: [
      { required: true, message: "照片不能为空", trigger: "blur" }
    ],
    collegeId: [
      { required: true, message: "所属院系不能为空", trigger: "change" }
    ],
    title: [
      { required: true, message: "职称不能为空", trigger: "change" }
    ],
    education: [
      { required: true, message: "最高学历不能为空", trigger: "change" }
    ],
    gender: [
      { required: true, message: "性别不能为空", trigger: "change" }
    ],
    phone: [
      { required: true, message: "联系电话不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询教师信息列表 */
function getList() {
  loading.value = true;
  listTeacher(queryParams.value).then(response => {
    teacherList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

// 取消按钮
function cancel() {
  open.value = false;
  reset();
}

// 表单重置
function reset() {
  form.value = {
    id: null,
    teacherNo: null,
    name: null,
    image: null,
    collegeId: null,
    positionType: null,
    title: null,
    education: null,
    gender: null,
    nationality: null,
    phone: null,
    idCard: null,
    createTime: null,
    updateTime: null,
    createBy: null,
    updateBy: null,
    remark: null
  };
  proxy.resetForm("teacherRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加教师信息";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getTeacher(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改教师信息";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["teacherRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateTeacher(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addTeacher(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _ids = row.id || ids.value;
  proxy.$modal.confirm('是否确认删除教师信息编号为"' + _ids + '"的数据项？').then(function() {
    return delTeacher(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('teach/teacher/export', {
    ...queryParams.value
  }, `teacher_${new Date().getTime()}.xlsx`)
}

getList();
</script>
