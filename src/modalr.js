import ModalContainer from "./ModalContainer.html";

const noop = function () { }

const defaultOptions = () => {
  return {
    closeOnMark: true,
    isLoading: false,
    backgroundColor: "rgba(0, 0, 0, 0.25)",
    onCloseCallback: noop,
    before: noop
  }
};

const getDialogIdBuilder = () => {
  let index = 0;
  return () => {
    index += 1;
    const ts = new Date()
    return `$modalr_layer_${index}_${ts.getTime()}`;
  };
};

const nextDialogId = getDialogIdBuilder();

const target = document.body;

let dialogs = {};

export default {
  /**
   * 弹出
   * @param {HTMLElement} content 内容
   * @param {{closeOnMark: boolean, backgroundColor: string, onCloseCallback: () => void}} opts 选项
   */
  show(content, opts) {
    const opt = Object.assign(defaultOptions(), opts);
    const { closeOnMark, onCloseCallback, before } = opt;

    const id = nextDialogId();

    if (opt.before) {
      opt.before()
    }

    const handle = new ModalContainer({
      target,
      data: {
        id,
        content,
        config: {
          closeOnMark
        }
      }
    });

    handle.on("destroy", onCloseCallback);

    dialogs[id] = handle;

    return id;
  },

  /**
   * 按 handleId 关闭指定的弹出层
   * @param {*} id 弹出层 ID 号
   */
  close(id) {
    const handle = dialogs[id];

    if (handle && handle.destroy) {
      handle.destroy();
      dialogs[id] = null;
    }
  },

  /**
   * 关闭所有弹出层
   */
  closeAll() {
    Object.keys(dialogs).map(handleId => {
      const handle = dialogs[handleId];

      if (handle && handle.destroy) {
        handle.destroy();
        dialogs[handleId] = null;
      }
    });
  },

  /**
   * 显示“加载中”
   * @param {number} timeout 自动关闭延时，单位：ms
   */
  loading(timeout) {
    const x = this;
    const { onCloseCallback } = defaultOptions();

    const handle = new ModalContainer({
      target,
      data: {
        config: {
          closeOnMark: false,
          isLoading: true,
          backgroundColor: "rgba(0, 0, 0, 0.05)",
        }
      }
    });

    handle.on("destroy", onCloseCallback);

    const id = nextDialogId();
    dialogs[id] = handle;

    if (timeout) {
      setTimeout(() => {
        x.close(id);
      }, timeout);
    }

    return id;
  }
};
