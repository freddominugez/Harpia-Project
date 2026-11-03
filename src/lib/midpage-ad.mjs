import { parseFragment } from 'parse5';

const ignored = new Set(['script', 'style', 'template', 'svg', 'math', 'aside']);
const atomic = new Set(['a', 'button', 'form', 'ul', 'ol', 'dl', 'table', 'pre', 'code', 'figure', 'details', 'select']);
const blocks = new Set(['p', 'div', 'section', 'article', 'h2', 'h3', 'h4', 'figure', 'ul', 'ol', 'table', 'nav', 'blockquote', 'a']);
const flowClasses = new Set(['article', 'prose', 'home-editorial', 'nart-texto', 'news-list', 'fontes-site']);

const hidden = node => ignored.has(node.tagName) || node.attrs?.some(attr => attr.name === 'hidden' || (attr.name === 'aria-hidden' && attr.value === 'true'));
const classes = node => (node.attrs?.find(attr => attr.name === 'class')?.value || '').split(/\s+/);
const isFlow = node => node.nodeName === '#document-fragment' || classes(node).some(name => flowClasses.has(name)) ||
  (node.tagName === 'div' && classes(node).every(name => ['container', 'wide'].includes(name)));

/** Find a block boundary near the middle of the reading, preserving the original HTML. */
export function midpageOffset(html) {
  const root = parseFragment(html, { sourceCodeLocationInfo: true });
  const candidates = [];
  let weight = 0;

  function visit(node, allowInsertion = true) {
    if (hidden(node)) return;
    if (node.nodeName === '#text') {
      weight += node.value.replace(/\s+/g, ' ').trim().length;
      return;
    }
    const allowChildren = allowInsertion && !atomic.has(node.tagName);
    let previous;
    for (const child of node.childNodes || []) {
      if (hidden(child)) continue;
      // Never separate a heading from its following paragraph or insert inside a grid/card.
      if (allowChildren && isFlow(node) && previous && !/^h[1-6]$/.test(previous.tagName) &&
          blocks.has(child.tagName) && child.sourceCodeLocation) {
        candidates.push({ offset: child.sourceCodeLocation.startOffset, weight });
      }
      visit(child, allowChildren);
      if (child.tagName) previous = child;
    }
  }
  visit(root);
  const middle = weight / 2;
  const valid = candidates.filter(candidate => candidate.weight > 0 && candidate.weight < weight);
  valid.sort((a, b) => Math.abs(a.weight - middle) - Math.abs(b.weight - middle));
  // A one-block page has no internal boundary: keep the banner after that complete block.
  return valid[0]?.offset ?? html.length;
}
