import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { config } from '../config';

interface JWTPayload {
  email: string;
  role: string;
}

export class AuthController {
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      // TODO: Заменить на реальную проверку из базы данных
      if (email === 'k.bakharev@inpglobal.com' && (!password || password === 'admin')) {
        const payload: JWTPayload = { email, role: 'admin' };
        const token = jwt.sign(
          payload,
          config.jwt.secret as jwt.Secret,
          { expiresIn: config.jwt.expiresIn }
        );

        res.json({
          token,
          user: payload
        });
      } else {
        res.status(401).json({ message: 'Неверные учетные данные' });
      }
    } catch (error) {
      console.error('Ошибка авторизации:', error);
      res.status(500).json({ message: 'Ошибка сервера при авторизации' });
    }
  }

  async checkAuth(req: Request, res: Response) {
    try {
      const token = req.headers.authorization?.split(' ')[1];

      if (!token) {
        return res.status(401).json({ message: 'Токен не предоставлен' });
      }

      const decoded = jwt.verify(token, config.jwt.secret as jwt.Secret) as JWTPayload;
      res.json({ user: decoded });
    } catch (error) {
      res.status(401).json({ message: 'Недействительный токен' });
    }
  }
} 