import { ModalContainer } from './components/modal-container';

const noop = function () {};

const defaultOptions = () => {
  return {
    closeOnMark: true,
    isLoading: false,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    onCloseCallback: noop,
    before: noop,
  };
};

const dialogIds = [];
const dialogs = new Map();

const makeDialogIdBuilder = () => {
  let index = 0;
  return () => {
    index += 1;
    const ts = new Date();
    const dialogId = `$modalr_layer_${index}_${ts.getTime()}`;
    return dialogId;
  };
};

const nextDialogId = makeDialogIdBuilder();

const target = document.body;

export default {
  /**
   * 弹出
   * @param {HTMLElement} content 内容
   * @param {{closeOnMark: boolean, backgroundColor: string, onCloseCallback: () => void, before: () => void}} opts 选项
   * @returns {string} 弹出层 ID
   */
  show(content, opts) {
    const clonedContent = content && content.cloneNode ? content.cloneNode(true) : content;
    const opt = { ...defaultOptions(), ...opts };
    const { closeOnMark, onCloseCallback, before: beforeHook } = opt;

    const id = nextDialogId();

    if (beforeHook && typeof beforeHook === 'function') {
      beforeHook();
    }

    const handle = new ModalContainer({
      target,
      props: {
        id,
        content: clonedContent,
        config: {
          closeOnMark,
        },
      },
    });

    handle.$on('destroy', onCloseCallback);
    dialogIds.push(id);
    dialogs.set(id, handle);

    return id;
  },

  /**
   * 按 handleId 关闭指定的弹出层
   * @param {*} id 弹出层 ID 号
   */
  close(id) {
    const dialog = dialogs.get(id);

    if (!dialog) {
      return;
    }

    if (dialog.$destroy) {
      dialog.$destroy();
    }

    dialogs.delete(id);

    const index = dialogIds.findIndex(it => it === id);
    if (index > -1) {
      dialogIds.splice(index, 1);
    }
  },

  /**
   * 关闭最后一个弹出层
   */
  closeLatest() {
    const lastId = dialogIds.pop();
    this.close(lastId);
  },

  /**
   * 关闭所有弹出层
   */
  closeAll() {
    Array.from(dialogs.values()).forEach(handleId => this.close(handleId));
  },

  /**
   * 显示“加载中”
   * @param {number} timeout 自动关闭延时，单位：ms
   * @returns {string} 弹出层 ID
   */
  loading(timeout) {
    const _timeout = timeout || 0;
    const { onCloseCallback } = defaultOptions();

    const dialog = new ModalContainer({
      target,
      props: {
        config: {
          closeOnMark: false,
          isLoading: true,
          backgroundColor: 'rgba(0, 0, 0, 0.05)',
        },
      },
    });

    dialog.$on('destroy', onCloseCallback);

    const id = nextDialogId();
    dialogIds.push(id);
    dialogs.set(id, dialog);

    if (_timeout > -1) {
      setTimeout(() => {
        this.close(id);
      }, _timeout);
    }

    return id;
  },
};
