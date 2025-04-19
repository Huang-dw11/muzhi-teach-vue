<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="课程编码" prop="courseCode">
        <el-input
          v-model="queryParams.courseCode"
          placeholder="请输入课程编码"
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
      <!-- <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['teach:arrange:add']"
        >新增</el-button>
      </el-col> -->
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['teach:arrange:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['teach:arrange:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['teach:arrange:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="arrangeList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" type="index" width="55" align="center" prop="id" />
      <el-table-column label="开课编码" align="center" prop="openCourseCode" />
      <el-table-column label="课程名称" align="center" prop="courseName" />
      <el-table-column label="课程类型" align="center" prop="courseType">
        <template #default="scope">
          <dict-tag :options="college_type" :value="scope.row.courseType"/>
        </template>
      </el-table-column>
      <el-table-column label="星期" align="center" prop="weekday">
        <template #default="scope">
          <dict-tag :options="monday" :value="scope.row.weekday"/>
        </template>
      </el-table-column>
      <el-table-column label="开始节次" align="center" prop="start" />
      <el-table-column label="结束节次" align="center" prop="end" />
      <el-table-column label="教师编码" align="center" prop="teacherNo" />
      <el-table-column label="教师名" align="center" prop="name" />
      <el-table-column label="教室编号" align="center" prop="classroomCode" />

      <!-- <el-table-column label="上课时间" align="center" prop="classTime">
        <template #default="scope">
          <dict-tag :options="class_time" :value="scope.row.classTime"/>
        </template>
      </el-table-column> -->

      <!-- <el-table-column label="学分" align="center" prop="credit" /> -->
      <!-- <el-table-column label="学时" align="center" prop="classHours" /> -->
      <el-table-column label="课程周数" align="center" prop="courseWeeks" /> 
      <el-table-column label="班级人数" align="center" prop="classSize" />
      <el-table-column label="考核方式" align="center" prop="assessmentMethod" />
      <el-table-column label="开课学期" align="center" prop="semester" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['teach:arrange:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['teach:arrange:remove']">删除</el-button>
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

    <!-- 添加或修改课程安排对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="arrangeRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="课程名称" prop="courseCode" v-if="form.id == undefined">
          <!-- <el-input v-model="form.courseCode" placeholder="请输入课程编码" /> -->
           <el-select v-model="form.courseCode" placeholder="请选择课程">
            <el-option
              v-for="item in courseList"
              :key="item.courseCode"
              :label="item.courseName"
              :value="item.courseCode"
            />
           </el-select>
        </el-form-item>
        <el-form-item label="授课教师" prop="teacherNo" >
          <!-- <el-input v-model="form.teacherNo" placeholder="请输入教师编码" /> -->
           <el-select v-model="form.teacherNo" placeholder="请选择教师">
            <el-option
              v-for="item in teacherList"
              :key="item.teacherNo"
              :label="item.name"
              :value="`${item.teacherNo},${item.name}`"
            />
           </el-select>
        </el-form-item>
        <el-form-item label="授课教室" prop="classroomCode">
          <!-- <el-input v-model="form.classroomCode" placeholder="请输入教室编号" /> -->
           <el-select v-model="form.classroomCode" placeholder="请选择教室">
            <el-option
              v-for="item in classroomList"
              :key="item.classroomCode"
              :label="item.classroomCode"
              :value="item.classroomCode"
            />
           </el-select>
        </el-form-item>

        <!-- <el-form-item label="星期" prop="weekday">
          <el-select v-model="form.weekday" placeholder="请选择星期">
            <el-option
              v-for="dict in monday"
              :key="dict.value"
              :label="dict.label"
              :value="parseInt(dict.value)"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="上课时间" prop="classTime">
          <el-select v-model="form.classTime" placeholder="请选择上课时间">
            <el-option
              v-for="dict in class_time"
              :key="dict.value"
              :label="dict.label"
              :value="parseInt(dict.value)"
            ></el-option>
          </el-select>
        </el-form-item> -->

        <el-form-item label="课程周数" prop="courseWeeks">
          <el-input v-model="form.courseWeeks" placeholder="请输入课程周数" />
        </el-form-item>
        <el-form-item label="班级人数" prop="classSize">
          <el-input v-model="form.classSize" placeholder="请输入班级人数" />
        </el-form-item>
        <el-form-item label="考核方式" prop="assessmentMethod">
          <el-input v-model="form.assessmentMethod" placeholder="请输入考核方式" />
        </el-form-item>
        <el-form-item label="开课学期" prop="semester">
          <el-input v-model="form.semester" placeholder="请输入开课学期" />
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

<script setup name="Arrange">
import { listArrange, getArrange, delArrange, addArrange, updateArrange } from "@/api/teach/arrange";
import { listCourse } from "@/api/teach/course";
import { listTeacher } from "@/api/teach/teacher";
import { listClassroom } from "@/api/teach/classroom"; 
import { loadAllParams } from "@/api/page";

const { proxy } = getCurrentInstance();
const { class_time, college_type, monday } = proxy.useDict('class_time', 'college_type', 'monday');

const arrangeList = ref([]);
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
    courseCode: null,
    courseName: null,
  },
  rules: {
    teacherNo: [
      { required: true, message: "教师不能为空", trigger: "blur" }
    ],
    courseCode: [
      { required: true, message: "课程编码不能为空", trigger: "blur" }
    ],
    classroomCode: [
      { required: true, message: "教室编号不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询课程安排列表 */
function getList() {
  loading.value = true;
  listArrange(queryParams.value).then(response => {
    arrangeList.value = response.rows;
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
    courseCode: null,
    openCourseCode: null,
    courseName: null,
    teacherNo: null,
    name: null,
    courseType: null,
    classroomCode: null,
    credit: null,
    classHours: null,
    courseWeeks: null,
    classSize: null,
    assessmentMethod: null,
    semester: null,
    createTime: null,
    updateTime: null,
    createBy: null,
    updateBy: null
  };
  proxy.resetForm("arrangeRef");
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
  title.value = "添加课程安排";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getArrange(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改课程安排";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["arrangeRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateArrange(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addArrange(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除课程安排编号为"' + _ids + '"的数据项？').then(function() {
    return delArrange(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('teach/arrange/export', {
    ...queryParams.value
  }, `arrange_${new Date().getTime()}.xlsx`)
}

/* 查询课程列表 */
const courseList = ref([]);
function getCourseList() {
  listCourse(loadAllParams).then(response => {
    courseList.value = response.rows;
  });
}

/* 查询教师列表 */
const teacherList = ref([]);
function getTeacherList() {
  listTeacher(loadAllParams).then(response => {
    teacherList.value = response.rows;
  });
}

/* 查询教室列表 */
const classroomList = ref([]);
function getClassroomList() {
  listClassroom(loadAllParams).then(response => {
    classroomList.value = response.rows;
  });
}

getClassroomList();
getTeacherList();
getCourseList();
getList();
</script>
