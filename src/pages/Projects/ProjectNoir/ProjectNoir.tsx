import noirThumbnail from "../../../assets/images/project-noir-thumbnail.jpg";
import { BackLink,
    Chip,
    DashList,
    EofMarker,
    Marker,
    PhosphorImage,
    Prompt } from "../../../components/ui";
import ui from "../../../components/ui/ui.module.css";
import { NOIR, SITE } from "../../../data/site";

/** Project NOIR: the home server write-up. */
export default function ProjectNoir() {
    return (
        <article className={ui.readingPage}>
            <div className={ui.headerRow}>
                <Prompt>$ cat ~/projects/noir/README.md</Prompt>
                <BackLink to="/projects">← ~/projects</BackLink>
            </div>
            <PhosphorImage src={noirThumbnail} alt={NOIR.title} caption="header · 720×360 · noir.jpg" />
            <div className={ui.titleRow}>
                <div>
                    <h1 className={ui.pageTitle}># {NOIR.title}</h1>
                    <div className={ui.pageSub}>## {NOIR.sub}</div>
                </div>
                <Chip className={ui.titleChip}>{NOIR.state}</Chip>
            </div>
            <Marker left={NOIR.buildDate} right="build" />
            <div className={ui.reading}>
                <p>{NOIR.intro}</p>
                <p>
                    These are the specs of NOIR; you can look at it more in depth on its{" "}
                    <a href={NOIR.partsUrl} target="_blank" rel="noreferrer">
                        pc part picker
                    </a>
                    .
                </p>
                <DashList items={NOIR.specs} />
                <p>I did not need a dedicated GPU for what I wanted from NOIR so I opted for integrated Intel CPU graphics.</p>
                <p>
                    The build process was somewhat simple, aside from me not having HDD data sata cables ready at the
                    time of build. Somehow, it never occurred to me that a HDD needed a cable to power it and also
                    another cable to transmit data...
                </p>
                <p>
                    Post build process, there were two exhaust fans that were not spinning. Originally I thought it was
                    a compatibility issue with the fans&apos; 3 pin headers and Meshify&apos;s built in Nexus+ 2 Fan Hub.
                    Turns out I didn&apos;t plug in the Hub&apos;s PWM header into the MOBO...
                </p>
                <p>
                    This was also my first time installing and working with a Linux based OS (aside from VM projects in
                    university). TrueNAS feels great to use.
                </p>
                <p>Currently, I have the following running on NOIR.</p>
                <DashList items={NOIR.running} />
                <p>I thought to myself, wow is this really all I have on there? Yup.</p>
                <p>I considered Plex for media streaming, but I don&apos;t watch any shows or movies. Besides Arcane of course.</p>
                <p>
                    The build process was recorded, and I am in the process of compiling and editing the footage for
                    YouTube. ;)
                </p>
            </div>
            <Marker left={NOIR.updateDate} right="update" />
            <div className={ui.reading}>
                <p>{NOIR.update}</p>
            </div>
            <EofMarker>EOF · {SITE.owner}</EofMarker>
        </article>
    );
}
