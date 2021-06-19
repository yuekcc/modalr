import { ModalContainer } from './components/modal-container';

interface Options {
  closeOnMark: boolean;
  isLoading: boolean;
  backgroundColor: string;
  onCloseCallback: () => void;
  before: () => void;
}

const noop = function () {};

const defaultOptions = (): Options => {
  return {
    closeOnMark: true,
    isLoading: false,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    onCloseCallback: noop,
    before: noop,
  };
};

const makeDialogIdBuilder = () => {
  let index = 0;
  return () => {
    index += 1;
    return `$modalr_layer_${index}`;
  };
};

const getDOM = content => (content && content.cloneNode ? content.cloneNode(true) : content);

const TARGET = document.body;

const nextDialogId = makeDialogIdBuilder();

class DialogManager {
  _dialogIds = [];
  _dialogs = new Map();

  constructor() {}

  /**
   * 弹出
   * @param {HTMLElement} content 内容
   * @param {{closeOnMark: boolean, backgroundColor: string, onCloseCallback: () => void, before: () => void}} opts 选项
   * @returns {string} 弹出层 ID
   */
  show(content: HTMLElement, opts: Options) {
    const _content = getDOM(content);
    const { closeOnMark, onCloseCallback, before: beforeHook } = { ...defaultOptions(), ...opts };

    if (beforeHook && typeof beforeHook === 'function') {
      beforeHook();
    }

    const id = nextDialogId();

    const dialog = new ModalContainer({
      target: TARGET,
      props: {
        id,
        content: _content,
        config: {
          closeOnMark,
        },
      },
    });

    dialog.$on('destroy', onCloseCallback);
    this._dialogIds.push(id);
    this._dialogs.set(id, dialog);

    return id;
  }

  private _remove(dialogId: string): void {
    this._dialogs.delete(dialogId);

    const index = this._dialogIds.findIndex(it => it === dialogId);
    if (index > -1) {
      this._dialogIds.splice(index, 1);
    }
  }

  close(dialogId: string): void {
    const dialog = this._dialogs.get(dialogId);

    if (!dialog) {
      return;
    }

    if (dialog.$destroy) {
      dialog.$destroy();
    }

    this._remove(dialogId);
  }

  closeLatest(): void {
    const lastDialogId = this._dialogIds.pop();
    this.close(lastDialogId);
  }

  closeAll(): void {
    Array.from(this._dialogIds.values()).forEach(handleId => this.close(handleId));
  }

  loading(timeout: number) {
    const _timeout = timeout || 0;
    const { onCloseCallback } = defaultOptions();

    const dialog = new ModalContainer({
      target: TARGET,
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
    this._dialogIds.push(id);
    this._dialogs.set(id, dialog);

    if (_timeout > -1) {
      setTimeout(() => {
        this.close(id);
      }, _timeout);
    }

    return id;
  }
}

export const dialogManager = new DialogManager();
