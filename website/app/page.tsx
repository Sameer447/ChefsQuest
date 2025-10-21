import Link from 'next/link';
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>Welcome to Chef's Quest</h1>
        <p>
          <Link href="/privacy">View our Privacy Policy</Link>
        </p>
      </main>
    </div>
  );
}
