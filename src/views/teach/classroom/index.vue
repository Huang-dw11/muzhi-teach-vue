<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="教室编码" prop="classroomCode">
        <el-input
          v-model="queryParams.classroomCode"
          placeholder="请输入教室编码"
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
          v-hasPermi="['teach:classroom:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['teach:classroom:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['teach:classroom:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['teach:classroom:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="classroomList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" tpye="index" align="center" prop="id" />
      <el-table-column label="教室编码" align="center" prop="classroomCode" />
      <el-table-column label="教室类型" align="center" prop="classroomType" />
      <el-table-column label="教室容量" align="center" prop="capacity" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)">查看使用详情</el-button>
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['teach:classroom:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['teach:classroom:remove']">删除</el-button>
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

    <!-- 添加或修改教室管理对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="classroomRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="教室编码" prop="classroomCode">
          <el-input v-model="form.classroomCode" placeholder="请输入教室编码" />
        </el-form-item>
        <el-form-item label="教室类型" prop="classroomType">
          <el-input v-model="form.classroomType" placeholder="请输入教室类型" />
        </el-form-item>
        <el-form-item label="教室容量" prop="capacity">
          <el-input v-model="form.capacity" placeholder="请输入教室容量" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 添加或修改教室管理对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="classroomRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="教室编码" prop="classroomCode">
          <el-input v-model="form.classroomCode" placeholder="请输入教室编码" />
        </el-form-item>
        <el-form-item label="教室类型" prop="classroomType">
          <el-input v-model="form.classroomType" placeholder="请输入教室类型" />
        </el-form-item>
        <el-form-item label="教室容量" prop="capacity">
          <el-input v-model="form.capacity" placeholder="请输入教室容量" />
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

<script setup name="Classroom">
import { listClassroom, getClassroom, delClassroom, addClassroom, updateClassroom } from "@/api/teach/classroom";

const { proxy } = getCurrentInstance();

const classroomList = ref([]);
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
    classroomCode: null,
  },
  rules: {
    classroomCode: [
      { required: true, message: "教室编码不能为空", trigger: "blur" }
    ],
    capacity: [
      { required: true, message: "教室容量不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询教室管理列表 */
function getList() {
  loading.value = true;
  listClassroom(queryParams.value).then(response => {
    classroomList.value = response.rows;
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
    classroomCode: null,
    classroomType: null,
    capacity: null,
    createTime: null,
    updateTime: null,
    createBy: null,
    updateBy: null
  };
  proxy.resetForm("classroomRef");
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
  title.value = "添加教室管理";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getClassroom(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改教室管理";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["classroomRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateClassroom(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addClassroom(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除教室管理编号为"' + _ids + '"的数据项？').then(function() {
    return delClassroom(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('teach/classroom/export', {
    ...queryParams.value
  }, `classroom_${new Date().getTime()}.xlsx`)
}

getList();
</script>
