# modalr 一个模态层

## 特性

- 提供一个模态容器。
- 使用绝对定位、flexbox 实现容器内的 html 可以水平、垂直居中。
- 支持多弹出模态层。
- 基于 [svelte 框架](https://svelte.technology/)、[rollup 工具](https://rollupjs.org/)。
- [IIFE](https://developer.mozilla.org/en-US/docs/Glossary/IIFE) 方式打包，支持 jQuery 协同使用。

## API
```javascript
opts = {
    closeOnMark: true, // 允许点击
    target: document.body, // 挂载点，默认是 document.body.
    onCloseCallback: function() {} // 关闭弹出层时回调函数
}

htmlObj = document.getElementById('some-id').innerHtml

id = modalr.show(htmlObj, opts) // 弹出层，内容为普通 HTML 文本

id = modalr.loading(); // 弹出“加载中”，需要手动关闭

id = modalr.loading(1000); // 弹出“加载中”，1000ms 后自动关闭

modalr.close(id) // 关闭指定层
modalr.closeAll() // 关闭所有

```

## 构建

以下在 `node.js` v10 版本下测试。

```shell
$ npm install -g rollup
$ npm install
$ npm run build # 打包生产环境版本
$ npm run dev # 开发环境
```

## 用例

见 [index.html](index.html)。


## 更新记录

- 2018.09.06
  - [x] 可以弹出模态层。z-index 按 10000 起计算。
  - [x] 可以弹出 loading 提示。

## 协议

[MIT LICENSE](LICENSE)
