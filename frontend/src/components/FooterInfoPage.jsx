const FooterInfoPage = ({ eyebrow, title, description }) => (
  <main className="bg-[#FAFAFA] px-4 py-12 md:px-8 md:py-16 lg:px-12">
    <section className="mx-auto w-full max-w-screen-2xl">
      <div className="border-b border-[#DCE9E0] pb-8 md:pb-10">
        <p className="text-[12px] font-bold uppercase tracking-[0.22em] text-[#5C8A72]">{eyebrow}</p>
        <h1 className="mt-4 max-w-4xl text-[34px] font-extrabold leading-tight text-[#0A3D25] md:text-[48px]">
          {title}
        </h1>
      </div>

      <div className="py-10 md:py-12">
        <p className="max-w-3xl text-[17px] leading-8 text-[#4A5550] md:text-[18px]">
          {description}
        </p>
      </div>
    </section>
  </main>
);

export default FooterInfoPage;
