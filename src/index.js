import { createServer } from "http";
import { readFile, readdir} from "fs/promises";

import { renderJSXToHTMLString } from "./renderJSXToHTML.js";
import { BlogPostPage } from "./components/BlogPostPage.js";
import { BlogIndexPage } from "./components/BlogIndexPage.js";
import { BlogLayout } from "./components/BlogLayout.js";
import { renderJSXToClientJSX } from "./renderJSXToClientJSX.js";

createServer(async (req, res) => {
  const author = "Jae Doe";
  const url = new URL(req.url, `http://${req.headers.host}`);
  const clientScript = await readFile('./src/injectedScript.js', 'utf-8')
  
  if (url.pathname === '/client.js') {
    res.setHeader("Content-Type", "text/javascript");
    res.end(clientScript);
    return;
  }

  try {
    const jsx = await matchRoute(url);
    const clientJSX = await renderJSXToClientJSX(<BlogLayout>{jsx}</BlogLayout>)
    if (url.searchParams.has('jsx')) {
      console.log({ jsx })
      sendJSX(res, clientJSX)
    } else {
      sendHTML(res, jsx, clientJSX)
    }
  } catch (err) {
    console.error(err);
    res.statusCode = err.statusCode ?? 500;
    res.end();
  }
}).listen(8080);

async function sendHTML(res, jsx, clientJSX) {
  const html = await renderJSXToHTMLString(
    <BlogLayout>{jsx}</BlogLayout>
  )
  const clientJSXString = JSON.stringify(clientJSX, stringifyJSX);
  res.setHeader("Content-Type", "text/html");
  res.end(`
  <script type="importmap">
      {
        "imports": {
          "react": "https://esm.sh/react@canary",
          "react-dom/client": "https://esm.sh/react-dom@canary/client"
        }
      }
    </script>
  ${html}
  <script>
      window.__INITIAL_CLIENT_JSX_STRING__=${JSON.stringify(clientJSXString).replace(/</g, "\\u003c")};
  </script>
  
  `);
}

function stringifyJSX(key, value) {
  if (value === Symbol.for("react.element")) {
    // We can't pass a symbol, so pass our magic string instead.
    return "$RE"; // Could be arbitrary. I picked RE for React Element.
  } else if (typeof value === "string" && value.startsWith("$")) {
    // To avoid clashes, prepend an extra $ to any string already starting with $.
    return "$" + value;
  } else {
    return value;
  }
}

function sendJSX(res, jsx) {
  const json = JSON.stringify(jsx, stringifyJSX)
  res.setHeader("Content-Type", "application/json");
  res.end(json);
}


async function matchRoute(url) {
  if (url.pathname.includes('.')) {
    return;
  }

  if (url.pathname === "/") {
    // We're on the index route which shows every blog post one by one.
    // Read all the files in the posts folder, and load their contents.

    return <BlogIndexPage />;
  } else {
    // We're showing an individual blog post.
    // Read the corresponding file from the posts folder.
    const postSlug = url.pathname.slice(1)
    return <BlogPostPage postSlug={postSlug} />;
  }
}

function throwNotFound(cause) {
  const notFound = new Error("Not found.", { cause });
  notFound.statusCode = 404;
  throw notFound;
}
