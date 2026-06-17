declare global {
  namespace App {
    interface Locals {
      session?: {
        userId: string;
        email: string;
        name: string;
        avatarUrl: string;
      };
    }
  }
}

export {};
