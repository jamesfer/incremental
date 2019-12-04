// interface ElementTemplate {
//   tag: string;
//   attributes: { [k: string]: any };
//   children: ElementTemplate[];
// }
//
// function stringifyAttributes(element: Element, attributes: { [k: string]: any }): string {
//   return Object.keys(attributes).map(key => `${key}=${(element as any)[key]}`).join(' ');
// }
//
// function stringifyChildren(element: Element, template: ElementTemplate): string {
//   const ellipsis = element.children.length > template.children.length ? '...' : '';
//   const children = template.children.slice(0, element.children.length)
//     .map((child, index) => stringifyElement(element.children[index], child))
//     .join('\n');
//   return ellipsis
//     ? children
//       ? `${ellipsis}\n${children}`
//       : ellipsis
//     : children;
// }
//
// function stringifyElement(element: Element, template: ElementTemplate): string {
//   let elementTagName = element.tagName.toLowerCase();
//   const childrenLines = stringifyChildren(element, template);
//
//   if (childrenLines) {
//     const topLine = (
//       `<${elementTagName} ${stringifyAttributes(element, template.attributes)}>`
//     );
//     const bottomLine = `</${elementTagName}>`;
//     return `${topLine}\n${childrenLines}\n${bottomLine}`;
//   }
//
//   return `<${elementTagName} ${stringifyAttributes(element, template.attributes)} />`;
// }
//
// function checkElement(path: string, element: Element, template: ElementTemplate): boolean {
//   const elementTagName = element.tagName.toLowerCase();
//   if (elementTagName !== template.tag.toLowerCase()) {
//
//   }
// }
//
// expect.extend({
//   toMatchElement(received: Element, template: ElementTemplate) {
//     const pass = received >= floor && received <= ceiling;
//     if (pass) {
//     } else {
//       return {
//         message: () =>
//           `expected ${received} to be within range ${floor} - ${ceiling}`,
//         pass: false,
//       };
//     }
//   },
// });
