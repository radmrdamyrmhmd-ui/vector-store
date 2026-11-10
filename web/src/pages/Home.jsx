import { useEffect } from 'react';
import Hero from '../components/home/Hero';
import CollectionSection from '../components/home/CollectionSection';
import UrbanBanner from '../components/home/UrbanBanner';
import Usps from '../components/home/Usps';
import NewsletterSection from '../components/home/NewsletterSection';

export default function Home() {
  useEffect(() => {
    document.title = 'YAS SPORTS | یاس اسپورت — کفش و پوشاک ورزشی';
  }, []);

  return (
    <>
      <Hero />
      <CollectionSection />
      <UrbanBanner />
      <Usps />
      <NewsletterSection />
    </>
  );
}
