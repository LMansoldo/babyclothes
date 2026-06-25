declare global {
  namespace App {
    interface Locals {
      session?: {
        userId: string;
        email: string;
        name: string;
        avatarUrl: string;
        type: 'pf' | 'pj' | null;
        cpf?: string;
        cnpj?: string;
        isSeller: boolean;
      };
    }
  }
}

export {};
