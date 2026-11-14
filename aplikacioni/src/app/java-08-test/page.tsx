import { ZgjedhVendtakimin } from "@/components/ZgjedhVendtakimin";

// Faqe prove pa login, databazë ose shërbime të jashtme: të njëjtin komponent
// vendtakimi si te detajet, me të dhëna fiktive të udhëtimit të Dritonit.
const udhetim = {
  id: "2",
  nisja: "Ferizaj",
  destinacioni: "AAB",
  ora: "08:15",
};

export default function ProvaVendtakimi() {
  return (
    <main>
      <p style={{ opacity: 0.8 }}>Simulim për klasë · të dhëna fiktive</p>
      <h1>
        Udhëtimi {udhetim.id} · {udhetim.nisja} → {udhetim.destinacioni}
      </h1>
      <p>Nisja: {udhetim.ora}</p>
      <ZgjedhVendtakimin />
    </main>
  );
}
