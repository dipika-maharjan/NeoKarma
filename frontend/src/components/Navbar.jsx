import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="w-full bg-white border-b">
      <div className="max-w-7xl mx-auto px-8 py-5 flex items-center justify-between">

        <h1 className="text-3xl font-bold text-green-800">
          Neoकर्म
        </h1>

        <div className="hidden md:flex items-center text-gray-700 gap-10">
          <Link href="/">Home</Link>
          <Link href="#how">How It Works</Link>
          <Link href="#about">About</Link>
          <Link href="/calculator">Calculator</Link>
        </div>

        <div className="flex items-center text-gray-700 gap-6">
          <Link href="/login">
            Login
          </Link>

          <Link
            href="/register"
            className="bg-green-700 text-white px-6 py-3 rounded-full hover:bg-green-800"
          >
            Get Started
          </Link>
        </div>

      </div>
    </nav>
  );
}