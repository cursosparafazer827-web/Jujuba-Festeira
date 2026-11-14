"use client";

import Link from "next/link";

type Props = { whatsapp: string };

export default function SiteFooter({ whatsapp }: Props) {
  const whatsappUrl = "https://wa.me/" + whatsapp;

  return (
    <footer className="jf-site-footer">
      <div className="container jf-footer-grid">
        <div className="jf-footer-brand">
          <Link href="/" className="jf-footer-wordmark" aria-label="Jujuba Festeira — página inicial">
            Jujuba Festeira
          </Link>
          <p>Papelaria criativa e personalizada, feita com carinho para transformar momentos especiais em boas memórias.</p>
          <span className="jf-footer-signature">Pequenos detalhes, grandes celebrações. ✿</span>
        </div>

        <nav className="jf-footer-nav" aria-label="Links do rodapé">
          <h2>Explore</h2>
          <Link href="/">Início</Link>
          <Link href="/#catalogo">Os nossos produtos</Link>
          <a href={whatsappUrl} target="_blank" rel="noreferrer">Fale connosco</a>
        </nav>

        <div className="jf-footer-contact">
          <h2>Vamos conversar?</h2>
          <p>Estamos prontas para ajudar a dar vida à sua próxima celebração.</p>
          <a className="jf-footer-contact-link" href={whatsappUrl} target="_blank" rel="noreferrer">
            WhatsApp <span aria-hidden="true">↗</span>
          </a>
          <a className="jf-footer-contact-link" href="https://www.instagram.com/jujubapapel/" target="_blank" rel="noreferrer">
            Instagram @jujubapapel <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>

      <div className="container jf-footer-bottom">
        <span>© {new Date().getFullYear()} Jujuba Festeira. Todos os direitos reservados.</span>
        <a href={whatsappUrl} target="_blank" rel="noreferrer">Feito com carinho para celebrar ♡</a>
      </div>
    </footer>
  );
}
