export interface Location {
  city: string;
  name: string;
  address: string;
  img: string;
  hours: string;
  seats: string;
}

export const LOCATIONS_DATA: Location[] = [
  {
    city: "Solo",
    name: "Kaspa Space Manahan",
    address: "Jl. Adi Sucipto No. 12, Manahan, Solo 57139",
    img: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
    hours: "08:00 – 22:00",
    seats: "60+ seat",
  },
  {
    city: "Surabaya",
    name: "Kaspa Space Citraland",
    address: "Citraland Boulevard No. 88, Surabaya 60219",
    img: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1200&q=80",
    hours: "08:00 – 22:00",
    seats: "80+ seat",
  },
  {
    city: "Surabaya",
    name: "Kaspa Space Sinarmas",
    address: "Sinarmas Tower Lt. 18, Jl. Pemuda 60-66, Surabaya",
    img: "https://images.unsplash.com/photo-1568992687947-868a62a9f521?auto=format&fit=crop&w=1200&q=80",
    hours: "08:00 – 22:00",
    seats: "100+ seat",
  },
  {
    city: "Surabaya",
    name: "Kaspa Space Pakuwon",
    address: "Pakuwon City Mall Lt. 3, Jl. Kejawan Putih, Surabaya",
    img: "https://images.unsplash.com/photo-1604328698692-f76ea9498e76?auto=format&fit=crop&w=1200&q=80",
    hours: "08:00 – 22:00",
    seats: "70+ seat",
  },
];
