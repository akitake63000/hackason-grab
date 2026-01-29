"use client";

import { useState } from "react";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import PageShell from "../ui/PageShell";
import { useAuthState } from "../ui/useAuthState";
import { auth } from "@/lib/firebase";
import styles from "./page.module.css";

export default function LoginPage() {
  const { user, loading } = useAuthState();
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleLogin = async () => {
    if (isSigningIn) return;
    setIsSigningIn(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <PageShell
      title="Login"
      description="Firebase Authentication (Google) を使ってログインします。"
      badge="Auth"
    >
      <div className={styles.block}>
        {loading ? (
          <p className={styles.muted}>読み込み中...</p>
        ) : user ? (
          <>
            <p className={styles.user}>ログイン中: {user.displayName ?? user.email}</p>
            <button className={styles.actionSecondary} onClick={handleLogout}>
              ログアウト
            </button>
          </>
        ) : (
          <>
            <button
              className={styles.action}
              onClick={handleLogin}
              disabled={isSigningIn}
            >
              {isSigningIn ? "ログイン中..." : "Googleでログイン"}
            </button>
            <p className={styles.muted}>
              Googleログインを有効化したFirebaseプロジェクトを指定してください。
            </p>
          </>
        )}
      </div>
    </PageShell>
  );
}
