import { readFile } from "fs/promises";
import { Footer } from "./Footer.js";

export async function BlogLayout({ children }) {
    const author = "Jae Doe";
 
    return (
      <html>
        <head>
          <title>My blog</title>
          <script type="module" src="/client.js"></script>
        </head>
        <body> 
          <input />
          <nav>
            <a href="/">Home</a>
            <hr />
          </nav>
          <main>
            {children}
          </main>
          <Footer author={author} />
        </body>
      </html>
    );
  }