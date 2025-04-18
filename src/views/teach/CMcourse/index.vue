<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="课表ID" prop="cmCode">
        <el-input
          v-model="queryParams.cmCode"
          placeholder="请输入课表ID"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="课程编号" prop="courseCode">
        <el-input
          v-model="queryParams.courseCode"
          placeholder="请输入课程编号"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="课程名称" prop="courseName">
        <el-input
          v-model="queryParams.courseName"
          placeholder="请输入课程名称"
          clearable
          @keyup.enter="handleQuery"
        />
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
          v-hasPermi="['teach:CMcourse:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['teach:CMcourse:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['teach:CMcourse:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['teach:CMcourse:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="CMcourseList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="主键ID，自增" align="center" prop="id" />
      <el-table-column label="课表ID" align="center" prop="cmCode" />
      <el-table-column label="课程编号" align="center" prop="courseCode" />
      <el-table-column label="课程名称" align="center" prop="courseName" />
      <el-table-column label="教师编号" align="center" prop="teacherNo" />
      <el-table-column label="教师姓名" align="center" prop="teacherName" />
      <el-table-column label="星期" align="center" prop="weekday" />
      <el-table-column label="开始节次" align="center" prop="start" />
      <el-table-column label="结束节次" align="center" prop="end" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['teach:CMcourse:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['teach:CMcourse:remove']">删除</el-button>
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
    <!-- ================================================================== -->
    <!-- 添加或修改课管理对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="CMcourseRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="课程编号" prop="courseCode">
          <el-input v-model="form.courseCode" placeholder="请输入课程编号" />
        </el-form-item>
        <el-form-item label="教师编号" prop="teacherNo">
          <el-input v-model="form.teacherNo" placeholder="请输入教师编号" />
        </el-form-item>
        <el-form-item label="星期" prop="weekday">
          <el-input v-model="form.weekday" placeholder="请输入星期" />
        </el-form-item>
        <el-form-item label="开始节次" prop="start">
          <el-input v-model="form.start" placeholder="请输入开始节次" />
        </el-form-item>
        <el-form-item label="结束节次" prop="end">
          <el-input v-model="form.end" placeholder="请输入结束节次" />
        </el-form-item>
        <el-form-item label="课程详细信息">
          <editor v-model="form.content" :min-height="192"/>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
    <!-- ================================================================== -->
  </div>
</template>

<script setup name="CMcourse">
import { listCMcourse, getCMcourse, delCMcourse, addCMcourse, updateCMcourse } from "@/api/teach/CMcourse";

const { proxy } = getCurrentInstance();

const CMcourseList = ref([]);
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
    cmCode: null,
    courseCode: null,
    courseName: null,
  },
  rules: {
    cmCode: [
      { required: true, message: "课表ID不能为空", trigger: "blur" }
    ],
    courseCode: [
      { required: true, message: "课程编号不能为空", trigger: "blur" }
    ],
    courseName: [
      { required: true, message: "课程名称不能为空", trigger: "blur" }
    ],
    teacherNo: [
      { required: true, message: "教师编号不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询课管理列表 */
function getList() {
  loading.value = true;
  listCMcourse(queryParams.value).then(response => {
    CMcourseList.value = response.rows;
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
    cmCode: null,
    courseCode: null,
    courseName: null,
    teacherNo: null,
    teacherName: null,
    weekday: null,
    start: null,
    end: null,
    content: null,
    createTime: null,
    updateTime: null,
    createBy: null,
    updateBy: null
  };
  proxy.resetForm("CMcourseRef");
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
  title.value = "添加课管理";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getCMcourse(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改课管理";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["CMcourseRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateCMcourse(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addCMcourse(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除课管理编号为"' + _ids + '"的数据项？').then(function() {
    return delCMcourse(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('teach/CMcourse/export', {
    ...queryParams.value
  }, `CMcourse_${new Date().getTime()}.xlsx`)
}

getList();
</script>
