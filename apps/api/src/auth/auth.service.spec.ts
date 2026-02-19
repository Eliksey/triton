import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  const prismaMock = {
    user: {
      findUnique: jest.fn(),
    },
  };
  const jwtMock = {
    signAsync: jest.fn(),
  };

  let authService: AuthService;

  beforeEach(async () => {
    jest.resetAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: JwtService, useValue: jwtMock },
      ],
    }).compile();

    authService = moduleRef.get(AuthService);
  });

  it('returns a token for valid credentials', async () => {
    const passwordHash = await bcrypt.hash('secure-pass', 10);
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'user_1',
      username: 'admin',
      role: 'ADMIN',
      passwordHash,
    });
    jwtMock.signAsync.mockResolvedValue('token-value');

    const result = await authService.login('admin', 'secure-pass');

    expect(result.accessToken).toBe('token-value');
    expect(result.user.username).toBe('admin');
  });

  it('throws on invalid password', async () => {
    const passwordHash = await bcrypt.hash('right-pass', 10);
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'user_1',
      username: 'admin',
      role: 'ADMIN',
      passwordHash,
    });

    await expect(
      authService.login('admin', 'wrong-pass'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
