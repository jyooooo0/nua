import Hero from "./components/Hero";
import Concept from "./components/Concept";
import Gallery from "./components/Gallery";
import Price from "./components/Price";
import Profile from "./components/Profile";
import Info from "./components/Info";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen w-full bg-background selection:bg-wood/20">
      <Hero />
      <Concept />
      <Gallery />
      <Price />
      <Profile />
      <Info />
      <Footer />
    </main>
  );
}
