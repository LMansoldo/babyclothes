import type { Item } from '$lib/domain/item/entities/Item';
import type { Message } from '$lib/domain/chat/entities/Message';
import {
  createNotification,
  type Notification,
} from '$lib/domain/notification/entities/Notification';
import type { Session } from '$lib/domain/auth/entities/Session';

// ── Session ──
export const mockSession: Session = {
  userId: 'user-1',
  email: 'ana@example.com',
  name: 'Ana Silva',
  avatarUrl: '',
};

// ── Children ──
export type MockChild = {
  id: string;
  name: string;
  birthDate: string;
  gender: 'male' | 'female';
  birthWeightG: number;
  birthHeightCm: number;
  document?: string;
};

export const mockChildren: MockChild[] = [
  {
    id: 'child-1',
    name: 'Sofia',
    birthDate: '2024-03-15',
    gender: 'female',
    birthWeightG: 3200,
    birthHeightCm: 49,
    document: '123.456.789-00',
  },
  {
    id: 'child-2',
    name: 'Miguel',
    birthDate: '2023-08-22',
    gender: 'male',
    birthWeightG: 3500,
    birthHeightCm: 51,
    document: undefined,
  },
  {
    id: 'child-3',
    name: 'Laura',
    birthDate: '2025-01-10',
    gender: 'female',
    birthWeightG: 2900,
    birthHeightCm: 47,
    document: undefined,
  },
];

// ── Growth Records ──
export type GrowthRecord = {
  id: string;
  childId: string;
  weightG: number;
  heightCm: number;
  clothingSize: string;
  recordedAt: Date;
};

export const mockGrowthRecords: GrowthRecord[] = [
  {
    id: 'gr-1',
    childId: 'child-1',
    weightG: 3200,
    heightCm: 49,
    clothingSize: 'RN',
    recordedAt: new Date('2024-03-15'),
  },
  {
    id: 'gr-2',
    childId: 'child-1',
    weightG: 4500,
    heightCm: 55,
    clothingSize: 'P',
    recordedAt: new Date('2024-05-15'),
  },
  {
    id: 'gr-3',
    childId: 'child-1',
    weightG: 6200,
    heightCm: 62,
    clothingSize: 'M',
    recordedAt: new Date('2024-08-15'),
  },
  {
    id: 'gr-4',
    childId: 'child-1',
    weightG: 7800,
    heightCm: 68,
    clothingSize: 'M',
    recordedAt: new Date('2024-11-15'),
  },
  {
    id: 'gr-5',
    childId: 'child-1',
    weightG: 9100,
    heightCm: 73,
    clothingSize: 'G',
    recordedAt: new Date('2025-03-15'),
  },
  {
    id: 'gr-6',
    childId: 'child-2',
    weightG: 3500,
    heightCm: 51,
    clothingSize: 'RN',
    recordedAt: new Date('2023-08-22'),
  },
  {
    id: 'gr-7',
    childId: 'child-2',
    weightG: 5800,
    heightCm: 60,
    clothingSize: 'P',
    recordedAt: new Date('2023-11-22'),
  },
  {
    id: 'gr-8',
    childId: 'child-2',
    weightG: 8200,
    heightCm: 70,
    clothingSize: 'M',
    recordedAt: new Date('2024-04-22'),
  },
  {
    id: 'gr-9',
    childId: 'child-2',
    weightG: 10500,
    heightCm: 78,
    clothingSize: 'G',
    recordedAt: new Date('2024-08-22'),
  },
  {
    id: 'gr-10',
    childId: 'child-2',
    weightG: 12000,
    heightCm: 84,
    clothingSize: 'GG',
    recordedAt: new Date('2025-02-22'),
  },
  {
    id: 'gr-11',
    childId: 'child-3',
    weightG: 2900,
    heightCm: 47,
    clothingSize: 'RN',
    recordedAt: new Date('2025-01-10'),
  },
  {
    id: 'gr-12',
    childId: 'child-3',
    weightG: 4100,
    heightCm: 53,
    clothingSize: 'P',
    recordedAt: new Date('2025-04-10'),
  },
];

// ── Categories ──
export const mockCategories = [
  { id: 'all', label: 'All' },
  { id: 'romper', label: 'Romper' },
  { id: 'bodysuit', label: 'Bodysuit' },
  { id: 'dress', label: 'Dress' },
  { id: 'coat', label: 'Coat' },
  { id: 'set', label: 'Set' },
  { id: 'accessory', label: 'Accessory' },
];

// ── Sellers ──
export type MockSeller = {
  id: string;
  name: string;
  avatarUrl: string;
  verified: boolean;
};

export const mockSellers: Record<string, MockSeller> = {
  'seller-1': { id: 'seller-1', name: 'Maria Souza', avatarUrl: '', verified: true },
  'seller-2': { id: 'seller-2', name: 'Juliana Costa', avatarUrl: '', verified: true },
  'seller-3': { id: 'seller-3', name: 'Carla Santos', avatarUrl: '', verified: false },
  'seller-4': { id: 'seller-4', name: 'Fernanda Lima', avatarUrl: '', verified: true },
};

// ── Items ──
export const mockItems: Item[] = [
  {
    id: 'item-1',
    sellerId: 'seller-1',
    title: 'Macacão floral com laço',
    description:
      'Lindo macacão floral com laço na cintura. Tecido leve e respirável, perfeito para o verão.',
    category: 'romper',
    gender: 'female',
    clothingSize: 'P',
    condition: 'new',
    priceCents: 8900,
    status: 'active',
    photoUrls: [],
  },
  {
    id: 'item-2',
    sellerId: 'seller-2',
    title: 'Body manga longa estrelas',
    description: 'Body de manga longa com estampado de estrelas. Algodão orgânico, super macio.',
    category: 'bodysuit',
    gender: 'unisex',
    clothingSize: 'M',
    condition: 'like_new',
    priceCents: 4500,
    status: 'active',
    photoUrls: [],
  },
  {
    id: 'item-3',
    sellerId: 'seller-1',
    title: 'Vestido tutu rosa',
    description:
      'Vestido com saia tutu rosa e top de algodão. Ideal para festas e ocasiões especiais.',
    category: 'dress',
    gender: 'female',
    clothingSize: 'G',
    condition: 'new',
    priceCents: 12900,
    status: 'active',
    photoUrls: [],
  },
  {
    id: 'item-4',
    sellerId: 'seller-3',
    title: 'Jaqueta jeans forrada',
    description: 'Jaqueta jeans forrada com pelúcia. Perfeita para dias mais frios.',
    category: 'coat',
    gender: 'male',
    clothingSize: '2',
    condition: 'used',
    priceCents: 3500,
    status: 'active',
    photoUrls: [],
  },
  {
    id: 'item-5',
    sellerId: 'seller-2',
    title: 'Conjunto listrado marinho',
    description: 'Conjunto de camiseta e calça listrada. Algodão premium, cores que não desbotam.',
    category: 'set',
    gender: 'male',
    clothingSize: 'M',
    condition: 'like_new',
    priceCents: 6700,
    status: 'active',
    photoUrls: [],
  },
  {
    id: 'item-6',
    sellerId: 'seller-4',
    title: 'Laço de cabelo artesanal',
    description: 'Laço de cabelo feito à mão com tecido de algodão. Hipoalergênico.',
    category: 'accessory',
    gender: 'female',
    clothingSize: 'RN',
    condition: 'new',
    priceCents: 1800,
    status: 'active',
    photoUrls: [],
  },
  {
    id: 'item-7',
    sellerId: 'seller-1',
    title: 'Macacão dinossauro verde',
    description: 'Macacão divertido com estampa de dinossauro. Tem capuz com chifres.',
    category: 'romper',
    gender: 'male',
    clothingSize: 'G',
    condition: 'new',
    priceCents: 9500,
    status: 'active',
    photoUrls: [],
  },
  {
    id: 'item-8',
    sellerId: 'seller-3',
    title: 'Body manga curta frutas',
    description: 'Body com estampa de frutas coloridas. Algodão macio e elástico.',
    category: 'bodysuit',
    gender: 'unisex',
    clothingSize: 'P',
    condition: 'used',
    priceCents: 2500,
    status: 'active',
    photoUrls: [],
  },
  {
    id: 'item-9',
    sellerId: 'seller-4',
    title: 'Vestido princesa azul',
    description: 'Vestido de princesa azul com glitter e saia volumosa. Perfeito para fantasias.',
    category: 'dress',
    gender: 'female',
    clothingSize: '1',
    condition: 'like_new',
    priceCents: 15000,
    status: 'active',
    photoUrls: [],
  },
  {
    id: 'item-10',
    sellerId: 'seller-2',
    title: 'Conjunto inverno urso',
    description: 'Conjunto de inverno com estampa de urso. Inclui blusa de lã e calça forrada.',
    category: 'set',
    gender: 'unisex',
    clothingSize: 'GG',
    condition: 'new',
    priceCents: 11000,
    status: 'active',
    photoUrls: [],
  },
];

// ── Messages ──
export const mockMessages: Message[] = [
  {
    id: 'msg-1',
    role: 'agent',
    content: {
      type: 'text',
      content: 'Olá! Sou a assistente virtual da BabyClothes. Como posso ajudar você hoje?',
    },
    createdAt: new Date('2025-06-15T10:00:00'),
  },
  {
    id: 'msg-2',
    role: 'user',
    content: { type: 'text', content: 'Estou procurando roupas para minha filha de 6 meses' },
    createdAt: new Date('2025-06-15T10:01:00'),
  },
  {
    id: 'msg-3',
    role: 'agent',
    content: {
      type: 'text',
      content:
        'Ótimo! Para 6 meses, geralmente o tamanho M é o mais adequado. Você prefere roupas de que tipo? Macacões, bodies, vestidos?',
    },
    createdAt: new Date('2025-06-15T10:01:30'),
  },
  {
    id: 'msg-4',
    role: 'user',
    content: { type: 'text', content: 'Macacões e bodies. Algo que seja bom para o verão' },
    createdAt: new Date('2025-06-15T10:02:00'),
  },
  {
    id: 'msg-5',
    role: 'agent',
    content: {
      type: 'text',
      content:
        'Encontrei algumas opções perfeitas para você! Temos o Macacão floral com laço (tamanho P, ideal para 3-6 meses) e o Body manga curta frutas (tamanho P). Ambos são de algodão respirável, perfeitos para o calor.',
    },
    createdAt: new Date('2025-06-15T10:02:30'),
  },
  {
    id: 'msg-6',
    role: 'user',
    content: { type: 'text', content: 'Quanto custa o macacão floral?' },
    createdAt: new Date('2025-06-15T10:03:00'),
  },
  {
    id: 'msg-7',
    role: 'agent',
    content: {
      type: 'text',
      content:
        'O Macacão floral com laço está R$ 89,00. É novo, com etiqueta! A vendedora Maria Souza tem 15 vendas confirmadas e é verificada. Quer que eu mostre mais detalhes?',
    },
    createdAt: new Date('2025-06-15T10:03:30'),
  },
  {
    id: 'msg-8',
    role: 'user',
    content: { type: 'text', content: 'Sim, quero ver!' },
    createdAt: new Date('2025-06-15T10:04:00'),
  },
  {
    id: 'msg-9',
    role: 'agent',
    content: {
      type: 'text',
      content:
        'Perfeito! Aqui estão os detalhes do Macacão floral:\n\n• Tamanho: P (3-6 meses)\n• Condição: Novo com etiqueta\n• Tecido: Algodão respirável\n• Cor: Rosa com estampa floral\n• Laço removível na cintura\n\nA Maria também tem outros itens no tamanho P se quiser combinar!',
    },
    createdAt: new Date('2025-06-15T10:04:30'),
  },
  {
    id: 'msg-10',
    role: 'user',
    content: { type: 'text', content: 'Ótimo! Vou querer o macacão. Como faço para comprar?' },
    createdAt: new Date('2025-06-15T10:05:00'),
  },
  {
    id: 'msg-11',
    role: 'agent',
    content: {
      type: 'text',
      content:
        'Você pode comprar diretamente pelo app! Basta clicar no botão "Comprar" na página do item. Aceitamos PIX, cartão de crédito e boleto. A entrega é feita pelos Correios com rastreamento.',
    },
    createdAt: new Date('2025-06-15T10:05:30'),
  },
];

// ── Notifications ──
export const mockNotifications: Notification[] = [
  createNotification({
    id: 'notif-1',
    userId: 'user-1',
    type: 'growth_prediction',
    title: 'Previsão de tamanho',
    body: 'Sofia vai precisar de roupas tamanho G em breve!',
    readAt: undefined,
  }),
  createNotification({
    id: 'notif-2',
    userId: 'user-1',
    type: 'new_match',
    title: 'Novo item compatível',
    body: 'Maria Souza listou um macacão no tamanho M que combina com Miguel.',
    readAt: new Date('2025-06-14'),
  }),
  createNotification({
    id: 'notif-3',
    userId: 'user-1',
    type: 'system',
    title: 'Bem-vinda!',
    body: 'Complete o perfil da Sofia para receber recomendações personalizadas.',
    readAt: undefined,
  }),
  createNotification({
    id: 'notif-4',
    userId: 'user-1',
    type: 'growth_prediction',
    title: 'Hora de comprar!',
    body: 'Laura está crescendo rápido. Considere comprar roupas tamanho P.',
    readAt: new Date('2025-06-13'),
  }),
  createNotification({
    id: 'notif-5',
    userId: 'user-1',
    type: 'new_match',
    title: 'Preço reduzido',
    body: 'O Vestido tutu rosa que você favoritou teve o preço reduzido!',
    readAt: undefined,
  }),
  createNotification({
    id: 'notif-6',
    userId: 'user-1',
    type: 'system',
    title: 'Atualização do app',
    body: 'Nova funcionalidade: agora você pode acompanhar o crescimento dos seus filhos!',
    readAt: new Date('2025-06-10'),
  }),
];
