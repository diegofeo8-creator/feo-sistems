import SocialLinks from "./SocialLinks";

export default function SocialSection() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-10 sm:py-12 text-center">
      <h2 className="font-heading font-bold text-paper text-2xl sm:text-3xl mb-6">
        Seguí el proyecto
      </h2>
      <SocialLinks variant="row" />
    </section>
  );
}
