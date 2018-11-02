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
    closeOnMark: true, // 允许点击空白处关闭弹出层
    target: document.body, // 弹出层挂载点，默认是 document.body.
    onCloseCallback: function() {}， // 弹出层关闭时回调钩子
    before: function(){} // 弹出前钩子
}

htmlString = document.getElementById('some-id').innerHtml

// 弹出层，内容为普通 HTML String，ID 为 modalr 的 handler ，动态生成。
// 注意因为弹出层显示的内容是 Html String，如果业务上需要获取内容里某个值（例如表单的值），
// 需要使用 document.getElementByClass 方式。弹出层是复制了 HTML 中内容，非引用方式。
// 如果使用 jQuery，通过 `${id}-content-wrapper` 可以构造出弹出层的内容的 wrapper id。
// 通过  $('wrapper-id > .some-class')，可以快速定位出需要的 HTML Element。
id = modalr.show(htmlString, opts)

id = modalr.loading(); // 弹出“加载中”，需要手动关闭

id = modalr.loading(1000); // 弹出“加载中”，1000ms 后自动关闭

modalr.close(id) // 关闭指定层
modalr.closeAll() // 关闭所有

```

## 构建

以下在 `node.js` v10 版本下测试。

```shell
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

- 2018.09.15
  - [x] 调用模态层 ID 号生成方法，减少重复的可能。
  - [x] 可以正确处理多模态层时关闭事件，现在可以逐层关闭。
  - [x] 更新示例。

- 2018.10.16
  - [x] 更新构建脚本。
  - [x] javascript 转换器改为 babel。

- 2018.11.02
  - [x] 增加 before 钩子。
  - [x] 增加弹出层内容外层 ID，格式：${id}-content-wrapper。
  - [x] 更新示例。

## 协议

[MIT LICENSE](LICENSE)
