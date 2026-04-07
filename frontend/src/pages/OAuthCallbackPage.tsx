import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { fetchMe } from "../store/auth";

/**
 * Handles the redirect from the OAuth callback.
 *
 * Flow:
 *  1. users-api redirects here with ?token=<jwt>
 *  2. We store the JWT in localStorage
 *  3. We fetch /users/me to populate Redux auth state
 *  4. Redirect to dashboard
 */
const OAuthCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const token = searchParams.get("token");
    const error = searchParams.get("error");

    if (error || !token) {
      navigate("/login?error=" + (error ?? "unknown"), { replace: true });
      return;
    }

    localStorage.setItem("token", token);
    // Fetch user profile to populate Redux, then go to dashboard once loaded
    (dispatch as any)(fetchMe(() => navigate("/dashboard", { replace: true })));
  }, []); // run once on mount

  return (
    <div className="min-h-screen flex items-center justify-center dark:bg-black">
      <p className="text-black/60 dark:text-white/60">Signing you in…</p>
    </div>
  );
};

export default OAuthCallbackPage;
