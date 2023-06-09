import { createServer } from 'http';
import { readFile } from 'fs/promises';

import { renderJSXToHTMLString } from './renderJSXToHTML.js'

createServer(async (req, res) => {
  const author = "Jae Doe";
  const postContent = await readFile("./posts/hello-world.txt", "utf8");
  const jsx = (
    <html>
      <body>Hello world</body>
    </html>
  )
  const htmlString = renderJSXToHTMLString(jsx);
  sendHTML(
    res,
    htmlString
  );
}).listen(8080);

function sendHTML(res, html) {
  res.setHeader("Content-Type", "text/html");
  res.end(html);
}
