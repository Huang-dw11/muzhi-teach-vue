<template>
  <div class="app-container">
    <el-space 
      wrap
      :fill= "1"
      :size="10"
      :fill-ratio="fillRatio"
      :direction="vertical"
      style="width: 100%; justify-content: center; align-items: center"
      align-items: stretch
      >
      <el-card class="box-card" style="width: 100%;">
        <template #header>
          <div class="card-header">
            <span>简单说两句</span>
            </div>
        </template>
      <el-row>
           <el-col :span="6">
             <el-statistic title="公共必修分" :precision="1" :value="1" >
               <template #suffix>/64.0</template>
             </el-statistic>
           </el-col>
           <el-col :span="6">
             <el-statistic title="专业必修分" :precision="1" :value="1">
               <template #suffix>/120.0</template>
             </el-statistic>
           </el-col>
           <el-col :span="6">
             <el-statistic title="教师数" :precision="1" :value="1" >
               <template #suffix>/4.0</template>
             </el-statistic>
           </el-col>
           <el-col :span="6">
             <el-statistic title="在校学生数" :precision="1" :value="1">
                <template #suffix>/4.0</template>
             </el-statistic>
           </el-col>
        </el-row>
      </el-card>
      <el-card class="box-card" style="width: 100%;"><teacherAbility /></el-card>
      <el-card class="box-card" style="width: 100%;"><demo /></el-card>
      <!-- <div></div>
      <div></div> -->


  </el-space>

   
  </div>
</template>

<script setup name="statistics">
import teacherAbility from './teacherAbility.vue'
import demo from './demo.vue'

</script>

<style>
</style>