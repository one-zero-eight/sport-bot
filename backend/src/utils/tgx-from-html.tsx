import type { TgxElement } from '@telegum/tgx'
import { JSDOM } from 'jsdom'

export function tgxFromHtml(raw: string): TgxElement {
  const dom = new JSDOM(raw)
  return tgxFromNode(dom.window.document.documentElement)
}

function tgxFromNode(node: ChildNode): TgxElement {
  switch (node.nodeType) {
    case node.TEXT_NODE:
      return <>{node.textContent}</>
    case node.ELEMENT_NODE:
      switch ((node as Element).tagName) {
        case 'P':
          return (
            <>
              {Array.from(node.childNodes).map(tgxFromNode)}
              <br />
            </>
          )
        case 'A':
          return <a href={(node as HTMLAnchorElement).href}>{Array.from(node.childNodes).map(tgxFromNode)}</a>
        case 'B':
        case 'STRONG':
          return <b>{Array.from(node.childNodes).map(tgxFromNode)}</b>
        case 'I':
          return <i>{Array.from(node.childNodes).map(tgxFromNode)}</i>
        case 'U':
          return <u>{Array.from(node.childNodes).map(tgxFromNode)}</u>
        case 'S':
        case 'DEL':
        case 'STRIKE':
          return <s>{Array.from(node.childNodes).map(tgxFromNode)}</s>
        case 'BR':
          return <br />
        default:
          return <>{Array.from(node.childNodes).map(tgxFromNode)}</>
      }
  }
  return <></>
}
