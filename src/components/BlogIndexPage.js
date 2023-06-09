import { readdir, readFile } from 'fs/promises'

export async function BlogIndexPage() {
  const postFiles = await readdir("./posts");
  const postSlugs = postFiles.map((file) => file.slice(0, file.lastIndexOf(".")));
  const postContents = await Promise.all(
    postSlugs.map((postSlug) =>
      readFile("./posts/" + postSlug + ".txt", "utf8")
    )
  );
    return (
      <section>
        <h1>Welcome to my blog</h1>
        <div>
          {postSlugs.map((postSlug, index) => (
            <section key={postSlug}>
              <h2>
                <a href={"/" + postSlug}>{postSlug}</a>
              </h2>
              <article>{postContents[index]}</article>
            </section>
          ))}
        </div>
      </section>
    );
  }