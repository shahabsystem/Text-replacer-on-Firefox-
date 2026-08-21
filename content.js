(() => {
  const SKIP = new Set(["SCRIPT","STYLE","NOSCRIPT","TEXTAREA","INPUT","SELECT","OPTION","BUTTON"]);
  let rules = [];
  let enabled = true;
  let observer = null;
  let busy = false;

  async function load() {
    const data = await browser.storage.local.get({enabled:true, rules:[]});
    enabled = data.enabled;
    rules = (data.rules || []).filter(r => r && r.from);
    applyAll();
  }

  function isAllowedTextNode(node) {
    if (!node.parentElement || SKIP.has(node.parentElement.tagName)) return false;
    if (node.parentElement.isContentEditable) return false;
    return true;
  }

  function replaceText(text) {
    let out = text;
    for (const r of rules) {
      if (r.enabled === false || !r.from) continue;
      if (r.caseSensitive) {
        out = out.split(r.from).join(r.to ?? "");
      } else {
        out = out.replace(new RegExp(escapeRegExp(r.from), "gi"), r.to ?? "");
      }
    }
    return out;
  }

  function escapeRegExp(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function process(root) {
    if (!enabled || busy) return;
    busy = true;
    try {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      const nodes=[];
      let n;
      while ((n=walker.nextNode())) if (isAllowedTextNode(n)) nodes.push(n);
      for (const node of nodes) {
        const next=replaceText(node.nodeValue);
        if (next !== node.nodeValue) node.nodeValue=next;
      }
    } finally { busy=false; }
  }

  function applyAll() {
    if (observer) observer.disconnect();
    if (!enabled) return;
    process(document.body || document.documentElement);
    observer = new MutationObserver(mutations => {
      for (const m of mutations) {
        for (const node of m.addedNodes) {
          if (node.nodeType === Node.TEXT_NODE && isAllowedTextNode(node)) {
            const next=replaceText(node.nodeValue);
            if(next!==node.nodeValue) node.nodeValue=next;
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            process(node);
          }
        }
      }
    });
    if (document.body) observer.observe(document.body,{childList:true,subtree:true});
  }

  browser.storage.onChanged.addListener(load);
  load();
})();