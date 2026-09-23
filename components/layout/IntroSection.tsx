"use client";

import { motion } from "framer-motion";

export default function IntroSection() {
  return (
    <section className="max-w-4xl mx-auto px-6 py-3xl">
      <motion.p
        className="font-heading text-2xl md:text-4xl leading-snug text-paper"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        Sabemos lo que vale tu equipo.{" "}
        <span className="text-muted">
          Por eso eliminamos la falta de transparencia del servicio técnico
          tradicional
        </span>
      </motion.p>
    </section>
  );
}
