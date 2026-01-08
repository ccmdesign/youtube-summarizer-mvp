import { _ as __nuxt_component_0, u as useAsyncData, q as queryCollection } from './app-c_VwMdJF.mjs';
import { _ as __nuxt_component_0$1 } from './nuxt-link-wD1AYW9d.mjs';
import { defineComponent, ref, computed, withCtx, unref, createTextVNode, toDisplayString, createVNode, createBlock, createCommentVNode, openBlock, Fragment, renderList, resolveDynamicComponent, mergeProps, renderSlot, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderAttr, ssrRenderVNode, ssrRenderSlot } from 'vue/server-renderer';
import { _ as _export_sfc, a as useRouter } from './server.mjs';
import { format } from 'date-fns';
import { marked } from 'marked';
import 'perfect-debounce';
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

const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  ...{
    inheritAttrs: false
  },
  __name: "ccmButton",
  __ssrInlineRender: true,
  props: {
    // Structural props
    /** HTML tag to render when not using to/href. Defaults to 'button' for standard button behavior. */
    is: { type: String, default: "button" },
    /** Internal route for NuxtLink navigation. When provided, renders as NuxtLink component. */
    to: { type: [String, Object], default: null },
    /** External URL for anchor link. When provided, renders as <a> tag with href attribute. */
    href: { type: String, default: null },
    // Content props
    /** Button text label used as fallback when slot is empty. Takes precedence over slot content for accessibility. */
    label: { type: String, default: "" },
    // Visual props
    /** Button size following the s/m/l/xl scale. Controls padding and font size. Valid values: s, m, l, xl */
    size: { type: String, default: "m" },
    /** Color theme using semantic design tokens. Valid values: primary, secondary, base, accent, white, success, fail, warning, info */
    color: { type: String, default: "base" },
    /** Custom background color override using CSS custom property name (without -- prefix). Use 'transparent' for default behavior. */
    backgroundColor: { type: String, default: "transparent" },
    /** Visual style variant affecting appearance. Valid values: primary (filled), secondary (outlined), ghost (no border), link (text-only), unstyled (no styles) */
    variant: { type: String, default: "primary" },
    // Accessibility props
    /** Custom aria-label for screen readers. Overrides automatic label generation. Use for buttons with icon-only content. */
    ariaLabel: { type: String, default: null },
    /** Toggle button pressed state. Set to true/false for toggle buttons, null for non-toggle buttons. Controls aria-pressed attribute. */
    isPressed: { type: Boolean, default: null },
    /** Expandable button expanded state. Set to true/false for expandable buttons, null for non-expandable buttons. Controls aria-expanded attribute. */
    isExpanded: { type: Boolean, default: null },
    // Behavior props
    /** Disable the button and prevent all interactions. Sets aria-disabled and removes pointer events. */
    disabled: { type: Boolean, default: false }
  },
  setup(__props) {
    const props = __props;
    const componentTag = computed(() => {
      if (props.to) return __nuxt_component_0$1;
      if (props.href) return "a";
      return props.is;
    });
    const componentProps = computed(() => {
      if (props.to) {
        return { to: props.to };
      }
      if (props.href) {
        return { href: props.href };
      }
      return { disabled: props.disabled };
    });
    const cssVars = computed(() => {
      const vars = {};
      if (props.backgroundColor && props.backgroundColor !== "transparent") {
        vars["--_ccm-button-background-color"] = `var(--${props.backgroundColor})`;
      }
      return vars;
    });
    const router = useRouter();
    const resolvedHref = computed(() => {
      if (props.href) return props.href;
      if (props.to) {
        if (typeof props.to === "string") return props.to;
        try {
          return router.resolve(props.to).href;
        } catch {
          return null;
        }
      }
      return null;
    });
    function humanizeUrl(url) {
      try {
        const u = new URL(url, "http://example.local");
        const path = u.pathname || "";
        const last = path.split("/").filter(Boolean).pop() || u.hostname || "";
        const text = decodeURIComponent((last || "").replace(/[-_]+/g, " ").trim());
        if (!text) return "link";
        return text.charAt(0).toUpperCase() + text.slice(1);
      } catch {
        const fallback = decodeURIComponent((url || "").replace(/[-_]+/g, " ").trim());
        return fallback ? fallback.charAt(0).toUpperCase() + fallback.slice(1) : "link";
      }
    }
    const computedAriaLabel = computed(() => {
      if (props.ariaLabel) return props.ariaLabel;
      if (props.label) return props.label;
      const url = resolvedHref.value;
      return url ? `Go to ${humanizeUrl(url)}` : null;
    });
    const computedAriaPressed = computed(() => {
      return props.isPressed === null ? null : props.isPressed;
    });
    const computedAriaExpanded = computed(() => {
      return props.isExpanded === null ? null : props.isExpanded;
    });
    return (_ctx, _push, _parent, _attrs) => {
      ssrRenderVNode(_push, createVNode(resolveDynamicComponent(componentTag.value), mergeProps(componentProps.value, {
        class: "ccm-button",
        style: cssVars.value,
        "aria-label": computedAriaLabel.value,
        "aria-pressed": computedAriaPressed.value,
        "aria-expanded": computedAriaExpanded.value,
        "aria-disabled": __props.disabled || null,
        variant: __props.variant,
        color: __props.color,
        size: __props.size
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            ssrRenderSlot(_ctx.$slots, "default", {}, () => {
              _push2(`${ssrInterpolate(__props.label)}`);
            }, _push2, _parent2, _scopeId);
          } else {
            return [
              renderSlot(_ctx.$slots, "default", {}, () => [
                createTextVNode(toDisplayString(__props.label), 1)
              ], true)
            ];
          }
        }),
        _: 3
      }), _parent);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ds/molecules/ccmButton.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_1 = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$1, [["__scopeId", "data-v-9d23e570"]]), { __name: "CcmButton" });
const formatDate = (date, formatPattern = "MMM d, yyyy") => {
  try {
    const dateObj = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) {
      console.warn("Invalid date provided to formatDate:", date);
      return "Invalid Date";
    }
    return format(dateObj, formatPattern);
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid Date";
  }
};
function pick(obj, keys) {
  const result = {};
  for (const key of keys) {
    if (key in obj) result[key] = obj[key];
  }
  return result;
}
function getProp(obj, path) {
  return path.split(".").reduce((acc, key) => acc == void 0 ? acc : acc[key], obj);
}
function matchesWhere(doc, where) {
  if (typeof where === "function") return !!where(doc);
  for (const [k, v] of Object.entries(where)) {
    if (getProp(doc, k) !== v) return false;
  }
  return true;
}
function sortDocs(docs, sort) {
  if (!sort) return docs;
  const sorts = Array.isArray(sort) ? sort : [sort];
  return [...docs].sort((a, b) => {
    for (const s of sorts) {
      const direction = (s.order ?? "asc") === "asc" ? 1 : -1;
      const av = getProp(a, s.by);
      const bv = getProp(b, s.by);
      if (av == void 0 && bv == void 0) continue;
      if (av == void 0) return 1;
      if (bv == void 0) return -1;
      if (av < bv) return -1 * direction;
      if (av > bv) return 1 * direction;
    }
    return 0;
  });
}
function useContentStream(source, optionsOrPreset = {}) {
  const options = typeof optionsOrPreset === "string" ? presetToOptions(optionsOrPreset) : optionsOrPreset;
  const key = options.key ?? `content:${source}:${JSON.stringify({ ...options, key: void 0 })}`;
  const { data, pending, error, refresh } = useAsyncData(key, async () => {
    const isPath = source.startsWith("/");
    let docs = isPath ? await queryContent(source).find() : await queryCollection(source).all();
    if (!options.includeDrafts) {
      docs = docs.filter((d) => d.published !== false);
    }
    if (options.where) docs = docs.filter((d) => matchesWhere(d, options.where));
    if (options.sort) docs = sortDocs(docs, options.sort);
    if (options.select?.length) docs = docs.map((d) => pick(d, options.select));
    if (options.limit && options.limit > 0) docs = docs.slice(0, options.limit);
    return docs;
  }, "$Wa1w635gC_");
  return { data, pending, error, refresh };
}
function presetToOptions(preset) {
  switch (preset) {
    case "recency":
      return { sort: { by: "date", order: "desc" } };
    case "abc":
    case "alphabetical":
      return { sort: { by: "title", order: "asc" } };
    default:
      return {};
  }
}
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    marked.use({
      renderer: {
        paragraph(token) {
          return token.text;
        }
      }
    });
    const { data: summaries, pending, refresh: refreshSummaries } = useContentStream("summaries");
    const sortBy = ref("processedAt");
    const sortedSummaries = computed(() => {
      if (!summaries.value) return [];
      const sorted = [...summaries.value].sort((a, b) => {
        const aValue = a[sortBy.value];
        const bValue = b[sortBy.value];
        if (!aValue || !bValue) return 0;
        return bValue.localeCompare(aValue);
      });
      return sorted;
    });
    const isSyncing = ref(false);
    const syncStatus = ref("");
    const currentVideoTitle = ref("");
    const syncProgress = ref({ current: 0, total: 0 });
    const isLocalhost = computed(() => {
      return false;
    });
    async function handleSync() {
      isSyncing.value = true;
      syncStatus.value = "";
      currentVideoTitle.value = "";
      syncProgress.value = { current: 0, total: 0 };
      try {
        if (isLocalhost.value) {
          const response = await fetch("/api/sync-stream", { method: "POST" });
          const reader = response.body?.getReader();
          const decoder = new TextDecoder();
          if (!reader) {
            throw new Error("No response body");
          }
          let buffer = "";
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n\n");
            buffer = lines.pop() || "";
            for (const line of lines) {
              if (line.startsWith("data: ")) {
                try {
                  const event = JSON.parse(line.slice(6));
                  if (event.type === "processing") {
                    currentVideoTitle.value = event.videoTitle || "";
                    syncProgress.value = {
                      current: event.current || 0,
                      total: event.total || 0
                    };
                  } else if (event.type === "complete" && event.result) {
                    const result = event.result;
                    syncStatus.value = `Sync completed: ${result.processed} processed, ${result.skipped} skipped, ${result.failed} failed`;
                  } else if (event.type === "error") {
                    syncStatus.value = `Sync failed: ${event.error}`;
                  }
                } catch {
                }
              }
            }
          }
          await refreshSummaries();
        } else {
          const response = await fetch("/.netlify/functions/trigger-sync", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ maxVideos: 10 })
          });
          const data = await response.json();
          if (data.success) {
            syncStatus.value = data.message || "Sync triggered successfully!";
            if (data.note) {
              syncStatus.value += "\n\n" + data.note;
            }
          } else {
            syncStatus.value = `Sync failed: ${data.error || data.details || "Unknown error"}`;
          }
        }
      } catch (error) {
        syncStatus.value = `Sync failed: ${error instanceof Error ? error.message : String(error)}`;
      } finally {
        isSyncing.value = false;
        currentVideoTitle.value = "";
        syncProgress.value = { current: 0, total: 0 };
      }
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_ccm_section = __nuxt_component_0;
      const _component_ccm_button = __nuxt_component_1;
      const _component_nuxt_link = __nuxt_component_0$1;
      _push(ssrRenderComponent(_component_ccm_section, _attrs, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="stack" data-v-1915095d${_scopeId}><div class="sync-section" data-v-1915095d${_scopeId}>`);
            _push2(ssrRenderComponent(_component_ccm_button, {
              onClick: handleSync,
              disabled: unref(isSyncing),
              variant: "primary",
              color: "primary"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`${ssrInterpolate(unref(isSyncing) ? "Syncing..." : "Sync Playlist")}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(unref(isSyncing) ? "Syncing..." : "Sync Playlist"), 1)
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            if (unref(isSyncing)) {
              _push2(`<span class="sync-loading" data-v-1915095d${_scopeId}>${ssrInterpolate(unref(currentVideoTitle) || "Starting sync...")} `);
              if (unref(syncProgress).current && unref(syncProgress).total) {
                _push2(`<!--[--> (${ssrInterpolate(unref(syncProgress).current)}/${ssrInterpolate(unref(syncProgress).total)}) <!--]-->`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</span>`);
            } else {
              _push2(`<!---->`);
            }
            if (unref(syncStatus)) {
              _push2(`<p class="sync-status" data-v-1915095d${_scopeId}>${ssrInterpolate(unref(syncStatus))}</p>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</div><div class="header-row" data-v-1915095d${_scopeId}><h2 data-v-1915095d${_scopeId}>Video Summaries</h2><div class="sort-buttons" data-v-1915095d${_scopeId}>`);
            _push2(ssrRenderComponent(_component_ccm_button, {
              onClick: ($event) => sortBy.value = "publishedAt",
              variant: unref(sortBy) === "publishedAt" ? "primary" : "secondary",
              size: "m"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(` Sort by Video Date `);
                } else {
                  return [
                    createTextVNode(" Sort by Video Date ")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_ccm_button, {
              onClick: ($event) => sortBy.value = "processedAt",
              variant: unref(sortBy) === "processedAt" ? "primary" : "secondary",
              size: "m"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(` Sort by Recently Added `);
                } else {
                  return [
                    createTextVNode(" Sort by Recently Added ")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`</div></div>`);
            if (unref(sortedSummaries) && unref(sortedSummaries).length > 0) {
              _push2(`<ul class="summaries-list | stack" data-v-1915095d${_scopeId}><!--[-->`);
              ssrRenderList(unref(sortedSummaries), (summary) => {
                _push2(`<li class="summary-item"${ssrRenderAttr("to", `/summaries/${summary.videoId}`)}${ssrRenderAttr("title", summary.title)} data-v-1915095d${_scopeId}>`);
                if (summary.thumbnailUrl) {
                  _push2(`<img${ssrRenderAttr("src", summary.thumbnailUrl)}${ssrRenderAttr("alt", `Thumbnail for ${summary.title}`)} class="summary-thumb" loading="lazy" data-v-1915095d${_scopeId}>`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`<div class="summary-content" data-v-1915095d${_scopeId}><div class="summary-meta" data-v-1915095d${_scopeId}><span class="channel" data-v-1915095d${_scopeId}>${ssrInterpolate(summary.channel)}</span> | <span class="date" data-v-1915095d${_scopeId}>${ssrInterpolate(unref(formatDate)(summary.publishedAt))}</span> | <a${ssrRenderAttr("href", `https://www.youtube.com/watch?v=${summary.videoId}`)} target="_blank" rel="noopener" class="video-link" data-v-1915095d${_scopeId}>Watch on YouTube</a></div><h3 data-v-1915095d${_scopeId}>`);
                _push2(ssrRenderComponent(_component_nuxt_link, {
                  to: `/summaries/${summary.videoId}`
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`${ssrInterpolate(summary.title)}`);
                    } else {
                      return [
                        createTextVNode(toDisplayString(summary.title), 1)
                      ];
                    }
                  }),
                  _: 2
                }, _parent2, _scopeId));
                _push2(`</h3>`);
                if (summary.tldr) {
                  _push2(`<div class="tldr" data-v-1915095d${_scopeId}>${unref(marked).parse(summary.tldr) ?? ""}</div>`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`</div></li>`);
              });
              _push2(`<!--]--></ul>`);
            } else if (!unref(pending)) {
              _push2(`<p data-v-1915095d${_scopeId}>No summaries found</p>`);
            } else {
              _push2(`<p data-v-1915095d${_scopeId}>Loading...</p>`);
            }
            _push2(`</div>`);
          } else {
            return [
              createVNode("div", { class: "stack" }, [
                createVNode("div", { class: "sync-section" }, [
                  createVNode(_component_ccm_button, {
                    onClick: handleSync,
                    disabled: unref(isSyncing),
                    variant: "primary",
                    color: "primary"
                  }, {
                    default: withCtx(() => [
                      createTextVNode(toDisplayString(unref(isSyncing) ? "Syncing..." : "Sync Playlist"), 1)
                    ]),
                    _: 1
                  }, 8, ["disabled"]),
                  unref(isSyncing) ? (openBlock(), createBlock("span", {
                    key: 0,
                    class: "sync-loading"
                  }, [
                    createTextVNode(toDisplayString(unref(currentVideoTitle) || "Starting sync...") + " ", 1),
                    unref(syncProgress).current && unref(syncProgress).total ? (openBlock(), createBlock(Fragment, { key: 0 }, [
                      createTextVNode(" (" + toDisplayString(unref(syncProgress).current) + "/" + toDisplayString(unref(syncProgress).total) + ") ", 1)
                    ], 64)) : createCommentVNode("", true)
                  ])) : createCommentVNode("", true),
                  unref(syncStatus) ? (openBlock(), createBlock("p", {
                    key: 1,
                    class: "sync-status"
                  }, toDisplayString(unref(syncStatus)), 1)) : createCommentVNode("", true)
                ]),
                createVNode("div", { class: "header-row" }, [
                  createVNode("h2", null, "Video Summaries"),
                  createVNode("div", { class: "sort-buttons" }, [
                    createVNode(_component_ccm_button, {
                      onClick: ($event) => sortBy.value = "publishedAt",
                      variant: unref(sortBy) === "publishedAt" ? "primary" : "secondary",
                      size: "m"
                    }, {
                      default: withCtx(() => [
                        createTextVNode(" Sort by Video Date ")
                      ]),
                      _: 1
                    }, 8, ["onClick", "variant"]),
                    createVNode(_component_ccm_button, {
                      onClick: ($event) => sortBy.value = "processedAt",
                      variant: unref(sortBy) === "processedAt" ? "primary" : "secondary",
                      size: "m"
                    }, {
                      default: withCtx(() => [
                        createTextVNode(" Sort by Recently Added ")
                      ]),
                      _: 1
                    }, 8, ["onClick", "variant"])
                  ])
                ]),
                unref(sortedSummaries) && unref(sortedSummaries).length > 0 ? (openBlock(), createBlock("ul", {
                  key: 0,
                  class: "summaries-list | stack"
                }, [
                  (openBlock(true), createBlock(Fragment, null, renderList(unref(sortedSummaries), (summary) => {
                    return openBlock(), createBlock("li", {
                      class: "summary-item",
                      key: summary.videoId,
                      to: `/summaries/${summary.videoId}`,
                      title: summary.title
                    }, [
                      summary.thumbnailUrl ? (openBlock(), createBlock("img", {
                        key: 0,
                        src: summary.thumbnailUrl,
                        alt: `Thumbnail for ${summary.title}`,
                        class: "summary-thumb",
                        loading: "lazy"
                      }, null, 8, ["src", "alt"])) : createCommentVNode("", true),
                      createVNode("div", { class: "summary-content" }, [
                        createVNode("div", { class: "summary-meta" }, [
                          createVNode("span", { class: "channel" }, toDisplayString(summary.channel), 1),
                          createTextVNode(" | "),
                          createVNode("span", { class: "date" }, toDisplayString(unref(formatDate)(summary.publishedAt)), 1),
                          createTextVNode(" | "),
                          createVNode("a", {
                            href: `https://www.youtube.com/watch?v=${summary.videoId}`,
                            target: "_blank",
                            rel: "noopener",
                            class: "video-link"
                          }, "Watch on YouTube", 8, ["href"])
                        ]),
                        createVNode("h3", null, [
                          createVNode(_component_nuxt_link, {
                            to: `/summaries/${summary.videoId}`
                          }, {
                            default: withCtx(() => [
                              createTextVNode(toDisplayString(summary.title), 1)
                            ]),
                            _: 2
                          }, 1032, ["to"])
                        ]),
                        summary.tldr ? (openBlock(), createBlock("div", {
                          key: 0,
                          class: "tldr",
                          innerHTML: unref(marked).parse(summary.tldr)
                        }, null, 8, ["innerHTML"])) : createCommentVNode("", true)
                      ])
                    ], 8, ["to", "title"]);
                  }), 128))
                ])) : !unref(pending) ? (openBlock(), createBlock("p", { key: 1 }, "No summaries found")) : (openBlock(), createBlock("p", { key: 2 }, "Loading..."))
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-1915095d"]]);

export { index as default };
//# sourceMappingURL=index-LLi_hi8k.mjs.map
