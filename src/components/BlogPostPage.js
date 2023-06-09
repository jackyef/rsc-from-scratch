

import { readFile } from 'fs/promises'

export async function BlogPostPage({ postSlug }) {
  const postContent = await readFile("./posts/" + postSlug + ".txt", "utf8");

  return (
    <section>
      <h2>
        <a href={"/" + postSlug}>{postSlug}</a>
      </h2>
      <article>{postContent}</article>
    </section>
  );
}