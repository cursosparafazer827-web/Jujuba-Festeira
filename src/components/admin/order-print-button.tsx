"use client";

type OrderPrintButtonProps = { orderId: string };

export function OrderPrintButton({ orderId }: OrderPrintButtonProps) {
  function handlePrint() {
    const card = document.querySelector<HTMLElement>(`[data-order-card="${orderId}"]`);
    if (!card) return;

    const cleanup = () => {
      document.body.classList.remove("printing-order");
      card.removeAttribute("data-printing");
    };

    card.setAttribute("data-printing", "true");
    document.body.classList.add("printing-order");
    window.addEventListener("afterprint", cleanup, { once: true });
    window.print();
  }

  return (
    <button type="button" className="btn btn-light text-xs" onClick={handlePrint}>
      Imprimir encomenda
    </button>
  );
}
