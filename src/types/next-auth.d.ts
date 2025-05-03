import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      systemRole: string;
      image?: string;
      organizationId?: string | null;
    };
  }
  interface JWT {
    id: string;
    name: string;
    email: string;
    systemRole: string;
    image?: string;
  }
  interface User {
    id: string;
    name: string;
    email: string;
    systemRole: string;
    image?: string;
  }
  interface Profile {
    picture?: string;
  }
}

declare module 'next-auth/providers/GoogleProvider' {
  interface Profile {
    picture?: string;
  }
}
