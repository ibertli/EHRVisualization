#EHR可视化项目

[![standard-readme compliant](https://img.shields.io/badge/readme%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)

## Table of Contents

- [Background](#background)
- [Install](#install)
- [Usage](#usage)
- [Img](#img)
- [Maintainers](#maintainers)
- [Contributing](#contributing)
- [License](#license)
- - [Change Logs](#change logs)

## Background

车辆在道路上行驶过程中，安装在车身上的各类传感器（如粘贴在挡风玻璃上的摄像头）会实时采集车辆周围的环境信息，并经过相应的算法处理模块，输出分割或语义识别后的结果。该显示化工程就是接收算法模块的处理结果，并使用相应的3D库渲染在浏览器上。准确并且低延时的输出这些信息，可以作为自动驾驶决策模块的参考，实现换道、跟车、刹车等动作。

## Install

在windows电脑上，首先需要安装[nginx](http://nginx.org/en/download.html)，安装完成后将该工程完整复制到nginx的**html**文件目录下；

在linux电脑上，同样需要安装[nginx](https://ubuntu.com/tutorials/install-and-configure-nginx#2-installing-nginx)，安装完成后将完整的工程移动到**/var/www/html**目录下：

```sh
$ sudo mv EHRVisualization /var/www/html
```

## Usage

在windows电脑上，双击nginx，画面一闪而过表示nginx已启动，然后在浏览器中输入 http://localhost/EHRVisualizaton/index.html 即可看到显示效果；
在ubuntu下，在浏览器中输入相同的地址即可看到显示效果；

## Img

效果图是这样的：https://github.com/ibertli/MusicPlayer/blob/master/images/%E6%95%88%E6%9E%9C%E5%9B%BE.png

## Maintainers

[@ibertli](https://github.com/ibertli).

## Contributing

Feel free to dive in! [Open an issue](https://github.com/RichardLitt/standard-readme/issues/new) or submit PRs.

## License

[MIT](LICENSE) © Richard Littauer

## Change Logs

| Version |  Update   | Contractor | Description | Remark |
| ------  | -------   |   :----:   | ----------- | ------ |
| V1.0.0  | 2020.3.19 |   李向南   | 1.删除了摄像头显示窗口 2.增加TBox Heading指针 3.将之前左上角的信息以不同颜色的表格放置在右下角
