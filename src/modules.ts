export type ModuleMeta = { slug: string; no: string; title: string; short: string; symbol: string };

export const MODULES: ModuleMeta[] = [
  { slug: "altin-oran", no: "01", title: "Altın Oran & Fibonacci Sarmalı", short: "Fare ile yönlendirilen φ sarmalı", symbol: "φ" },
  { slug: "collatz", no: "02", title: "Collatz Sanısı (3x+1)", short: "Sayıların 1'e yolculuğu", symbol: "3x+1" },
  { slug: "pi", no: "03", title: "Pi Sayısı Çember Açılımı", short: "Çevreyi bir doğruya aç", symbol: "π" },
  { slug: "pisagor-akordu", no: "04", title: "Pisagor Akordu", short: "Frekans oranları ve armoni", symbol: "3:2" },
  { slug: "lojistik-harita", no: "05", title: "Lojistik Harita", short: "Büyümeden kaosa", symbol: "r" },
  { slug: "pascal-sierpinski", no: "06", title: "Pascal Üçgeni & Sierpinski", short: "Binom katsayılarında fraktal", symbol: "C(n,k)" },
  { slug: "lorenz", no: "07", title: "Kaos Teorisi & Lorenz Çekicisi", short: "Kelebek etkisi parçacıkları", symbol: "σρβ" },
  { slug: "euler", no: "08", title: "Euler Sayısı & Bileşik Büyüme", short: "Sürekli büyüme ve sönüm", symbol: "e" },
];
