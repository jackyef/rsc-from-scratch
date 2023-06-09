import escapeHtml from  'escape-html';

export async function renderJSXToHTMLString(jsx) {
  if (typeof jsx === "string" || typeof jsx === "number") {
    // This is a string. Escape it and put it into HTML directly.
    return escapeHtml(jsx);
  } else if (jsx == null || typeof jsx === "boolean") {
    // This is an empty node. Don't emit anything in HTML for it.
    return "";
  } else if (Array.isArray(jsx)) {
    // This is an array of nodes. Render each into HTML and concatenate.
    const str = await Promise.all(jsx.map((child) => renderJSXToHTMLString(child)))
    return str.join("");
  } else if (typeof jsx === "object") {
    // Check if this object is a React JSX element (e.g. <div />).
    if (jsx.$$typeof === Symbol.for("react.element")) {
      // Turn it into an an HTML tag.
      if (typeof jsx.type === 'string') {
        // Ini HTML element biasa e.g.: 'div', 'html', dll.
        let html = "<" + jsx.type;
        if (jsx.props.dangerouslySetInnerHTML) {
          html += ">";
          html += jsx.props.dangerouslySetInnerHTML.__html;
          html += `</${jsx.type}>`
          return html
        }
      
        for (const propName in jsx.props) {
          if (jsx.props.hasOwnProperty(propName) && propName !== "children") {
            html += " ";
            html += propName;
            html += "=";
            html += escapeHtml(jsx.props[propName]);
          }
        }
        html += ">";
        html += await renderJSXToHTMLString(jsx.props.children);
        html += "</" + jsx.type + ">";
        return html;
      } else if (typeof jsx.type === 'function') {
        const Component = jsx.type;
        const props = jsx.props;
        const returnedJsx = await Component(props);

        return renderJSXToHTMLString(returnedJsx);
      } else {
        throw new Error("Not implemented.")
      }
    } else throw new Error("Cannot render an object.");
  } else throw new Error("Not implemented.");
}
