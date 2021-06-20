(() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, {enumerable: true, configurable: true, writable: true, value}) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };

  // node_modules/svelte/internal/index.mjs
  function noop() {
  }
  function run(fn) {
    return fn();
  }
  function blank_object() {
    return Object.create(null);
  }
  function run_all(fns) {
    fns.forEach(run);
  }
  function is_function(thing) {
    return typeof thing === "function";
  }
  function safe_not_equal(a, b) {
    return a != a ? b == b : a !== b || (a && typeof a === "object" || typeof a === "function");
  }
  function is_empty(obj) {
    return Object.keys(obj).length === 0;
  }
  var tasks = new Set();
  function append(target, node) {
    target.appendChild(node);
  }
  function insert(target, node, anchor) {
    target.insertBefore(node, anchor || null);
  }
  function detach(node) {
    node.parentNode.removeChild(node);
  }
  function element(name) {
    return document.createElement(name);
  }
  function listen(node, event, handler, options) {
    node.addEventListener(event, handler, options);
    return () => node.removeEventListener(event, handler, options);
  }
  function attr(node, attribute, value) {
    if (value == null)
      node.removeAttribute(attribute);
    else if (node.getAttribute(attribute) !== value)
      node.setAttribute(attribute, value);
  }
  function children(element2) {
    return Array.from(element2.childNodes);
  }
  function set_style(node, key, value, important) {
    node.style.setProperty(key, value, important ? "important" : "");
  }
  function custom_event(type, detail) {
    const e = document.createEvent("CustomEvent");
    e.initCustomEvent(type, false, false, detail);
    return e;
  }
  var active_docs = new Set();
  var current_component;
  function set_current_component(component) {
    current_component = component;
  }
  function get_current_component() {
    if (!current_component)
      throw new Error("Function called outside component initialization");
    return current_component;
  }
  function onMount(fn) {
    get_current_component().$$.on_mount.push(fn);
  }
  function createEventDispatcher() {
    const component = get_current_component();
    return (type, detail) => {
      const callbacks = component.$$.callbacks[type];
      if (callbacks) {
        const event = custom_event(type, detail);
        callbacks.slice().forEach((fn) => {
          fn.call(component, event);
        });
      }
    };
  }
  var dirty_components = [];
  var binding_callbacks = [];
  var render_callbacks = [];
  var flush_callbacks = [];
  var resolved_promise = Promise.resolve();
  var update_scheduled = false;
  function schedule_update() {
    if (!update_scheduled) {
      update_scheduled = true;
      resolved_promise.then(flush);
    }
  }
  function add_render_callback(fn) {
    render_callbacks.push(fn);
  }
  var flushing = false;
  var seen_callbacks = new Set();
  function flush() {
    if (flushing)
      return;
    flushing = true;
    do {
      for (let i = 0; i < dirty_components.length; i += 1) {
        const component = dirty_components[i];
        set_current_component(component);
        update(component.$$);
      }
      set_current_component(null);
      dirty_components.length = 0;
      while (binding_callbacks.length)
        binding_callbacks.pop()();
      for (let i = 0; i < render_callbacks.length; i += 1) {
        const callback = render_callbacks[i];
        if (!seen_callbacks.has(callback)) {
          seen_callbacks.add(callback);
          callback();
        }
      }
      render_callbacks.length = 0;
    } while (dirty_components.length);
    while (flush_callbacks.length) {
      flush_callbacks.pop()();
    }
    update_scheduled = false;
    flushing = false;
    seen_callbacks.clear();
  }
  function update($$) {
    if ($$.fragment !== null) {
      $$.update();
      run_all($$.before_update);
      const dirty = $$.dirty;
      $$.dirty = [-1];
      $$.fragment && $$.fragment.p($$.ctx, dirty);
      $$.after_update.forEach(add_render_callback);
    }
  }
  var outroing = new Set();
  var outros;
  function group_outros() {
    outros = {
      r: 0,
      c: [],
      p: outros
    };
  }
  function check_outros() {
    if (!outros.r) {
      run_all(outros.c);
    }
    outros = outros.p;
  }
  function transition_in(block, local) {
    if (block && block.i) {
      outroing.delete(block);
      block.i(local);
    }
  }
  function transition_out(block, local, detach2, callback) {
    if (block && block.o) {
      if (outroing.has(block))
        return;
      outroing.add(block);
      outros.c.push(() => {
        outroing.delete(block);
        if (callback) {
          if (detach2)
            block.d(1);
          callback();
        }
      });
      block.o(local);
    }
  }
  var globals = typeof window !== "undefined" ? window : typeof globalThis !== "undefined" ? globalThis : global;
  var boolean_attributes = new Set([
    "allowfullscreen",
    "allowpaymentrequest",
    "async",
    "autofocus",
    "autoplay",
    "checked",
    "controls",
    "default",
    "defer",
    "disabled",
    "formnovalidate",
    "hidden",
    "ismap",
    "loop",
    "multiple",
    "muted",
    "nomodule",
    "novalidate",
    "open",
    "playsinline",
    "readonly",
    "required",
    "reversed",
    "selected"
  ]);
  function create_component(block) {
    block && block.c();
  }
  function mount_component(component, target, anchor, customElement) {
    const {fragment, on_mount, on_destroy, after_update} = component.$$;
    fragment && fragment.m(target, anchor);
    if (!customElement) {
      add_render_callback(() => {
        const new_on_destroy = on_mount.map(run).filter(is_function);
        if (on_destroy) {
          on_destroy.push(...new_on_destroy);
        } else {
          run_all(new_on_destroy);
        }
        component.$$.on_mount = [];
      });
    }
    after_update.forEach(add_render_callback);
  }
  function destroy_component(component, detaching) {
    const $$ = component.$$;
    if ($$.fragment !== null) {
      run_all($$.on_destroy);
      $$.fragment && $$.fragment.d(detaching);
      $$.on_destroy = $$.fragment = null;
      $$.ctx = [];
    }
  }
  function make_dirty(component, i) {
    if (component.$$.dirty[0] === -1) {
      dirty_components.push(component);
      schedule_update();
      component.$$.dirty.fill(0);
    }
    component.$$.dirty[i / 31 | 0] |= 1 << i % 31;
  }
  function init(component, options, instance3, create_fragment3, not_equal, props, dirty = [-1]) {
    const parent_component = current_component;
    set_current_component(component);
    const $$ = component.$$ = {
      fragment: null,
      ctx: null,
      props,
      update: noop,
      not_equal,
      bound: blank_object(),
      on_mount: [],
      on_destroy: [],
      on_disconnect: [],
      before_update: [],
      after_update: [],
      context: new Map(parent_component ? parent_component.$$.context : options.context || []),
      callbacks: blank_object(),
      dirty,
      skip_bound: false
    };
    let ready = false;
    $$.ctx = instance3 ? instance3(component, options.props || {}, (i, ret, ...rest) => {
      const value = rest.length ? rest[0] : ret;
      if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
        if (!$$.skip_bound && $$.bound[i])
          $$.bound[i](value);
        if (ready)
          make_dirty(component, i);
      }
      return ret;
    }) : [];
    $$.update();
    ready = true;
    run_all($$.before_update);
    $$.fragment = create_fragment3 ? create_fragment3($$.ctx) : false;
    if (options.target) {
      if (options.hydrate) {
        const nodes = children(options.target);
        $$.fragment && $$.fragment.l(nodes);
        nodes.forEach(detach);
      } else {
        $$.fragment && $$.fragment.c();
      }
      if (options.intro)
        transition_in(component.$$.fragment);
      mount_component(component, options.target, options.anchor, options.customElement);
      flush();
    }
    set_current_component(parent_component);
  }
  var SvelteElement;
  if (typeof HTMLElement === "function") {
    SvelteElement = class extends HTMLElement {
      constructor() {
        super();
        this.attachShadow({mode: "open"});
      }
      connectedCallback() {
        const {on_mount} = this.$$;
        this.$$.on_disconnect = on_mount.map(run).filter(is_function);
        for (const key in this.$$.slotted) {
          this.appendChild(this.$$.slotted[key]);
        }
      }
      attributeChangedCallback(attr2, _oldValue, newValue) {
        this[attr2] = newValue;
      }
      disconnectedCallback() {
        run_all(this.$$.on_disconnect);
      }
      $destroy() {
        destroy_component(this, 1);
        this.$destroy = noop;
      }
      $on(type, callback) {
        const callbacks = this.$$.callbacks[type] || (this.$$.callbacks[type] = []);
        callbacks.push(callback);
        return () => {
          const index = callbacks.indexOf(callback);
          if (index !== -1)
            callbacks.splice(index, 1);
        };
      }
      $set($$props) {
        if (this.$$set && !is_empty($$props)) {
          this.$$.skip_bound = true;
          this.$$set($$props);
          this.$$.skip_bound = false;
        }
      }
    };
  }
  var SvelteComponent = class {
    $destroy() {
      destroy_component(this, 1);
      this.$destroy = noop;
    }
    $on(type, callback) {
      const callbacks = this.$$.callbacks[type] || (this.$$.callbacks[type] = []);
      callbacks.push(callback);
      return () => {
        const index = callbacks.indexOf(callback);
        if (index !== -1)
          callbacks.splice(index, 1);
      };
    }
    $set($$props) {
      if (this.$$set && !is_empty($$props)) {
        this.$$.skip_bound = true;
        this.$$set($$props);
        this.$$.skip_bound = false;
      }
    }
  };

  // src/components/loading/loading.svelte
  function add_css() {
    var style = element("style");
    style.id = "svelte-ebl6dg-style";
    style.textContent = ".modalr-loading.svelte-ebl6dg.svelte-ebl6dg{text-align:center;width:100%}.modalr-loading.svelte-ebl6dg .modalr-loading-img.svelte-ebl6dg{width:3rem;height:3rem}";
    append(document.head, style);
  }
  function create_fragment(ctx) {
    let div;
    let img;
    let img_src_value;
    return {
      c() {
        div = element("div");
        img = element("img");
        if (img.src !== (img_src_value = ctx[0]))
          attr(img, "src", img_src_value);
        attr(img, "alt", "\u52A0\u8F7D\u4E2D");
        attr(img, "class", "modalr-loading-img svelte-ebl6dg");
        attr(div, "class", "modalr-loading svelte-ebl6dg");
      },
      m(target, anchor) {
        insert(target, div, anchor);
        append(div, img);
      },
      p: noop,
      i: noop,
      o: noop,
      d(detaching) {
        if (detaching)
          detach(div);
      }
    };
  }
  function instance($$self) {
    const LoadingImage = `data:image/svg+xml;base64,PHN2ZyBjbGFzcz0ibGRzLWNhbWVyYSIgd2lkdGg9IjMycHgiICBoZWlnaHQ9IjMycHgiICB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJ4TWlkWU1pZCI+PGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoNTAsNTApIj4KPGcgdHJhbnNmb3JtPSJzY2FsZSgwLjcpIj4KPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTUwLC01MCkiPgo8ZyB0cmFuc2Zvcm09InJvdGF0ZSgyNzAuNzIgNTAgNTApIj4KICA8YW5pbWF0ZVRyYW5zZm9ybSBhdHRyaWJ1dGVOYW1lPSJ0cmFuc2Zvcm0iIHR5cGU9InJvdGF0ZSIgcmVwZWF0Q291bnQ9ImluZGVmaW5pdGUiIHZhbHVlcz0iMzYwIDUwIDUwOzAgNTAgNTAiIGtleVRpbWVzPSIwOzEiIGR1cj0iMXMiIGtleVNwbGluZXM9IjAuNSAwLjUgMC41IDAuNSIgY2FsY01vZGU9InNwbGluZSI+PC9hbmltYXRlVHJhbnNmb3JtPgogIDxwYXRoIGZpbGw9IiNmMDUxMjUiIGQ9Ik01NC4zLDI4LjFoMzQuMmMtNC41LTkuMy0xMi40LTE2LjctMjEuOS0yMC44TDQ1LjcsMjguMUw1NC4zLDI4LjFMNTQuMywyOC4xeiI+PC9wYXRoPgogIDxwYXRoIGZpbGw9IiNmZGI4MTMiIGQ9Ik02MS43LDcuM0M1MS45LDQsNDEuMSw0LjIsMzEuNSw4LjF2MjkuNWw2LjEtNi4xTDYxLjcsNy4zQzYxLjcsNy4zLDYxLjcsNy4zLDYxLjcsNy4zeiI+PC9wYXRoPgogIDxwYXRoIGZpbGw9IiM3ZmJiNDIiIGQ9Ik0yOC4xLDExLjZjLTkuMyw0LjUtMTYuNywxMi40LTIwLjgsMjEuOWwyMC44LDIwLjh2LTguNkwyOC4xLDExLjZDMjguMSwxMS42LDI4LjEsMTEuNiwyOC4xLDExLjZ6Ij48L3BhdGg+CiAgPHBhdGggZmlsbD0iIzMyYTBkYSIgZD0iTTMxLjUsNjIuNEw3LjMsMzguM2MwLDAsMCwwLDAsMEM0LDQ4LjEsNC4yLDU4LjksOC4xLDY4LjVoMjkuNUwzMS41LDYyLjR6Ij48L3BhdGg+CiAgPHBhdGggZmlsbD0iI2YwNTEyNSIgZD0iTTQ1LjcsNzEuOUgxMS41YzAsMCwwLDAsMCwwYzQuNSw5LjMsMTIuNCwxNi43LDIxLjksMjAuOGwyMC44LTIwLjhINDUuN3oiPjwvcGF0aD4KICA8cGF0aCBmaWxsPSIjZmRiODEzIiBkPSJNNjIuNCw2OC41TDM4LjMsOTIuNmMwLDAsMCwwLDAsMGM5LjgsMy40LDIwLjYsMy4xLDMwLjItMC44VjYyLjRMNjIuNCw2OC41eiI+PC9wYXRoPgogIDxwYXRoIGZpbGw9IiM3ZmJiNDIiIGQ9Ik03MS45LDQ1Ljd2OC42djM0LjJjMCwwLDAsMCwwLDBjOS4zLTQuNSwxNi43LTEyLjQsMjAuOC0yMS45TDcxLjksNDUuN3oiPjwvcGF0aD4KICA8cGF0aCBmaWxsPSIjMzJhMGRhIiBkPSJNOTEuOSwzMS41QzkxLjksMzEuNSw5MS45LDMxLjUsOTEuOSwzMS41bC0yOS41LDBsMCwwbDYuMSw2LjFsMjQuMSwyNC4xYzAsMCwwLDAsMCwwIEM5Niw1MS45LDk1LjgsNDEuMSw5MS45LDMxLjV6Ij48L3BhdGg+CjwvZz48L2c+PC9nPjwvZz48L3N2Zz4K`;
    return [LoadingImage];
  }
  var Loading = class extends SvelteComponent {
    constructor(options) {
      super();
      if (!document.getElementById("svelte-ebl6dg-style"))
        add_css();
      init(this, options, instance, create_fragment, safe_not_equal, {});
    }
  };
  var loading_default = Loading;

  // src/components/loading/index.js
  var Loading2 = loading_default;

  // src/utils/zindex-manager.js
  var makeZIndexManager = () => {
    let index = 1e3;
    return () => {
      index += 100;
      return index;
    };
  };
  var nextZIndex = makeZIndexManager();

  // src/components/modal-container/modal-container.svelte
  function add_css2() {
    var style = element("style");
    style.id = "svelte-fr23s2-style";
    style.textContent = ".modalr-dialog-container.svelte-fr23s2.svelte-fr23s2{position:fixed;top:0;right:0;bottom:0;left:0;height:100vh;width:100%;overflow:hidden}.modalr-flex-container.svelte-fr23s2.svelte-fr23s2{display:flex;justify-items:center;align-items:center}.modalr-flex-container.svelte-fr23s2 .flex-item.svelte-fr23s2{flex:1}";
    append(document.head, style);
  }
  function create_else_block(ctx) {
    let div;
    return {
      c() {
        div = element("div");
        attr(div, "id", ctx[5]);
        attr(div, "class", "flex-item svelte-fr23s2");
        set_style(div, "z-index", ctx[3]);
      },
      m(target, anchor) {
        insert(target, div, anchor);
        div.innerHTML = ctx[1];
      },
      p(ctx2, dirty) {
        if (dirty & 2)
          div.innerHTML = ctx2[1];
        ;
        if (dirty & 32) {
          attr(div, "id", ctx2[5]);
        }
        if (dirty & 8) {
          set_style(div, "z-index", ctx2[3]);
        }
      },
      i: noop,
      o: noop,
      d(detaching) {
        if (detaching)
          detach(div);
      }
    };
  }
  function create_if_block(ctx) {
    let div;
    let loading;
    let current;
    loading = new Loading2({});
    return {
      c() {
        div = element("div");
        create_component(loading.$$.fragment);
        attr(div, "class", "flex-item svelte-fr23s2");
        set_style(div, "z-index", ctx[3]);
      },
      m(target, anchor) {
        insert(target, div, anchor);
        mount_component(loading, div, null);
        current = true;
      },
      p(ctx2, dirty) {
        if (!current || dirty & 8) {
          set_style(div, "z-index", ctx2[3]);
        }
      },
      i(local) {
        if (current)
          return;
        transition_in(loading.$$.fragment, local);
        current = true;
      },
      o(local) {
        transition_out(loading.$$.fragment, local);
        current = false;
      },
      d(detaching) {
        if (detaching)
          detach(div);
        destroy_component(loading);
      }
    };
  }
  function create_fragment2(ctx) {
    let div;
    let current_block_type_index;
    let if_block;
    let current;
    let mounted;
    let dispose;
    const if_block_creators = [create_if_block, create_else_block];
    const if_blocks = [];
    function select_block_type(ctx2, dirty) {
      if (ctx2[6])
        return 0;
      return 1;
    }
    current_block_type_index = select_block_type(ctx, -1);
    if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    return {
      c() {
        div = element("div");
        if_block.c();
        attr(div, "data-modalr-id", ctx[0]);
        attr(div, "class", "modalr-dialog-container modalr-flex-container svelte-fr23s2");
        set_style(div, "z-index", ctx[2]);
        set_style(div, "background-color", ctx[4]);
      },
      m(target, anchor) {
        insert(target, div, anchor);
        if_blocks[current_block_type_index].m(div, null);
        current = true;
        if (!mounted) {
          dispose = listen(div, "click", ctx[7]);
          mounted = true;
        }
      },
      p(ctx2, [dirty]) {
        let previous_block_index = current_block_type_index;
        current_block_type_index = select_block_type(ctx2, dirty);
        if (current_block_type_index === previous_block_index) {
          if_blocks[current_block_type_index].p(ctx2, dirty);
        } else {
          group_outros();
          transition_out(if_blocks[previous_block_index], 1, 1, () => {
            if_blocks[previous_block_index] = null;
          });
          check_outros();
          if_block = if_blocks[current_block_type_index];
          if (!if_block) {
            if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx2);
            if_block.c();
          } else {
            if_block.p(ctx2, dirty);
          }
          transition_in(if_block, 1);
          if_block.m(div, null);
        }
        if (!current || dirty & 1) {
          attr(div, "data-modalr-id", ctx2[0]);
        }
        if (!current || dirty & 4) {
          set_style(div, "z-index", ctx2[2]);
        }
        if (!current || dirty & 16) {
          set_style(div, "background-color", ctx2[4]);
        }
      },
      i(local) {
        if (current)
          return;
        transition_in(if_block);
        current = true;
      },
      o(local) {
        transition_out(if_block);
        current = false;
      },
      d(detaching) {
        if (detaching)
          detach(div);
        if_blocks[current_block_type_index].d();
        mounted = false;
        dispose();
      }
    };
  }
  function instance2($$self, $$props, $$invalidate) {
    let continerZIndex;
    let clildZIndex;
    let backgroundColor;
    let contentWrapperId;
    let isLoading;
    const dispatch = createEventDispatcher();
    let {id = ""} = $$props;
    let {content = null} = $$props;
    let {config = {
      closeOnMark: true,
      isLoading: false,
      backgroundColor: "rgba(0, 0, 0, 0.25)",
      zindex: 1e4
    }} = $$props;
    const handleModalContainerOnClose = ({event, currentId}) => {
      if (event.target.dataset["modalrId"] != id) {
        return;
      }
      if (config.closeOnMark && currentId == id) {
        dispatch("destroy");
      }
    };
    const handleModalContainerOnClick = (event) => handleModalContainerOnClose({event, currentId: id});
    onMount(() => {
      $$invalidate(8, config.zindex = nextZIndex(), config);
    });
    $$self.$$set = ($$props2) => {
      if ("id" in $$props2)
        $$invalidate(0, id = $$props2.id);
      if ("content" in $$props2)
        $$invalidate(1, content = $$props2.content);
      if ("config" in $$props2)
        $$invalidate(8, config = $$props2.config);
    };
    $$self.$$.update = () => {
      if ($$self.$$.dirty & 256) {
        $:
          $$invalidate(2, continerZIndex = config.zindex);
      }
      if ($$self.$$.dirty & 256) {
        $:
          $$invalidate(3, clildZIndex = config.zindex + 10);
      }
      if ($$self.$$.dirty & 256) {
        $:
          $$invalidate(4, backgroundColor = config.backgroundColor || "rgba(0, 0, 0, 0.25)");
      }
      if ($$self.$$.dirty & 1) {
        $:
          $$invalidate(5, contentWrapperId = `${id}-content-wrapper`);
      }
      if ($$self.$$.dirty & 256) {
        $:
          $$invalidate(6, isLoading = config.isLoading);
      }
    };
    return [
      id,
      content,
      continerZIndex,
      clildZIndex,
      backgroundColor,
      contentWrapperId,
      isLoading,
      handleModalContainerOnClick,
      config
    ];
  }
  var Modal_container = class extends SvelteComponent {
    constructor(options) {
      super();
      if (!document.getElementById("svelte-fr23s2-style"))
        add_css2();
      init(this, options, instance2, create_fragment2, safe_not_equal, {id: 0, content: 1, config: 8});
    }
  };
  var modal_container_default = Modal_container;

  // src/components/modal-container/index.js
  var ModalContainer = modal_container_default;

  // src/dialog-manager.ts
  var noop2 = function() {
  };
  var defaultOptions = () => {
    return {
      closeOnMark: true,
      isLoading: false,
      backgroundColor: "rgba(0, 0, 0, 0.25)",
      onCloseCallback: noop2,
      before: noop2
    };
  };
  var makeDialogIdBuilder = () => {
    let index = 0;
    return () => {
      index += 1;
      return `$modalr_layer_${index}`;
    };
  };
  var getDOM = (content) => {
    const el = typeof content === "string" ? document.querySelector(content) : content;
    return el.cloneNode(true);
  };
  var TARGET = document.body;
  var nextDialogId = makeDialogIdBuilder();
  var DialogManager = class {
    constructor() {
      this._dialogIds = [];
      this._dialogs = new Map();
    }
    show(content, opts) {
      const _content = getDOM(content);
      const {closeOnMark, onCloseCallback, before: beforeHook} = __spreadValues(__spreadValues({}, defaultOptions()), opts);
      if (beforeHook && typeof beforeHook === "function") {
        beforeHook();
      }
      const id = nextDialogId();
      const dialog = new ModalContainer({
        target: TARGET,
        props: {
          id,
          content: _content.innerHTML,
          config: {
            closeOnMark
          }
        }
      });
      dialog.$on("destroy", onCloseCallback);
      this._dialogIds.push(id);
      this._dialogs.set(id, dialog);
      return id;
    }
    _removeDialog(dialogId) {
      this._dialogs.delete(dialogId);
      const index = this._dialogIds.findIndex((it) => it === dialogId);
      if (index > -1) {
        this._dialogIds.splice(index, 1);
      }
    }
    close(dialogId) {
      const dialog = this._dialogs.get(dialogId);
      if (!dialog) {
        return;
      }
      if (dialog.$destroy) {
        dialog.$destroy();
      }
      this._removeDialog(dialogId);
    }
    closeLatest() {
      const lastDialogId = this._dialogIds.pop();
      this.close(lastDialogId);
    }
    closeAll() {
      Array.from(this._dialogIds.values()).forEach((handleId) => this.close(handleId));
    }
    loading(timeout) {
      const _timeout = timeout || 0;
      const {onCloseCallback} = defaultOptions();
      const dialog = new ModalContainer({
        target: TARGET,
        props: {
          config: {
            closeOnMark: false,
            isLoading: true,
            backgroundColor: "rgba(0, 0, 0, 0.05)"
          }
        }
      });
      dialog.$on("destroy", onCloseCallback);
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
  };
  var dialogManager = new DialogManager();

  // src/iife-wrapper.js
  window.modalr = dialogManager;
})();
//# sourceMappingURL=modalr.js.map
