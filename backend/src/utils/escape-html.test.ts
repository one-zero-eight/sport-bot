import { expect, it } from 'vitest'
import { escapeHtml } from './escape-html'

it('does not modify strings without HTML', () => {
  expect(escapeHtml('')).toBe('')
  expect(escapeHtml('Hello, world!')).toBe('Hello, world!')
})

it('escapes HTML', () => {
  expect(escapeHtml('<script>alert("Ha-ha!")</script>')).toBe('&lt;script&gt;alert("Ha-ha!")&lt;/script&gt;')
  expect(escapeHtml('1 < 2 & 3 > 4')).toBe('1 &lt; 2 &amp; 3 &gt; 4')
  expect(escapeHtml('<a href="https://fishing.url">FREE MONEY!</a>')).toBe('&lt;a href="https://fishing.url"&gt;FREE MONEY!&lt;/a&gt;')
})
