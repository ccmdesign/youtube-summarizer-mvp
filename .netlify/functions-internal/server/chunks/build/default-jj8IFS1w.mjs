import { _ as __nuxt_component_0$3 } from './nuxt-link-wD1AYW9d.mjs';
import { computed, mergeProps, unref, toRef, isRef, defineComponent, withCtx, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderSlot, ssrInterpolate } from 'vue/server-renderer';
import { c as useRoute, u as useNuxtApp, _ as _export_sfc } from './server.mjs';
import '../nitro/nitro.mjs';
import 'zod';
import 'winston';
import 'path';
import 'fs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'better-sqlite3';
import 'vue-router';

const useStateKeyPrefix = "$s";
function useState(...args) {
  const autoKey = typeof args[args.length - 1] === "string" ? args.pop() : void 0;
  if (typeof args[0] !== "string") {
    args.unshift(autoKey);
  }
  const [_key, init] = args;
  if (!_key || typeof _key !== "string") {
    throw new TypeError("[nuxt] [useState] key must be a string: " + _key);
  }
  if (init !== void 0 && typeof init !== "function") {
    throw new Error("[nuxt] [useState] init must be a function: " + init);
  }
  const key = useStateKeyPrefix + _key;
  const nuxtApp = useNuxtApp();
  const state = toRef(nuxtApp.payload.state, key);
  if (state.value === void 0 && init) {
    const initialValue = init();
    if (isRef(initialValue)) {
      nuxtApp.payload.state[key] = initialValue;
      return initialValue;
    }
    state.value = initialValue;
  }
  return state;
}
const _sfc_main$4 = /* @__PURE__ */ defineComponent({
  ...{
    inheritAttrs: false
  },
  __name: "ccmTopbar",
  __ssrInlineRender: true,
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      const _component_nuxt_link = __nuxt_component_0$3;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "topbar | cluster" }, _attrs))} data-v-6bdb9258><h1 class="topbar__title | h3" data-v-6bdb9258>`);
      ssrRenderSlot(_ctx.$slots, "logo", {}, () => {
        _push(ssrRenderComponent(_component_nuxt_link, { to: "/" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`site name`);
            } else {
              return [
                createTextVNode("site name")
              ];
            }
          }),
          _: 1
        }, _parent));
      }, _push, _parent);
      _push(`</h1><nav role="navigation" class="margin-left:auto" data-v-6bdb9258><ul class="menu | cluster" data-v-6bdb9258><li data-v-6bdb9258>`);
      _push(ssrRenderComponent(_component_nuxt_link, {
        class: "menu__item",
        to: "/"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Home`);
          } else {
            return [
              createTextVNode("Home")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</li><li data-v-6bdb9258>`);
      _push(ssrRenderComponent(_component_nuxt_link, {
        class: "menu__item",
        to: "/blog"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Insights`);
          } else {
            return [
              createTextVNode("Insights")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</li><li data-v-6bdb9258>`);
      _push(ssrRenderComponent(_component_nuxt_link, {
        class: "menu__item",
        to: "/docs"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Docs`);
          } else {
            return [
              createTextVNode("Docs")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</li><li data-v-6bdb9258>`);
      _push(ssrRenderComponent(_component_nuxt_link, {
        class: "menu__item",
        to: "/test"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Test`);
          } else {
            return [
              createTextVNode("Test")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</li></ul></nav></div>`);
    };
  }
});
const _sfc_setup$4 = _sfc_main$4.setup;
_sfc_main$4.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ds/molecules/ccmTopbar.vue");
  return _sfc_setup$4 ? _sfc_setup$4(props, ctx) : void 0;
};
const __nuxt_component_0$2 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$4, [["__scopeId", "data-v-6bdb9258"]]), { __name: "CcmTopbar" });
const _sfc_main$3 = /* @__PURE__ */ defineComponent({
  ...{
    inheritAttrs: false
  },
  __name: "ccmHero",
  __ssrInlineRender: true,
  props: {
    // Content props
    /** Optional eyebrow text displayed above the main title. Renders as h4 when provided. */
    brow: {
      type: String,
      default: ""
    },
    /** Main hero heading text. Renders as h1 when provided. Falls back to default slot if not provided. */
    title: {
      type: String,
      default: ""
    },
    /** Supporting tagline text displayed below the title. Renders as h3 when provided. */
    tagline: {
      type: String,
      default: ""
    },
    // Visual props
    /** Custom background color using CSS custom property name (without -- prefix). Overrides default background. */
    backgroundColor: {
      type: String,
      default: ""
    },
    /** Padding size following the s/m/l/xl scale. Controls vertical padding via --space-{size} token. Valid values: s, m, l, xl */
    size: {
      type: String,
      default: "l"
    },
    /** Layout variant affecting aspect ratio and height. Valid values: default (16:7 aspect), minimal (auto height), full-screen (100vh) */
    variant: {
      type: String,
      default: "default",
      validator: (value) => ["default", "minimal", "full-screen"].includes(value)
    },
    // Behavior props
    /** Hide the top section (top-bar and top slots). When true, top navigation and related content is hidden. */
    hideTop: {
      type: Boolean,
      default: false
    },
    /** Hide the bottom section (bottom slot). When true, bottom metadata and CTAs are hidden. Defaults to true. */
    hideBottom: {
      type: Boolean,
      default: true
    }
  },
  setup(__props) {
    const props = __props;
    const cssVars = computed(() => {
      const vars = {};
      if (props.backgroundColor) {
        vars["--_ccm-hero-background-color"] = `var(--${props.backgroundColor})`;
      }
      vars["--_ccm-hero-padding-block"] = `var(--space-${props.size})`;
      return vars;
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_ccm_topbar = __nuxt_component_0$2;
      _push(`<header${ssrRenderAttrs(mergeProps({
        class: "ccm-hero",
        role: "banner",
        variant: __props.variant,
        "hide-top": __props.hideTop,
        "hide-bottom": __props.hideBottom,
        style: cssVars.value
      }, _attrs))} data-v-f5fdb1f6><div class="ccm-hero__top | center" data-v-f5fdb1f6>`);
      ssrRenderSlot(_ctx.$slots, "top-bar", {}, () => {
        _push(ssrRenderComponent(_component_ccm_topbar, null, null, _parent));
      }, _push, _parent);
      ssrRenderSlot(_ctx.$slots, "top", {}, null, _push, _parent);
      _push(`</div><div class="ccm-hero__main | center" data-v-f5fdb1f6>`);
      ssrRenderSlot(_ctx.$slots, "default", {}, () => {
        _push(`<hgroup data-v-f5fdb1f6>`);
        if (__props.brow) {
          _push(`<h4 data-v-f5fdb1f6>${ssrInterpolate(__props.brow)}</h4>`);
        } else {
          _push(`<!---->`);
        }
        if (__props.title) {
          _push(`<h1 data-v-f5fdb1f6>${ssrInterpolate(__props.title)}</h1>`);
        } else {
          _push(`<!---->`);
        }
        if (__props.tagline) {
          _push(`<h3 data-v-f5fdb1f6>${ssrInterpolate(__props.tagline)}</h3>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</hgroup>`);
      }, _push, _parent);
      _push(`</div>`);
      if (!__props.hideBottom) {
        _push(`<div class="ccm-hero__bottom | center" data-v-f5fdb1f6>`);
        ssrRenderSlot(_ctx.$slots, "bottom", {}, null, _push, _parent);
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</header>`);
    };
  }
});
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ds/organisms/ccmHero.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const __nuxt_component_0$1 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$3, [["__scopeId", "data-v-f5fdb1f6"]]), { __name: "CcmHero" });
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  ...{
    inheritAttrs: false
  },
  __name: "ccmByLine",
  __ssrInlineRender: true,
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "by-line | cluster" }, _attrs))} data-v-43d45916><span data-v-43d45916>© ${ssrInterpolate((/* @__PURE__ */ new Date()).getFullYear())} CCM Design</span><a href="#" class="margin-left:auto" data-v-43d45916>by ccm.design</a></div>`);
    };
  }
});
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ds/organisms/ccmByLine.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const __nuxt_component_0 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$2, [["__scopeId", "data-v-43d45916"]]), { __name: "CcmByLine" });
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  ...{
    inheritAttrs: false
  },
  __name: "ccmFooter",
  __ssrInlineRender: true,
  props: {
    // Visual props
    /**
     * Background color token name (without var()). When provided, the footer
     * background will use the CSS variable `--<token>` via `var(--<token>)`.
     * Examples: `color-neutral-950`, `color-primary-tint-20`.
     * Default `transparent` leaves background unchanged.
     */
    backgroundColor: {
      type: String,
      default: "transparent"
    },
    /**
     * Vertical padding size scale applied via CSS variables.
     * Valid values: `xs`, `s`, `m`, `l`, `xl`, `2xl`, `3xl`.
     */
    size: {
      type: String,
      default: "l"
    }
  },
  setup(__props) {
    const props = __props;
    const cssVars = computed(() => {
      const vars = {};
      if (props.backgroundColor && props.backgroundColor !== "transparent") {
        vars["--_ccm-footer-background-color"] = `var(--${props.backgroundColor})`;
      }
      return vars;
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_ccm_by_line = __nuxt_component_0;
      _push(`<footer${ssrRenderAttrs(mergeProps({
        class: "ccm-footer",
        role: "contentinfo",
        size: __props.size,
        style: cssVars.value
      }, _attrs))} data-v-969646d0><div class="ccm-footer-container | center" data-v-969646d0><h1 data-v-969646d0>Footer</h1>`);
      _push(ssrRenderComponent(_component_ccm_by_line, null, null, _parent));
      _push(`</div></footer>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ds/organisms/ccmFooter.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_1 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$1, [["__scopeId", "data-v-969646d0"]]), { __name: "CcmFooter" });
const _sfc_main = {
  __name: "default",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute();
    const heroState = useState("hero", () => null);
    const hero = computed(() => route.meta.hero || heroState.value);
    const footer = computed(() => route.meta.footer ?? true);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_ccm_hero = __nuxt_component_0$1;
      const _component_ccm_footer = __nuxt_component_1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "layout" }, _attrs))}>`);
      if (unref(hero)) {
        _push(ssrRenderComponent(_component_ccm_hero, {
          class: "layout-hero",
          brow: unref(hero).brow,
          title: unref(hero).title,
          tagline: unref(hero).tagline,
          "background-color": unref(hero).backgroundColor,
          size: unref(hero).size || "l",
          hideTop: unref(hero).hideTop === true
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`<main class="layout-main">`);
      ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      _push(`</main>`);
      if (unref(footer)) {
        _push(ssrRenderComponent(_component_ccm_footer, { class: "layout-footer" }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("layouts/default.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=default-jj8IFS1w.mjs.map
