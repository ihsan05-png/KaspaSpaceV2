import { Icon } from './icons';

interface ProductCardProps {
  className?: string;
  tag: string;
  title: string;
  desc: string;
  price: React.ReactNode;
  img: string;
}

function ProductCard({ className = '', tag, title, desc, price, img }: ProductCardProps) {
  return (
    <a className={`product-card ${className}`} href="#">
      <img src={img} alt={title} loading="lazy" />
      <div className="product-body">
        <span className="product-tag">{tag}</span>
        <h3 className="product-title">{title}</h3>
        <p className="product-desc">{desc}</p>
        <div className="product-foot">
          <span className="product-price">{price}</span>
          <span className="product-cta">Pesan <Icon.Arrow /></span>
        </div>
      </div>
    </a>
  );
}

export default function Products() {
  return (
    <section className="section" id="produk">
      <div className="container">
        <div className="product-head">
          <div>
            <span className="eyebrow">Produk Unggulan</span>
            <h2 className="section-title">Solusi Lengkap untuk <em>Bisnis Anda</em></h2>
            <p className="section-sub">
              Pilih layanan yang paling sesuai dengan kebutuhan tim Anda — dari share desk
              harian sampai virtual office prestige.
            </p>
          </div>
          <a className="btn btn-ghost" href="#">Lihat Semua <Icon.Arrow /></a>
        </div>

        <div className="product-grid">
          <ProductCard
            className="span-3 row-2 large"
            tag="Paling Populer"
            title="Coworking Space"
            desc="Hot desk, dedicated desk, dan ruang tim dengan internet 1 Gbps dan komunitas profesional."
            price={<>Mulai <strong>Rp 5.000</strong> / hari</>}
            img="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1400&q=80"
          />
          <ProductCard
            className="span-3"
            tag="Untuk Bisnis"
            title="Virtual Office"
            desc="Alamat bisnis prestige + layanan PKP & resepsionis profesional."
            price={<>Mulai <strong>Rp 350.000</strong> / bulan</>}
            img="https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=1200&q=80"
          />
          <ProductCard
            className="span-3"
            tag="Eksklusif"
            title="Private Office"
            desc="Kantor pribadi siap pakai untuk tim 4–20 orang, lengkap dengan furnitur, internet, dan keamanan 24/7."
            price={<>Mulai <strong>Rp 4.5jt</strong> / bulan</>}
            img="https://images.unsplash.com/photo-1604328698692-f76ea9498e76?auto=format&fit=crop&w=1200&q=80"
          />
          <ProductCard
            className="span-3"
            tag="Tim"
            title="Meeting Room"
            desc="Ruang rapat dengan layar interaktif, video conference, dan whiteboard untuk diskusi efektif."
            price={<>Mulai <strong>Rp 75.000</strong> / jam</>}
            img="https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=1200&q=80"
          />
          <ProductCard
            className="span-3"
            tag="Kuliner"
            title="Food & Beverage"
            desc="Kafe internal dengan menu kopi specialty, makanan sehat, dan diskon member sampai 20%."
            price={<>Diskon hingga <strong>20%</strong> untuk member</>}
            img="https://images.unsplash.com/photo-1559925393-8be0ec4767c8?auto=format&fit=crop&w=1200&q=80"
          />
        </div>
      </div>
    </section>
  );
}
