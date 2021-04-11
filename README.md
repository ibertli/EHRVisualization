#EHR可视化项目

##须知
1.部署时需要先安装apache，然后将文件夹“EHRVisualizaton”放到/var/www/html/目录下。
2.然后在浏览器中打开：http://localhost/EHRVisualizaton/index.html 即可。

## 版本说明 （软件版本）
| Version |  Update   | Contractor | Description | Remark |
| ------  | -------   |   :----:   | ----------- | ------ |
| V1.0.0  | 2020.3.19 |   李向南   | 1.删除了摄像头显示窗口 2.增加TBox Heading指针 3.将之前左上角的信息以不同颜色的表格放置在右下角

##应用目录
- index.html按不同的时间频率读取 loc_data.json 和 map_data.json 数据
- 逻辑处理部分的js代码在 js/index2.js 中
