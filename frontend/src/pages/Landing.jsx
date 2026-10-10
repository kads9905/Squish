import Navbar from "../components/landing/Navbar";
import Hero from "../components/landing/Hero";
import HowItWorks from "../components/landing/HowItWorks";
import Formats from "../components/landing/Formats";
import Faq from "../components/landing/Faq";
import CtaBand from "../components/landing/CtaBand";
import Footer from "../components/landing/Footer";

export default function Landing() {
  return (
    <div className="min-h-dvh overflow-x-clip bg-surface">
      <Navbar />
      <main>
        <Hero />
        <HowItWorks />
        <Formats />
        <Faq />
        <CtaBand />
      </main>
      <Footer />
    </div>
  );
}
