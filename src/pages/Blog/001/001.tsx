import post001Thumbnail from "../../../assets/images/post-001-thumbnail.jpg";
import { BackLink, Chip, EofMarker, Marker, PhosphorImage, Prompt } from "../../../components/ui";
import ui from "../../../components/ui/ui.module.css";
import { POSTS, SITE } from "../../../data/site";

const post = POSTS[0];

/** Blog post 001: Beginning anew. */
export default function Post001() {
    return (
        <article className={ui.readingPage}>
            <div className={ui.headerRow}>
                <Prompt>$ cat ~/blog/{post.id}.md</Prompt>
                <BackLink to="/blog">← ~/blog</BackLink>
            </div>
            <PhosphorImage src={post001Thumbnail} alt={post.title} caption={`header · 720×360 · ${post.id}.jpg`} />
            <div className={ui.titleRow}>
                <div>
                    <h1 className={ui.pageTitle}># {post.title}</h1>
                    <div className={ui.pageSub}>## {post.sub}</div>
                </div>
                <Chip className={ui.titleChip}>{post.id}</Chip>
            </div>
            <Marker left={post.date} right="entry" />
            <div className={ui.reading}>
                {post.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                ))}
            </div>
            <EofMarker>EOF · {SITE.owner}</EofMarker>
        </article>
    );
}
