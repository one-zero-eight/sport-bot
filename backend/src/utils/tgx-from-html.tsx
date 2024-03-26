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

// console.log(
//   inspect(
//     tgxFromHtml(`<p>The club trains in the following areas: hiking, historical fencing, folk games and general physical training. For self-development it is desirable to attend at least 2 classes a week.</p>\r\n<p>&nbsp;</p>\r\n<p>We also organize events, such as flying in a hot air tube, origami folding or traditional tea parties.</p>\r\n<p>&nbsp;</p>\r\n<p>Hiking</p>\r\n<p>Monday 19:30 - 21:30 - In front of SC</p>\r\n<p>We are walking along the outskirts of Innopolis on rough terrain.</p>\r\n<p>&nbsp;</p>\r\n<p>Historical Fencing</p>\r\n<p>Tuesday 16:30 - 18:30 - Big hall (RAGE Knights)</p>\r\n<p>Thursday 17:00 - 18:30 - Big hall (RAGE Knights)</p>\r\n<p>We train in the art of swordsmanship with a one-handed sword and shield. This is where you get praise for beating a man with a stick)</p>\r\n<p>&nbsp;</p>\r\n<p>Folk Games</p>\r\n<p>Wednesday 19:30 - 21:30 - Outdoor Basketball court</p>\r\n<p>We are playing in a lot of games, which can play both girls and boys, like Lapta, or hide-and-seek, salki and so on.</p>\r\n<p>&nbsp;</p>\r\n<p>Workout</p>\r\n<p>Friday 21:00 - 22:30 - 232 SC</p>\r\n<p>General physical training. Working with your own weight and sometimes with a partner. Mostly circular training sessions.</p>\r\n<p>&nbsp;</p>\r\n<p>Club Fee</p>\r\n<p>For buying equipment and developing the club we are gathering club fee. 500 rub per month. First month is free.</p>\r\n<p>&nbsp;</p>\r\n<p>Telegram channels</p>\r\n<p><a href=\"https://t.me/dich_trainings\">General</a></p>\r\n<p><a href=\"https://t.me/rage_knights\">RAGE Knights</a></p>`),
//     { depth: null },
//   ),
// )
