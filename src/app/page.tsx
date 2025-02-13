import HeaderPage from "@/components/landingPage/header";
import Information from "@/components/landingPage/information";
import Product from "@/components/landingPage/product";
import Project from "@/components/landingPage/project";
import Testimonials from "@/components/landingPage/testimonials";
import CTA from "@/components/landingPage/cta";
import BodyLandingPage from "@/components/landingPage/body";
import Footer from "@/components/landingPage/footer";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <HeaderPage />
      <Information />
      <Product />
      <Project />
      <Testimonials />
      <CTA />
      <BodyLandingPage />
      <Footer />
    </main>
  );
}