interface Options {
    closeOnMark: boolean;
    isLoading: boolean;
    backgroundColor: string;
    onCloseCallback: () => void;
    before: () => void;
}
export declare class DialogManager {
    _dialogIds: any[];
    _dialogs: Map<string, any>;
    constructor();
    show(content: HTMLElement | string, opts: Options): string;
    private _removeDialog;
    close(dialogId: string): void;
    closeLatest(): void;
    closeAll(): void;
    loading(timeout: number): string;
}
export declare const dialogManager: DialogManager;
export {};
