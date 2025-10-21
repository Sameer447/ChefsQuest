import Image from 'next/image';
import Link from 'next/link';
import styles from './page.module.css';

export default function Home() {
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <Image
          src="/images/chef-quest-logo.png"
          alt="Chef's Quest Logo"
          width={200}
          height={200}
          className={styles.logo}
        />
        <h1 className={styles.title}>Chef&apos;s Quest</h1>
        <p className={styles.subtitle}>
          The ultimate culinary adventure for your mobile device!
        </p>
        <div className={styles.privacyLinkContainer}>
          <Link href="/privacy" className={styles.privacyLink}>
            View our Privacy Policy
          </Link>
        </div>
      </main>
    </div>
  );
}
