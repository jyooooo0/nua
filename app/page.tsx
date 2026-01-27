import Menu from "./components/Menu";
import Hero from "./components/Hero";
import Concept from "./components/Concept";
import Gallery from "./components/Gallery";
import Price from "./components/Price";
import Profile from "./components/Profile";
import Reservation from "./components/Reservation";
import Info from "./components/Info";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen w-full bg-background selection:bg-wood/20">
      <Menu />
      <div id="hero"><Hero /></div>
      <div id="concept"><Concept /></div>
      <div id="gallery"><Gallery /></div>
      <div id="price"><Price /></div>
      <div id="profile"><Profile /></div>
      <div id="reservation"><Reservation /></div>
      <div id="info"><Info /></div>
      <Footer />
    </main>
  );
}
