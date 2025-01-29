import Features from "@/components/Home/features";
import Footer from "@/components/Home/footer";
import Header from "@/components/Home/header";
import Hero from "@/components/Home/hero";
import Pricing from "@/components/Home/pricing";
import Testimonials from "@/components/Home/testimonials";

export default function Home() {

  return (
    <main className="min-h-screen dark text-foreground bg-background">
      <Header />
      <Hero />
      <Features />
      <Pricing />
      <Testimonials />
      <Footer />
    </main>
  );
}
