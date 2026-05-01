import Link from "next/link";

interface FooterProps {
  storeName?: string;
  phone?: string | null;
  email?: string | null;
  socialVk?: string | null;
  socialTg?: string | null;
}

export default function Footer({ storeName = "KRZME HOME", phone, email, socialVk, socialTg }: FooterProps) {
  const words = storeName.split(" ");
  const first = words[0];
  const rest = words.slice(1).join(" ");

  return (
    <footer className="bg-[#0d0d0d] border-t border-[#2a2a2a] mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          <div>
            <span className="text-lg font-bold tracking-widest uppercase text-white">
              {first}{rest && <span className="text-[#3b82f6]"> {rest}</span>}
            </span>
            <p className="mt-4 text-sm text-[#aaa] leading-relaxed">
              Товары для кухни и дома.<br />Доставка по всей России.
            </p>
            {(socialVk || socialTg) && (
              <div className="flex gap-2 mt-5">
                {socialVk && (
                  <a href={socialVk} className="w-9 h-9 border border-[#3a3a3a] hover:border-[#3b82f6] text-[#aaa] hover:text-[#3b82f6] rounded-lg flex items-center justify-center transition-colors text-xs font-bold">
                    VK
                  </a>
                )}
                {socialTg && (
                  <a href={socialTg} className="w-9 h-9 border border-[#3a3a3a] hover:border-[#3b82f6] text-[#aaa] hover:text-[#3b82f6] rounded-lg flex items-center justify-center transition-colors text-xs font-bold">
                    TG
                  </a>
                )}
              </div>
            )}
          </div>

          <div>
            <h4 className="text-xs font-semibold tracking-widest uppercase text-[#888] mb-5">Каталог</h4>
            <ul className="space-y-3 text-sm">
              {[
                { href: "/catalog", label: "Все товары" },
                { href: "/catalog?filter=new", label: "Новинки" },
                { href: "/catalog?filter=featured", label: "Хиты продаж" },
                { href: "/catalog?filter=sale", label: "Акции" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-[#aaa] hover:text-white transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold tracking-widest uppercase text-[#888] mb-5">Покупателям</h4>
            <ul className="space-y-3 text-sm">
              {[
                { href: "/account", label: "Личный кабинет" },
                { href: "/account/orders", label: "Мои заказы" },
                { href: "#delivery", label: "Доставка и оплата" },
                { href: "#returns", label: "Возврат товара" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <a href={href} className="text-[#aaa] hover:text-white transition-colors">{label}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold tracking-widest uppercase text-[#888] mb-5">Контакты</h4>
            <ul className="space-y-3 text-sm text-[#aaa]">
              {phone && <li>{phone}</li>}
              {email && <li>{email}</li>}
              <li>Пн–Пт 9:00–18:00</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#2a2a2a] mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#777]">
          <p>© {new Date().getFullYear()} {storeName}. Все права защищены.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Политика конфиденциальности</a>
            <a href="#" className="hover:text-white transition-colors">Оферта</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
