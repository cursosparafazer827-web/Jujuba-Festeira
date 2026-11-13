"use client";

import { useMemo, useState } from "react";

type OrderStatsRow = {
  status: string;
  total_price_cents: number;
  product_name: string;
  quantity: number;
  order_date: string;
};

type Props = {
  orders: OrderStatsRow[];
  error?: boolean;
};

type Period = "today" | "7days" | "month" | "all";

const money = (cents: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);

const periodLabels: Record<Period, string> = {
  today: "Hoje",
  "7days": "Últimos 7 dias",
  month: "Este mês",
  all: "Todas as encomendas",
};

export default function OrderStatistics({ orders, error = false }: Props) {
  const [period, setPeriod] = useState<Period>("all");

  const filteredOrders = useMemo(() => {
    if (period === "all") return orders;

    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (period === "7days") {
      start.setDate(start.getDate() - 6);
    } else if (period === "month") {
      start.setDate(1);
    }

    return orders.filter((order) => {
      const orderDate = new Date(order.order_date);
      return !Number.isNaN(orderDate.getTime()) && orderDate >= start && orderDate <= now;
    });
  }, [orders, period]);

  if (error) {
    return (
      <section className="panel mb-8">
        <h2 className="text-xl font-black">Estatísticas de encomendas</h2>
        <p className="mt-2 text-sm text-red-700">Não foi possível carregar as estatísticas. As restantes funções do painel continuam disponíveis.</p>
      </section>
    );
  }

  const pending = filteredOrders.filter((order) => order.status === "Pendente").length;
  const completed = filteredOrders.filter((order) => order.status === "Concluída" || order.status === "Entregue").length;
  const totalValue = filteredOrders.reduce(
    (sum, order) => sum + (order.status === "Cancelada" ? 0 : order.total_price_cents),
    0,
  );

  const productTotals = new Map<string, number>();
  for (const order of filteredOrders) {
    if (order.status === "Cancelada") continue;
    productTotals.set(order.product_name, (productTotals.get(order.product_name) || 0) + order.quantity);
  }
  const popularProducts = Array.from(productTotals.entries())
    .map(([name, quantity]) => ({ name, quantity }))
    .sort((a, b) => b.quantity - a.quantity || a.name.localeCompare(b.name, "pt-BR"))
    .slice(0, 5);

  const cards = [
    { label: "Total de encomendas", value: String(filteredOrders.length), detail: "Todos os estados" },
    { label: "Pendentes", value: String(pending), detail: "Aguardam confirmação" },
    { label: "Concluídas", value: String(completed), detail: "Concluídas ou entregues" },
    { label: "Valor total", value: money(totalValue), detail: "Sem encomendas canceladas" },
  ];

  return (
    <section className="mb-8">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-black">Resumo das encomendas</h2>
          <p className="muted mt-1 text-sm">Estatísticas atualizadas com os registos do painel.</p>
        </div>
        <label className="flex flex-col gap-1 text-sm font-semibold">
          Período das estatísticas
          <select
            value={period}
            onChange={(event) => setPeriod(event.target.value as Period)}
            className="rounded-xl border border-pink-200 bg-white px-3 py-2 text-sm"
          >
            {Object.entries(periodLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>
      </div>
      <p className="muted mb-3 text-xs">A mostrar: {periodLabels[period].toLowerCase()}.</p>
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
        <p className="muted mt-1 text-xs">Classificação pela quantidade de unidades em encomendas não canceladas neste período.</p>
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
          <p className="muted mt-3 text-sm">Não existem encomendas neste período para criar uma classificação.</p>
        )}
      </div>
      <p className="muted mt-2 text-xs">O valor apresentado é o total registado nas encomendas, não representa necessariamente pagamentos já recebidos.</p>
    </section>
  );
}
