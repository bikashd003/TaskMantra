import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      image?: string;
      systemRole?: string;
    };
  }

  interface User {
    _id: string;
    id?: string;
    name: string;
    email: string;
    image?: string;
    systemRole?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId: string;
    email: string;
  }
}
