import Image from "next/image";
import Link from "next/link";

import { SiteFooter } from "@/components/site/footer";
import { SiteHeader } from "@/components/site/header";

const featuredBrandLogos = [
  { name: "Macallan", image: "/images/brands/macallan.png" },
  { name: "Moet & Chandon", image: "/images/brands/moet-chandon.png" },
  { name: "Jack Daniel's", image: "/images/brands/jack-daniels.png" },
  { name: "Johnnie Walker", image: "/images/brands/johnnie-walker.png" },
  { name: "Hennessy", image: "/images/brands/hennessy.png" },
  { name: "Penfolds", image: "/images/brands/penfolds.png" },
  { name: "Remy Martin", image: "/images/brands/remy-martin.png" },
  { name: "Wolf Blass", image: "/images/brands/wolf-blass.png" }
] as const;

const brandGroups = [
  {
    letter: "A",
    items: [
      "Abelha",
      "Aber Falls",
      "Aberfeldy",
      "Aberlour",
      "Absinthe Absente",
      "Absolut",
      "Afuri",
      "AJ Fernandez",
      "AK47",
      "Aladino",
      "Alexander",
      "Alipus",
      "Amahagan",
      "Amami",
      "Amami Oshima",
      "Amaro Lucano",
      "Amaro Montenegro",
      "Ambrosia",
      "American Eagle",
      "An Dulaman",
      "Anatani Hitomebore",
      "Ancho Reyes",
      "AnCnoc",
      "And Union",
      "Angostura",
      "Aperol",
      "Appleton Estate",
      "Arctic Brands Group",
      "Ardbeg",
      "Ardnamurchan",
      "Argiolas",
      "Ark",
      "Arquitecto",
      "Arran",
      "Artic",
      "Arvesolvet",
      "Asahi",
      "Asamai",
      "Askur",
      "Asura",
      "Auchentoshan",
      "Aultmore",
      "Averna",
      "Azabu",
      "Azakura",
      "Azumarikish"
    ]
  },
  {
    letter: "B",
    items: [
      "Bacardi",
      "Baileys",
      "Balblair",
      "Ballantine's",
      "Bandwagon",
      "Bangkok",
      "BarCraft",
      "Bareksten",
      "Baron De Sigognac",
      "Bayou",
      "Beefeater",
      "Bellevoye",
      "Beluga",
      "Belvedere",
      "Benchmark",
      "Benedictine",
      "Beneroy Calvados",
      "Benriach",
      "Benvenuti",
      "Bernheim",
      "Bickens",
      "Bijofu",
      "Birra Baladin",
      "Birra Morena",
      "Birra Roma",
      "Birradamare",
      "Bitter Truth",
      "Bittermens",
      "Black Bottle",
      "Black Tears",
      "Black Tot",
      "Black Velvet",
      "Blackburn",
      "Blackheart",
      "Bluecoat",
      "Boatyard",
      "Bob's Bitters",
      "Bobby's",
      "Bojimaya",
      "Bolivar",
      "Bols",
      "Bombay Sapphire",
      "Bong Spirit",
      "Boodles",
      "Borealis Rare",
      "BORN",
      "Bosford",
      "Bottega",
      "Bowmore",
      "Boxer",
      "Branca",
      "Braulio",
      "Brew Dog",
      "Broken Shed",
      "Broker's",
      "Brooklyn",
      "Brothers Cider",
      "Brugal",
      "Bruichladdich",
      "Buen Amigo",
      "Buffalo Trace",
      "Bulldog",
      "Bulleit",
      "Bumbu",
      "Burnett's",
      "Bushmills",
      "Buss 101",
      "Buss 509",
      "Butterfly Cannon"
    ]
  },
  {
    letter: "C",
    items: [
      "Cachaca Aguacana",
      "Caffe Borghetti",
      "CAFFO",
      "Calvados Pere",
      "Calvados Roger",
      "Cambridge",
      "Campari",
      "Camus",
      "Cana Brava",
      "Cana Rio",
      "Canadian Club",
      "Caol Ila",
      "Caorunn",
      "Capel Pisco",
      "Captain Morgan",
      "Capucana",
      "Cardhu",
      "Carlo Pellegrino",
      "Carlos I",
      "Carpano",
      "Casa Flamenco",
      "Casa Maestri",
      "Casa Martelletti",
      "Casa Noble",
      "Cenote",
      "Chabot Armagnac",
      "Chalong Bay",
      "Chambord",
      "Chao Siam",
      "Chivas Regal",
      "Cinzano",
      "Ciroc",
      "Citadelle",
      "Clase Azul",
      "Clynelish",
      "Cointreau",
      "Compass Box",
      "Courvoisier",
      "Crystal Head",
      "Cutty Sark",
      "Cynar",
      "Codigo 1530"
    ]
  },
  {
    letter: "D",
    items: [
      "Dailuaine",
      "Daimon",
      "Daishichi",
      "Dalwhinnie",
      "Damm",
      "Damrak Gin",
      "Dartigalongue",
      "Dassai",
      "Davidoff",
      "De Kuyper",
      "Dead Man's Finger",
      "Dewar's",
      "Dictador",
      "Diplomatico",
      "Disaronno",
      "Dolin",
      "Don Julio",
      "Don Papa",
      "Drambuie"
    ]
  },
  { letter: "E", items: ["Elijah Craig", "Espolon", "Evan Williams"] },
  { letter: "F", items: ["Finlandia", "Fireball", "Four Pillars"] },
  { letter: "G", items: ["Giffard", "Glenfiddich", "Glenlivet", "Glenmorangie", "Gordon's", "Grey Goose"] },
  { letter: "H", items: ["Havana Club", "Hendrick's", "Hennessy"] },
  { letter: "J", items: ["Jack Daniel's", "Jameson", "Jim Beam", "Johnnie Walker"] },
  { letter: "K", items: ["Kahlua", "Ketel One", "Knob Creek", "Kraken"] },
  { letter: "L", items: ["Lagavulin", "Laphroaig", "Licor 43"] },
  { letter: "M", items: ["Malibu", "Maker's Mark", "Martell", "Midori", "Monkey 47", "Monkey Shoulder"] },
  { letter: "N", items: ["Nikka", "No.3"] },
  { letter: "O", items: ["Oban", "Olmeca"] },
  { letter: "P", items: ["Patron", "Pernod", "Pimm's", "Plantation", "Penfolds"] },
  { letter: "R", items: ["Remy Martin", "Ron Zacapa", "Roku", "Royal Salute"] },
  { letter: "S", items: ["Sapporo", "Singleton", "Smirnoff", "Southern Comfort", "Suntory"] },
  { letter: "T", items: ["Talisker", "Tanqueray", "The Macallan", "Tito's", "Tullamore D.E.W."] },
  { letter: "W", items: ["Wolf Blass", "Woodford Reserve"] },
  { letter: "Y", items: ["Yamazaki"] },
  { letter: "Z", items: ["Zubrowka"] }
] as const;

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

function slugifyBrand(name: string) {
  return name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function BrandsPage() {
  return (
    <div className="min-h-screen bg-white text-ink">
      <SiteHeader />

      <main className="mx-auto max-w-[1220px] px-4 pb-16 pt-8">
        <section className="border-b border-[#ece7de] pb-8">
          <p className="text-xs uppercase tracking-[0.16em] text-[#8b6a2b]">
            <Link href="/" className="hover:text-[#2437e8]">
              หน้าแรก
            </Link>{" "}
            / แบรนด์
          </p>

          <div className="mt-4 rounded-[32px] border border-[#e9dfd1] bg-white p-6 shadow-[0_14px_30px_rgba(0,0,0,0.05)] sm:p-8">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#8b6a2b]">Feature Brands</p>
            <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-[#171212] sm:text-5xl">รวมแบรนด์ทั้งหมด</h1>
            <p className="mt-6 max-w-3xl text-[15px] leading-8 text-[#5f5852] sm:text-base">
              รวมแบรนด์เครื่องดื่มและสุราที่คัดสรรไว้บนเว็บไซต์ เพื่อให้ค้นหาแบรนด์ที่ต้องการได้สะดวกและรวดเร็วมากขึ้น
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {featuredBrandLogos.map((brand) => (
                <div
                  key={brand.name}
                  className="flex min-h-[120px] items-center justify-center rounded-[22px] border border-[#ece4d6] bg-[linear-gradient(135deg,#faf7f1_0%,#f2f5fb_100%)] p-5"
                >
                  <div className="relative h-[72px] w-full">
                    <Image src={brand.image} alt={brand.name} fill className="object-contain" sizes="20vw" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="pt-10">
          <div className="rounded-[30px] border border-[#e9dfd1] bg-[linear-gradient(135deg,#fbf7f0_0%,#ffffff_55%,#f6f8ff_100%)] p-6 shadow-[0_14px_30px_rgba(0,0,0,0.05)] sm:p-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className="mr-3 text-xs font-extrabold uppercase tracking-[0.18em] text-[#8b6a2b]"></span>
              {alphabet.map((letter) => {
                const hasItems = brandGroups.some((group) => group.letter === letter);

                return hasItems ? (
                  <a
                    key={letter}
                    href={`#letter-${letter}`}
                    className="inline-flex h-8 min-w-8 items-center justify-center rounded-md border border-[#ddd3c5] bg-white px-2 text-xs font-bold text-[#171212] transition hover:border-[#171212]"
                  >
                    {letter}
                  </a>
                ) : (
                  <span
                    key={letter}
                    className="inline-flex h-8 min-w-8 items-center justify-center rounded-md border border-[#ece4d6] bg-[#faf7f1] px-2 text-xs font-bold text-[#c5b9a8]"
                  >
                    {letter}
                  </span>
                );
              })}
            </div>
          </div>
        </section>

        <section className="mt-10 space-y-10">
          {brandGroups.map((group) => (
            <section key={group.letter} id={`letter-${group.letter}`} className="scroll-mt-28">
              <div className="mb-4 flex items-center gap-4">
                <span className="text-4xl font-extrabold text-[#d8cec0]">{group.letter}</span>
                <div className="h-px flex-1 bg-[#ece7de]" />
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                {group.items.map((brand) => (
                  <article
                    key={brand}
                    id={slugifyBrand(brand)}
                    className="rounded-[24px] border border-[#ece4d6] bg-white p-5 shadow-[0_10px_24px_rgba(0,0,0,0.04)] transition hover:-translate-y-1 hover:shadow-[0_16px_30px_rgba(0,0,0,0.06)]"
                  >
                    <div className="flex min-h-[90px] items-center justify-center text-center">
                      <h2 className="line-clamp-3 text-lg font-extrabold uppercase tracking-[0.05em] text-[#171212]">{brand}</h2>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
