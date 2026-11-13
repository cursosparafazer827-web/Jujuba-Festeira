type OrderStatsRow = {
  status: string;
  total_price_cents: number;
  product_name: string;
  quantity: number;
};

type Props = {
  orders: OrderStatsRow[];
  error?: boolean;
};

const money = (cents: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);

export default function OrderStatistics({ orders, error = false }: Props) {
  if (error) {
    return (
      <section className="panel mb-8">
        <h2 className="text-xl font-black">Estatísticas de encomendas</h2>
        <p className="mt-2 text-sm text-red-700">Não foi possível carregar as estatísticas. As restantes funções do painel continuam disponíveis.</p>
      </section>
    );
  }

  const pending = orders.filter((order) => order.status === "Pendente").length;
  const completed = orders.filter((order) => order.status === "Concluída" || order.status === "Entregue").length;
  const totalValue = orders.reduce(
    (sum, order) => sum + (order.status === "Cancelada" ? 0 : order.total_price_cents),
    0,
  );

  const productTotals = new Map<string, number>();
  for (const order of orders) {
    if (order.status === "Cancelada") continue;
    productTotals.set(order.product_name, (productTotals.get(order.product_name) || 0) + order.quantity);
  }
  const popularProducts = Array.from(productTotals.entries())
    .map(([name, quantity]) => ({ name, quantity }))
    .sort((a, b) => b.quantity - a.quantity || a.name.localeCompare(b.name, "pt-BR"))
    .slice(0, 5);

  const cards = [
    { label: "Total de encomendas", value: String(orders.length), detail: "Todos os estados" },
    { label: "Pendentes", value: String(pending), detail: "Aguardam confirmação" },
    { label: "Concluídas", value: String(completed), detail: "Concluídas ou entregues" },
    { label: "Valor total", value: money(totalValue), detail: "Sem encomendas canceladas" },
  ];

  return (
    <section className="mb-8">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-xl font-black">Resumo das encomendas</h2>
          <p className="muted mt-1 text-sm">Estatísticas atualizadas com os registos do painel.</p>
        </div>
        <span className="pill">Atualizado ao abrir o painel</span>
      </div>
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {cards.map((card) => (
          <article key={card.label} className="rounded-2xl border border-pink-100 bg-white p-4 shadow-sm">
            <p className="muted text-xs font-semibold">{card.label}</p>
            <p className="mt-2 break-words text-2xl font-black text-berry">{card.value}</p>
            <p className="muted mt-1 text-xs">{card.detail}</p>
          </article>
        ))}
      </div>
      <div className="panel mt-4">
        <h3 className="font-black">Produtos mais pedidos</h3>
        <p className="muted mt-1 text-xs">Classificação pela quantidade de unidades em encomendas não canceladas.</p>
        {popularProducts.length ? (
          <ol className="mt-4 grid gap-3 sm:grid-cols-2">
            {popularProducts.map((product, index) => (
              <li key={product.name} className="flex items-center justify-between gap-3 rounded-xl bg-pink-50/60 px-3 py-3">
                <span className="min-w-0">
                  <span className="mr-2 font-black text-berry">{index + 1}.</span>
                  <span className="font-semibold">{product.name}</span>
                </span>
                <span className="shrink-0 text-sm font-bold">{product.quantity} un.</span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="muted mt-3 text-sm">Ainda não existem encomendas válidas para criar uma classificação.</p>
        )}
      </div>
      <p className="muted mt-2 text-xs">O valor apresentado é o total registado nas encomendas, não representa necessariamente pagamentos já recebidos.</p>
    </section>
  );
}
