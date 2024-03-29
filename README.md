# modalr 一个模态层

## 特性

- 提供一个模态容器。
- 使用绝对定位、flexbox 实现容器内的 html 可以水平、垂直居中。
- 支持多弹出模态层。
- 基于 [svelte](https://svelte.dev/)、[esbuild 工具](https://esbuild.github.io/)。
- [iife][1] 方式打包，默认挂载到 `window.modalr`，可以和 jQuery 协同使用。
- **不支持 IE 系列浏览器，也不会计划支持 IE 系列浏览器**。

[1]: https://developer.mozilla.org/zh-CN/docs/Glossary/IIFE

## API

```javascript
opts = {
  // 允许点击空白处关闭弹出层
  closeOnMark: true,

  // 弹出层挂载点，默认是 document.body.
  target: document.body,

  // 弹出层关闭时回调钩子
  onCloseCallback: function() {},  
  // 弹出前钩子
  before: function(){} 
}

htmlString = document.getElementById('some-id').innerHtml

// 弹出层，内容为普通 HTML String，ID 为 modalr 的 handler ，动态生成。
// 注意因为弹出层显示的内容是 Html String，如果业务上需要获取内容里某个值（例如表单的值），
// 需要使用 document.getElementByClass 方式。弹出层是复制了 HTML 中内容，非引用方式。
// 如果使用 jQuery，通过 `${id}-content-wrapper` 可以构造出弹出层的内容的 wrapper id。
// 通过  $('wrapper-id > .some-class')，可以快速定位出需要的 HTML Element。
const id1 = modalr.show(htmlString, opts)

// 弹出“加载中”，需要手动关闭
const id2 = modalr.loading();

// 弹出“加载中”，1000ms 后自动关闭
const id3 = modalr.loading(1000);

// 关闭指定层
modalr.close(id1);

// 关闭所有
modalr.closeAll();

// 关闭最后一个弹出层
modalr.closeLatest();

```

## 构建

以下在 `node.js` v16 版本下测试通过。

```shell
$ npm install
$ npm run build # 打包生产环境版本
$ npm run dev # 开发环境
```

## 用例

见 [demo.html](demo.html)。

## 更新记录

- 2021.06.19
  - 更新构建脚本
  - 使用 typescript 重写入口代码
  - 增加 types
  - 更新 package.json 配置，完善 bundler 支持

- 2021.06.18
  - iife 入口改为 iife-wrapper.js；esm 模块入口改为 esm-wrapper.js
  - 修复部分场景下不能删除 dialogId 的问题
  - 增加 eslint 配置

- 2021.06.10
  - 升级依赖
  - 构建工具改为 esbuild，极速构建
  - 传入的 DOM 节点会尝试调用 `el.cloneNode(true)` 复制一份用于弹窗
  - 因为 esbuild 的限制，不再输出 umd 格式，改为 iife 格式。默认挂载到 `window.modalr`

- 2019.10.26
  - 升级依赖
  - 构建脚本统一放置到 scripts 目录
  - 增加开发服务器，运行 npm run dev-server 启动

- 2019.8.18
   - 升级依赖
   - 调整目录、文件
   - package.json 增加 main、module 入口

- 2019.6.24

  - 升级依赖
  - 开放 before 钩子

- 2019.4.30

  - rollup 升级到 rollup 1.10.1。
  - svelte 升级到 3.1.0。
  - 按 svelte 3 重写相应的组件。
  - 增加 modalr.closeLatest() 方法，关闭最后一个弹窗。

- 2018.9.6

  - 可以弹出模态层。z-index 按 10000 起计算。
  - 可以弹出 loading 提示。

- 2018.9.15

  - 调用模态层 ID 号生成方法，减少重复的可能。
  - 可以正确处理多模态层时关闭事件，现在可以逐层关闭。
  - 更新示例。

- 2018.10.16

  - 更新构建脚本。
  - javascript 转换器改为 babel。

- 2018.11.2

  - 增加 before 钩子。
  - 增加弹出层内容外层 ID，格式：\${id}-content-wrapper。
  - 更新示例。

## 协议

[MIT LICENSE](LICENSE)
