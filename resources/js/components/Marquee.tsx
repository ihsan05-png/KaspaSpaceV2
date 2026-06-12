const items = [
    'Coworking Space','Virtual Office','Private Office','Meeting Room',
    'E-Library','Kasper AI','Food & Beverage','Legalitas Usaha','Sertifikasi ISO','Back Office',
];
const doubled = [...items, ...items];

export default function Marquee() {
    return (
        <div className="marquee-strip">
            <div className="marquee-inner">
                {doubled.map((x, i) => (
                    <span key={i} className="marquee-item">
                        <span className="marquee-dot"></span>{x}
                    </span>
                ))}
            </div>
        </div>
    );
}
