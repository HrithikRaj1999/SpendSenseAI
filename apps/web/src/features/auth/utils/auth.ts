import {
  signIn,
  signUp,
  confirmSignUp,
  resendSignUpCode,
  resetPassword,
  confirmResetPassword,
  signOut,
  fetchAuthSession,
  getCurrentUser,
} from "aws-amplify/auth";

export async function authSignUp(email: string, password: string) {
  return signUp({
    username: email,
    password,
    options: { userAttributes: { email } },
  });
}

export async function authConfirmEmail(email: string, code: string) {
  return confirmSignUp({ username: email, confirmationCode: code });
}

export async function authResendCode(email: string) {
  return resendSignUpCode({ username: email });
}

export async function authSignIn(email: string, password: string) {
  return signIn({ username: email, password });
}

export async function authForgotPassword(email: string) {
  return resetPassword({ username: email }); // sends code
}

export async function authResetPassword(
  email: string,
  code: string,
  newPassword: string,
) {
  return confirmResetPassword({
    username: email,
    confirmationCode: code,
    newPassword,
  });
}

export async function authSignOut() {
  return signOut();
}

export async function authGetAccessToken(): Promise<string | null> {
  const session = await fetchAuthSession();
  return session.tokens?.accessToken?.toString() ?? null;
}

export async function authGetUser(): Promise<{
  username: string;
  userId: string;
} | null> {
  try {
    const user = await getCurrentUser();
    return { username: user.username, userId: user.userId };
  } catch {
    return null;
  }
}
