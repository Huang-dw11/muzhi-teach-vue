<!-- CourseEditDialog.vue -->
<template>
    <el-dialog
      :title="title"
      v-model="visible"
      width="600px"
      append-to-body
      :close-on-click-modal="false"
    >
      <el-form :model="formData" label-width="80px">
        <el-form-item label="课程名称" v-if="formData.id == undefined">
          <el-select v-model="formData.courseCode">
            <el-option
              v-for="item in courseList"
              :key="item.courseCode"
              :label="item.courseName"
              :value="item.courseCode"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="开始节次">
          <span class="detail-value">{{ formData.start }}</span>
        </el-form-item>
        <el-form-item label="结束节次">
          <el-input-number 
            v-model="formData.end" 
            :min="formData.start" 
            :max="maxLength"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">保存</el-button>
      </template>
    </el-dialog>
  </template>
  
  <script setup>
  import { ref, watch } from 'vue'
  
  const props = defineProps({
    modelValue: Boolean,
    title: String,
    courseList: Array,
    currentData: Object,
    initialData: Object,
    maxLength: Number
  })
  
  const emit = defineEmits(['update:model-value', 'submit'])
  
  const visible = ref(false)
  const formData = ref({
    weekday: 0,
    courseCode: '',
    start: 1,
    end: 1,
    weekKey: '',
    id: null
  })
  
  watch(() => props.modelValue, (val) => {
    visible.value = val
  })
  
  watch(visible, (val) => {
    emit('update:model-value', val)
  })
  
  watch(() => props.initialData, (newVal) => {
    if (newVal) {
      formData.value = {
        ...newVal,
        id: newVal.id || null
      }
    }
  }, { deep: true, immediate: true })
  
  const handleSubmit = async () => {
    const payload = {
      ...formData.value,
      cmCode: props.currentData.cmCode,
      coursmanageId: props.currentData.id
    }
    emit('submit', payload)
    visible.value = false
  }
  </script>
  
  <style scoped>
  .detail-value {
    padding: 0 15px;
  }
  </style>