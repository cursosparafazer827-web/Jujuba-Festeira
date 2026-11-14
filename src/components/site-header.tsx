"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

type Props = { whatsapp: string };

export default function SiteHeader({ whatsapp }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const whatsappUrl = "https://wa.me/" + whatsapp;

  return (
    <header className="jf-header">
      <div className="container jf-header-inner">
        <Link
          href="/"
          aria-label="Jujuba Festeira — página inicial"
          className="jf-brand"
          onClick={() => setMenuOpen(false)}
        >
          <Image
            src="/images/jujuba-logo.png"
            alt="Jujuba Festeira — Papelaria Criativa"
            width={885}
            height={390}
            priority
            className="jf-brand-logo"
          />
        </Link>

        <button
          type="button"
          className="jf-menu-toggle"
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={menuOpen}
          aria-controls="jf-primary-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav
          id="jf-primary-navigation"
          className={`jf-navigation ${menuOpen ? "is-open" : ""}`}
          aria-label="Navegação principal"
        >
          <Link href="/" onClick={() => setMenuOpen(false)}>Início</Link>
          <a href="/#catalogo" onClick={() => setMenuOpen(false)}>Produtos</a>
          <a href={whatsappUrl} target="_blank" rel="noreferrer" onClick={() => setMenuOpen(false)}>
            Contacto
          </a>
          <a
            className="jf-header-cta"
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            onClick={() => setMenuOpen(false)}
          >
            Fazer encomenda
          </a>
        </nav>
      </div>
    </header>
  );
}
