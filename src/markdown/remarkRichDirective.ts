import { visit } from 'unist-util-visit';
import type { Root } from 'mdast';

/**
 * remark plugin: converts container/leaf directives (`:::chart … :::`) into a
 * `<richblock>` hast node carrying the type + raw body, so directives and fenced
 * code blocks funnel into the exact same RichBlock dispatcher.
 *
 * Convention for the directive body (documented in STANDARDS.md): put the block
 * payload in a nested ```` ```json ```` fence, e.g.
 *
 *   :::chart
 *   ```json
 *   { "type": "line", ... }
 *   ```
 *   :::
 *
 * If no fenced child is present, we fall back to concatenating the text content.
 */

interface DirectiveLikeNode {
  type: string;
  name?: string;
  attributes?: Record<string, string> | null;
  value?: string;
  children?: DirectiveLikeNode[];
  data?: {
    hName?: string;
    hProperties?: Record<string, unknown>;
  };
}

/** Recursively collect text/code payload as a raw string (fallback path). */
function collectRaw(node: DirectiveLikeNode): string {
  if (node.type === 'code' || node.type === 'text' || node.type === 'inlineCode') {
    return node.value ?? '';
  }
  if (!node.children) return '';
  return node.children.map(collectRaw).join('');
}

export function remarkRichDirective() {
  return (tree: Root): void => {
    visit(tree, (node) => {
      const n = node as unknown as DirectiveLikeNode;
      if (n.type !== 'containerDirective' && n.type !== 'leafDirective') {
        return;
      }

      const type = n.name ?? '';
      const codeChild = n.children?.find((c) => c.type === 'code');
      const raw = codeChild?.value ?? collectRaw(n);

      const data = n.data ?? (n.data = {});
      data.hName = 'richblock';
      data.hProperties = {
        richType: type,
        richRaw: raw,
        richAttrs: JSON.stringify(n.attributes ?? {}),
      };
      // Body has been captured into properties; don't also render the children.
      n.children = [];
    });
  };
}
