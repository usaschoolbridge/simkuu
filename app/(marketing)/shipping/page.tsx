import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Shipping & Delivery Policy | Simkuu",
  description: "Simkuu sells 100% digital eSIM products. No physical shipping. eSIM QR codes are delivered to your email within minutes of purchase.",
  alternates: { canonical: `${siteConfig.url}/shipping` },
  openGraph: {
    title: "Shipping & Delivery Policy | Simkuu",
    description: "All Simkuu products are digital. Your eSIM is delivered via QR code to your email instantly.",
    url: `${siteConfig.url}/shipping`,
    siteName: siteConfig.name,
    type: "website",
  },
};

const COMPATIBLE_DEVICES = [
  { brand: "Apple", models: "iPhone XS, XS Max, XR, 11, 11 Pro, 12, 12 Pro, 13, 13 Pro, 14, 14 Pro, 15, 15 Pro, 16, 16 Pro, SE (2nd & 3rd gen), iPad Pro (2018+), iPad Air (2019+)" },
  { brand: "Samsung", models: "Galaxy S20, S21, S22, S23, S24, Z Fold 2/3/4/5/6, Z Flip 3/4/5/6, Note 20, A54, A55" },
  { brand: "Google", models: "Pixel 3, 3a, 4, 4a, 5, 5a, 6, 6a, 7, 7a, 8, 8a, 9, Fold" },
  { brand: "Microsoft", models: "Surface Pro X, Surface Duo, Surface Duo 2" },
  { brand: "Motorola", models: "Razr 2019+, Edge+ 2020+, G52, G62" },
  { brand: "Others", models: "Sony Xperia 10 III/IV/V, Oppo Find X3/X5/X7, Huawei P40/P50 (limited), Xiaomi 12T Pro+" },
];

export default function ShippingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-gradient-to-br from-green-50 to-blue-50 border-b border-black/[0.06]">
        <div className="container-xl py-16 md:py-24">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/70 border border-green-100 text-green-600 text-sm font-medium mb-6">
              Shipping & Delivery Policy
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-black text-black tracking-tight mb-4">
              100% Digital Delivery — No Physical Shipping
            </h1>
            <p className="text-black/50 text-lg leading-relaxed">
              All Simkuu products are entirely digital. There is nothing to ship. Your eSIM is delivered as a QR code directly to your email address within minutes of purchase — no waiting, no tracking numbers, no delivery delays.
            </p>
            <p className="text-black/40 text-sm mt-4">Effective Date: January 1, 2025 · Last Updated: June 1, 2026</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container-xl py-16">
        <div className="max-w-3xl mx-auto space-y-12">

          {/* Key callout */}
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-green-600 text-white text-xl flex items-center justify-center flex-shrink-0">✓</div>
            <div>
              <div className="font-bold text-green-800 mb-1">No Physical Products</div>
              <p className="text-green-700 text-sm leading-relaxed">
                Simkuu does not manufacture, ship, or deliver any physical SIM cards, devices, or merchandise. All products listed on simkuu.com are digital eSIM activation credentials delivered electronically.
              </p>
            </div>
          </div>

          <section>
            <h2 className="font-display text-2xl font-bold text-black mb-4">1. How eSIM Delivery Works</h2>
            <p className="text-black/60 leading-relaxed mb-6">
              After completing your purchase on simkuu.com, the following steps occur automatically:
            </p>
            <ol className="space-y-4">
              {[
                { step: "1", title: "Order Confirmation", desc: "An order confirmation email is sent to your registered email address immediately after payment is processed." },
                { step: "2", title: "eSIM Generation", desc: "Our system generates a unique eSIM QR code and activation credentials for your chosen carrier plan. This process takes approximately 30–90 seconds." },
                { step: "3", title: "QR Code Delivery", desc: "A separate email containing your eSIM QR code, activation instructions, and account details is delivered to your inbox within 2–5 minutes of purchase." },
                { step: "4", title: "Activation", desc: "Scan the QR code using your device's camera in Settings → Cellular/Mobile → Add eSIM. The plan activates within 60–120 seconds." },
              ].map(({ step, title, desc }) => (
                <li key={step} className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">{step}</div>
                  <div>
                    <div className="font-semibold text-black mb-1">{title}</div>
                    <p className="text-black/60 text-sm leading-relaxed">{desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold text-black mb-4">2. Delivery Timeframe</h2>
            <div className="grid gap-4">
              {[
                { label: "Standard Delivery", time: "Within 5 minutes", desc: "99% of orders are delivered within 5 minutes of purchase confirmation." },
                { label: "Peak Hours Delay", time: "5–15 minutes", desc: "During high-traffic periods, delivery may take up to 15 minutes. You will receive an email if there is any delay." },
                { label: "Maximum Wait", time: "30 minutes", desc: "In rare cases (carrier API timeouts, system maintenance), delivery can take up to 30 minutes. If not received within 30 minutes, contact support immediately." },
              ].map(({ label, time, desc }) => (
                <div key={label} className="border border-black/[0.08] rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-black text-sm">{label}</span>
                    <span className="text-blue-600 font-bold text-sm bg-blue-50 px-3 py-1 rounded-full">{time}</span>
                  </div>
                  <p className="text-black/50 text-sm">{desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold text-black mb-4">3. No Delivery Charges</h2>
            <p className="text-black/60 leading-relaxed">
              There are no shipping fees, delivery charges, or handling fees of any kind. The price you see on the plan page is the total price you pay. eSIM delivery is always free and instant.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold text-black mb-4">4. What Is Delivered</h2>
            <p className="text-black/60 leading-relaxed mb-4">Your eSIM delivery email will contain:</p>
            <ul className="space-y-2 text-black/60 text-sm">
              {[
                "A scannable QR code image (PNG format)",
                "Your eSIM activation code (manual entry option)",
                "SM-DP+ address and activation PIN for manual installation",
                "Step-by-step activation instructions for iOS and Android",
                "Your plan details: data allowance, validity period, carrier, and APN settings",
                "A link to your account dashboard where you can manage your plan",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span> {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold text-black mb-4">5. Supported Devices</h2>
            <p className="text-black/60 leading-relaxed mb-6">
              eSIMs require compatible devices. Please verify your device supports eSIM before purchasing. The following devices are confirmed compatible with Simkuu eSIM plans:
            </p>
            <div className="space-y-4">
              {COMPATIBLE_DEVICES.map(({ brand, models }) => (
                <div key={brand} className="rounded-2xl border border-black/[0.08] p-4">
                  <div className="font-semibold text-black mb-1">{brand}</div>
                  <p className="text-black/50 text-sm">{models}</p>
                </div>
              ))}
            </div>
            <p className="text-black/40 text-xs mt-4">
              * Device must be eSIM-unlocked. Carrier-locked devices may not be compatible. Contact your device manufacturer or existing carrier to confirm eSIM support.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold text-black mb-4">6. eSIM Not Received?</h2>
            <p className="text-black/60 leading-relaxed mb-4">
              If you have not received your eSIM within 30 minutes of purchase, please:
            </p>
            <ol className="space-y-2 text-black/60 text-sm list-decimal list-inside">
              <li>Check your spam/junk folder for emails from noreply@simkuu.com</li>
              <li>Log in to your Simkuu account at simkuu.com/dashboard to download your QR code directly</li>
              <li>Contact us at support@simkuu.com with your Order ID</li>
              <li>WhatsApp/call us at +1 (302) 555-0147 for immediate assistance</li>
            </ol>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold text-black mb-4">7. Contact Us</h2>
            <div className="bg-[#FAFAFA] rounded-2xl border border-black/[0.06] p-6 space-y-3 text-sm text-black/60">
              <div><strong className="text-black">Email:</strong> support@simkuu.com</div>
              <div><strong className="text-black">Phone / WhatsApp:</strong> +1 (302) 555-0147</div>
              <div><strong className="text-black">Hours:</strong> Monday–Friday, 9 AM – 6 PM EST</div>
              <div><strong className="text-black">Address:</strong> Simkuu Inc., 2093 Philadelphia Pike, Suite 1234, Claymont, DE 19703, United States</div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
