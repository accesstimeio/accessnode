export default function H1({ content }: { content: string }) {
    return (
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
            {content}
        </h1>
    )
}
