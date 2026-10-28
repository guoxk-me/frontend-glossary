// AI modified: retain a departing row's visual position while Vue moves the surviving rows.
export function retainLeavingRow(element: Element): void {
  if (!(element instanceof HTMLElement) || !element.parentElement)
    return
  const parent = element.parentElement
  const bounds = element.getBoundingClientRect()
  const parentBounds = parent.getBoundingClientRect()
  if (element.contains(document.activeElement)) {
    const sibling = [...parent.children].find(child => child !== element && !child.hasAttribute('inert'))
    const nextControl = sibling?.querySelector<HTMLElement>('a,button,input,[tabindex="0"]')
    parent.tabIndex = -1
    ;(nextControl ?? parent).focus({ preventScroll: true })
  }
  element.inert = true
  element.setAttribute('aria-hidden', 'true')
  Object.assign(element.style, {
    width: `${bounds.width}px`,
    height: `${bounds.height}px`,
    left: `${bounds.left - parentBounds.left + parent.scrollLeft - parent.clientLeft}px`,
    top: `${bounds.top - parentBounds.top + parent.scrollTop - parent.clientTop}px`,
    position: 'absolute',
  })
}
export function releaseLeavingRow(element: Element): void {
  if (!(element instanceof HTMLElement))
    return
  for (const property of [
    'width',
    'height',
    'left',
    'top',
    'position',
  ])
    element.style.removeProperty(property)
  element.inert = false
  element.removeAttribute('aria-hidden')
}
