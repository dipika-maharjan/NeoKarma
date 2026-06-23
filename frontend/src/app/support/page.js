import FooterInfoPage from '@/components/FooterInfoPage';

export const metadata = {
  title: 'Help Center - Neo Karma',
  description: 'Get help using Neo Karma.',
};

export default function SupportPage() {
  return (
    <FooterInfoPage
      eyebrow="Support"
      title="Help Center"
      description="This Help Center page is being prepared. Add FAQs, troubleshooting steps, account guidance, and school onboarding support here."
    />
  );
}
