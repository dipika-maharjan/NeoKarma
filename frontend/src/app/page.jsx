import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#F8F9FA]">

      <section className="max-w-7xl mx-auto px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* Left Side */}
          <div>

            <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-700 text-sm font-medium mb-6">
              🌱 MADE FOR NEPALESE SCHOOLS
            </div>

            <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-6">
              Your actions today shape tomorrow.
              <br />
              Track. Reflect.
              <br />
              Reduce.
            </h1>

            <p className="text-lg text-gray-600 mb-10">
              Neo Karma helps Nepalese students understand
              their carbon footprint and take meaningful
              actions for a greener future.
            </p>

            <div className="flex gap-4">

              <button className="bg-green-700 hover:bg-green-800 text-white px-8 py-4 rounded-full font-semibold transition">
                Try Carbon Calculator →
              </button>

              <button className="border border-gray-400 text-gray-700 hover:bg-gray-100 px-8 py-4 rounded-full font-semibold">
                Try Quick Calculator
              </button>

            </div>

          </div>

          {/* Right Side */}
          <div className="relative">

            <Image
              src="/images/hero.png"
              alt="Students planting trees"
              width={700}
              height={500}
              className="rounded-3xl shadow-2xl"
            />

          </div>

        </div>
      </section>

    </main>
  );
}