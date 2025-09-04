interface ILogin {
  username: string;
  password: string;
}

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!baseUrl) throw new Error("API URL is not defined");

class Auth {
  async login(data: ILogin) {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to login");

    const response = await res.json();

    await localStorage.setItem("userId", response.data.user.id);

    return response.status;
  }

  async logout() {
    const res = await fetch(`${baseUrl}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to logout");
    return res.json();
  }
}

export const AuthService = new Auth();
