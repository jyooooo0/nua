export default function Footer() {
    return (
        <footer className="w-full py-8 text-center text-xs text-foreground/40 bg-[#f2efe9]">
            &copy; {new Date().getFullYear()} nua. All rights reserved.
        </footer>
    );
}
