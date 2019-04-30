function noop() {}

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
	return typeof thing === 'function';
}

function safe_not_equal(a, b) {
	return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
}

function append(target, node) {
	target.appendChild(node);
}

function insert(target, node, anchor) {
	target.insertBefore(node, anchor);
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

function children(element) {
	return Array.from(element.childNodes);
}

function set_style(node, key, value) {
	node.style.setProperty(key, value);
}

function custom_event(type, detail) {
	const e = document.createEvent('CustomEvent');
	e.initCustomEvent(type, false, false, detail);
	return e;
}

let current_component;

function set_current_component(component) {
	current_component = component;
}

function get_current_component() {
	if (!current_component) throw new Error(`Function called outside component initialization`);
	return current_component;
}

function onMount(fn) {
	get_current_component().$$.on_mount.push(fn);
}

function createEventDispatcher() {
	const component = current_component;

	return (type, detail) => {
		const callbacks = component.$$.callbacks[type];

		if (callbacks) {
			// TODO are there situations where events could be dispatched
			// in a server (non-DOM) environment?
			const event = custom_event(type, detail);
			callbacks.slice().forEach(fn => {
				fn.call(component, event);
			});
		}
	};
}

const dirty_components = [];

const resolved_promise = Promise.resolve();
let update_scheduled = false;
const binding_callbacks = [];
const render_callbacks = [];
const flush_callbacks = [];

function schedule_update() {
	if (!update_scheduled) {
		update_scheduled = true;
		resolved_promise.then(flush);
	}
}

function add_render_callback(fn) {
	render_callbacks.push(fn);
}

function flush() {
	const seen_callbacks = new Set();

	do {
		// first, call beforeUpdate functions
		// and update components
		while (dirty_components.length) {
			const component = dirty_components.shift();
			set_current_component(component);
			update(component.$$);
		}

		while (binding_callbacks.length) binding_callbacks.shift()();

		// then, once components are updated, call
		// afterUpdate functions. This may cause
		// subsequent updates...
		while (render_callbacks.length) {
			const callback = render_callbacks.pop();
			if (!seen_callbacks.has(callback)) {
				callback();

				// ...so guard against infinite loops
				seen_callbacks.add(callback);
			}
		}
	} while (dirty_components.length);

	while (flush_callbacks.length) {
		flush_callbacks.pop()();
	}

	update_scheduled = false;
}

function update($$) {
	if ($$.fragment) {
		$$.update($$.dirty);
		run_all($$.before_render);
		$$.fragment.p($$.dirty, $$.ctx);
		$$.dirty = null;

		$$.after_render.forEach(add_render_callback);
	}
}

let outros;

function group_outros() {
	outros = {
		remaining: 0,
		callbacks: []
	};
}

function check_outros() {
	if (!outros.remaining) {
		run_all(outros.callbacks);
	}
}

function on_outro(callback) {
	outros.callbacks.push(callback);
}

function mount_component(component, target, anchor) {
	const { fragment, on_mount, on_destroy, after_render } = component.$$;

	fragment.m(target, anchor);

	// onMount happens after the initial afterUpdate. Because
	// afterUpdate callbacks happen in reverse order (inner first)
	// we schedule onMount callbacks before afterUpdate callbacks
	add_render_callback(() => {
		const new_on_destroy = on_mount.map(run).filter(is_function);
		if (on_destroy) {
			on_destroy.push(...new_on_destroy);
		} else {
			// Edge case - component was destroyed immediately,
			// most likely as a result of a binding initialising
			run_all(new_on_destroy);
		}
		component.$$.on_mount = [];
	});

	after_render.forEach(add_render_callback);
}

function destroy(component, detaching) {
	if (component.$$) {
		run_all(component.$$.on_destroy);
		component.$$.fragment.d(detaching);

		// TODO null out other refs, including component.$$ (but need to
		// preserve final state?)
		component.$$.on_destroy = component.$$.fragment = null;
		component.$$.ctx = {};
	}
}

function make_dirty(component, key) {
	if (!component.$$.dirty) {
		dirty_components.push(component);
		schedule_update();
		component.$$.dirty = {};
	}
	component.$$.dirty[key] = true;
}

function init(component, options, instance, create_fragment, not_equal$$1, prop_names) {
	const parent_component = current_component;
	set_current_component(component);

	const props = options.props || {};

	const $$ = component.$$ = {
		fragment: null,
		ctx: null,

		// state
		props: prop_names,
		update: noop,
		not_equal: not_equal$$1,
		bound: blank_object(),

		// lifecycle
		on_mount: [],
		on_destroy: [],
		before_render: [],
		after_render: [],
		context: new Map(parent_component ? parent_component.$$.context : []),

		// everything else
		callbacks: blank_object(),
		dirty: null
	};

	let ready = false;

	$$.ctx = instance
		? instance(component, props, (key, value) => {
			if ($$.ctx && not_equal$$1($$.ctx[key], $$.ctx[key] = value)) {
				if ($$.bound[key]) $$.bound[key](value);
				if (ready) make_dirty(component, key);
			}
		})
		: props;

	$$.update();
	ready = true;
	run_all($$.before_render);
	$$.fragment = create_fragment($$.ctx);

	if (options.target) {
		if (options.hydrate) {
			$$.fragment.l(children(options.target));
		} else {
			$$.fragment.c();
		}

		if (options.intro && component.$$.fragment.i) component.$$.fragment.i();
		mount_component(component, options.target, options.anchor);
		flush();
	}

	set_current_component(parent_component);
}

class SvelteComponent {
	$destroy() {
		destroy(this, true);
		this.$destroy = noop;
	}

	$on(type, callback) {
		const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
		callbacks.push(callback);

		return () => {
			const index = callbacks.indexOf(callback);
			if (index !== -1) callbacks.splice(index, 1);
		};
	}

	$set() {
		// overridden by instance, if it has props
	}
}

/* src\Loading.svelte generated by Svelte v3.1.0 */

function add_css() {
	var style = element("style");
	style.id = 'svelte-1m5zham-style';
	style.textContent = ".modalr-loading.svelte-1m5zham{text-align:center;width:100%}.modalr-loading.svelte-1m5zham .modalr-loading-img.svelte-1m5zham{width:3rem;height:3rem}";
	append(document.head, style);
}

function create_fragment(ctx) {
	var div, img;

	return {
		c() {
			div = element("div");
			img = element("img");
			img.src = ctx.LoadingImage;
			img.alt = "加载中";
			img.className = "modalr-loading-img svelte-1m5zham";
			div.className = "modalr-loading svelte-1m5zham";
		},

		m(target, anchor) {
			insert(target, div, anchor);
			append(div, img);
		},

		p: noop,
		i: noop,
		o: noop,

		d(detaching) {
			if (detaching) {
				detach(div);
			}
		}
	};
}

function instance($$self) {
	const LoadingImage = `data:image/svg+xml;base64,PHN2ZyBjbGFzcz0ibGRzLWNhbWVyYSIgd2lkdGg9IjMycHgiICBoZWlnaHQ9IjMycHgiICB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJ4TWlkWU1pZCI+PGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoNTAsNTApIj4KPGcgdHJhbnNmb3JtPSJzY2FsZSgwLjcpIj4KPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTUwLC01MCkiPgo8ZyB0cmFuc2Zvcm09InJvdGF0ZSgyNzAuNzIgNTAgNTApIj4KICA8YW5pbWF0ZVRyYW5zZm9ybSBhdHRyaWJ1dGVOYW1lPSJ0cmFuc2Zvcm0iIHR5cGU9InJvdGF0ZSIgcmVwZWF0Q291bnQ9ImluZGVmaW5pdGUiIHZhbHVlcz0iMzYwIDUwIDUwOzAgNTAgNTAiIGtleVRpbWVzPSIwOzEiIGR1cj0iMXMiIGtleVNwbGluZXM9IjAuNSAwLjUgMC41IDAuNSIgY2FsY01vZGU9InNwbGluZSI+PC9hbmltYXRlVHJhbnNmb3JtPgogIDxwYXRoIGZpbGw9IiNmMDUxMjUiIGQ9Ik01NC4zLDI4LjFoMzQuMmMtNC41LTkuMy0xMi40LTE2LjctMjEuOS0yMC44TDQ1LjcsMjguMUw1NC4zLDI4LjFMNTQuMywyOC4xeiI+PC9wYXRoPgogIDxwYXRoIGZpbGw9IiNmZGI4MTMiIGQ9Ik02MS43LDcuM0M1MS45LDQsNDEuMSw0LjIsMzEuNSw4LjF2MjkuNWw2LjEtNi4xTDYxLjcsNy4zQzYxLjcsNy4zLDYxLjcsNy4zLDYxLjcsNy4zeiI+PC9wYXRoPgogIDxwYXRoIGZpbGw9IiM3ZmJiNDIiIGQ9Ik0yOC4xLDExLjZjLTkuMyw0LjUtMTYuNywxMi40LTIwLjgsMjEuOWwyMC44LDIwLjh2LTguNkwyOC4xLDExLjZDMjguMSwxMS42LDI4LjEsMTEuNiwyOC4xLDExLjZ6Ij48L3BhdGg+CiAgPHBhdGggZmlsbD0iIzMyYTBkYSIgZD0iTTMxLjUsNjIuNEw3LjMsMzguM2MwLDAsMCwwLDAsMEM0LDQ4LjEsNC4yLDU4LjksOC4xLDY4LjVoMjkuNUwzMS41LDYyLjR6Ij48L3BhdGg+CiAgPHBhdGggZmlsbD0iI2YwNTEyNSIgZD0iTTQ1LjcsNzEuOUgxMS41YzAsMCwwLDAsMCwwYzQuNSw5LjMsMTIuNCwxNi43LDIxLjksMjAuOGwyMC44LTIwLjhINDUuN3oiPjwvcGF0aD4KICA8cGF0aCBmaWxsPSIjZmRiODEzIiBkPSJNNjIuNCw2OC41TDM4LjMsOTIuNmMwLDAsMCwwLDAsMGM5LjgsMy40LDIwLjYsMy4xLDMwLjItMC44VjYyLjRMNjIuNCw2OC41eiI+PC9wYXRoPgogIDxwYXRoIGZpbGw9IiM3ZmJiNDIiIGQ9Ik03MS45LDQ1Ljd2OC42djM0LjJjMCwwLDAsMCwwLDBjOS4zLTQuNSwxNi43LTEyLjQsMjAuOC0yMS45TDcxLjksNDUuN3oiPjwvcGF0aD4KICA8cGF0aCBmaWxsPSIjMzJhMGRhIiBkPSJNOTEuOSwzMS41QzkxLjksMzEuNSw5MS45LDMxLjUsOTEuOSwzMS41bC0yOS41LDBsMCwwbDYuMSw2LjFsMjQuMSwyNC4xYzAsMCwwLDAsMCwwIEM5Niw1MS45LDk1LjgsNDEuMSw5MS45LDMxLjV6Ij48L3BhdGg+CjwvZz48L2c+PC9nPjwvZz48L3N2Zz4K`;

	return { LoadingImage };
}

class Loading extends SvelteComponent {
	constructor(options) {
		super();
		if (!document.getElementById("svelte-1m5zham-style")) add_css();
		init(this, options, instance, create_fragment, safe_not_equal, []);
	}
}

const createZIndexManager = () => {
  let index = 1000;
  return () => {
    index += 100;
    return index;
  };
};

const nextIndex = createZIndexManager();

/* src\ModalContainer.svelte generated by Svelte v3.1.0 */

function add_css$1() {
	var style = element("style");
	style.id = 'svelte-1nsld77-style';
	style.textContent = ".modalr-dialog-container.svelte-1nsld77{position:fixed;top:0;right:0;bottom:0;left:0;height:100vh;width:100%;overflow:hidden}.modalr-flex-container.svelte-1nsld77{display:flex;justify-items:center;align-items:center}.modalr-flex-container.svelte-1nsld77 .flex-item.svelte-1nsld77{flex:1}";
	append(document.head, style);
}

// (72:2) {:else}
function create_else_block(ctx) {
	var div;

	return {
		c() {
			div = element("div");
			div.id = ctx.contentWrapperId;
			div.className = "flex-item svelte-1nsld77";
			set_style(div, "z-index", ctx.clildZIndex);
		},

		m(target, anchor) {
			insert(target, div, anchor);
			div.innerHTML = ctx.content;
		},

		p(changed, ctx) {
			if (changed.content) {
				div.innerHTML = ctx.content;
			}

			if (changed.contentWrapperId) {
				div.id = ctx.contentWrapperId;
			}

			if (changed.clildZIndex) {
				set_style(div, "z-index", ctx.clildZIndex);
			}
		},

		i: noop,
		o: noop,

		d(detaching) {
			if (detaching) {
				detach(div);
			}
		}
	};
}

// (68:2) {#if isLoading}
function create_if_block(ctx) {
	var div, current;

	var loading = new Loading({});

	return {
		c() {
			div = element("div");
			loading.$$.fragment.c();
			div.className = "flex-item svelte-1nsld77";
			set_style(div, "z-index", ctx.clildZIndex);
		},

		m(target, anchor) {
			insert(target, div, anchor);
			mount_component(loading, div, null);
			current = true;
		},

		p(changed, ctx) {
			if (!current || changed.clildZIndex) {
				set_style(div, "z-index", ctx.clildZIndex);
			}
		},

		i(local) {
			if (current) return;
			loading.$$.fragment.i(local);

			current = true;
		},

		o(local) {
			loading.$$.fragment.o(local);
			current = false;
		},

		d(detaching) {
			if (detaching) {
				detach(div);
			}

			loading.$destroy();
		}
	};
}

function create_fragment$1(ctx) {
	var div, current_block_type_index, if_block, current, dispose;

	var if_block_creators = [
		create_if_block,
		create_else_block
	];

	var if_blocks = [];

	function select_block_type(ctx) {
		if (ctx.isLoading) return 0;
		return 1;
	}

	current_block_type_index = select_block_type(ctx);
	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

	return {
		c() {
			div = element("div");
			if_block.c();
			div.dataset.modalrId = ctx.id;
			div.className = "modalr-dialog-container modalr-flex-container svelte-1nsld77";
			set_style(div, "z-index", ctx.continerZIndex);
			set_style(div, "background-color", ctx.backgroundColor);
			dispose = listen(div, "click", ctx.handleModalContainerOnClick);
		},

		m(target, anchor) {
			insert(target, div, anchor);
			if_blocks[current_block_type_index].m(div, null);
			current = true;
		},

		p(changed, ctx) {
			var previous_block_index = current_block_type_index;
			current_block_type_index = select_block_type(ctx);
			if (current_block_type_index === previous_block_index) {
				if_blocks[current_block_type_index].p(changed, ctx);
			} else {
				group_outros();
				on_outro(() => {
					if_blocks[previous_block_index].d(1);
					if_blocks[previous_block_index] = null;
				});
				if_block.o(1);
				check_outros();

				if_block = if_blocks[current_block_type_index];
				if (!if_block) {
					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
					if_block.c();
				}
				if_block.i(1);
				if_block.m(div, null);
			}

			if (!current || changed.id) {
				div.dataset.modalrId = ctx.id;
			}

			if (!current || changed.continerZIndex) {
				set_style(div, "z-index", ctx.continerZIndex);
			}

			if (!current || changed.backgroundColor) {
				set_style(div, "background-color", ctx.backgroundColor);
			}
		},

		i(local) {
			if (current) return;
			if (if_block) if_block.i();
			current = true;
		},

		o(local) {
			if (if_block) if_block.o();
			current = false;
		},

		d(detaching) {
			if (detaching) {
				detach(div);
			}

			if_blocks[current_block_type_index].d();
			dispose();
		}
	};
}

function instance$1($$self, $$props, $$invalidate) {
	

    const dispatch = createEventDispatcher();

    let { id = "", content = null, config = {
      closeOnMark: true,
      isLoading: false,
      backgroundColor: "rgba(0, 0, 0, 0.25)",
      zindex: 10000
    } } = $$props;

    const handleModalContainerOnClose = ({ event, currentId }) => {
      if (event.target.dataset["modalrId"] != id) {
        return;
      }

      if (config.closeOnMark && currentId == id) {
        dispatch("destroy");
      }
    };

    const handleModalContainerOnClick = event =>
      handleModalContainerOnClose({ event, currentId: id });

    onMount(() => {
      config.zindex = nextIndex(); $$invalidate('config', config);
    });

	$$self.$set = $$props => {
		if ('id' in $$props) $$invalidate('id', id = $$props.id);
		if ('content' in $$props) $$invalidate('content', content = $$props.content);
		if ('config' in $$props) $$invalidate('config', config = $$props.config);
	};

	let continerZIndex, clildZIndex, backgroundColor, contentWrapperId, isLoading;
	$$self.$$.update = ($$dirty = { config: 1, id: 1 }) => {
		if ($$dirty.config) { $$invalidate('continerZIndex', continerZIndex = config.zindex); }
		if ($$dirty.config) { $$invalidate('clildZIndex', clildZIndex = config.zindex + 10); }
		if ($$dirty.config) { $$invalidate('backgroundColor', backgroundColor = config.backgroundColor || "rgba(0, 0, 0, 0.25)"); }
		if ($$dirty.id) { $$invalidate('contentWrapperId', contentWrapperId = `${id}-content-wrapper}`); }
		if ($$dirty.config) { $$invalidate('isLoading', isLoading = config.isLoading); }
	};

	return {
		id,
		content,
		config,
		handleModalContainerOnClick,
		continerZIndex,
		clildZIndex,
		backgroundColor,
		contentWrapperId,
		isLoading
	};
}

class ModalContainer extends SvelteComponent {
	constructor(options) {
		super();
		if (!document.getElementById("svelte-1nsld77-style")) add_css$1();
		init(this, options, instance$1, create_fragment$1, safe_not_equal, ["id", "content", "config"]);
	}
}

const noop$1 = function() {};

const defaultOptions = () => {
  return {
    closeOnMark: true,
    isLoading: false,
    backgroundColor: "rgba(0, 0, 0, 0.25)",
    onCloseCallback: noop$1,
    before: noop$1
  };
};

let dialogs = {};
let dialogIds = [];

const getDialogIdBuilder = () => {
  let index = 0;
  return () => {
    index += 1;
    const ts = new Date();
    const dialogId = `$modalr_layer_${index}_${ts.getTime()}`;

    dialogIds.push(dialogId);
    return dialogId;
  };
};

const nextDialogId = getDialogIdBuilder();

const target = document.body;

var modalr = {
  /**
   * 弹出
   * @param {HTMLElement} content 内容
   * @param {{closeOnMark: boolean, backgroundColor: string, onCloseCallback: () => void}} opts 选项
   */
  show(content, opts) {
    const opt = { ...defaultOptions(), ...opts };
    const { closeOnMark, onCloseCallback, before } = opt;

    const id = nextDialogId();

    if (opt.before) {
      opt.before();
    }

    const handle = new ModalContainer({
      target,
      props: {
        id,
        content,
        config: {
          closeOnMark
        }
      }
    });

    handle.$on("destroy", onCloseCallback);

    dialogs[id] = handle;

    return id;
  },

  /**
   * 按 handleId 关闭指定的弹出层
   * @param {*} id 弹出层 ID 号
   */
  close(id) {
    const handle = dialogs[id];

    if (handle && handle.$destroy) {
      handle.$destroy();
      dialogs[id] = null;
    }
  },

  closeLatest() {
    const lastId = dialogIds.pop();
    this.close(lastId);
  },

  /**
   * 关闭所有弹出层
   */
  closeAll() {
    Object.keys(dialogs).map(handleId => {
      const handle = dialogs[handleId];

      if (handle && handle.$destroy) {
        handle.$destroy();
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
      props: {
        config: {
          closeOnMark: false,
          isLoading: true,
          backgroundColor: "rgba(0, 0, 0, 0.05)"
        }
      }
    });

    handle.$on("destroy", onCloseCallback);

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

export default modalr;
