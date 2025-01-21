import Features from "@/components/Home/features";
import Footer from "@/components/Home/footer";
import Header from "@/components/Home/header";
import Hero from "@/components/Home/hero";
import Pricing from "@/components/Home/pricing";
import Statistics from "@/components/Home/statistics";
import Testimonials from "@/components/Home/testimonials";

export default function Home() {

  return (
    <main className="min-h-screen bg-[#0F0E0E] text-white">
      <Header />
      <Hero />
      <Features />
      <Statistics />
      <Pricing />
      <Testimonials />
      <Footer />
    </main>
  );
}
