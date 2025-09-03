interface ILogin {
  email: string;
  password: string;
}

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

if (!baseUrl) throw new Error("API URL is not defined");

class Auth {
  async login(data: ILogin) {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to login");
    return res.json();
  }

  async logout() {
    const res = await fetch(`${baseUrl}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to logout");
    return res.json();
  }
}

export const AuthService = new Auth();
